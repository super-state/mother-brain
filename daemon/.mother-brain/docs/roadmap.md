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

## MVP Checkpoint (End of Phase 1)

✅ **Phase 1 Complete When ALL acceptance criteria verified for:**
- Outcome 1: Daemon lifecycle management
- Outcome 2: Autonomous task execution
- Outcome 3: Verification gates
- Outcome 4: Budget control
- Outcome 5: Scheduled operation
- Outcome 6: Telegram communication
- Outcome 7: Conversational onboarding & identity

**Validation Method**: Run the daemon overnight. Wake up to a Telegram morning report showing verified, committed work within budget.

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
| 027 | Outcome 7: Conversational onboarding | ⬜ |
| 028 | Outcome 7: Conversational onboarding | ⬜ |
| 029 | Outcome 7: Conversational onboarding | ⬜ |
| 030 | Outcome 7: Conversational onboarding | ⬜ |
| 031 | Outcome 7: Conversational onboarding | ⬜ |
| 032 | Outcome 7: Conversational onboarding | ⬜ |
| 033 | Outcome 7: Conversational onboarding | ⬜ |

---

## Risk Mitigation

**MVP Risks:**
- **Pi performance**: Daemon + Ollama may compete for RAM → MVP uses cloud-only (no Ollama)
- **LLM tool use quality**: Claude's file operations via tool use may produce inconsistent results → Verification gates catch failures
- **Overnight reliability**: Long-running Node.js processes on Pi → pm2 auto-restart, watchdog timer
- **Telegram rate limits**: Too many notifications → Rate limiting built into reporter

**Delivery Strategy**: Protect MVP outcomes at all costs. Phase 2+ can be deferred.

---

**Total Tasks**: 33  
**Phase 1 (MVP) Tasks**: 33 (26 complete, 7 pending)  
**Post-MVP Tasks**: TBD based on usage experience
