# Mother Brain Daemon - Value Framework

> Living prioritization criteria derived from vision discovery.
> Used to order tasks, evaluate new ideas, and justify roadmap decisions.
> Updated as the project evolves and user priorities shift.

## Core Value Driver

Full autonomy — speak to Mother Brain from anywhere via phone, it builds products, runs business operations, orchestrates specialized agents, and generates income. Dream → message → reality.

## Priority Dimensions (Weighted)

- **Vision Alignment** — Weight: 5 — How directly does this serve the autonomous dream→reality pipeline?
- **Reliability** — Weight: 5 — Will this run safely overnight without supervision? Will it break other things?
- **Token Efficiency** — Weight: 5 — Does this minimize API spend? Zero cost when idle?
- **MVP Proximity** — Weight: 4 — Does this get us closer to the first working daemon?
- **User Impact** — Weight: 4 — How much does this improve the "wake up to progress" experience?
- **Effort** — Weight: 3 — How much work is required? (inverse: lower effort = higher priority)
- **Long-term Value** — Weight: 3 — Does this pay off strategically (multi-agent, income gen)?
- **Risk Reduction** — Weight: 2 — Does this reduce technical or operational risk?

*Weights are 1 (low importance) to 5 (critical). Derived from user's stated values.*

## User's Stated Values

- **Speed vs Quality**: Quality-first — "getting it right the first time"
- **Tech Debt Tolerance**: Balanced — depends on the feature. Core daemon loop must be solid; peripheral features can iterate.
- **Abandon Trigger**: Complexity that risks reliability. If adding a feature could break the daemon's autonomous operation, deprioritize it.
- **Core Success Metric**: "I can speak to Mother Brain using a chat app on my phone from anywhere, anytime, and it will build pretty much anything for me."

## Scoring Guide

**Priority Score** = Sum of (Dimension Score × Weight) for each dimension

When comparing tasks:
1. Score each task across all dimensions (1-5 per dimension)
2. Multiply by weight
3. Higher total = higher priority
4. Ties broken by: Vision Alignment > Reliability > Token Efficiency

## Decision Rules

- Tasks scoring < 3 on Reliability should be redesigned before implementation
- Tasks scoring 5 on Reliability AND Token Efficiency get automatic priority boost
- Features that add complexity without clear vision alignment → backlog, not Phase 1
- When in doubt, choose the simpler approach that's less likely to break overnight
- After MVP: User Impact and Long-term Value (multi-agent, income) become more important

## Framework Evolution Log

- Initial framework from vision discovery. Quality + reliability prioritized for autonomous operation.
