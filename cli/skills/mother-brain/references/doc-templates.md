# Document Templates

Templates used by Mother Brain when creating project documents.

## Vision Document Template (`vision.md`)

```markdown
# [Project Name] - Vision

## The Problem
[User's pain point/opportunity]

## The Vision
[3-12 month desired future state]

## Target Users
[Who benefits and how]

## Why This Matters
[The deeper purpose]

## Success Looks Like
[Measurable outcomes]

## Timeline & Constraints
[Constraints only - budget, skills, tech preferences. NOT timeline.]

## MVP Definition
[Minimum viable success]

## Strategic Themes
[3-5 key focus areas derived from vision]
```

## Task Document Template (`tasks/NNN-task-name.md`)

```markdown
# Task NNN: [Task Name] - [Logic/UI/Animation]

**Status**: 🟡 In Progress  
**Phase**: Phase 1 - Foundation  
**Strategic Theme**: [Which theme this supports]  
**Assigned**: [Date]  

## Objective
[What this task achieves]

**Scope Clarity**:
- **Type**: [Logic | UI | Animation | Integration | Testing]
- **Focus**: [What this task implements specifically]
- **NOT in scope**: [What related features are in future tasks]

## Success Criteria
- [ ] [Specific, testable criterion]
- [ ] [Specific, testable criterion]

## Approach
[High-level approach]

## Dependencies
- [What must exist before this]

## Skills to Use
- [Relevant skill name and purpose]

## Deliverables
- [Specific files/outputs]

## Notes & Decisions
[Log decisions made during execution]

## Validation
[ ] Built successfully
[ ] Tested and verified
[ ] User confirmed it meets expectations
```

## Value Framework Template (`value-framework.md`)

```markdown
# [Project Name] - Value Framework

> Living prioritization criteria derived from vision discovery.
> Used to order tasks, evaluate new ideas, and justify roadmap decisions.
> Updated as the project evolves and user priorities shift.

## Core Value Driver
[The #1 thing — e.g., "Users can track their backlog within 2 weeks"]

## Priority Dimensions (Weighted)

| Dimension | Weight | Description |
|-----------|--------|-------------|
| Vision Alignment | [1-5] | How directly does this serve the core vision? |
| MVP Proximity | [1-5] | Does this get us closer to a shippable release? |
| User Impact | [1-5] | How much does this improve the user experience? |
| Effort | [1-5] | How much work is required? (inverse: lower effort = higher priority) |
| Urgency | [1-5] | Is this time-sensitive or blocking other work? |
| Long-term Value | [1-5] | Does this pay off strategically over time? |
| Risk Reduction | [1-5] | Does this reduce technical or project risk? |

*Weights are 1 (low importance) to 5 (critical). Derived from user's stated values.*

## User's Stated Values
- Speed vs Quality preference: [from discovery]
- Abandon/deprioritize triggers: [from discovery]
- Core success metric: [from discovery]

## Scoring Guide

**Priority Score** = Sum of (Dimension Score × Weight) for each dimension

When comparing tasks:
1. Score each task across all dimensions (1-5 per dimension)
2. Multiply by weight
3. Higher total = higher priority
4. Ties broken by: Vision Alignment > MVP Proximity > User Impact

## Decision Rules
- Tasks scoring < [threshold] on Vision Alignment should be questioned
- Tasks scoring 5 on Urgency override normal ordering (blockers first)
- Tasks scoring 5 on MVP Proximity during Phase 1 get priority boost
- After MVP: User Impact and Long-term Value become more important

## Framework Evolution Log

| Date | Change | Reason |
|------|--------|--------|
| [Created] | Initial framework | Vision discovery |
```

## Roadmap Template (`roadmap.md`)

```markdown
# [Project Name] - Roadmap

## Delivery Strategy (Research-Based)
**Project Type**: [From research]  
**MVP Approach**: [What minimum viable means for this type]  
**Launch Pattern**: [How to reach users]  
**Iteration Strategy**: [How to improve post-launch]

---

## Phase 1: MVP - [Core Problem Solution]
**Goal**: Shortest path to deliver user value  
**Success Gate**: [MVP criteria from vision]  
**Strategy**: Solve core problem, defer everything else

**Deliverables** (ordered by Value Framework score):
- [ ] **Task 001**: [Description] — *Score: [N]*
- [ ] **Task 002**: [Description] — *Score: [N]*

**Why this order**: [Explanation based on Value Framework]

**Skills Available**: [List relevant skills]

**Definition of Done** (from vision + research):
- [Criterion from vision]
- [Launch criterion from research]

---

## Phase 2+: Post-MVP Iteration
**Strategy**: [Iteration approach from research]  
**Trigger**: Phase 1 complete + [feedback mechanism]

**Planned Enhancements**:
- [ ] **Task [N]**: [Enhancement] — *Score: [N]*

**Note**: These tasks may change based on user feedback

---

## Future Enhancements (Post-MVP Backlog)
- [ ] [Feature not essential to core problem]
```

## Learning Log Template (`learning-log.md`)

```markdown
# Learning Log

## [Date] - [Issue Fixed]
**Skill**: [Which skill was healed]
**Problem**: [What went wrong]
**Root Cause**: [Why it happened]
**Fix Applied**: [How it was fixed]
**Lesson Learned**: [General principle extracted]
**Improvement Made**: [What was updated to prevent recurrence]
```
