import { Bot } from 'grammy';
import type { Logger } from 'pino';
import type { DaemonModule } from '../core/lifecycle.js';
import type { TelegramConfig } from '../core/config.js';
import type { ProjectManager, Project } from '../db/projects.js';
import type { BudgetTracker, UsageReport } from '../budget/tracker.js';
import type { UsageOptimizer, OptimizationReport } from '../budget/optimizer.js';
import type { ConversationHandler } from '../conversation/handler.js';
import type { CommitmentStore, Commitment, CommitmentResult } from '../commitment/index.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DaemonStatus {
  state: string;
  currentTask: string | null;
  tasksCompleted: number;
  budgetRemaining: string;
  activeHours: string;
  uptime: string;
}

export type StatusProvider = () => DaemonStatus;
export type PauseResumeHandler = (action: 'pause' | 'resume' | 'stop') => void;

// ---------------------------------------------------------------------------
// Telegram Reporter
// ---------------------------------------------------------------------------

/**
 * Telegram bot for daemon communication.
 *
 * Commands:
 * - /status — Show current daemon state
 * - /pause — Pause task execution
 * - /resume — Resume task execution
 * - /stop — Emergency stop
 *
 * Outbound notifications:
 * - Task completion
 * - Errors
 * - Budget warnings
 * - Morning report
 */
export class TelegramReporter implements DaemonModule {
  readonly name = 'telegram';
  private bot: Bot | null = null;
  private statusProvider: StatusProvider | null = null;
  private controlHandler: PauseResumeHandler | null = null;
  private projectManager: ProjectManager | null = null;
  private budgetTracker: BudgetTracker | null = null;
  private usageOptimizer: UsageOptimizer | null = null;
  private conversationHandler: ConversationHandler | null = null;
  private commitmentStore: CommitmentStore | null = null;
  private commitmentScheduler: import('../commitment/scheduler.js').CommitmentScheduler | null = null;

  constructor(
    private config: TelegramConfig,
    private logger: Logger,
  ) {}

  /** Register a callback that provides current daemon status. */
  onStatus(provider: StatusProvider): void {
    this.statusProvider = provider;
  }

  /** Register a callback for pause/resume/stop commands. */
  onControl(handler: PauseResumeHandler): void {
    this.controlHandler = handler;
  }

  /** Register the project manager for project commands. */
  onProjects(manager: ProjectManager): void {
    this.projectManager = manager;
  }

  /** Register the budget tracker for usage commands. */
  onBudget(tracker: BudgetTracker): void {
    this.budgetTracker = tracker;
  }

  /** Register the usage optimizer for optimization analysis. */
  onOptimizer(optimizer: UsageOptimizer): void {
    this.usageOptimizer = optimizer;
  }

  /** Register the conversation handler for natural language messages. */
  onConversation(handler: ConversationHandler): void {
    this.conversationHandler = handler;
  }

  /** Register the commitment store for commitment commands. */
  onCommitments(store: CommitmentStore): void {
    this.commitmentStore = store;
  }

  /** Register commitment detection for conversation flow. */
  onConversationCommitments(store: CommitmentStore, scheduler: import('../commitment/scheduler.js').CommitmentScheduler): void {
    this.commitmentStore = store;
    this.commitmentScheduler = scheduler;
  }

