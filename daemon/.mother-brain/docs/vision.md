# Mother Brain Daemon - Vision

## The Problem

AI coding agents like OpenClaw burn through API credits at alarming rates — £20+ in 2 hours with minimal tangible progress. They waste tokens on bloated conversation history (25,000+ tokens per call), vague prompting, and constant LLM calls for basic orchestration tasks like scheduling and state checking. There's no structured methodology — just raw LLM calls hoping for the best.

Meanwhile, Mother Brain's structured approach (vision → roadmap → outcomes → skills → acceptance criteria) is extremely efficient and produces quality results. But it only works interactively — you have to sit at your terminal and drive it.

**The gap**: There's no way to have Mother Brain work autonomously overnight, executing your roadmap while you sleep, and report back in the morning with completed outcomes.

## The Vision

An autonomous, self-hosted development agent that runs on a Raspberry Pi. It reads your Mother Brain roadmap, picks the next outcome, executes tasks using the same structured methodology that makes Mother Brain effective, verifies its own work through multi-layer gates, and reports via Telegram. You assign work before bed, wake up to completed outcomes and a morning report.

**The daemon is a new runtime for the same brain** — not a new product. The CLI is for interactive sessions. The daemon is for autonomous execution. Same skills, same roadmap format, same methodology. Different mode.

## Target Users

**Us** — build for ourselves first. This is a personal tool that solves a real problem: multiplying development productivity by reclaiming sleep hours. Not a commercial product, not an open-source community tool (yet). Just something that works brilliantly for its creator.

## Why This Matters

Every night is 6-8 hours of potential development time being wasted. With the right structure and efficiency, an autonomous agent can execute meaningful work during those hours — not by burning money on vague LLM calls, but by using Mother Brain's proven methodology of structured, minimal-context task execution. The result: wake up to real progress, not a credit card bill.

## User Needs

> These are the core abilities users need. Each becomes an outcome in the roadmap.

- **Ability to assign work before sleeping and wake up to completed outcomes** — The core promise. Queue work, go to bed, see results in the morning.
- **Ability to communicate with the daemon via Telegram from my phone** — Send commands, receive updates, get morning reports. Telegram only — no platform bloat.
- **Ability to set budget caps so it never spends more than allowed** — Hard enforcement. If the budget is £5/night, it stops at £5. No surprises.
- **Ability to receive morning reports of what was accomplished overnight** — Structured reports: what was completed, what was verified, what needs human review, screenshots/proofs.
- **Ability to have the daemon execute roadmap outcomes autonomously** — Uses Mother Brain's methodology: read roadmap → pick outcome → load skill → execute tasks → verify → commit.
- **Ability to run everything self-hosted on my Raspberry Pi** — Own machine, own data. No cloud dependency for the daemon itself. Cloud APIs only for code generation.
- **Ability to have zero cost when idle** — Scheduler uses pure file reads (roadmap state, clock checks). No LLM calls for heartbeat/orchestration. $0 when not actively working.
- **Ability to onboard quickly** — API key + skills selection + go. No 50-step configuration wizard.
- **Ability to monitor and interrupt work from my phone** — Via Telegram: pause, resume, cancel, check status, request details.
- **Ability to configure daemon settings through a minimal web dashboard** — API keys, schedules, budget caps, agent status. Lightweight, not OpenClaw-complex.
- **Ability to see running agents and scheduled cron jobs** — Visual monitoring of what the daemon is doing and what's planned.

## Success Looks Like

- Wake up to a Telegram message showing completed outcomes with verification proofs
- Overnight spend is predictable and within budget caps
- Zero cost when idle — the daemon is invisible when not working
- Roadmap progress continues even when you're not at your desk
- Can check status and adjust from phone at any time
- Morning report is clear, structured, and trustworthy (not vague "I did stuff")

## Constraints

- **Hardware**: Raspberry Pi 4/5 (8GB+ recommended for local models)
- **Self-hosted**: Must run entirely on local hardware (cloud APIs are external, but daemon is local)
- **Telegram only**: Single messaging platform — no WhatsApp, Discord, Slack
- **Token efficiency**: THE priority. Every LLM call must be justified. Zero idle cost.
- **Node.js**: Same runtime as the existing Mother Brain CLI for code sharing
- **Build for ourselves**: Not optimizing for other users yet

## MVP Definition

The smallest daemon that proves the concept:
1. Reads a Mother Brain roadmap from a local git repo
2. Picks the next outcome and its tasks
3. Executes tasks using cloud LLM API with minimal context
4. Runs build/test verification gates
5. Commits verified work to a branch
6. Sends a Telegram message with results
7. Respects a simple budget cap (stop when limit reached)
8. Runs on a schedule (e.g., 11pm-7am)

**NOT in MVP**: Web dashboard, Ollama local models, multi-repo support, soul/personality files, screenshot proofs, Playwright functional gates.

## Strategic Themes

1. **Token Efficiency** — Every design decision optimizes for minimal API spend. $0 when idle. Minimal context per task. Free local models where possible.
2. **Structured Autonomy** — Mother Brain's methodology (roadmap → outcome → skill → task → verify) provides the structure that makes autonomy trustworthy.
3. **Self-Hosted Independence** — Runs on your hardware, your data, your rules. Cloud APIs are a tool, not a dependency.
4. **Trust Through Verification** — Multi-layer verification gates (build → test → functional) and independent verifier (implementer ≠ checker) build confidence in autonomous output.
5. **Communication Without Noise** — Telegram integration is focused and useful. Morning reports, status checks, and commands — not chatbot conversation.
