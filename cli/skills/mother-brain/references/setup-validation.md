# Setup Validation & Self-Healing Protocol

**MANDATORY REFLECTION — Blocks setup completion.**

This is the REFLECTION step mentioned in RULE 8. It MUST complete before declaring "setup complete".

**When to run**: IMMEDIATELY after Step 7.5 menu response, BEFORE proceeding to any next action.
**Purpose**: Detect and learn from any issues during the setup flow (Steps 3-7).

## Step 7.6.1: Scan Conversation for Setup Issues
- Review conversation history from Steps 3-7 for:
  - **Build/Tool Failures**: Commands that failed, tools that errored
  - **Skill Creation Failures**: Skills that failed to create or validate
  - **Research Failures**: Web searches that returned no results
  - **File Creation Errors**: Documents that failed to create
  - **Retry Attempts**: Any step that had to be re-run
  - **Partial Completions**: Steps that succeeded but with warnings

- If 0 issues detected: Skip to Step 8 when user selects "Start Task 001"
- If 1+ issues detected: Proceed with healing

## Step 7.6.2: Layer 1 — Fix Current Project Setup
- For each issue found:
  - Identify what failed
  - Determine root cause
  - Apply fix: re-run failed command, re-create failed file, re-validate failed skill
  - Continue until all issues resolved

## Step 7.6.3: Layer 2 — Extract Meta-Lessons for Mother Brain
- For each issue, ask: "What could Mother Brain do differently to prevent this in ALL future projects?"
- Categories:
  - **Missing Validation**: Should a validation step exist where it doesn't?
  - **Error Handling Gap**: Should Mother Brain catch and handle this error type?
  - **Workflow Ordering**: Should steps be reordered to prevent this?
  - **Missing Retry Logic**: Should automatic retry be added?
  - **Missing Pre-Checks**: Should a prerequisite check exist?

- Extract project-agnostic principle:
  - ❌ Bad: "Coffee project skill creation failed"
  - ✅ Good: "Skill creation should validate tool permissions before creating files"

## Step 7.6.4: Auto-Apply Mother Brain Updates
- For each meta-lesson: identify SKILL.md section to update, apply edit, display changes
- Log in `docs/learning-log.md`:
  ```markdown
  ## [Date] - Setup Self-Healing: [Project Name]
  **Issues Found**: [Count]
  **Layer 1 Fixes Applied**: [What was fixed]
  **Layer 2 Meta-Lessons Extracted**: [Principles]
  **Mother Brain Updates Applied**: [Steps/sections updated]
  **Impact**: Prevents [issue type] in all future projects
  ```

## Step 7.6.5: Display Summary
- If issues found:
  ```
  🔧 Setup Validation & Reflection Complete
  Found [X] issue(s) — all resolved.
  ✅ Project Fixes: [summary]
  ✅ Mother Brain Improvements: [meta-lessons]
  ```

- If no issues:
  ```
  ✅ Reflection Complete — No issues detected. Setup is complete!
  ```

- **ONLY AFTER this step completes** → proceed to user's selected action from Step 7.5 menu

**Key Principle**: Every setup run improves Mother Brain for all future projects. Issues are not just fixed—they're learned from.