  async start(): Promise<void> {
    this.bot = new Bot(this.config.botToken);
    const authorizedChat = this.config.chatId;

    // Auth middleware — only respond to the configured chat
    this.bot.use(async (ctx, next) => {
      if (ctx.chat?.id.toString() !== authorizedChat) {
        this.logger.warn({ chatId: ctx.chat?.id }, 'Unauthorized chat — ignoring');
        return;
      }
      await next();
    });

    // /status command
    this.bot.command('status', async (ctx) => {
      const status = this.statusProvider?.() ?? {
        state: 'unknown', currentTask: null, tasksCompleted: 0,
        budgetRemaining: 'N/A', activeHours: 'N/A', uptime: 'N/A',
      };
      await ctx.reply(formatStatusMessage(status), { parse_mode: 'HTML' });
    });

    // /pause command
    this.bot.command('pause', async (ctx) => {
      this.controlHandler?.('pause');
      await ctx.reply('⏸ Daemon paused. Use /resume to continue.');
    });

    // /resume command
    this.bot.command('resume', async (ctx) => {
      this.controlHandler?.('resume');
      await ctx.reply('▶️ Daemon resumed.');
    });

    // /stop command
    this.bot.command('stop', async (ctx) => {
      await ctx.reply('🛑 Emergency stop initiated. Daemon shutting down...');
      this.controlHandler?.('stop');
    });

    // /projects — list all projects
    this.bot.command('projects', async (ctx) => {
      if (!this.projectManager) {
        await ctx.reply('Project manager not available.');
        return;
      }
      const projects = this.projectManager.listProjects();
      if (projects.length === 0) {
        await ctx.reply('📂 No projects. Use /addproject &lt;path&gt; to add one.');
        return;
      }
      await ctx.reply(formatProjectsList(projects), { parse_mode: 'HTML' });
    });

    // /addproject <path> [name] — add a new project
    this.bot.command('addproject', async (ctx) => {
      if (!this.projectManager) {
        await ctx.reply('Project manager not available.');
        return;
      }
      const args = ctx.match?.toString().trim().split(/\s+/) ?? [];
      if (args.length === 0 || !args[0]) {
        await ctx.reply('Usage: /addproject &lt;path&gt; [name]');
        return;
      }
      const project = this.projectManager.addProject(args[0], 'daemon/work', args[1]);
      if (!project) {
        await ctx.reply(`❌ Path not found: ${args[0]}`);
        return;
      }
      await ctx.reply(`✅ Added project: <b>${escapeHtml(project.name)}</b>\nPath: <code>${escapeHtml(project.repoPath)}</code>`, { parse_mode: 'HTML' });
    });

    // /work <name> — set active project
    this.bot.command('work', async (ctx) => {
      if (!this.projectManager) {
        await ctx.reply('Project manager not available.');
        return;
      }
      const name = ctx.match?.toString().trim();
      if (!name) {
        await ctx.reply('Usage: /work &lt;project-name&gt;');
        return;
      }
      const project = this.projectManager.setActiveProject(name);
      if (!project) {
        await ctx.reply(`❌ Project not found: ${name}`);
        return;
      }
      await ctx.reply(`🎯 Now working on: <b>${escapeHtml(project.name)}</b>`, { parse_mode: 'HTML' });
    });

    // /rmproject <name> — remove a project
    this.bot.command('rmproject', async (ctx) => {
      if (!this.projectManager) {
        await ctx.reply('Project manager not available.');
        return;
      }
      const name = ctx.match?.toString().trim();
      if (!name) {
        await ctx.reply('Usage: /rmproject &lt;project-name&gt;');
        return;
      }
      const removed = this.projectManager.removeProject(name);
      if (removed) {
        await ctx.reply(`🗑 Project removed: ${name}`);
      } else {
        await ctx.reply(`❌ Project not found: ${name}`);
      }
    });

    // /usage — comprehensive token usage report
    this.bot.command('usage', async (ctx) => {
      if (!this.budgetTracker) {
        await ctx.reply('Budget tracker not available.');
        return;
      }
      const report = this.budgetTracker.getUsageReport();
      await ctx.reply(formatUsageReport(report), { parse_mode: 'HTML' });
    });

    // /optimize — run usage optimization analysis
    this.bot.command('optimize', async (ctx) => {
      if (!this.usageOptimizer) {
        await ctx.reply('Usage optimizer not available.');
        return;
      }
      const days = parseInt(ctx.match?.toString().trim() || '7', 10) || 7;
      const report = this.usageOptimizer.analyze(days);
      await ctx.reply(formatOptimizationReport(report), { parse_mode: 'HTML' });
    });

    // /commitments — list active commitments
    this.bot.command('commitments', async (ctx) => {
      if (!this.commitmentStore) {
        await ctx.reply('Commitment engine not available.');
        return;
      }
      const active = this.commitmentStore.listActive();
      if (active.length === 0) {
        await ctx.reply("📋 No active commitments. I haven't promised anything yet!");
        return;
      }
      await ctx.reply(formatCommitmentsList(active), { parse_mode: 'HTML' });
    });

    // /cancel <query> — cancel a commitment by description
    this.bot.command('cancel', async (ctx) => {
      if (!this.commitmentStore) {
        await ctx.reply('Commitment engine not available.');
        return;
      }
      const query = ctx.match?.toString().trim();
      if (!query) {
        await ctx.reply('Usage: /cancel &lt;description&gt;\nExample: /cancel daily news');
        return;
      }
      const cancelled = this.commitmentStore.cancelByDescription(query);
      if (cancelled) {
        await ctx.reply(`✅ Cancelled: "${escapeHtml(cancelled.actionDescription)}"`);
      } else {
        await ctx.reply(`❌ No active commitment matching "${escapeHtml(query)}". Use /commitments to see active ones.`);
      }
    });

    // /reset — reset conversation state to start fresh
    this.bot.command('reset', async (ctx) => {
      if (!this.conversationHandler) {
        await ctx.reply('Conversation handler not available.');
        return;
      }
      this.conversationHandler.resetConversation();
      await ctx.reply("🔄 Conversation reset. Let's start fresh! What are you working on?");
    });

    // Catch-all: natural language messages → conversation handler
    this.bot.on('message:text', async (ctx) => {
      if (!this.conversationHandler) {
        await ctx.reply("I'm running but conversation mode isn't set up yet. Use /status for daemon info.");
        return;
      }

      try {
        const response = await this.conversationHandler.handleMessage(ctx.message.text);
        await ctx.reply(response.text);

        // If commitments were detected, store and schedule them
        if (response.detectedCommitments?.length && this.commitmentStore && this.commitmentScheduler) {
          for (const detected of response.detectedCommitments) {
            const commitment = this.commitmentStore.create(detected);
            this.commitmentScheduler.scheduleCommitment(commitment);
            await this.notifyCommitmentCreated(commitment);
          }
        }
      } catch (error) {
        this.logger.error({ error }, 'Conversation handler error');
        await ctx.reply("Sorry, I had trouble processing that. Try again or use /status.");
      }
    });

    // Start polling (long polling — no webhooks needed for Pi)
    this.bot.start({
      onStart: () => {
        this.logger.info('Telegram bot started (long polling)');
      },
    });
  }

