import type { Logger } from 'pino';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { Lifecycle } from './lifecycle.js';
import { loadConfig, defaultConfigPath } from './config.js';
import { ensureDataDir } from './logger.js';
import { DatabaseManager } from '../db/database.js';
import { Scheduler } from '../scheduler/scheduler.js';
import { TelegramReporter } from '../reporter/telegram.js';
import { WorkspaceManager } from '../workspace/workspace.js';
import { parseRoadmap } from '../workspace/roadmap-parser.js';
import { pickNextTask } from '../workspace/task-picker.js';
import { buildTaskContext } from '../workspace/context-builder.js';
import { createLLMClient } from '../llm/router.js';
import type { LLMExecutor } from '../llm/router.js';
import { applyFileChanges } from '../workspace/file-writer.js';
import { verify } from '../verifier/verifier.js';
import { BudgetTracker } from '../budget/tracker.js';
import type { DaemonModule, DaemonState } from './lifecycle.js';
import type { DaemonConfig } from './config.js';

export type { DaemonModule, DaemonState, DaemonConfig };

/**
 * Main Daemon class — orchestrates all daemon modules.
 *
 * Lifecycle: start() → running → stop()
 * Modules are registered in dependency order and started/stopped
 * in that order via the Lifecycle coordinator.
 */
export class Daemon {
  private lifecycle: Lifecycle;
  private paused = false;
  private sessionId = randomUUID();
  private tasksCompleted = 0;
  private startTime = Date.now();
  config: DaemonConfig | null = null;

  constructor(
    readonly logger: Logger,
    private configPath?: string,
  ) {
    this.lifecycle = new Lifecycle(this.logger);
  }

  get state(): DaemonState {
    return this.lifecycle.state;
  }

  /** Register a module into the daemon lifecycle. */
  register(module: DaemonModule): void {
    this.lifecycle.register(module);
  }

  async start(): Promise<void> {
    this.logger.info('Mother Brain Daemon starting...');

    // Ensure data directory exists
    const dataDir = ensureDataDir();

    // Load config
    const cfgPath = this.configPath ?? defaultConfigPath();
    try {
      this.config = loadConfig(cfgPath, this.logger);
    } catch (error) {
      this.logger.warn({ error }, 'No config loaded — running in skeleton mode');
      await this.lifecycle.startAll();
      this.logger.info('Mother Brain Daemon started (skeleton mode)');
      return;
    }

    // Register core modules in dependency order
    const db = new DatabaseManager(join(dataDir, 'daemon.db'), this.logger);
    this.register(db);

    // Workspace
    const workspace = new WorkspaceManager(
      this.config.workspace.repoPath,
      this.config.workspace.branch,
      this.logger,
    );
    this.register(workspace);

    // Scheduler
    const scheduler = new Scheduler(
      this.config.activeHours,
      this.config.timezone,
      this.config.heartbeatMinutes ?? 15,
      this.logger,
    );
    this.register(scheduler);

    // Telegram reporter (optional — start even if bot fails)
    let reporter: TelegramReporter | null = null;
    if (this.config.telegram.botToken) {
      reporter = new TelegramReporter(this.config.telegram, this.logger);
      this.register(reporter);
    }

    // Start all modules
    await this.lifecycle.startAll();

    // Create session record
    db.connection.prepare(
      `INSERT INTO sessions (id, started_at, status) VALUES (?, datetime('now'), 'active')`,
    ).run(this.sessionId);

    // Set up budget tracker
    const budgetTracker = new BudgetTracker(
      db.connection,
      this.config.budget.perNight,
      this.config.budget.currency,
      this.logger,
    );

    // LLM clients — three-tier model routing
    const codingClient = createLLMClient(this.config, this.logger, 'coding');

    // Wire up Telegram status provider
    reporter?.onStatus(() => ({
      state: this.paused ? 'paused' : 'running',
      currentTask: null,
      tasksCompleted: this.tasksCompleted,
      budgetRemaining: `${budgetTracker.getStatus(this.sessionId).remaining.toFixed(2)} ${this.config!.budget.currency}`,
      activeHours: `${this.config!.activeHours.start}:00 - ${this.config!.activeHours.end}:00`,
      uptime: formatUptime(Date.now() - this.startTime),
    }));

    // Wire up Telegram control commands
    reporter?.onControl((action) => {
      if (action === 'pause') this.paused = true;
      if (action === 'resume') this.paused = false;
      if (action === 'stop') void this.stop();
    });

    // Wire up the execution loop to the scheduler
    const repoPath = this.config.workspace.repoPath;
    scheduler.onTask(async () => {
      await this.executeNextTask(
        repoPath, workspace, codingClient, budgetTracker, reporter, db,
      );
    });

    // Ensure we're on the work branch
    await workspace.ensureBranch();

    this.logger.info('Mother Brain Daemon started');
  }

