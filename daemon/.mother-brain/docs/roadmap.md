# Mother Brain Daemon - Roadmap

## Delivery Strategy (Research-Based)
**Project Type**: Self-hosted autonomous Node.js daemon on Raspberry Pi  
**MVP Approach**: Smallest daemon that can read a roadmap, execute tasks, verify output, and report via Telegram overnight  
**Launch Pattern**: Personal tool — no public launch. MVP complete when it runs overnight and we wake up to results  
**Iteration Strategy**: Daily personal usage drives improvements. Phase 2+ informed by real overnight sessions

---

## User Needs Traceability

| User Need (from Vision) | Fulfilled By |
|-------------------------|--------------|
| Ability to assign work and wake up to results | Outcomes 2, 3, 5 |
| Ability to communicate via Telegram | Outcome 6 |
| Ability to set budget caps | Outcome 4 |
| Ability to receive morning reports | Outcome 6 (basic), Phase 2 (detailed) |
| Ability to execute roadmap outcomes autonomously | Outcome 2 |
| Ability to run self-hosted on Pi | Outcome 1 |
| Ability to have zero cost when idle | Outcomes 4, 5 |
| Ability to onboard quickly | Outcome 1, **Outcome 7** |
| Ability to monitor from phone | Outcome 6 |
| Ability to have natural conversational onboarding | **Outcome 7** |
| Ability to self-optimize token spending | **Outcome 8** |
| Ability to run the full Mother Brain process over Telegram | **Outcome 9** |
| Ability to figure out and do things it doesn't know how to do yet | **Outcome 10** (Tool Layer) |
| Ability to have conversation commitments become real scheduled actions | **Outcome 11** |
| Ability to configure correct LLM tier model assignments | **Outcome 12** |
| Ability to track and manage tasks durably | **Outcome 13** |
| Ability to plan, execute, and verify work with evidence | **Outcome 14** |
| Ability to gate risky actions with human approval | **Outcome 15** |
| Ability to configure via web dashboard | Phase 2 |
| Ability to see agents and cron jobs | Phase 2 |

---

## Phase 1: MVP — Autonomous Overnight Worker

**Goal**: A daemon that reads a roadmap, executes tasks overnight, verifies output, respects budget, and reports via Telegram  
**Success Gate**: Run the daemon before bed, wake up to a Telegram message showing completed and verified work  
**Strategy**: Core execution loop first, communication second. Every component must be reliable enough for unsupervised operation

---

### 📋 Outcome 1: Ability to start the daemon and have it manage its own lifecycle

> So the daemon can run reliably on a Raspberry Pi without manual intervention — starting, stopping, restarting on crash, and loading configuration.

**Acceptance Criteria:**
- [ ] Daemon starts from a single command (`mother-brain-daemon start`)
- [ ] Configuration loads from a JSON file (API keys, paths, schedule)
- [ ] Invalid config is rejected with clear error messages
- [ ] Daemon shuts down gracefully on SIGTERM/SIGINT
- [ ] pm2 can manage the daemon (auto-restart on crash, startup on boot)
- [ ] Structured logs written via pino (not console.log)

**Demo / Proof:**
- Run `mother-brain-daemon start` and see structured log output
- Kill the process and see pm2 auto-restart it
- Provide invalid config and see clear error message

**Priority Score:** 124 (Vision: 3, Reliability: 5, Token Efficiency: 5, MVP: 5)

**🔧 Tasks (internal):**
- Task 001: Project scaffolding — package.json, tsconfig.json, build setup (tsup)
- Task 002: Core daemon class with start/stop lifecycle and signal handling
- Task 003: Configuration loader with validation and typed config interface
- Task 004: Pino logging setup with daily rotation
- Task 005: SQLite database setup with migrations

---

### 📋 Outcome 2: Ability to have the daemon read a roadmap and execute tasks autonomously

> So the daemon can pick the next task from a Mother Brain roadmap, build minimal context, call a cloud LLM API, and apply the generated code changes — the core autonomous execution loop.

**Acceptance Criteria:**
- [ ] Daemon reads and parses a `roadmap.md` file from a configured git repo
- [ ] Daemon identifies the next uncompleted task
- [ ] Context builder creates a minimal prompt (~4,700 tokens) from skill + task + relevant files
- [ ] Cloud LLM API (Claude) is called with tool use for file operations
- [ ] Generated file changes are applied to the workspace
- [ ] Each execution is logged in the SQLite database

