import type { Logger } from 'pino';
import type Database from 'better-sqlite3';

// ---------------------------------------------------------------------------
// Pricing Models (cost per million tokens)
// ---------------------------------------------------------------------------

interface ModelPricing {
  inputPerMillion: number;   // USD per million input tokens
  outputPerMillion: number;  // USD per million output tokens
}

const PRICING: Record<string, ModelPricing> = {
  // Anthropic Claude
  'claude-sonnet-4-20250514': { inputPerMillion: 3.00, outputPerMillion: 15.00 },
  'claude-3-5-sonnet-20241022': { inputPerMillion: 3.00, outputPerMillion: 15.00 },
  'claude-3-5-haiku-20241022': { inputPerMillion: 0.80, outputPerMillion: 4.00 },
  'claude-3-haiku-20240307': { inputPerMillion: 0.25, outputPerMillion: 1.25 },
  // OpenAI GPT
  'gpt-4o': { inputPerMillion: 2.50, outputPerMillion: 10.00 },
  'gpt-4o-mini': { inputPerMillion: 0.15, outputPerMillion: 0.60 },
};

/** Get pricing for a model. Falls back to Claude Sonnet pricing if unknown. */
function getPricing(model: string): ModelPricing {
  return PRICING[model] ?? { inputPerMillion: 3.00, outputPerMillion: 15.00 };
}

/** Calculate cost in USD for a given model and token counts. */
export function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = getPricing(model);
  return (
    (inputTokens / 1_000_000) * pricing.inputPerMillion +
    (outputTokens / 1_000_000) * pricing.outputPerMillion
  );
}

// ---------------------------------------------------------------------------
// Budget Tracker
// ---------------------------------------------------------------------------

export interface BudgetStatus {
  sessionId: string;
  totalSpent: number;   // USD
  budgetCap: number;    // USD
  remaining: number;    // USD
  canProceed: boolean;
  taskBreakdown: Array<{ taskId: string; cost: number }>;
}

export class BudgetTracker {
  constructor(
    private db: Database.Database,
    private budgetCap: number,
    private currency: string,
    private logger: Logger,
  ) {}

  /** Record an API call's token usage and cost. */
  recordUsage(
    sessionId: string,
    provider: string,
    model: string,
    inputTokens: number,
    outputTokens: number,
  ): number {
    const cost = calculateCost(model, inputTokens, outputTokens);

    this.db.prepare(`
      INSERT INTO budget_tracking (session_id, timestamp, provider, model, input_tokens, output_tokens, cost_usd)
      VALUES (?, datetime('now'), ?, ?, ?, ?, ?)
    `).run(sessionId, provider, model, inputTokens, outputTokens, cost);

    // Update session totals
    this.db.prepare(`
      UPDATE sessions
      SET tokens_used = tokens_used + ? + ?,
          cost_usd = cost_usd + ?
      WHERE id = ?
    `).run(inputTokens, outputTokens, cost, sessionId);

    this.logger.info(
      { provider, model, inputTokens, outputTokens, cost: cost.toFixed(4), currency: this.currency },
      'API usage recorded',
    );

    return cost;
  }

  /** Check if we can proceed with the next task (budget not exceeded). */
  canProceed(sessionId: string): boolean {
    const row = this.db.prepare(
      'SELECT COALESCE(SUM(cost_usd), 0) as total FROM budget_tracking WHERE session_id = ?',
    ).get(sessionId) as { total: number } | undefined;

    const totalSpent = row?.total ?? 0;
    const remaining = this.budgetCap - totalSpent;

    if (remaining <= 0) {
      this.logger.warn(
        { totalSpent: totalSpent.toFixed(4), budgetCap: this.budgetCap, currency: this.currency },
        'Budget exceeded — stopping execution',
      );
      return false;
    }

    this.logger.debug(
      { remaining: remaining.toFixed(4), currency: this.currency },
      'Budget check passed',
    );
    return true;
  }

  /** Get full budget status for reporting. */
  getStatus(sessionId: string): BudgetStatus {
    const totalRow = this.db.prepare(
      'SELECT COALESCE(SUM(cost_usd), 0) as total FROM budget_tracking WHERE session_id = ?',
    ).get(sessionId) as { total: number } | undefined;

    const totalSpent = totalRow?.total ?? 0;

    // Get per-task breakdown from task_executions
    const tasks = this.db.prepare(`
      SELECT te.task_id, COALESCE(SUM(bt.cost_usd), 0) as cost
      FROM task_executions te
      LEFT JOIN budget_tracking bt ON bt.session_id = te.session_id
      WHERE te.session_id = ?
      GROUP BY te.task_id
    `).all(sessionId) as Array<{ task_id: string; cost: number }>;

    return {
      sessionId,
      totalSpent,
      budgetCap: this.budgetCap,
      remaining: this.budgetCap - totalSpent,
      canProceed: totalSpent < this.budgetCap,
      taskBreakdown: tasks.map((t) => ({ taskId: t.task_id, cost: t.cost })),
    };
  }
}