  async stop(): Promise<void> {
    if (this.bot) {
      await this.bot.stop();
      this.bot = null;
      this.logger.info('Telegram bot stopped');
    }
  }

  // ---------------------------------------------------------------------------
  // Outbound Notifications
  // ---------------------------------------------------------------------------

  /** Send a notification about task completion. */
  async notifyTaskComplete(taskId: string, description: string, commitSha: string, confidence: string): Promise<void> {
    const emoji = confidence === 'HIGH' ? '✅' : confidence === 'MEDIUM' ? '⚠️' : '❌';
    const message = [
      `${emoji} <b>Task ${taskId} Complete</b>`,
      `<i>${description}</i>`,
      ``,
      `Confidence: ${confidence}`,
      `Commit: <code>${commitSha.slice(0, 7)}</code>`,
    ].join('\n');
    await this.sendMessage(message);
  }

  /** Send a notification about an error. */
  async notifyError(taskId: string, error: string): Promise<void> {
    const message = [
      `🔴 <b>Task ${taskId} Failed</b>`,
      `<code>${escapeHtml(error.slice(0, 500))}</code>`,
    ].join('\n');
    await this.sendMessage(message);
  }

  /** Send a budget warning. */
  async notifyBudgetWarning(spent: string, remaining: string, currency: string): Promise<void> {
    await this.sendMessage(
      `💰 <b>Budget Warning</b>\nSpent: ${spent} ${currency}\nRemaining: ${remaining} ${currency}`,
    );
  }

  /** Send the morning report. */
  async sendMorningReport(report: MorningReport): Promise<void> {
    const message = formatMorningReport(report);
    await this.sendMessage(message);
  }

  /** Send an optimization analysis report. */
  async sendOptimizationReport(report: OptimizationReport): Promise<void> {
    await this.sendMessage(formatOptimizationReport(report));
  }

