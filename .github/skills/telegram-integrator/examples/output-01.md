# Example: Implementing a Telegram Command

## Input
"Add a /status command to the Telegram bot."

## Output

### File: `daemon/src/reporter/commands/status.ts`

```typescript
import { Composer } from 'grammy';
import type { DaemonContext } from '../bot.js';
import { MessageBuilder } from '../message-builder.js';

export const statusCommand = new Composer<DaemonContext>();

statusCommand.command('status', async (ctx) => {
  const daemon = ctx.daemon; // Injected via middleware
  const session = daemon.getCurrentSession();
  const budget = daemon.getBudgetStatus();
  const currentTask = daemon.getCurrentTask();

  const msg = new MessageBuilder()
    .header('🧠', 'Mother Brain Daemon')
    .blank()
    .line(`Status: ${session.status === 'active' ? '🟢 Running' : '⏸️ Paused'}`)
    .line(`Active Since: ${session.startedAt}`)
    .blank();

  if (currentTask) {
    msg
      .header('📋', `Current Task: ${currentTask.name}`)
      .line(`⏱️ Running for: ${currentTask.elapsed}`)
      .line(`📍 Outcome: ${currentTask.outcomeName}`)
      .blank();
  }

  msg
    .header('💰', 'Budget')
    .line(`${budget.spent} / ${budget.cap} (${budget.percentage}%)`)
    .line(`✅ Tasks Complete: ${session.tasksCompleted}`)
    .line(`⚠️ Tasks Failed: ${session.tasksFailed}`);

  await ctx.reply(msg.build(), { parse_mode: 'MarkdownV2' });
});
```

## Validation
- [x] Uses Composer pattern (modular)
- [x] Follows message format from skill spec
- [x] Uses MessageBuilder for consistent formatting
- [x] MarkdownV2 parse mode set
- [x] No conversation state — single request/response
