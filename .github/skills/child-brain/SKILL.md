---
name: child-brain
description: Learning orchestrator that analyzes friction, creates missing skills, and splits learnings between project-level and meta-level improvements.
license: MIT
compatibility: node>=18
metadata:
  domain: meta
  stage: production
allowed-tools: powershell view grep glob web_search ask_user create edit skill
---

# 🧒 Child Brain

**The Learning Orchestrator for Friction Analysis**

Child Brain is invoked when friction occurs (user says "this isn't what I wanted", task fails validation, errors happen). It handles the **analysis and routing** of learnings to the correct location.

## Purpose

Child Brain ensures learnings go to the right place:
- **Project-specific learnings** → Project Brain (`.mother-brain/project-brain.md`)
- **Meta-level process learnings** → Mother Brain (`.github/skills/mother-brain/SKILL.md`)

Child Brain NEVER stores domain knowledge itself. It analyzes, routes, and creates.

## When to Invoke

Child Brain is invoked by Mother Brain when:
1. User says "this isn't what I wanted" or similar negative feedback
2. Task validation fails (needs adjustment or rework)
3. Build/test failures occur during task execution
4. Post-task reflection identifies friction points
5. **User provides freeform/other response when given choices** (indicates expectations weren't met by provided options)
6. **User expresses confusion or asks clarifying questions mid-task** (indicates process isn't clear)
7. **User corrects agent behavior** (e.g., "you should have done X" or "why didn't you Y")

**AUTOMATIC TRIGGER RULE**: If user selects "other" or provides freeform text that contradicts/challenges agent behavior, IMMEDIATELY invoke Child Brain before continuing. This indicates friction that needs analysis.

## Operating Principles

- **Separation of Concerns**: Project learnings stay in project, meta learnings stay in framework
- **Deep Questioning**: Don't accept surface-level feedback - dig for root cause
- **Skill Creation Bias**: When in doubt, create a skill rather than add inline knowledge
- **Vision Alignment**: Project learnings must align with project vision
- **Meta Abstraction**: Mother Brain updates must be completely project-agnostic

## Friction Analysis Flow

### Step 1: Capture the Friction

When invoked with friction context:

```
🧒 Child Brain - Friction Analysis

**What Happened:**
- Task: [Task number and name]
- What was implemented: [Brief description]
- User feedback: [Exact user feedback or error message]
- Current skills used: [List skills that were used]
```

### Step 2: Deep Questioning

Ask the user deeper questions to understand root cause:

```
I need to understand this better to prevent it from happening again.
```

Use `ask_user` to probe:
1. "What specifically was wrong?" (if not clear from initial feedback)
2. "What did you expect instead?" (concrete expected outcome)
3. "Is this a style/tone issue or a fundamental approach issue?"
4. "Have you seen examples of what you wanted?" (reference gathering)

### Step 3: Root Cause Analysis

Determine the **layer** where the issue originated:

**Layer Analysis Questions:**
1. Was there a skill that should have been used but wasn't?
2. Was there a skill that was used but lacked domain knowledge?
3. Did Mother Brain's process skip a necessary discovery step?
4. Was the roadmap/task definition missing requirements?

**Root Cause Categories:**
- **Missing Skill**: No skill existed for this type of work
- **Insufficient Skill**: Skill existed but lacked depth/research/references
- **Missing Discovery**: User wasn't asked about preferences before implementation
- **Missing Validation**: No check was in place to catch this before user saw it
- **Process Gap**: Mother Brain's workflow skipped a necessary step

### Step 4: Split the Learning

Based on root cause, determine what goes where:

**PROJECT-LEVEL Learning (→ Project Brain):**
- "This project uses [specific style/tone/approach]"
- "For this project, always [specific check or validation]"
- "This project's vision includes [specific requirement]"
- References, examples, style guides specific to this project
- Validation checks specific to this project's domain

**META-LEVEL Learning (→ Mother Brain):**
- Process improvements that help ALL projects
- When to create skills (patterns that warrant skill creation)
- When to ask discovery questions (before implementing creative work)
- When to research (domains that need external knowledge)
- Validation gates (when to pause and check with user)

**Skill Creation Decision:**
If root cause is "Missing Skill" or "Insufficient Skill":
- Invoke skill-creator to create/enhance the skill
- Skill gets the domain knowledge, NOT Mother Brain
- Log skill creation in Project Brain

### Step 5: Apply Project-Level Learning

Update `.mother-brain/project-brain.md`:

```markdown
## [Date] - Learning: [Brief Title]

**Trigger**: [What went wrong]
**Root Cause**: [Category from Step 3]
**Learning**: [What this project now knows]
**Validation Check**: [What to check in future tasks]
**Aligned With Vision**: [Which vision element this supports]
```

Display:
```
📘 PROJECT BRAIN updated: [Brief description of what was learned for this project]
```

### Step 6: Apply Meta-Level Learning

Update Mother Brain SKILL.md with **process-only** improvements:

**Good Meta Learnings (process-agnostic):**
- "Before implementing creative work, always ask user about style preferences"
- "When task involves [category], check if a specialized skill exists"
- "Add discovery step before implementing user-facing content"
- "Validate task scope against existing skills before starting"

**Bad Meta Learnings (polluting - NEVER add these):**
- "When writing game dialogue, use short punchy sentences"
- "UI elements should have 8px padding"
- "Horse portraits should use pixel art style"
- "Story-driven tasks need narrative depth"

Display:
```
🧠 MOTHER BRAIN updated: [Brief description of process improvement]
```

### Step 7: Skill Creation/Enhancement

If a skill needs to be created or enhanced:

1. Research the domain using `web_search`:
   - "[domain] best practices"
   - "[domain] style guides"
   - "[domain] examples"

2. Invoke skill-creator with context:
   - What the skill should do
   - Research findings
   - User's stated preferences
   - Examples of good output

3. Log skill creation:
   ```
   🛠️ SKILL CREATED: [skill-name] - [brief description of what it knows]
   ```

4. Update Project Brain with skill reference:
   ```markdown
   ## Skills Created for This Project
   - [skill-name]: Created because [reason], knows about [domain knowledge]
   ```

### Step 8: Fix the Immediate Issue

After learning is captured:
1. Apply the fix to the current deliverable
2. Re-validate with user
3. Mark task complete only when user approves

## Project Brain File Structure

Child Brain creates/updates `.mother-brain/project-brain.md`:

```markdown
# [Project Name] - Project Brain

> Project-specific learnings, checks, and validations. This file is consulted at the start of each task.

## Vision Alignment

[Brief summary of project vision for quick reference]

## Style & Tone

### [Category 1 - e.g., "Narrative/Writing"]
- Style: [User's stated preference]
- Tone: [Discovered preference]
- Examples: [References that match desired output]
- Validation: [How to check if output matches]

### [Category 2 - e.g., "Visual/UI"]
- Style: [User's stated preference]
- References: [Examples, style guides]
- Validation: [How to check]

## Validation Checks (Run at Task Start)

Before starting any task, check:
- [ ] [Check 1 from past learnings]
- [ ] [Check 2 from past learnings]
- [ ] [Check 3 from past learnings]

## Skills Created for This Project

| Skill Name | Created Because | Domain Knowledge |
|------------|-----------------|------------------|
| [skill-name] | [Friction that triggered creation] | [What it knows] |

## Learning Log (Project-Specific)

### [Date] - [Brief Title]
**Trigger**: [What went wrong]
**Learning**: [What we now know about this project]
**Check Added**: [Validation check to prevent recurrence]
```

## Integration with Mother Brain

### Mother Brain Invokes Child Brain When:

1. **Step 10 - Task Validation**: User selects "Works but needs adjustment" or "Doesn't meet expectations"
2. **Step 10B - Post-Task Reflection**: Friction points detected in conversation
3. **Step 9A - Error Detection**: Build/test failures during task execution

### Child Brain Returns Control When:

1. Learning has been routed to correct location (Project Brain or Mother Brain)
2. Any needed skills have been created/enhanced
3. Immediate fix has been applied (if applicable)
4. User has validated the fix works

## Example: Story Dialogue Issue

**Friction**: User says "This dialogue is awful, short, and doesn't fit what I had in mind"

**Step 1 - Capture**:
- Task: Implement story chapter 2
- What was implemented: 5 lines of basic dialogue
- User feedback: "awful, short, doesn't fit"
- Skills used: None specific to narrative

**Step 2 - Deep Questions**:
- "What specifically was wrong?" → "Too brief, no personality"
- "What did you expect?" → "Rich dialogue like Monkey Island, witty banter"
- "Style/tone issue or approach?" → "Both - no research was done"
- "Examples?" → "Monkey Island, Discworld games"

**Step 3 - Root Cause**:
- Missing Skill: No narrative/dialogue skill existed
- Missing Discovery: Never asked user about writing style
- Process Gap: Task started without checking if skills were sufficient

**Step 4 - Split**:

PROJECT BRAIN:
- "This project uses witty, verbose dialogue style like Monkey Island"
- "Dialogue should include personality, humor, and world-building"
- "Reference: Monkey Island, Discworld games"
- "Validation: Dialogue must be reviewed for personality before showing user"

MOTHER BRAIN (meta-level only):
- "Step 9 Enhancement: Before starting tasks involving creative content (narrative, dialogue, art, music), MUST check if specialized skill exists. If not, create one with user input on style preferences"
- "Step 9 Enhancement: Add mandatory discovery questions for creative domains"

SKILL CREATION:
- Create `game-narrative-designer` skill
- Research: adventure game dialogue, witty writing, character voice
- Include: user's stated preference for Monkey Island style
- Embed: examples, patterns, validation checks

**Step 5-7**: Apply updates to Project Brain, Mother Brain, create skill

**Step 8**: Rewrite dialogue using new skill, validate with user

## What Child Brain Does NOT Do

- ❌ Store domain knowledge (that goes in skills)
- ❌ Make project-specific entries in Mother Brain
- ❌ Skip the user discovery step
- ❌ Assume style/tone without asking
- ❌ Add industry-specific or domain-specific rules to Mother Brain

## Visible Feedback (Mandatory)

When Child Brain completes analysis, display:

```
🧒 Child Brain Analysis Complete

📘 PROJECT BRAIN: [What was learned for this project]
🧠 MOTHER BRAIN: [Process improvement applied - or "No meta changes needed"]
🛠️ SKILLS: [Skills created/enhanced - or "No skill changes"]

Applying fix to current task...
```

This ensures the user sees where learnings went.