  /** Notify about a commitment result (success or failure). */
  async notifyCommitmentResult(commitment: Commitment, result: CommitmentResult): Promise<void> {
    if (result.success) {
      const lines = [
        `📌 <b>Commitment Fulfilled</b>`,
        `<i>${escapeHtml(commitment.actionDescription)}</i>`,
        '',
        result.output ? escapeHtml(result.output.slice(0, 500)) : 'Done!',
      ];
      if (commitment.type === 'recurring') {
        lines.push('', `🔁 Recurring — next run scheduled`);
      }
      await this.sendMessage(lines.join('\n'));
    } else {
      const lines = [
        `⚠️ <b>Commitment Failed</b>`,
        `<i>${escapeHtml(commitment.actionDescription)}</i>`,
        '',
        `Error: <code>${escapeHtml(result.error?.slice(0, 300) ?? 'Unknown error')}</code>`,
        '',
        `Use /commitments to see status or /cancel to remove it.`,
      ];
      await this.sendMessage(lines.join('\n'));
    }
  }

  /** Notify that a new commitment was detected and scheduled. */
  async notifyCommitmentCreated(commitment: Commitment): Promise<void> {
    const typeLabel = commitment.type === 'recurring'
      ? `🔁 Recurring (${commitment.schedule})`
      : `⏰ One-time`;
    await this.sendMessage(
      `📌 <b>Commitment Tracked</b>\n${typeLabel}\n<i>${escapeHtml(commitment.actionDescription)}</i>\n\nUse /commitments to see all, /cancel to remove.`,
    );
  }

  /** Send a message to the configured Telegram chat. */
  async sendMessage(text: string): Promise<void> {
    if (!this.bot) {
      this.logger.warn('Bot not started — cannot send message');
      return;
    }
    try {
      await this.bot.api.sendMessage(this.config.chatId, text, { parse_mode: 'HTML' });
    } catch (error) {
      this.logger.error({ error }, 'Failed to send Telegram message');
    }
  }
}

// ---------------------------------------------------------------------------
// Message Formatting
// ---------------------------------------------------------------------------

export interface MorningReport {
  sessionDuration: string;
  tasksCompleted: number;
  tasksFailed: number;
  totalSpent: string;
  currency: string;
  completedTasks: Array<{ id: string; description: string; confidence: string }>;
  failedTasks: Array<{ id: string; description: string; error: string }>;
}

function formatStatusMessage(status: DaemonStatus): string {
  const stateEmoji = status.state === 'running' ? '🟢' : status.state === 'paused' ? '🟡' : '🔴';
  return [
    `${stateEmoji} <b>Mother Brain Daemon</b>`,
    ``,
    `State: ${status.state}`,
    status.currentTask ? `Current Task: ${status.currentTask}` : 'Current Task: idle',
    `Tasks Completed: ${status.tasksCompleted}`,
    `Budget Remaining: ${status.budgetRemaining}`,
    `Active Hours: ${status.activeHours}`,
    `Uptime: ${status.uptime}`,
  ].join('\n');
}