**Demo / Proof:**
- Point daemon at a real Mother Brain project with a roadmap
- Daemon picks the next task and generates code changes
- Changes appear in the working directory

**Priority Score:** 137 (Vision: 5, Reliability: 4, Token Efficiency: 5, MVP: 5)

**🔧 Tasks (internal):**
- Task 006: Roadmap parser — parse roadmap.md into structured outcomes/tasks
- Task 007: Task picker — select next uncompleted task with dependency awareness
- Task 008: Context builder — assemble minimal prompt from skill + task + files
- Task 009: Cloud LLM client — Anthropic Claude API with tool use (file read/write)
- Task 010: File writer — apply LLM-generated changes to workspace
- Task 011: Workspace manager — git operations (branch, status, diff)

---

### 📋 Outcome 3: Ability to verify autonomous output before committing

> So every change the daemon makes is verified through build and test gates before being committed — ensuring we wake up to working code, not broken builds.

**Acceptance Criteria:**
- [ ] Build gate runs the project's build command and passes/fails
- [ ] Test gate runs the project's test command and passes/fails
- [ ] Build/test commands are auto-detected from project type (package.json, Cargo.toml, etc.)
- [ ] Verified changes are committed with a descriptive commit message
- [ ] Failed verification triggers git revert (no broken code accumulated)
- [ ] Confidence level (HIGH/MEDIUM/FAILED) is recorded for each task

**Demo / Proof:**
- Daemon executes a task, build passes, tests pass → auto-committed
- Daemon executes a task, build fails → changes reverted, logged as FAILED
- Git log shows clean, verified commits only

**Priority Score:** 131 (Vision: 4, Reliability: 5, Token Efficiency: 4, MVP: 4)

**🔧 Tasks (internal):**
- Task 012: Build gate — detect and run project build command
- Task 013: Test gate — detect and run project test command
- Task 014: Confidence classifier — score results as HIGH/MEDIUM/FAILED
- Task 015: Git committer — commit verified changes with descriptive message
- Task 016: Git reverter — clean revert on failed verification

---

### 📋 Outcome 4: Ability to control budget and prevent overspending

> So the daemon never spends more than the configured budget cap per night — providing financial safety for autonomous operation.

**Acceptance Criteria:**
- [ ] Every LLM API call's token usage and cost is tracked in SQLite
- [ ] Budget cap is configurable per-night (e.g., £5.00)
- [ ] Daemon checks budget BEFORE starting each task (not after)
- [ ] Daemon stops gracefully when budget is exceeded
- [ ] Budget status is queryable (total spent, remaining, breakdown by task)

**Demo / Proof:**
- Set a £2.00 budget cap, run daemon, see it stop after ~2-3 tasks
- Query budget status and see accurate per-task breakdown
- Verify no tasks started after budget exceeded

**Priority Score:** 122 (Vision: 4, Reliability: 4, Token Efficiency: 5, MVP: 4)

**🔧 Tasks (internal):**
- Task 017: Budget tracker — record token usage and cost per API call
- Task 018: Cost-per-token models — pricing for Claude, GPT, etc.
- Task 019: Budget enforcer — pre-task budget check with graceful stop

---

### 📋 Outcome 5: Ability to run the daemon on a schedule during set hours

> So the daemon works overnight while you sleep — running during configured active hours and staying idle (zero cost) outside those hours.

**Acceptance Criteria:**
- [ ] Active hours are configurable (e.g., 11pm-7am)
- [ ] Daemon only executes tasks during active hours
- [ ] Scheduler checks are pure computation ($0, no LLM calls)
- [ ] Heartbeat interval is configurable (e.g., every 15 minutes)
- [ ] Daemon is completely idle outside active hours (zero resource usage)

**Demo / Proof:**
- Configure active hours, see daemon start executing at the right time
- See daemon go idle when active hours end
- Verify no LLM calls during idle periods

**Priority Score:** 124 (Vision: 4, Reliability: 4, Token Efficiency: 5, MVP: 4)

