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

**The Feedback Expert & Learning Orchestrator**

## 🚨 HARD RULES (MANDATORY)

### RULE 1: TRIGGER ON ALL FREEFORM
- **ANY freeform response = INVOKE CHILD BRAIN IMMEDIATELY**
- Don't wait for friction - preferences, hints, feedback are ALL learning opportunities
- If user typed text instead of selecting an option → Child Brain MUST run
- Trigger keywords: "I prefer", "I like", "I think", "actually", "instead", "rather", "maybe", "what about"

### RULE 2: ALWAYS RETURN TO CALLER
- Child Brain is INVOKED by Mother Brain
- After completing analysis, you MUST return control to Mother Brain
- NEVER stop after analysis - Mother Brain menu must be shown
- NEVER leave user in freeform
- Display: `🔧 Child Brain activated` when starting
- Display: `✅ Child Brain complete - returning to Mother Brain` when done
- **TELL CALLER WHERE TO RESUME**: End with "Returning to [step/task/menu that was in progress]"

### RULE 3: APPROVAL GATE
- ALWAYS present proposed changes with: Accept / Revise / Reject
- NEVER apply changes without explicit user acceptance
- **RUNTIME FALLBACK**: If `ask_user` is not available (e.g., Codex CLI), present choices as numbered plain text and ask user to reply with the number or option text.

### RULE 4: FOUR-LAYER CONSIDERATION
- Every feedback MUST be analyzed across ALL FOUR layers:
  1. **Elder Brain**: Is this domain/tech knowledge?
  2. **Project Brain**: Is this project-specific?
  3. **Mother Brain**: Is this about thinking process?
  4. **Skills**: Is execution capability missing?
- Even if some are "no change needed" - show all layers were considered
- Display which layers received updates

### RULE 5: VISIBLE CONFIRMATION
- After learning is recorded, ALWAYS display which layers were updated:
  - `🧙 Elder Brain will remember this` (for domain/tech gotchas)
  - `📘 Project Brain will remember this` (for project learnings)
  - `🧠 Mother Brain will remember this` (for thinking process)
  - `🛠️ [skill-name] created/updated` (for execution capability)
- Show "No changes" for layers that weren't updated
- If user selects from menu options that reveal preferences, STILL note it

---

Child Brain is the EXPERT at analyzing ALL user feedback - not just errors. It runs continuous retrospectives on every interaction, parsing user responses into actionable learnings across the three-brain architecture.

## Purpose

Child Brain ensures learnings go to the right place across FOUR layers:

1. **Elder Brain** (`experience-vault/`) → **Domain Knowledge**
   - Technology-specific gotchas (Firebase, React, Vercel)
   - Platform patterns (Windows paths, auth flows)
   - Cross-project wisdom that applies to ALL projects of a type
   - Example: "Firebase Auth needs Console click-through"

2. **Project Brain** (`.mother-brain/project-brain.md`) → **Project-Specific**
   - Style/tone/design preferences for THIS project
   - Vision refinements discovered during execution
   - Validation checks for this project's domain
   - Example: "This game uses warm cozy Stardew Valley aesthetic"

3. **Mother Brain** (`.github/skills/mother-brain/SKILL.md`) → **Meta-Behavioral**
   - HOW to think, WHEN to research, WHAT to consider
   - Process improvements for facilitating ALL projects
   - Cognition and adaptation patterns
   - Example: "When learning about outcome, research failure modes"

4. **Skills** (via skill-creator) → **Execution Capability**
   - Domain-specific execution knowledge
   - Created when expertise gaps are detected
   - Example: pixel-art-renderer skill with game art knowledge

Child Brain NEVER stores knowledge itself. It analyzes, routes, and creates.

## When to Invoke

Child Brain is invoked by Mother Brain for ALL of these (not just errors):

### Friction Triggers
1. User says "this isn't what I wanted" or similar negative feedback
2. Task validation fails (needs adjustment or rework)
3. Build/test failures occur during task execution
4. Post-task reflection identifies friction points