  async stop(): Promise<void> {
    this.logger.info('Mother Brain Daemon stopping...');
    await this.lifecycle.stopAll();
    this.logger.info('Mother Brain Daemon stopped');
  }

  /**
   * Core execution loop — called on each scheduler heartbeat.
   */
  private async executeNextTask(
    repoPath: string,
    workspace: WorkspaceManager,
    llmClient: LLMExecutor,
    budgetTracker: BudgetTracker,
    reporter: TelegramReporter | null,
    db: DatabaseManager,
  ): Promise<void> {
    if (this.paused) {
      this.logger.debug('Daemon paused — skipping task');
      return;
    }

    // 1. Check budget
    if (!budgetTracker.canProceed(this.sessionId)) {
      this.logger.info('Budget exceeded — stopping');
      await reporter?.notifyBudgetWarning(
        budgetTracker.getStatus(this.sessionId).totalSpent.toFixed(2),
        '0.00',
        this.config!.budget.currency,
      );
      return;
    }

    // 2. Parse roadmap and pick next task
    const roadmapPath = join(repoPath, '.mother-brain', 'docs', 'roadmap.md');
    const roadmap = parseRoadmap(roadmapPath, this.logger);
    const picked = pickNextTask(roadmap, this.logger);

    if (!picked) {
      this.logger.info('All tasks complete — nothing to execute');
      return;
    }

    const { task, outcome } = picked;
    this.logger.info({ taskId: task.id, description: task.description }, 'Executing task');

    // Record task execution start
    const executionId = randomUUID();
    db.connection.prepare(`
      INSERT INTO task_executions (id, session_id, task_id, outcome_id, started_at, status)
      VALUES (?, ?, ?, ?, datetime('now'), 'running')
    `).run(executionId, this.sessionId, task.id, outcome.id);

    try {
      // 3. Build context
      const context = buildTaskContext(task, outcome, repoPath, this.logger);

      // 4. Call LLM
      const result = await llmClient.executeTask(context.systemPrompt, context.taskPrompt);

      // 5. Record budget
      budgetTracker.recordUsage(
        this.sessionId,
        'copilot',
        result.model,
        result.inputTokens,
        result.outputTokens,
      );

      // 6. Apply changes
      if (result.changes.length === 0) {
        this.logger.warn({ taskId: task.id }, 'LLM returned no file changes');
        db.connection.prepare(
          `UPDATE task_executions SET status = 'skipped', completed_at = datetime('now') WHERE id = ?`,
        ).run(executionId);
        return;
      }

      applyFileChanges(result.changes, repoPath, this.logger);

      // 7. Verify
      const verification = verify(repoPath, this.logger);

      if (verification.confidence === 'FAILED') {
        // Revert changes
        await workspace.revertChanges();
        db.connection.prepare(
          `UPDATE task_executions SET status = 'failed', completed_at = datetime('now'), verification_result = ? WHERE id = ?`,
        ).run(verification.summary, executionId);
        await reporter?.notifyError(task.id, verification.summary);
        return;
      }

      // 8. Commit
      const sha = await workspace.commitChanges(task.id, task.description);

      // 9. Record success
      db.connection.prepare(
        `UPDATE task_executions SET status = 'verified', completed_at = datetime('now'), verification_result = ?, commit_sha = ? WHERE id = ?`,
      ).run(verification.summary, sha, executionId);

      db.connection.prepare(
        `UPDATE sessions SET tasks_completed = tasks_completed + 1 WHERE id = ?`,
      ).run(this.sessionId);

      this.tasksCompleted++;

      // 10. Notify
      await reporter?.notifyTaskComplete(task.id, task.description, sha, verification.confidence);
      this.logger.info({ taskId: task.id, sha, confidence: verification.confidence }, 'Task complete');

    } catch (error) {
      this.logger.error({ taskId: task.id, error }, 'Task execution failed');
      db.connection.prepare(
        `UPDATE task_executions SET status = 'failed', completed_at = datetime('now') WHERE id = ?`,
      ).run(executionId);

      // Revert any partial changes
      try {
        await workspace.revertChanges();
      } catch {
        this.logger.error('Failed to revert changes after error');
      }

      await reporter?.notifyError(task.id, String(error));
    }
  }
}

function formatUptime(ms: number): string {
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  return `${hours}h ${minutes}m`;
}
