import { Bot } from 'grammy';
import type { Logger } from 'pino';
import type { DaemonModule } from '../core/lifecycle.js';
import type { TelegramConfig } from '../core/config.js';

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

  private async sendMessage(text: string): Promise<void> {
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
