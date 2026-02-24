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

## Validation Checks
- [ ] User-facing features should prefer conversational discovery over explicit commands
- [ ] Onboarding flows should feel natural, not require reading documentation
- [ ] The daemon should have identity/personality before engaging with users
- [ ] Autonomous tracking systems must include automatic analysis/optimization, not just data collection
