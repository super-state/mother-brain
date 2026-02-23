---
name: daemon-architect
description: Architecture and coding patterns for the Mother Brain Daemon — an autonomous Node.js service running on Raspberry Pi.
license: MIT
compatibility: node>=18
metadata:
  domain: backend
  stage: production
allowed-tools: powershell view grep glob web_search ask_user create edit
---

# Daemon Architect

Provides architectural guidance and coding patterns for the Mother Brain Daemon. Use this skill when implementing any daemon component to ensure consistency, reliability, and token efficiency.

## Purpose

The daemon is an autonomous Node.js service that:
- Reads Mother Brain roadmaps and executes outcomes overnight
- Runs on a Raspberry Pi (resource-constrained environment)
- Must be reliable enough to operate without supervision for 8+ hours
- Must be token-efficient ($0 when idle, minimal context per task)

## Operating Principles

### Architecture Rules (MANDATORY)
- **Single process** — No microservices. One Node.js process manages everything.
- **No frameworks** — Direct LLM API calls, no LangChain/LlamaIndex. Keep dependencies minimal.
- **TypeScript strict mode** — All code in TypeScript with strict compiler options.
- **ESM modules** — Use ES module syntax (`import`/`export`), not CommonJS.
- **Composable modules** — Small, focused modules with clear interfaces. Each module does one thing.
- **Async/await everywhere** — No callbacks, no raw promises. Always async/await.
- **Graceful shutdown** — Every module must handle SIGTERM/SIGINT cleanly.
- **Structured logging** — Use pino for all logging. Never console.log in production code.

### Module Structure
```
daemon/src/
├── core/           # Core daemon lifecycle (start, stop, config)
│   ├── daemon.ts       # Main daemon class — orchestrates everything
│   ├── config.ts       # Configuration loading and validation
│   └── lifecycle.ts    # Startup/shutdown coordination
├── scheduler/      # Cron scheduling and task picking
│   ├── scheduler.ts    # croner-based job scheduling
│   ├── task-picker.ts  # Reads roadmap, selects next task
│   └── active-hours.ts # Active hours configuration
├── llm/            # LLM API abstraction
│   ├── router.ts       # Routes requests to local/cloud models
│   ├── cloud.ts        # Cloud API client (Anthropic/OpenAI)
│   ├── local.ts        # Ollama client for local models
│   └── context.ts      # Context builder — minimal token usage
├── workspace/      # Git repo and file management
│   ├── workspace.ts    # Git operations (clone, branch, commit)
│   ├── file-reader.ts  # Read project files for context
│   └── roadmap-parser.ts # Parse Mother Brain roadmap.md
├── verifier/       # Multi-layer verification gates
│   ├── verifier.ts     # Orchestrates verification pipeline
│   ├── build-gate.ts   # Build verification
│   ├── test-gate.ts    # Test verification
│   └── functional-gate.ts # Functional verification (post-MVP)
├── reporter/       # Telegram communication
│   ├── bot.ts          # grammy bot setup and commands
│   ├── commands.ts     # Command handlers (/status, /pause, etc.)
│   ├── notifications.ts # Outbound notifications
│   └── morning-report.ts # Morning report generator
├── budget/         # Token/cost tracking
│   ├── tracker.ts      # Track API spend per session
│   ├── enforcer.ts     # Hard budget cap enforcement
│   └── models.ts       # Cost-per-token models
├── dashboard/      # Minimal web UI (post-MVP)
│   └── server.ts       # Express/Fastify server
└── db/             # SQLite database
    ├── database.ts     # Database connection and setup
    ├── migrations.ts   # Schema migrations
    └── queries.ts      # Typed query helpers
```

### Coding Patterns

#### Configuration
```typescript
// Always use a typed config interface
interface DaemonConfig {
  activeHours: { start: number; end: number };
  timezone: string;
  budgetCap: { perNight: number; currency: string };
  telegram: { botToken: string; chatId: string };
  llm: {
    cloud: { provider: 'anthropic' | 'openai'; apiKey: string; model: string };
    local: { enabled: boolean; baseUrl: string; model: string };
  };
  workspace: { repoPath: string; branch: string };
}

// Load from ~/.mother-brain-daemon/config.json
// Validate on startup — fail fast if invalid
```