function formatMorningReport(report: MorningReport): string {
  const lines = [
    `☀️ <b>Morning Report</b>`,
    ``,
    `⏱ Duration: ${report.sessionDuration}`,
    `✅ Completed: ${report.tasksCompleted}`,
    `❌ Failed: ${report.tasksFailed}`,
    `💰 Spent: ${report.totalSpent} ${report.currency}`,
  ];

  if (report.completedTasks.length > 0) {
    lines.push('', '<b>Completed:</b>');
    for (const task of report.completedTasks) {
      const emoji = task.confidence === 'HIGH' ? '✅' : '⚠️';
      lines.push(`  ${emoji} Task ${task.id}: ${task.description}`);
    }
  }

  if (report.failedTasks.length > 0) {
    lines.push('', '<b>Failed:</b>');
    for (const task of report.failedTasks) {
      lines.push(`  ❌ Task ${task.id}: ${task.description}`);
      lines.push(`     <code>${escapeHtml(task.error.slice(0, 100))}</code>`);
    }
  }

  return lines.join('\n');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatProjectsList(projects: Project[]): string {
  const lines = [`📂 <b>Projects</b> (${projects.length})\n`];
  for (const p of projects) {
    const active = p.active ? ' 🎯' : '';
    const tasks = p.tasksCompleted > 0 ? ` (${p.tasksCompleted} tasks done)` : '';
    lines.push(`${active} <b>${escapeHtml(p.name)}</b>${tasks}`);
    lines.push(`  <code>${escapeHtml(p.repoPath)}</code>`);
  }
  lines.push('', 'Use /work &lt;name&gt; to switch projects');
  return lines.join('\n');
}

function formatUsageReport(report: UsageReport): string {
  const lines = [
    `📊 <b>Token Usage Report</b>`,
    ``,
    `<b>All-Time:</b>`,
    `  Tokens: ${report.allTime.totalTokens.toLocaleString()}`,
    `  Cost: $${report.allTime.totalCost.toFixed(4)}`,
    `  Requests: ${report.allTime.requestCount}`,
  ];

  // Global budget
  if (report.globalBudget.cap !== Infinity) {
    const bar = makeProgressBar(report.globalBudget.percentUsed);
    lines.push(
      ``,
      `<b>Global Budget:</b>`,
      `  ${bar} ${report.globalBudget.percentUsed.toFixed(1)}%`,
      `  $${report.globalBudget.spent.toFixed(4)} / $${report.globalBudget.cap.toFixed(2)}`,
    );
  }

  // By tier
  const tiers = Object.entries(report.byTier);
  if (tiers.length > 0) {
    lines.push('', '<b>By Tier:</b>');
    const tierEmoji: Record<string, string> = {
      background: '🔧', chat: '💬', planning: '📋', coding: '🏗️', review: '🔍',
    };
    for (const [tier, data] of tiers) {
      const emoji = tierEmoji[tier] ?? '•';
      lines.push(`  ${emoji} ${tier}: ${data.tokens.toLocaleString()} tokens ($${data.cost.toFixed(4)}) [${data.requests} req]`);
    }
  }

  // By model
  const models = Object.entries(report.byModel);
  if (models.length > 0) {
    lines.push('', '<b>By Model:</b>');
    for (const [model, data] of models) {
      lines.push(`  • ${model}: $${data.cost.toFixed(4)} [${data.requests} req]`);
    }
  }

  // By project
  const projects = Object.entries(report.byProject);
  if (projects.length > 0) {
    lines.push('', '<b>By Project:</b>');
    for (const [project, data] of projects) {
      lines.push(`  • ${project}: $${data.cost.toFixed(4)} (${data.tokens.toLocaleString()} tokens)`);
    }
  }

  return lines.join('\n');
}

function formatOptimizationReport(report: OptimizationReport): string {
  const lines = [
    `🔍 <b>Usage Optimization Report</b>`,
    `<i>Last ${report.periodDays} days — ${report.totalRequests} requests, $${report.totalCost.toFixed(4)} spent</i>`,
    ``,
  ];

  if (report.insights.length === 0) {
    lines.push('✅ No optimization opportunities found — usage looks efficient.');
  } else {
    const severityEmoji: Record<string, string> = {
      critical: '🔴', warning: '🟡', info: '🔵',
    };

    for (const insight of report.insights) {
      const emoji = severityEmoji[insight.severity] ?? '•';
      lines.push(`${emoji} <b>${escapeHtml(insight.title)}</b>`);
      lines.push(`   ${escapeHtml(insight.detail)}`);
      lines.push(`   💡 ${escapeHtml(insight.suggestion)}`);
      lines.push('');
    }
  }

  lines.push(`<i>${escapeHtml(report.summary)}</i>`);
  return lines.join('\n');
}

function makeProgressBar(percent: number): string {
  const filled = Math.round(percent / 10);
  const empty = 10 - filled;
  return '▓'.repeat(filled) + '░'.repeat(empty);
}

function formatCommitmentsList(commitments: Commitment[]): string {
  const lines = [`📋 <b>Active Commitments</b> (${commitments.length})\n`];
  for (const c of commitments) {
    const typeEmoji = c.type === 'recurring' ? '🔁' : '⏰';
    const statusEmoji = c.status === 'executing' ? '⏳' : c.status === 'failed' ? '❌' : '✅';
    lines.push(`${typeEmoji}${statusEmoji} <b>${escapeHtml(c.actionDescription)}</b>`);
    if (c.type === 'recurring' && c.schedule) {
      lines.push(`  Schedule: <code>${c.schedule}</code>`);
    }
    if (c.executionCount > 0) {
      lines.push(`  Executed: ${c.executionCount} time${c.executionCount > 1 ? 's' : ''}`);
    }
    if (c.failureReason) {
      lines.push(`  ⚠️ Last error: ${escapeHtml(c.failureReason.slice(0, 100))}`);
    }
    lines.push('');
  }
  lines.push('Use /cancel &lt;description&gt; to remove a commitment.');
  return lines.join('\n');
}