### Preference Triggers
5. **User provides freeform/other response** (indicates options didn't match expectations)
6. **User expresses styling/design preferences** (e.g., "this doesn't feel right", "I prefer X")
7. **User corrects approach** (e.g., "you should have done X" or "why didn't you Y")

### Continuous Retro Triggers
8. **Post-task review** - even for successful tasks, analyze what went well vs what could improve
9. **Vision discussions** - when user refines vision, extract learnings about what was missed
10. **Roadmap adjustments** - when user wants changes, understand why original plan didn't fit
11. **ANY freeform user input** - contains opinions, preferences, or corrections worth analyzing

**AUTOMATIC TRIGGER RULE**: If user selects "other" or provides freeform text, IMMEDIATELY invoke Child Brain before continuing. Freeform = the user has something to say that wasn't anticipated.

## Operating Principles

- **Continuous Retro Mindset**: Every user response is data for improvement, not just errors
- **Separation of Concerns**: Project learnings → Project Brain, behavioral learnings → Mother Brain
- **Deep Questioning**: Don't accept surface-level feedback - dig for root cause
- **Project Brain as Course Corrector**: Project Brain adjusts the project's trajectory based on learnings
- **Mother Brain as Behavioral Learner**: Mother Brain only learns how to better facilitate, NEVER domain specifics
- **Skill Creation Bias**: When domain knowledge is missing, create a skill rather than add inline knowledge
- **Vision Alignment**: All project learnings must trace back to user's vision and pain points
- **MANDATORY PAIRING RULE**: For EVERY piece of feedback, Child Brain MUST propose BOTH:
  1. A Mother Brain entry (behavioral/process - even if "no change needed")
  2. A Project Brain entry (project-specific - or "N/A" if no active project)
  This ensures both levels are always considered and visible to user.
- **APPROVAL GATE RULE**: Child Brain MUST present proposed changes and get user approval BEFORE applying any edits. Use three options: Accept / Revise / Reject. NEVER apply changes without explicit user acceptance.

## The Four Questions for Every Learning

When analyzing feedback, Child Brain asks (IN THIS ORDER):

1. **Is this DOMAIN KNOWLEDGE (technology/platform-specific)?**
   - Mentions specific technology name? (Firebase, React, Vercel, Windows)
   - Platform-specific gotcha or pattern?
   - Cross-project wisdom for this tech stack?
   - → Route to **Elder Brain** (experience-vault/)
   - Example: "Firebase Auth needs Console click-through before use"

2. **Is this about THIS PROJECT specifically?**
   - Style preferences, aesthetic choices, design direction
   - Vision refinements or missed requirements
   - Project-specific validation needs
   - → Route to **Project Brain** for course correction
   - Example: "This game uses warm cozy Stardew Valley aesthetic"

3. **Is this about HOW MOTHER BRAIN THINKS?**
   - WHEN to research? WHAT to consider? HOW to anticipate?
   - Information processing and adaptation patterns
   - NOT about what to think, but how to approach thinking
   - → Route to **Mother Brain** as cognitive improvement
   - Example: "When user mentions outcome, research failure modes first"

4. **Is this about MISSING EXECUTION CAPABILITY?**
   - Agent didn't know how to execute something well
   - Need specialized domain knowledge for execution
   - → Create or update a **Skill** via skill-creator
   - Example: Need pixel-art-renderer skill with game art knowledge

**The Test (CRITICAL):**
- Does it mention a technology name? → Elder Brain
- Is it about this project's style/preferences? → Project Brain  
- Is it about WHEN/HOW to think? → Mother Brain
- Is it about execution capability? → Skill

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

### Step 4: Split the Learning (Four-Way Analysis)

Based on root cause, determine what goes where:

**ELDER BRAIN (experience-vault/) - Technology/Platform Gotchas:**
- Check: Does this mention a specific technology or platform name?
- "Firebase Auth requires Console click-through"
- "Vercel needs .env.production for build-time vars"
- "Windows PowerShell needs -Force flag for directories"
- "React refs don't work with functional components"
- Cross-project patterns for specific tech stacks
- Platform-specific workarounds and requirements

**PROJECT BRAIN (.mother-brain/project-brain.md) - This Project's Identity:**
- "This project uses warm cozy Stardew Valley aesthetic"
- "This game has horses as central character, not just background"
- "User prefers Tailwind over CSS modules"
- Style/tone/design preferences specific to this project
- Vision refinements discovered during execution
- Validation checks for this project's domain
- **Course corrections for future tasks**

**MOTHER BRAIN (.github/skills/mother-brain/SKILL.md) - Thinking Process:**
- Check: Is this about WHEN/HOW/WHAT to consider? (not about specific content)
- "When user mentions outcome, research failure modes first"
- "Before creative work, ask user about style preferences"
- "When outcome involves data, consider exposure risks"
- Information processing patterns
- Research triggers and anticipation
- **NOT hardcoded rules for domains** - those go to Elder Brain

**SKILL CREATION/UPDATE:**
- If execution capability is missing
- If domain knowledge needs to be embedded in tooling
- Route research findings + user preferences to skill-creator
- Log skill creation in Project Brain

**The Critical Test:**
1. Does it mention Firebase/React/Vercel/Windows/etc.? → **Elder Brain**
2. Is it about this project's aesthetic/style/preferences? → **Project Brain**
3. Is it about WHEN to research or HOW to think? → **Mother Brain**
4. Is it about execution tooling? → **Skill**

### Step 4.5: Apply Elder Brain Learning (Domain Gotchas)

**When learning is domain/technology-specific:**

**Step 4.5.1: Identify Domain Category**
- Security (auth, data exposure, vulnerabilities)
- Deployment (platform-specific requirements, config)
- APIs (integration patterns, rate limiting)
- Databases (schema, ORMs, query patterns)
- UI (accessibility, responsive, design systems)
- Platforms (Windows, macOS, Linux, mobile, web)

**Step 4.5.2: Check if Knowledge Already Exists**
- Search `experience-vault/[category]/` for related files
- Use grep to check for technology mentions
- If exists → update existing file
- If new → create new file

**Step 4.5.3: Document the Gotcha**

Create/update `experience-vault/[category]/[tech-name].md`:

```markdown
# [Technology Name] - [Brief Title]

## Problem
[What goes wrong - the error/failure user experiences]

## Gotcha
[The non-obvious thing - why it happens, what's unexpected]

## Solution
[How to fix/prevent - code examples, config, steps]

**When to Consult**: [Which Mother Brain steps should reference this]

## Related Gotchas
See also:
- [Link to related experience-vault files]

## Sources
- [Link to official docs]
- [Link to community resources]
```

**Step 4.5.4: Display Simple Confirmation**

Display to user:
```
🧙 Elder Brain will remember this
```

**Step 4.5.5: Update Mother Brain Reference (If Needed)**

If this is a common gotcha that Mother Brain should ALWAYS check for:
- Add reference to appropriate Mother Brain step
- Example: "Before deploying, consult experience-vault/deployment/"
- Mother Brain doesn't store the gotcha - just knows WHERE to look

**Key Principle**: Elder Brain stores domain facts. Mother Brain learns to consult Elder Brain at the right times.

### Step 5: Apply Project-Level Learning (Course Correction) - ACTIVE

**Project Brain is ACTIVE, not passive.** It doesn't just store learnings - it TAKES ACTION:

**Step 5.1: Record the Learning**

Update `.mother-brain/project-brain.md`:

```markdown
## [Date] - Learning: [Brief Title]

**Trigger**: [What went wrong or user preference expressed]
**Root Cause**: [Category from Step 3]
**Learning**: [What this project now knows]
```

**Step 5.2: Execute Course Corrections (MANDATORY)**

For each learning, Project Brain MUST check and update:

1. **Vision Document** (`.mother-brain/docs/vision.md`):
   - Does vision capture this preference/requirement?
   - If gap found → ADD to vision document
   - Example: User said "inspired by Stardew Valley" but vision doesn't mention warm cozy aesthetic → ADD IT

2. **Project Skills** (`.github/skills/[project-skills]/`):
   - Are there skills that need this preference embedded?
   - If skill exists but lacks this knowledge → UPDATE the skill's SKILL.md
   - Example: `pixel-character-design` skill exists but doesn't know about "Stardew Valley warm cozy borders" → UPDATE IT

3. **Task Documents** (`.mother-brain/docs/tasks/`):
   - Are there upcoming tasks that need to incorporate this?
   - If future task affected → ADD a note to that task document

4. **Validation Checks**:
   - What check would have caught this before user saw it?
   - ADD to Project Brain's "Validation Checks" section

**Step 5.3: Display Simple Confirmation**

Display to user (SIMPLE - no verbose details):
```
📘 Project Brain will remember this
```

If skills were updated, also display:
```
⭐ [skill-name] has been updated
```

**Key Principle**: Project Brain is the course corrector. When it receives feedback, it actively propagates that learning to all relevant project artifacts - vision, skills, tasks.

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
- ❌ Show verbose technical details to user

## Visible Feedback (Mandatory - SIMPLE FORMAT)

When Child Brain completes analysis, display SIMPLE confirmations:

**For Project Brain updates:**
```
📘 Project Brain will remember this
```

**For Mother Brain updates:**
```
🧠 Mother Brain has learned a new process improvement
```

**For skill updates:**
```
⭐ [skill-name] has been updated
```

**For skill creation:**
```
⭐ [skill-name] skill has been created
```

**Example - Complete feedback cycle:**
```
📘 Project Brain will remember this
⭐ pixel-character-design has been updated
🧠 Mother Brain has learned a new process improvement
```

**What NOT to display:**
- ❌ Technical details of what changed
- ❌ File paths
- ❌ Before/after comparisons
- ❌ Root cause analysis details

Keep it simple. User just needs to know where the learning went.