#### Module Pattern
```typescript
// Every module follows this pattern
export class Scheduler {
  private logger: Logger;
  private jobs: Cron[] = [];

  constructor(private config: DaemonConfig, private db: Database) {
    this.logger = pino({ name: 'scheduler' });
  }

  async start(): Promise<void> {
    // Setup and start
  }

  async stop(): Promise<void> {
    // Graceful cleanup
    for (const job of this.jobs) job.stop();
  }
}
```

#### Error Handling
```typescript
// Custom error types for different failure modes
class BudgetExceededError extends Error { readonly code = 'BUDGET_EXCEEDED'; }
class VerificationFailedError extends Error { readonly code = 'VERIFY_FAILED'; }
class LLMError extends Error { readonly code = 'LLM_ERROR'; }

// Always catch and log — never let errors crash the daemon
try {
  await executeTask(task);
} catch (error) {
  logger.error({ error, task: task.id }, 'Task execution failed');
  await reporter.notifyError(task, error);
  // Continue to next task — don't crash
}
```

#### Token Efficiency
```typescript
// Context builder — MINIMAL tokens per task
function buildTaskContext(task: Task, skill: Skill, files: string[]): string {
  // Target: ~4,700 tokens total
  return [
    `# Task: ${task.objective}`,           // ~50 tokens
    `## Skill: ${skill.name}`,             // Skill instructions ~2,000 tokens
    `## Relevant Files:`,                  // 2-3 files ~2,500 tokens
    ...files.map(f => `### ${f.path}\n${f.content}`),
    `## Constraints:`,                     // ~150 tokens
    `- Follow existing code patterns`,
    `- Do not modify files outside scope`,
    `- Return ONLY the file changes`,
  ].join('\n');
}
// NEVER include conversation history
// NEVER include full project context
// NEVER re-discover project structure via LLM
```

### Database Schema (SQLite)
```sql
-- Core tables
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  status TEXT CHECK(status IN ('active', 'completed', 'failed', 'budget_exceeded')),
  tasks_completed INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  cost_usd REAL DEFAULT 0.0
);

CREATE TABLE task_executions (
  id TEXT PRIMARY KEY,
  session_id TEXT REFERENCES sessions(id),
  task_id TEXT NOT NULL,
  outcome_id TEXT NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  status TEXT CHECK(status IN ('running', 'verified', 'failed', 'skipped')),
  tokens_used INTEGER DEFAULT 0,
  verification_result TEXT,
  commit_sha TEXT
);

CREATE TABLE budget_tracking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT REFERENCES sessions(id),
  timestamp TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  cost_usd REAL NOT NULL
);

-- Pre-computed project context (avoid LLM re-discovery)
CREATE TABLE project_context (
  repo_path TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (repo_path, key)
);
```

### Reliability Patterns

1. **Crash recovery** — On startup, check for interrupted sessions. Resume or clean up.
2. **Watchdog timer** — If a task runs longer than 30 minutes, kill it and move on.
3. **Budget gate** — Check budget BEFORE starting each task, not after.
4. **Commit-per-task** — Each verified task gets its own git commit. Never batch.
5. **Notification-on-failure** — Any unrecoverable error sends Telegram alert immediately.
6. **Log rotation** — Use pino with daily rotation. Pi storage is limited.

## Steps

1. **Assess Architecture Need**
   - When implementing a new daemon component, check this skill for the correct module location and coding pattern
   - Verify the component follows the module structure above
   - Ensure TypeScript strict mode compliance

2. **Apply Patterns**
   - Use the coding patterns (config, module, error handling, token efficiency) as templates
   - Follow the database schema for any persistent state
   - Implement graceful shutdown in every new module

3. **Validate**
   - Component follows single-responsibility principle
   - No raw console.log (use pino logger)
   - Error handling catches and logs, never crashes daemon
   - Token context is minimal (target ~4,700 tokens per task)
   - Graceful shutdown implemented
   - SQLite used for state, not files (except roadmap.md which is the source of truth)

## Validation Checklist

- [ ] Module is in correct directory per structure above
- [ ] TypeScript strict mode compiles without errors
- [ ] Graceful shutdown handler implemented
- [ ] Structured logging (pino) used throughout
- [ ] Error handling prevents daemon crash
- [ ] Token context is minimal
- [ ] Database operations use typed queries
- [ ] No unnecessary dependencies added
