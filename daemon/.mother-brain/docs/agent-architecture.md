# Mother Brain Daemon — Agent Architecture

> The 12 systems that make an agent real — not just a chat model that talks like it's doing stuff.

## Design Principle

An agent needs a tiny operating system for tasks. Without these systems, it's just a language model with a personality prompt.

---

## The 12 Agent Systems

### 1. Tooling Layer (Typed)

The agent must have actual ways to act — not just generate text.

- Web fetch/search
- Filesystem read/write
- Email / calendar / social APIs
- DB access
- Shell commands / git / build tools
- Headless browser (for sites without clean APIs)

**Key detail**: Tools need typed inputs/outputs (schemas), not freeform text.

**Current status**: 🟡 LLM calls only. No web fetch, email, calendar, or browser.

---

### 2. Permissions & Security

An agent without boundaries becomes dangerous or useless.

- Per-tool allow/deny
- Scoped tokens (read-only vs write)
- Secret management (env vault, rotation)
- Sandboxing (container / restricted FS)
- Audit logs for every external action

**Current status**: 🟡 Chat ID auth on Telegram. No per-tool scoping.

---

### 3. Task Ledger (Durable State)

This is the big one most "agents" lack. A persistent store of:

- **Tasks**: what, why, priority, deadline
- **Status**: queued / running / blocked / done / failed
- **Checkpoints**: what's been tried, outputs so far
- **Artifacts**: files, links, results
- **Ownership**: which sub-agent is responsible

If the process restarts, tasks must survive.

**Current status**: 🟡 Commitments table exists but isn't a general-purpose task system.

---

### 4. Scheduler / Trigger System

So the agent acts without prompting every time.

- Cron-like schedules ("every day 9am")
- Event triggers (new email, GitHub issue created, etc.)
- Polling with backoff (when no webhooks exist)
- Debounce (avoid doing the same thing repeatedly)

**Current status**: ✅ Croner scheduler, commitment scheduler, heartbeat loop.

---

### 5. Planner + Executor Separation

If the same model both plans and acts, it overpromises, skips steps, and hallucinates completion.

- **Planner**: produces a small plan + success criteria + tool calls to attempt
- **Executor**: runs tool calls, records outputs, adapts
- **Verifier**: checks "definition of done" against evidence

Even if it's all the same LLM, keep the roles separate in code.

**Current status**: 🟡 Brain Runtime has phases, but no explicit planner/executor/verifier separation for tasks.

---

### 6. Observation + Verification

Agents must be grounded in reality, not vibes.

- After any action, re-check the world: did it actually happen?
- Evidence-based completion: links, API responses, build artifacts, screenshots, logs
- Tests for code tasks; "open the page and confirm" for web tasks
- This stops "I did it" when nothing happened.

**Current status**: 🟡 Verification engine exists for code tasks. Nothing for general tasks.

---

### 7. Memory (Short-term + Long-term)

Two different things:

- **Working memory**: current task context, recent tool outputs
- **Long-term memory**: preferences, configs, recurring entities, "how we do things"

Long-term memory should be explicit and editable (files / DB), not mystical.

**Current status**: 🟡 Conversation memory + brain state. No explicit long-term preference store.

---

### 8. Error Handling & Recovery

Real work fails constantly.

- Retries with backoff
- Circuit breakers (stop hammering failing APIs)
- "Blocked" state with clear reason + what's needed
- Fallback strategies (alternate tool, alternate model, ask user)

**Current status**: 🟡 LLM fallback routing. No circuit breakers or blocked state tracking.

---

### 9. Cost / Rate-Limit / Time Budgets

Otherwise it burns credits or loops forever.

- Token budgets per task
- Tool-call budgets (max browser fetches, max email reads)
- Timeouts per step
- "Stop conditions" when stuck ("3 failed attempts → escalate")

**Current status**: ✅ Budget tracker, tier routing, cost tracking.

---

### 10. Human-in-the-Loop Gates

For anything risky or irreversible:

- "Draft vs send"
- "Propose changes vs apply changes"
- "Ask before spending money / deleting / emailing"
- Approval UI / confirmation step

**Current status**: 🔴 Minimal. Telegram commands exist but no approval workflows.

---

### 11. Output Artifacts & Handoff

The agent should produce tangible outputs:

- Files (PRs, docs, spreadsheets)
- Links to dashboards / reports
- Change logs
- Summaries with citations/evidence

And hand work between agents cleanly:
- Standard task format
- Standard artifact locations
- Standard "done" proof

**Current status**: 🔴 Missing. No standard artifact format or handoff.

---

### 12. Control Surface (UI)

Even minimal:

- "What's running?"
- "What's blocked?"
- "What changed?"
- "Pause / stop / retry"
- "Approve this action"

Without this, autonomy feels like chaos.

**Current status**: 🟡 Telegram /status, /pause, /resume. No "what's running/blocked" view.

---

## Minimum Viable Agent Stack

The simplest "agent that actually works":

1. **Tool layer** (typed)
2. **Task ledger** (durable)
3. **Executor loop** (scheduler + retries)
4. **Verifier** ("done" requires evidence)
5. **Permissions + approvals**

Everything else is improvements.
