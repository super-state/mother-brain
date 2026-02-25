# Mother Brain Daemon — Project Brain

> Project-specific learnings, preferences, and skill tracking.
> Managed by Child Brain. Read by Mother Brain at task start.

## Skills Created
- `daemon-architect` — Architecture patterns, module structure, coding conventions
- `telegram-integrator` — grammy bot, commands, notifications, morning reports
- `verification-engine` — Multi-layer verification gates, confidence classification

## Skills Pending
- `ollama-manager` — Local model lifecycle on Pi, model selection, context optimization (needed for post-MVP local inference)
- `budget-tracker` — Token/cost tracking skill, budget enforcement patterns (needed when implementing budget module)
- `dashboard-builder` — Minimal web UI for configuration and monitoring (post-MVP)
- `morning-report-formatter` — Detailed morning report generation with evidence (may merge into telegram-integrator)

## Style & Preferences
- Quality-first approach — "getting it right the first time"
- Reliability over speed — complexity that risks breaking autonomous operation gets deprioritized
- Token efficiency is sacred — every LLM call must be justified
- Build for ourselves — not optimizing for external users

## Course Corrections

### Conversational Onboarding (Not Command-Based)
**Trigger**: User feedback that `/addproject` commands feel unnatural
**Learning**: The daemon's project onboarding should be conversational, not command-based. Instead of requiring users to learn Telegram commands, the daemon should:
1. **Identity Phase**: First establish its own personality/soul (borrowed from OpenClaw's identity concept)
2. **Discovery Phase**: Chat naturally with the user, understand what they're working on
3. **Vision Phase**: Organically detect projects and craft direction from conversation (maps to Mother Brain's vision phase)
**Impact**: Commands like `/addproject` become power-user shortcuts, not the primary onboarding flow. The default experience should feel like talking to an intelligent assistant that figures out what you need.
**Check Added**: Before building user-facing features, default to conversational UX over command-based UX.

### Self-Optimization Loop (Usage Retrospective)
**Trigger**: User feedback that usage tracking without analysis is wasted data
**Learning**: The daemon should run a daily usage retrospective at startup — analyze highest token consumers by tier/model/project, identify optimization opportunities (e.g., "chat tier used 80% of tokens — consider switching to a cheaper model" or "project X consumed 3x more than project Y — investigate"), and report findings via Telegram. This mirrors Child Brain's post-delivery retrospective pattern.
**Impact**: The daemon doesn't just track costs — it actively analyzes and recommends optimizations. This is a self-improvement loop: track → analyze → suggest → act.
**Check Added**: Autonomous systems must include self-optimization loops — don't just track metrics, automatically analyze them for improvement opportunities.

### All Models Via Copilot (Not Direct API)
**Trigger**: User corrected that Claude/Sonnet models should be labeled as Copilot, not Anthropic
**Learning**: All LLM models are accessed via GitHub Copilot subscription through GitHub Models API (`models.github.ai`). No direct Anthropic or OpenAI API keys are used. The provider is always "copilot". Anthropic-prefixed model IDs return 404 on GitHub Models API — only OpenAI-prefixed models are confirmed working.
**Impact**: Init wizard defaults changed from `anthropic/claude-*` to `openai/gpt-*`. Pricing labels updated. All code comments reference Copilot as provider.
**Check Added**: Never recommend or default to model IDs that haven't been confirmed working on GitHub Models API.

### The Daemon IS Mother Brain (Not a Chat Wrapper)
**Trigger**: User tested Telegram conversation and gave critical feedback: "It asks too many questions at once" and "It should BE Mother Brain — all of these rules, every part of the skills should be in this assistant"
**Learning**: The conversation handler must not be a generic LLM chat wrapper with a persona prompt. It must implement the actual Mother Brain guided process: state-tracked phases (greeting → discovery → vision → planning → active), one question at a time, phase-specific system prompts that constrain the LLM, entity extraction, and state persistence across sessions. The daemon doesn't "talk like" Mother Brain — it IS Mother Brain running over Telegram.
**Impact**: Complete rewrite of conversation handler. Added Brain Runtime state machine, phase-specific system prompts, SQLite state persistence, entity extraction, and automatic phase transitions.
**Check Added**: The daemon's conversation must follow a guided process with state tracking. Never freestyle LLM chat.

### Always-On, Not Overnight-Only
**Trigger**: User clarified "this isn't an overnight app — it just runs as an agent, there aren't set running times, it is just always on. The bonus is it works while asleep, not only works when you're asleep"
**Learning**: The daemon is an always-on development partner. The overnight capability is a BONUS feature, not its identity. System prompts, persona, and all messaging must frame it as "always available" not "works while you sleep." Never promise to do something "tonight" — say "right away" or "now."
**Impact**: Reframed all system prompts, persona greeting, and tagline from "overnight worker" to "always-on partner."
**Check Added**: Never use "overnight", "while you sleep", or time-bound language as the daemon's primary identity.

### Local Model Preference is qwen3
**Trigger**: User corrected default local model from gemma2:2b to qwen3
**Learning**: The default local Ollama model should be qwen3 (or other open-source models), not gemma. When setting configurable defaults, always check user's previously stated preferences before falling back to benchmark-based recommendations.
**Impact**: Init wizard default changed from gemma2:2b to qwen3.
**Check Added**: Always check Project Brain for user-stated preferences before setting defaults from research data.

### Outcomes Must Be Demo-Ready, Not Code-Ready
**Trigger**: User said "You should always craft outcomes so that the user can demo them - I never ever should be presented code" and refined: "I need specific instructions on how to use and see what you built — not the code, but what I can now do that I couldn't do before — user value"
**Learning**: When presenting completed outcomes for approval, provide specific step-by-step instructions the user can follow RIGHT NOW to experience the new capability. Frame as "what you can now do that you couldn't before." Include exact commands, messages to send, and expected responses. Never present file lists, code snippets, or abstract feature descriptions.
**Impact**: All future outcome presentations must be actionable user instructions.
**Check Added**: Outcome completion must include step-by-step user instructions, not code or abstract descriptions.

### Verify Runtime Dependencies After Deploy
**Trigger**: Commitment executor failed with "404 model 'qwen3:14b' not found" — model was configured but not installed on Pi
**Learning**: After deploying new functionality that depends on external services (Ollama models, APIs, configs), always verify the dependencies exist on the target. Don't assume config matches reality. For Ollama specifically, `ollama list` should be checked before relying on a model.
**Impact**: Added deployment checklist item. Reminder execution redesigned to not require LLM.
**Check Added**: After deploy, verify runtime dependencies exist on target environment.

### Simple Actions Don't Need LLM
**Trigger**: Commitment executor unnecessarily routed reminders through background LLM tier
**Learning**: Simple actions like reminders and notifications should be direct — the notification IS the fulfillment. Only use LLM for commitments that genuinely need reasoning (research, summarization, analysis). Over-engineering with LLM calls adds cost, latency, and failure modes for zero value.
**Impact**: Executor changed from LLM-based to direct notification for reminders.
**Check Added**: Token efficiency — never use an LLM call when direct code execution suffices.

## Validation Checks
- [ ] User-facing features should prefer conversational discovery over explicit commands
- [ ] Onboarding flows should feel natural, not require reading documentation
- [ ] The daemon should have identity/personality before engaging with users
- [ ] Autonomous tracking systems must include automatic analysis/optimization, not just data collection
- [ ] Never default to model IDs not confirmed working on GitHub Models API
- [ ] All models are accessed via Copilot — never label as "Anthropic" or "OpenAI" provider directly
- [ ] Conversation handler must use state-tracked phases, not freestyle LLM chat
- [ ] Every message must ask at most ONE question — never multiple questions at once
- [ ] System prompts must not reference "overnight work" during onboarding phases
- [ ] LLM API calls must have content filter error handling (Azure false positives)
- [ ] Phase transitions must have safety valves — never let a phase get stuck indefinitely
- [ ] Never use "overnight" or "while you sleep" as daemon's primary identity — it's always-on
- [ ] Default local model is qwen3 — always check Project Brain preferences before using research-based defaults
- [ ] Outcome completion must include step-by-step user instructions showing new capabilities, never code/file changes
- [ ] After deploying, verify runtime dependencies (Ollama models, configs) exist on target environment
- [ ] Reminders and simple notifications must NOT use LLM calls — direct notification is the fulfillment
- [ ] Regex matching LLM output must handle Unicode variants (curly quotes U+2019, em-dashes, etc.)
- [ ] Time parsing must support both 12h (3:00pm) and 24h (15:00) formats — LLMs use both
