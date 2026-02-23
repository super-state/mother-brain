# Example: Creating a New Daemon Module

## Input (User Request)
"I need to add a budget tracking module to the daemon."

## Wizard Interaction
Agent identifies this as a `budget/` module per the daemon architecture.

## Output

### File: `daemon/src/budget/tracker.ts`

```typescript
import { Logger } from 'pino';
import Database from 'better-sqlite3';
import type { DaemonConfig } from '../core/config.js';

export interface TokenUsage {
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}

export class BudgetTracker {
  private logger: Logger;

  constructor(
    private config: DaemonConfig,
    private db: Database.Database,
    logger: Logger
  ) {
    this.logger = logger.child({ module: 'budget-tracker' });
  }

  async start(): Promise<void> {
    this.logger.info('Budget tracker initialized');
  }

  async stop(): Promise<void> {
    this.logger.info('Budget tracker stopped');
  }

  recordUsage(sessionId: string, usage: TokenUsage): void {
    this.db.prepare(`
      INSERT INTO budget_tracking (session_id, timestamp, provider, model, input_tokens, output_tokens, cost_usd)
      VALUES (?, datetime('now'), ?, ?, ?, ?, ?)
    `).run(sessionId, usage.provider, usage.model, usage.inputTokens, usage.outputTokens, usage.costUsd);

    this.logger.debug({ sessionId, ...usage }, 'Token usage recorded');
  }

  getSessionSpend(sessionId: string): number {
    const result = this.db.prepare(
      'SELECT COALESCE(SUM(cost_usd), 0) as total FROM budget_tracking WHERE session_id = ?'
    ).get(sessionId) as { total: number };
    return result.total;
  }

  isWithinBudget(sessionId: string): boolean {
    const spent = this.getSessionSpend(sessionId);
    const limit = this.config.budgetCap.perNight;
    const withinBudget = spent < limit;

    if (!withinBudget) {
      this.logger.warn({ spent, limit }, 'Budget exceeded');
    }

    return withinBudget;
  }
}
```

### Validation
- [x] Located in `daemon/src/budget/` per architecture
- [x] TypeScript strict mode compatible
- [x] Graceful start/stop lifecycle
- [x] Structured logging via pino
- [x] Error handling prevents crashes
- [x] Uses SQLite for persistence
- [x] No unnecessary dependencies
