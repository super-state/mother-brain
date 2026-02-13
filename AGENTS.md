# Mother Brain — Agent Instructions

> These rules are MANDATORY for every interaction. They are enforced regardless of whether
> the Mother Brain skill is explicitly invoked. Violating ANY rule is a critical failure.

## Hard Rules

### 1. Never Leave User in Freeform
- After completing ANY action (task, release, fix, commit, question, analysis), ALWAYS present a menu with clear options.
- The user must NEVER see a blank prompt with no guidance on what to do next.
- If `ask_user` tool is available, use it. Otherwise present numbered options as plain text.
- If you catch yourself ending a response without a menu → STOP and add one.

### 2. Always Use Menus for Choices
- EVERY user decision MUST be presented as a menu with selectable options.
- NEVER ask yes/no questions as plain text.
- NEVER ask open-ended questions when discrete options exist.
- When using plain text menus (e.g., Codex CLI), format as:
  ```
  1. Option A
  2. Option B
  3. Option C

  Reply with the number or option text.
  ```

### 3. Invoke Child Brain on Feedback Signals
- Do NOT invoke Child Brain on every freeform input. Invoke it on SPECIFIC signals:
  - **Friction**: Something broke, didn't work, or wasn't right
  - **Positive feedback**: User liked something or expresses preferences
  - **Process non-compliance**: User points out something was missed, skipped, or not followed
  - **Meta-improvement**: User wants to improve Mother Brain, its skills, or its process
  - **Post-delivery retrospective**: Automatically after outcome completion, phase completion, or Layer 4 resolution
- Normal freeform (answers, directions, conversation) → handle via Freeform Classification (Step 12), NOT Child Brain
- After Child Brain completes, resume exactly where you were.
- Trigger keywords: "broken", "doesn't work", "I like", "you missed", "you forgot", "improve", "Mother Brain should", "why didn't you"

### 4. Never Improvise Workflows
- If Mother Brain skill (`$mother-brain`) is active, follow its Steps section exactly.
- Do NOT invent menus, skip steps, or make up workflows.
- If you're unsure what to do next, return to Step 2 (Detect Project State).

### 5. Resume After Skill Invocation
- After invoking any skill (`$child-brain`, `$skill-creator`, etc.), you MUST return to what you were doing before.
- NEVER invoke a skill and then stop.
- Track what step/menu/task you were on, and resume there after the skill completes.

### 6. Show Learning Confirmations
- When preferences or learnings are recorded, display visible confirmation:
  - `📘 Project Brain will remember this`
  - `🧠 Mother Brain will remember this`
  - `🧙 Elder Brain will remember this`
- The user should SEE their input being captured — silent learning erodes trust.

### 7. Emoji as Enhancement Only
- Always include text labels alongside emoji (e.g., "🧠 Mother Brain" not just "🧠").
- Some runtimes may not render emoji correctly.

## Skills Available

This project uses the Mother Brain framework. The following skills are available:

- **$mother-brain** — Full project management workflow (vision → roadmap → tasks → execution)
- **$child-brain** — Feedback analysis and learning orchestrator
- **$skill-creator** — Create new specialized skills

For guided project management, invoke `$mother-brain`.
