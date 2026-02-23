---
name: telegram-integrator
description: Build and maintain the Telegram bot interface for Mother Brain Daemon using grammy — commands, notifications, and morning reports.
license: MIT
compatibility: node>=18
metadata:
  domain: messaging
  stage: production
allowed-tools: powershell view grep glob web_search ask_user create edit
---

# Telegram Integrator

Provides patterns and implementation guidance for the daemon's Telegram bot interface. Use this skill when building any Telegram-related functionality.

## Purpose

The Telegram bot is the daemon's primary communication channel:
- Receive commands from the user (status, pause, resume, stop)
- Send notifications (task complete, errors, budget warnings)
- Deliver morning reports (overnight summary with proofs)
- Allow monitoring and control from any phone, anywhere

## Operating Principles

### Core Rules
- **grammy framework** — Use grammy (not Telegraf, not raw API). TypeScript-first, modern, maintained.
- **Modular commands** — Each command is a separate Composer. Easy to add/remove.
- **Single chat** — Only responds to the configured chat ID. Ignore all other messages.
- **No conversation state** — Bot is stateless. Each command is independent. No "sessions".
- **Rate limiting** — Never send more than 1 message per 5 seconds (Telegram limits).
- **Markdown V2** — Use MarkdownV2 for formatting. Escape special characters.
- **Silent mode** — Support quiet hours. Don't send non-critical notifications between midnight and wake time.

### Bot Architecture

```typescript
import { Bot, Composer } from 'grammy';

// Main bot setup
const bot = new Bot(config.telegram.botToken);

// Auth middleware — only respond to configured chat
bot.use(async (ctx, next) => {
  if (ctx.chat?.id.toString() !== config.telegram.chatId) return;
  await next();
});

// Modular command composers
bot.use(statusCommand);    // /status
bot.use(pauseCommand);     // /pause
bot.use(resumeCommand);    // /resume  
bot.use(budgetCommand);    // /budget
bot.use(nextCommand);      // /next
bot.use(reportCommand);    // /report
bot.use(stopCommand);      // /stop

bot.start();
```

### Command Specifications

#### `/status` — Current daemon state
```
🧠 Mother Brain Daemon

Status: 🟢 Running
Active Since: 11:00 PM

📋 Current Task: Build user auth module
⏱️ Running for: 12 minutes
📍 Outcome: Ability to authenticate users

💰 Budget: £2.34 / £5.00 (47%)
✅ Tasks Complete: 3
⚠️ Tasks Failed: 0
```

#### `/pause` — Pause execution
```
⏸️ Daemon paused

Current task will finish, then no new tasks will start.
Use /resume to continue.
```

#### `/resume` — Resume execution
```
▶️ Daemon resumed

Picking up next task from roadmap.
```

#### `/budget` — Budget status
```
💰 Budget Report

Tonight's Cap: £5.00
Spent So Far: £2.34 (47%)
Remaining: £2.66

Breakdown:
- Claude API: £2.10 (4 tasks)
- Ollama: £0.00 (12 classifications)
- Total tokens: 18,700

At current rate: ~2 more tasks before cap
```

#### `/next` — What's queued
```
📋 Next in Queue

1. 🔄 Build user auth module (in progress)
2. ⬜ Create login endpoint
3. ⬜ Add JWT token generation
4. ⬜ Write auth middleware

📍 Outcome: Ability to authenticate users (3/7 criteria remaining)
```

#### `/report` — Last night's summary
Triggers the morning report (see Morning Report section).

#### `/stop` — Emergency stop
```
🛑 Daemon stopped

All work halted immediately.
Current task reverted (uncommitted changes discarded).
Use /resume to restart.
```

### Morning Report Format

```
☀️ Morning Report — [Date]

🌙 Active: 11:00 PM → 6:45 AM (7h 45m)

📊 Summary:
- ✅ Tasks completed: 5
- ⚠️ Tasks failed: 1
- 💰 Budget used: £3.21 / £5.00

🎯 Outcomes Progress:
- ✅ Ability to authenticate users — COMPLETE
  - All 4 acceptance criteria verified
- 🔄 Ability to manage user profiles — 2/5 criteria
  - ✅ I can view my profile
  - ✅ I can update my email
  - 🔄 I can upload a profile picture (in progress)

❌ Failed Tasks:
- Upload profile picture handler
  - Build failed: missing sharp dependency
  - Needs: npm install sharp
  - Confidence: MEDIUM (needs human review)

📝 Commits:
- abc1234: feat: add JWT authentication
- def5678: feat: create login/register endpoints
- ghi9012: feat: add auth middleware
- jkl3456: feat: user profile view endpoint
- mno7890: feat: user email update endpoint

💡 Suggested Next Steps:
1. Install sharp dependency for image processing
2. Review MEDIUM confidence commits on branch daemon/overnight-[date]
3. Continue with "Ability to manage user profiles" outcome
```

### Notification Types

| Type | Priority | When to Send | Silent Hours? |
|------|----------|-------------|---------------|
| Task Complete | Low | After each verified task | Respect silent |
| Outcome Complete | Medium | All criteria verified | Send always |
| Error Alert | High | Unrecoverable error | Send always |
| Budget Warning | High | At 80% of cap | Send always |
| Budget Exceeded | Critical | Cap reached, stopping | Send always |
| Morning Report | Medium | Configured wake time | N/A (IS wake) |

### Message Formatting

```typescript
// Helper for MarkdownV2 escaping
function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

// Message builder pattern
class MessageBuilder {
  private lines: string[] = [];

  header(emoji: string, text: string): this {
    this.lines.push(`${emoji} *${escapeMarkdown(text)}*`);
    return this;
  }

  line(text: string): this {
    this.lines.push(escapeMarkdown(text));
    return this;
  }

  blank(): this {
    this.lines.push('');
    return this;
  }

  build(): string {
    return this.lines.join('\n');
  }
}
```

## Steps

1. **Identify Telegram Component**
   - Determine which part of the Telegram integration is being built
   - Check this skill for the appropriate pattern (command, notification, report)

2. **Implement Using Patterns**
   - Follow the command specification for correct message format
   - Use MessageBuilder for consistent formatting
   - Implement auth middleware (single chat only)
   - Respect notification priority and silent hours

3. **Validate**
   - Command responds only to configured chat ID
   - Messages are properly MarkdownV2 escaped
   - Rate limiting is respected (1 msg / 5 sec)
   - Silent hours are honored for low-priority notifications
   - Graceful shutdown stops the bot cleanly

## Validation Checklist

- [ ] Uses grammy (not Telegraf or raw API)
- [ ] Auth middleware filters to configured chat ID only
- [ ] Commands are modular Composers
- [ ] Messages use MarkdownV2 with proper escaping
- [ ] Rate limiting implemented
- [ ] Silent hours respected for low-priority notifications
- [ ] Morning report covers all required sections
- [ ] Graceful shutdown implemented
