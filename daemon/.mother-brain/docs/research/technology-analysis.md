# Technology & Pattern Analysis

## Autonomous Agent Architecture (2025 Best Practices)

### Architecture Pattern: Composable Modules
- Anthropic recommends composability over frameworks — small, focused modules with clear interfaces
- Direct LLM API calls preferred over heavyweight frameworks (no LangChain)
- Separate perception → decision → action modules
- Robust error handling, retry strategies, circuit breakers for overnight autonomy

### Node.js Patterns
- Event-driven async architecture ideal for orchestrating multiple concurrent tasks
- Use TypeScript for type safety in larger codebases
- Session memory via SQLite (not Redis — we're on a Pi, keep dependencies minimal)
- Structured logging (pino recommended over winston for performance)

### Key Decisions
- **No LangChain** — direct API calls with tool-use. Simpler, debuggable, efficient
- **No microservices** — single Node.js process is sufficient for a Pi daemon
- **Audit trail** — log every agent action for debugging and morning reports

---

## Ollama on Raspberry Pi 5 (Benchmarks)

### Model Performance Matrix

| Model | Params | Tokens/sec | RAM | Feasibility |
|-------|--------|-----------|-----|-------------|
| TinyLlama | 1.1B | 40+ | ~400MB | Excellent |
| Gemma2-2B | 2B | 20-25 | ~3GB | Sweet spot |
| Qwen2.5-3B | 3B | 10-15 | ~5.5GB | Usable |
| Phi-3 Q4 | 3.8B | 8-10 | ~5GB | Usable, slow |
| Mistral-7B Q4 | 7B | 3-6 | ~7GB | Slow, RAM-hungry |
| Llama 3-8B Q4 | 8B | 4-8 | ~5GB | Feasible but slow |

### Recommendations for Daemon
- **Classification/routing**: Gemma2-2B (20-25 tok/s, only 3GB) — fast enough for real-time
- **Output parsing**: TinyLlama 1.1B (40+ tok/s) — instant responses
- **Complex orchestration**: Qwen2.5-3B (10-15 tok/s) — best quality in practical range
- **Active cooling mandatory** — thermal throttling halves performance
- **SSD/NVMe boot** — SD cards too slow for model loading
- **Quantized models only** (Q4_K_M) — full precision won't fit
- **2GB+ swap** recommended for safety margin

### Daemon-Specific Strategy
- Use Gemma2-2B as the default local model (good balance)
- TinyLlama for trivial tasks (JSON parsing, boolean classification)
- Cloud API for actual code generation (not local — too slow and not good enough)
- Keep Ollama context window small to reduce RAM pressure

---

## grammy (Telegram Bot Framework)

### Why grammy
- Actively maintained, high-performance TypeScript-first framework
- Excellent plugin ecosystem (menus, sessions, rate limiting)
- Clean middleware composition pattern
- Strong docs: https://grammy.dev/guide/

### Architecture Pattern
```typescript
import { Bot, Composer } from "grammy";
const bot = new Bot(process.env.BOT_TOKEN!);

// Modular command handling
const statusModule = new Composer();
statusModule.command("status", ctx => ctx.reply("Running..."));
bot.use(statusModule);

bot.start();
```

### Daemon Bot Commands (Planned)
- `/status` — Current daemon state, active task, budget remaining
- `/report` — Last night's results
- `/pause` — Pause execution
- `/resume` — Resume execution
- `/budget` — Budget status and limits
- `/next` — What's queued next
- `/stop` — Stop current task
- `/approve <id>` — Approve a medium-confidence result

### Notification Patterns
- Morning report: Scheduled message at configured wake time
- Error alerts: Immediate notification on task failure
- Milestone: Notify when an outcome is verified
- Budget warning: Alert at 80% of budget cap

---

## croner (Cron Scheduler)

### Why croner
- Dependency-free, lightweight
- Supports seconds + year fields
- Built-in timezone handling
- Async overrun protection (won't re-enter running jobs)
- Pause/resume/stop lifecycle
- TypeScript typings included

### Active Hours Pattern
```typescript
import { Cron } from "croner";

// Run every 15 minutes between 11pm-7am
const nightWorker = new Cron('*/15 23,0-6 * * *', { 
  timezone: 'Europe/London' 
}, async () => {
  await daemon.checkAndExecuteNextTask();
});

// Morning report at 7:30am
const morningReport = new Cron('30 7 * * *', {
  timezone: 'Europe/London'
}, async () => {
  await daemon.sendMorningReport();
});
```

### Daemon Scheduler Design
- **Heartbeat interval**: Every 5-15 minutes during active hours
- **Active hours**: Configurable (default: 11pm-7am)
- **Morning report**: Configurable time (default: 7:30am)
- **Zero-cost when idle**: Cron check is pure computation, no LLM calls
- **Overrun protection**: croner won't stack tasks if previous is still running

---

## OpenClaw Patterns to Borrow

### Heartbeat Wake System
- Priority coalescing: RETRY=0 < INTERVAL=1 < DEFAULT=2 < ACTION=3
- 250ms coalesce window
- 1s retry backoff
- Session awareness (don't run if already executing)

### What NOT to Borrow
- Conversation history approach (token wasteful)
- 150-file gateway abstraction (over-engineered for single-channel)
- Multi-agent orchestration pattern (too complex for MVP)
- WhatsApp integration (Telegram only)

---

## Technology Stack (Final)

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Runtime | Node.js 22+ (TypeScript) | Same as CLI, async-native |
| Database | better-sqlite3 | Sync API, perfect for Pi, no server needed |
| LLM (Local) | Ollama + Gemma2-2B | Best tok/s vs quality ratio on Pi 5 |
| LLM (Cloud) | Anthropic Claude API | Best code generation quality |
| Telegram | grammy | TypeScript-first, modern, maintained |
| Scheduler | croner | Lightweight, timezone-aware, async-safe |
| Process Mgr | pm2 | Auto-restart, log management for Pi |
| Logging | pino | High-performance structured logging |
| Git | simple-git | Node.js git operations |