**🔧 Tasks (internal):**
- Task 020: Scheduler — croner-based job scheduling with timezone support
- Task 021: Active hours manager — configurable work window
- Task 022: Heartbeat loop — periodic task execution during active hours

---

### 📋 Outcome 6: Ability to communicate with the daemon via Telegram

> So you can monitor the daemon, receive results, and send commands from your phone — anywhere, anytime.

**Acceptance Criteria:**
- [ ] Telegram bot starts and responds to commands
- [ ] Bot only responds to the configured chat ID (security)
- [ ] `/status` shows current daemon state, task, and budget
- [ ] `/pause` and `/resume` control daemon execution
- [ ] `/stop` emergency stops the daemon
- [ ] Notifications sent on task completion, errors, and budget warnings
- [ ] Basic morning report sent at configured wake time

**Demo / Proof:**
- Open Telegram, send `/status`, see daemon state
- Receive a notification when a task completes overnight
- Receive a morning report at wake time with summary of overnight work

**Priority Score:** 121 (Vision: 5, Reliability: 3, Token Efficiency: 4, MVP: 4)

**🔧 Tasks (internal):**
- Task 023: grammy bot setup with auth middleware
- Task 024: Command handlers — /status, /pause, /resume, /stop
- Task 025: Notification system — task complete, errors, budget warnings
- Task 026: Basic morning report — summary of overnight work

---

### 📋 Outcome 7: Ability to onboard through natural conversation (not commands)

> So the daemon feels like talking to an intelligent assistant, not a command-line tool. Users chat naturally and the daemon discovers projects, builds understanding, and crafts direction — mirroring the Mother Brain vision phase but through organic conversation.

**Acceptance Criteria:**
- [ ] Daemon establishes its own identity/personality on first run (soul/persona config)
- [ ] New users are greeted conversationally, not with a command list
- [ ] Through natural chat, the daemon understands what the user is working on
- [ ] The daemon can detect and suggest projects from conversation context
- [ ] Conversation naturally flows into vision discovery (what does the user want to achieve?)
- [ ] Projects are registered organically from conversation, not via `/addproject` commands
- [ ] Existing commands (`/addproject`, `/work`) remain as power-user shortcuts
- [ ] Conversation context persists across sessions (the daemon remembers)

**Demo / Proof:**
- Start the daemon fresh, open Telegram, and just start chatting
- Daemon introduces itself with personality, asks what you're working on
- Through 3-5 messages, daemon understands the project and registers it
- No commands needed — the daemon figured it out from conversation

**Priority Score:** 130 (Vision: 5, Reliability: 3, Token Efficiency: 3, MVP: 5)

**🔧 Tasks (internal):**
- Task 027: Soul/persona system — configurable identity, greeting, communication style
- Task 028: Conversation handler — natural language processing for Telegram messages (not just commands)
- Task 029: Intent classifier — detect when user is describing a project, asking for help, or just chatting
- Task 030: Project discovery from conversation — extract repo paths, project names, goals from natural chat
- Task 031: Vision extraction — synthesize user's goals into a vision document from conversation
- Task 032: Conversation memory — persist chat context in SQLite across sessions
- Task 033: Onboarding flow — orchestrate identity → discovery → vision → project registration

---

### 📋 Outcome 8: Ability to self-optimize token usage

> So the daemon doesn't just track costs — it automatically analyzes spending patterns, identifies waste, and recommends optimizations. Like a Child Brain retrospective applied to token economics.

**Acceptance Criteria:**
- [ ] Daemon runs usage optimization analysis at startup (daily retrospective)
- [ ] Analysis identifies tier imbalance (e.g., chat using 80% of budget)
- [ ] Analysis detects expensive individual requests and context bloat
- [ ] Analysis flags project hotspots (disproportionate spending)
- [ ] Analysis detects usage spikes over time
- [ ] Optimization report sent via Telegram with actionable suggestions
- [ ] `/optimize` command available for on-demand analysis
- [ ] Zero cost when no usage data exists

**Demo / Proof:**
- Start daemon, receive optimization report in Telegram if usage data exists
- Send `/optimize` to get on-demand analysis with insights
- Insights include severity levels (info/warning/critical) and specific suggestions

**Priority Score:** 125 (Vision: 5, Reliability: 3, Token Efficiency: 5, MVP: 4)

**🔧 Tasks (internal):**
- Task 034: Usage optimization analyzer — pattern detection across tiers, models, projects, time
- Task 035: Telegram /optimize command and optimization report formatting
- Task 036: Startup daily retrospective — auto-send optimization insights on daemon boot

---

### 📋 Outcome 9: Ability to run the full Mother Brain process over Telegram

> So the daemon IS Mother Brain — not a chatbot wrapper, but the actual guided workflow running over Telegram. Each conversation follows the Mother Brain process: discovery → vision → planning → execution → learning. One question at a time, phase-tracked, state-persistent.

**Acceptance Criteria:**
- [ ] Conversation handler uses a state machine (Brain Runtime) not freestyle LLM chat
- [ ] Each phase has a dedicated system prompt that constrains the LLM to follow Mother Brain's process
- [ ] The daemon asks ONE question per message (enforced by prompt constraints)
- [ ] Phase transitions happen automatically based on conversation progress
- [ ] Brain state persists in SQLite across daemon restarts
- [ ] Discovery data (project names, paths, needs) is extracted and accumulated across messages
- [ ] Active phase uses project context for relevant responses
- [ ] Brainstorm mode available for freeform thinking without formal process

**Demo / Proof:**
- Send first message → daemon introduces itself and asks ONE question
- Through 3-5 messages → daemon transitions from greeting → discovery → vision naturally
- Restart daemon → conversation resumes from the same phase
- Type "brainstorm" → daemon enters thinking partner mode
- Daemon never asks multiple questions at once

**Priority Score:** 140 (Vision: 5, Reliability: 4, Token Efficiency: 4, MVP: 5)

**🔧 Tasks (internal):**
- Task 037: Brain Runtime state machine — phase definitions, system prompts, transition logic
- Task 038: Brain state persistence — SQLite table, state manager, cross-restart continuity
- Task 039: Entity extraction — project names, paths, user needs from conversation
- Task 040: Phase-aware handler — rewrite conversation handler to route through Brain Runtime

---

### 📋 Outcome 10: Typed Tool Layer — The Agent's Hands

> So the daemon can actually DO things in the real world — not just generate text. Every tool has a typed schema, the LLM knows what tools are available, and new tools can be built and registered dynamically.

**Agent System**: #1 (Tooling Layer) + #10 (Self-Extension)

**Acceptance Criteria:**
- [ ] Tool registry with typed schemas (name, description, input schema, output schema)
- [ ] Built-in tools: web_fetch (HTTP GET/POST), file_read, file_write, shell_exec
- [ ] Tool manifest injected into Brain Runtime system prompts (LLM knows what it can do)
- [ ] LLM can invoke tools via structured tool-use calls (not freeform text)
- [ ] Tool execution is sandboxed — tools run with scoped permissions
- [ ] When asked to do something with no matching tool, daemon reports the gap honestly
- [ ] New tools can be registered at runtime (dynamic capability extension)

**Demo / Proof:**
- Ask "What's the weather?" → daemon uses web_fetch tool to get the answer
- Ask "Read my project's README" → daemon uses file_read tool
- Send `/tools` → see list of available tools with descriptions
- Ask something impossible → daemon says "I don't have a tool for that yet" not "Sure, I'll do it!"

**Priority Score:** 140 (Vision: 5, Reliability: 4, Token Efficiency: 4, MVP: 5)

**🔧 Tasks (internal):**
- Task 055: Tool registry — typed schema system, registration, discovery, manifest generation
- Task 056: Built-in tools — web_fetch (HTTP client), file_read, file_write, shell_exec
- Task 057: Tool executor — sandboxed execution with typed input validation and output parsing
- Task 058: Brain Runtime tool integration — inject tool manifest into system prompts, handle tool-use responses
- Task 059: Dynamic tool registration — runtime capability extension, persistence across restarts

---

### 📋 Outcome 13: Task Ledger — Durable Agent State

> So every piece of work the daemon takes on — from reminders to research tasks to multi-step projects — lives in a durable task ledger that survives restarts, tracks progress, and produces artifacts.

**Agent System**: #3 (Task Ledger)

**Acceptance Criteria:**
- [ ] General-purpose task table: id, title, type, status (queued/running/blocked/done/failed), priority, deadline
- [ ] Tasks store checkpoints (what's been tried, outputs so far)
- [ ] Tasks produce artifacts (files, links, results) with standard locations
- [ ] Commitment engine migrated to use task ledger (commitments become a task type)
- [ ] Task status queryable via Telegram: `/tasks`, `/task <id>`
- [ ] If daemon restarts, queued and running tasks resume automatically
- [ ] Blocked tasks have clear reasons and what's needed to unblock

**Demo / Proof:**
- Ask the daemon to research something → see it appear as a task in `/tasks`
- Restart the daemon → task is still there, resumes on next tick
- A task gets stuck → see "blocked: waiting for API response" status
- Ask "what are you working on?" → daemon lists active tasks with progress

**Priority Score:** 138 (Vision: 5, Reliability: 5, Token Efficiency: 4, MVP: 5)

**🔧 Tasks (internal):**
- Task 060: Task ledger schema — SQLite table with status machine, checkpoints, artifacts
- Task 061: Task lifecycle — create, start, checkpoint, block, complete, fail, resume
- Task 062: Commitment migration — commitments become task type, preserve existing behavior
- Task 063: Telegram task commands — /tasks, /task <id>, natural language task queries
- Task 064: Restart recovery — detect interrupted tasks on startup, resume or fail gracefully

---

### 📋 Outcome 14: Planner/Executor/Verifier Pipeline

> So the daemon doesn't just "do things" — it plans them, executes them step by step, and verifies the results with evidence. The planner proposes, the executor acts, and the verifier confirms. Three separate roles, even if using the same LLM.

**Agent System**: #5 (Planner/Executor Separation) + #6 (Observation/Verification)

**Acceptance Criteria:**
- [ ] Planner produces a structured plan: steps, tool calls, success criteria, expected output
- [ ] Executor runs the plan step by step, recording outputs at each checkpoint
- [ ] Verifier checks "definition of done" against actual evidence (API response, file content, build output)
- [ ] Failed verification triggers retry or escalation, not silent "done"
- [ ] For code tasks: build passes + tests pass = verified (existing verification engine)
- [ ] For non-code tasks: evidence must exist (HTTP response, file on disk, data in DB)
- [ ] Task ledger updated at each stage (planned → executing → verifying → done/failed)

**Demo / Proof:**
- Ask daemon to fetch IGN articles → see plan ("1. fetch RSS, 2. parse articles, 3. summarize") → execution → verification ("found 5 articles, summary generated") → result delivered
- Ask for something that fails → verifier catches it, daemon reports "I tried but the API returned 404" with evidence
- View task in `/task <id>` → see the plan, execution log, and verification result

**Priority Score:** 136 (Vision: 5, Reliability: 5, Token Efficiency: 3, MVP: 5)

**🔧 Tasks (internal):**
- Task 065: Plan schema — structured plan with steps, tool calls, success criteria
- Task 066: Planner agent — LLM call that produces a plan (not direct execution)
- Task 067: Step executor — runs plan steps sequentially, records outputs, handles errors
- Task 068: Evidence verifier — checks success criteria against actual outputs
- Task 069: Pipeline orchestrator — planner → executor → verifier flow with task ledger updates

---

### 📋 Outcome 15: Human-in-the-Loop Gates

> So the daemon asks before doing anything risky or irreversible — sending messages, spending money, deleting data, posting to APIs. The user stays in control without micromanaging every action.

**Agent System**: #10 (Human-in-the-Loop)

**Acceptance Criteria:**
- [ ] Actions are classified by risk level: low (read-only), medium (write/modify), high (irreversible/external)
- [ ] Low-risk actions execute automatically (fetch data, read files)
- [ ] Medium/high-risk actions require Telegram approval before execution
- [ ] Approval request shows: what will happen, why, estimated cost/impact
- [ ] User can approve, reject, or modify the proposed action
- [ ] Timeout on approvals (auto-skip after configurable period, default: don't execute)
- [ ] Audit log of all approved/rejected actions

**Demo / Proof:**
- Daemon fetches data → executes automatically (low risk)
- Daemon wants to send an email → sends approval request in Telegram → user approves → sent
- Daemon wants to delete a file → sends approval → user rejects → action cancelled
- View `/audit` → see history of all gated actions and their outcomes

**Priority Score:** 130 (Vision: 4, Reliability: 5, Token Efficiency: 4, MVP: 4)

**🔧 Tasks (internal):**
- Task 070: Risk classifier — categorize tool calls by risk level (low/medium/high)
- Task 071: Approval gate — Telegram inline buttons for approve/reject/modify
- Task 072: Approval queue — store pending approvals, handle timeouts
- Task 073: Audit log — record all gated actions with outcomes in SQLite

---

### 📋 Outcome 11: Ability to have conversation commitments become real scheduled actions

> So when the daemon says "I'll do X at Y time," it actually happens. Every promise from conversation becomes a tracked, scheduled, executable action — not just words.

**Acceptance Criteria:**
- [x] When the LLM commits to a timed action ("I'll send you X at Y"), a real cron job is created in the scheduler
- [x] One-time commitments ("I'll do this now") are tracked and executed immediately
- [x] Recurring commitments ("every day at 7am") are stored in SQLite and managed by the scheduler
- [x] The user can list active commitments (e.g., "what have you promised me?")
- [x] The user can cancel commitments ("stop the daily news")
- [x] If a commitment fails to execute, the daemon notifies the user with what went wrong
- [x] Commitment intent is detected by the conversation handler — the LLM can't silently promise things

**Demo / Proof:**
- Ask for a daily reminder → see it created as a real scheduled job
- Ask "what have you promised me?" → see the active commitments list
- Cancel a commitment → confirmed removed, no more messages

**Priority Score:** 136 (Vision: 5, Reliability: 4, Token Efficiency: 4, MVP: 5)

**🔧 Tasks (internal):**
- Task 046: Commitment intent detector — parse LLM output for timed action promises
- Task 047: Commitment storage — SQLite table for tracked commitments (one-time + recurring)
- Task 048: Commitment scheduler — integrate with croner to execute commitments at scheduled times
- Task 049: Commitment management — list, cancel, and status reporting for active commitments
- Task 050: Commitment failure handling — detect and notify when commitments fail to execute

---

### 📋 Outcome 12: Ability to configure LLM tiers with correct model assignments

> So the daemon uses the right model for each job — cheap/local for background with fallback, Codex for conversation/coding/review, and Opus for planning.

**Tier Map:**
- Background: local Ollama (e.g., qwen3) → fallback to cheap Copilot model if Ollama unavailable
- Chat: openai/gpt-5.3-codex (via Copilot)
- Planning: claude-opus-4.6 (via Copilot)
- Coding: openai/gpt-5.3-codex (via Copilot)
- Review: openai/gpt-5.3-codex (via Copilot)

**Acceptance Criteria:**
- [ ] Background tier attempts local Ollama first, falls back to cheap Copilot model if unavailable
- [ ] Chat, coding, and review tiers use Codex 5.3 via GitHub Models API
- [ ] Planning tier uses Opus 4.6 via Copilot
- [ ] Init wizard defaults to these tier assignments
- [ ] Fallback logic is transparent in logs ("Ollama unavailable, using Copilot fallback")
- [ ] Budget tracker correctly calculates cost per tier/model

**Demo / Proof:**
- Run init wizard, see correct model defaults per tier
- Start daemon with Ollama stopped, see transparent fallback in logs
- Verify all tiers route to correct models

**Priority Score:** 120 (Vision: 4, Reliability: 4, Token Efficiency: 5, MVP: 4)

**🔧 Tasks (internal):**
- Task 051: Background tier fallback — local Ollama → cheap Copilot fallback logic in router
- Task 052: Update default tier config — Codex 5.3 for chat/coding/review, Opus 4.6 for planning
- Task 053: Init wizard update — new default model recommendations per tier
- Task 054: Model availability verification — test endpoint before saving config

---

## MVP Checkpoint (End of Phase 1)

✅ **Phase 1 Complete When ALL acceptance criteria verified for:**

**Foundation (Done):**
- Outcome 1: Daemon lifecycle management ✅
- Outcome 2: Autonomous task execution ✅
- Outcome 3: Verification gates ✅
- Outcome 4: Budget control ✅
- Outcome 5: Scheduled operation ✅
- Outcome 6: Telegram communication ✅
- Outcome 7: Conversational onboarding & identity ✅
- Outcome 8: Self-optimization of token usage ✅
- Outcome 9: Brain Runtime — full Mother Brain process over Telegram ✅
- Outcome 11: Commitment engine (promises → actions) ✅
- Outcome 12: LLM tier configuration ✅

**Agent Architecture (Remaining):**
- Outcome 10: Typed Tool Layer — the agent's hands
- Outcome 13: Task Ledger — durable agent state
- Outcome 14: Planner/Executor/Verifier Pipeline
- Outcome 15: Human-in-the-Loop Gates

**Architecture Reference**: See `agent-architecture.md` for the 12 agent systems.

**Validation Method**: Run the daemon, ask it to do something real (fetch IGN articles). It plans the task, uses tools to execute, verifies the result with evidence, and delivers. Tasks survive restarts. Risky actions require approval.

**Next Step After MVP**: Begin Phase 2 based on real usage experience.

---

## Phase 2: Enhanced Intelligence & Monitoring

**Strategy**: Iterate based on overnight usage experience  
**Trigger**: Phase 1 complete + first successful overnight run  
**Focus**: Better reports, local models, visual monitoring

---

### 📋 Ability to receive detailed morning reports with evidence

> So morning reports include verification proofs, commit links, and clear next steps.

**Acceptance Criteria:**
- [ ] Morning report includes per-task evidence (build/test output summary)
- [ ] Report includes git commit SHAs with descriptions
- [ ] Failed tasks include error details and suggested fixes
- [ ] Report includes suggested next steps for the day

**Note**: Subject to validation — may change based on Phase 1 experience

---

### 📋 Ability to use free local models for non-coding tasks

> So orchestration, classification, and output parsing use Ollama on the Pi — zero cloud API cost for non-creative work.

**Acceptance Criteria:**
- [ ] Ollama is managed by the daemon (start, model pull, health check)
- [ ] Task classification (what type of work) uses local model
- [ ] Output parsing (extract files from LLM response) uses local model
- [ ] Cloud API is only called for actual code generation

**Note**: Subject to validation — depends on Pi 5 model performance

---

### 📋 Ability to configure the daemon via a web dashboard

> So you can set API keys, schedules, and budget caps through a browser instead of editing JSON files.

**Acceptance Criteria:**
- [ ] Dashboard accessible at `http://pi-ip:port`
- [ ] View and edit daemon configuration
- [ ] See current daemon status and active tasks
- [ ] View scheduled cron jobs and their next run times

**Note**: Subject to validation — may change based on Phase 1 experience

---

## Phase 3+: Multi-Agent & Business Operations (Future)

**Strategy**: Expand from single-project to multi-project, from dev tool to business operations  
**Trigger**: Phase 2 complete + stable daily operation  
**Focus**: Scale, automate, generate value

- 📋 Ability to orchestrate multiple specialized agents working in parallel
- 📋 Ability to manage multiple project repos simultaneously
- 📋 Ability to have the daemon contribute to income-generating activities
- 📋 Ability to have the daemon self-learn from outcome history

**Validation Required**: Don't build until validated by real usage experience

---

## Internal Task Index

| Task | Under Outcome | Status |
|------|---------------|--------|
| 001 | Outcome 1: Daemon lifecycle | ✅ |
| 002 | Outcome 1: Daemon lifecycle | ✅ |
| 003 | Outcome 1: Daemon lifecycle | ✅ |
| 004 | Outcome 1: Daemon lifecycle | ✅ |
| 005 | Outcome 1: Daemon lifecycle | ✅ |
| 006 | Outcome 2: Task execution | ✅ |
| 007 | Outcome 2: Task execution | ✅ |
| 008 | Outcome 2: Task execution | ✅ |
| 009 | Outcome 2: Task execution | ✅ |
| 010 | Outcome 2: Task execution | ✅ |
| 011 | Outcome 2: Task execution | ✅ |
| 012 | Outcome 3: Verification | ✅ |
| 013 | Outcome 3: Verification | ✅ |
| 014 | Outcome 3: Verification | ✅ |
| 015 | Outcome 3: Verification | ✅ |
| 016 | Outcome 3: Verification | ✅ |
| 017 | Outcome 4: Budget control | ✅ |
| 018 | Outcome 4: Budget control | ✅ |
| 019 | Outcome 4: Budget control | ✅ |
| 020 | Outcome 5: Scheduling | ✅ |
| 021 | Outcome 5: Scheduling | ✅ |
| 022 | Outcome 5: Scheduling | ✅ |
| 023 | Outcome 6: Telegram | ✅ |
| 024 | Outcome 6: Telegram | ✅ |
| 025 | Outcome 6: Telegram | ✅ |
| 026 | Outcome 6: Telegram | ✅ |
| 027 | Outcome 7: Conversational onboarding | ✅ |
| 028 | Outcome 7: Conversational onboarding | ✅ |
| 029 | Outcome 7: Conversational onboarding | ✅ |
| 030 | Outcome 7: Conversational onboarding | ✅ |
| 031 | Outcome 7: Conversational onboarding | ✅ |
| 032 | Outcome 7: Conversational onboarding | ✅ |
| 033 | Outcome 7: Conversational onboarding | ✅ |
| 034 | Outcome 8: Self-optimization | ✅ |
| 035 | Outcome 8: Self-optimization | ✅ |
| 036 | Outcome 8: Self-optimization | ✅ |
| 037 | Outcome 9: Brain Runtime | ✅ |
| 038 | Outcome 9: Brain Runtime | ✅ |
| 039 | Outcome 9: Brain Runtime | ✅ |
| 040 | Outcome 9: Brain Runtime | ✅ |
| 046 | Outcome 11: Commitment engine | ✅ |
| 047 | Outcome 11: Commitment engine | ✅ |
| 048 | Outcome 11: Commitment engine | ✅ |
| 049 | Outcome 11: Commitment engine | ✅ |
| 050 | Outcome 11: Commitment engine | ✅ |
| 051 | Outcome 12: LLM tier config | ✅ |
| 052 | Outcome 12: LLM tier config | ✅ |
| 053 | Outcome 12: LLM tier config | ✅ |
| 054 | Outcome 12: LLM tier config | ✅ |
| 055 | Outcome 10: Tool layer | ⬜ |
| 056 | Outcome 10: Tool layer | ⬜ |
| 057 | Outcome 10: Tool layer | ⬜ |
| 058 | Outcome 10: Tool layer | ⬜ |
| 059 | Outcome 10: Tool layer | ⬜ |
| 060 | Outcome 13: Task ledger | ⬜ |
| 061 | Outcome 13: Task ledger | ⬜ |
| 062 | Outcome 13: Task ledger | ⬜ |
| 063 | Outcome 13: Task ledger | ⬜ |
| 064 | Outcome 13: Task ledger | ⬜ |
| 065 | Outcome 14: Planner/Executor/Verifier | ⬜ |
| 066 | Outcome 14: Planner/Executor/Verifier | ⬜ |
| 067 | Outcome 14: Planner/Executor/Verifier | ⬜ |
| 068 | Outcome 14: Planner/Executor/Verifier | ⬜ |
| 069 | Outcome 14: Planner/Executor/Verifier | ⬜ |
| 070 | Outcome 15: Human-in-the-loop | ⬜ |
| 071 | Outcome 15: Human-in-the-loop | ⬜ |
| 072 | Outcome 15: Human-in-the-loop | ⬜ |
| 073 | Outcome 15: Human-in-the-loop | ⬜ |

---

## Risk Mitigation

**MVP Risks:**
- **Pi performance**: Daemon + Ollama may compete for RAM → MVP uses cloud-only (no Ollama)
- **LLM tool use quality**: Claude's file operations via tool use may produce inconsistent results → Verification gates catch failures
- **Overnight reliability**: Long-running Node.js processes on Pi → pm2 auto-restart, watchdog timer
- **Telegram rate limits**: Too many notifications → Rate limiting built into reporter

**Delivery Strategy**: Protect MVP outcomes at all costs. Phase 2+ can be deferred.

---

**Total Tasks**: 73  
**Phase 1 (MVP) Tasks**: 73 (54 complete, 19 remaining)  
**Post-MVP Tasks**: TBD based on usage experience
