# Learning Log

## 2026-02-06 - Mother Brain Self-Update: Remove Redundant Skill

**Issue Type**: Suggestion for improvement
**User Report**: skill-trigger-detector seems unused and might be redundant - never seen it activated

**Analysis**:
- skill-trigger-detector was designed to auto-detect user intent and trigger skills
- In practice: CLI already has /skill-name for explicit invocation, Mother Brain Step 9 handles skill matching
- The skill itself was a configuration wizard, not an active detector
- Never actually invoked during normal operation

**Changes Applied**:
- Deleted `.github/skills/skill-trigger-detector/` folder
- Updated all Mother Brain references from 4 core skills to 3:
  - mother-brain, child-brain, skill-creator
- Removed all "invoke skill-trigger-detector" instructions
- Updated file structure documentation

**Core Framework now**: 3 skills (mother-brain, child-brain, skill-creator)

---

## 2026-02-06 - Mother Brain Self-Update: Existing Project Onboarding

**Issue Type**: Suggestion for improvement
**User Report**: When Mother Brain enters an existing project that doesn't have Mother Brain artifacts, it should offer to onboard - scan the repo to understand what exists, ask clarifying questions, build a retrospective roadmap, and help continue to the next milestone.

**Mother Brain Change**: 
- Added new detection case in Step 2: "Existing project WITHOUT Mother Brain artifacts"
- Added Step 2.2: Existing Project Onboarding workflow with:
  - Deep Repo Analysis (scan ALL files, assess project type/stack/features)
  - Vision Extraction (clarifying questions informed by what exists)
  - Retrospective Roadmap (Phase 0 = done, Phase 1 = current, Phase 2+ = future)
  - Skill Identification (detect patterns in existing code)
  - Confirmation and transition to normal workflow

**Sections Updated**:
- Mother Brain: Step 2 (added third detection case)
- Mother Brain: New Step 2.2 (Existing Project Onboarding)

---

## 2026-02-06 - Mother Brain Self-Update: Project Brain Active Role

**Issue Type**: Suggestion for improvement
**User Report**: Project Brain should be ACTIVE - not just storing learnings but updating vision docs, skills, and task documents. Also, user output should be simple ("Project Brain will remember this", "⭐ skill has been updated") not verbose technical details.

**Mother Brain Change**: 
- Added "Vision → Domain Research Principle": When user mentions inspirations (e.g., "Stardew Valley"), deep-research that domain and embed knowledge into skills

**Child Brain Changes**:
- Step 5 rewritten as "ACTIVE" course correction with mandatory actions:
  - Check and update vision document if gaps found
  - Check and update project skills with new preferences
  - Check and flag future tasks that need this learning
  - Add validation checks to prevent recurrence
- Visible Feedback section rewritten with SIMPLE format:
  - "📘 Project Brain will remember this"
  - "⭐ [skill-name] has been updated"
  - No verbose technical details

**Sections Updated**:
- Mother Brain: Learning Architecture section (new principle)
- Child Brain: Step 5, Visible Feedback section

---

## 2026-02-06 - Mother Brain Self-Update: Approval Gate Enforcement

**Issue Type**: Something broke or didn't work
**User Report**: When providing Mother Brain with an update, it should go via Child Brain for triage. Also, there's supposed to be assessment and the solution should be presented for approval BEFORE implementation - but agent went ahead and implemented without approval.

**Root Cause**: 
1. Step 2A didn't invoke Child Brain for triage
2. Step 2A skipped the approval gate - edits were applied without user acceptance

**Mother Brain Change**: 
- Step 2A now IMMEDIATELY invokes Child Brain for ALL feedback triage
- Added mandatory three-option approval gate: Accept / Revise / Reject
- Changes are ONLY applied after user selects "Accept"

**Child Brain Change**:
- Added MANDATORY PAIRING RULE: Every feedback produces BOTH Mother Brain + Project Brain entries
- Added APPROVAL GATE RULE: Must present changes and get acceptance before editing
- Child Brain now explicitly shows both proposed entries before applying

**Sections Updated**:
- Mother Brain: Step 2A completely restructured
- Child Brain: Operating Principles updated with two new rules

---

## 2026-02-06 - Mother Brain Self-Update: Learning Architecture Improvement

**Issue Type**: Suggestion for improvement
**User Report**: Mother Brain should be project-agnostic with hard rules against storing project-specific information. Child Brain should be the absolute expert at parsing ALL feedback (good and bad). Mother Brain learns only behavioral/process improvements. Project Brain handles course corrections for the current project.

**Root Cause**: Learning architecture wasn't clearly delineated - Mother Brain could accumulate project-specific knowledge over time

**Fix Applied**:
1. **Mother Brain SKILL.md** - Added "Core Identity (IMMUTABLE)" section:
   - Project Agnostic (ABSOLUTE RULE) - never stores project-specific info
   - Behavioral Self-Improvement Only - learns about process, not domains
   - Vision Facilitator Role - sole purpose is bridging user vision to reality

2. **Mother Brain SKILL.md** - Added "Learning Architecture (STRICT SEPARATION)" section:
   - Child Brain is the Feedback Expert for ALL user responses
   - Three-Brain Separation defined clearly
   - Project Brain as "course corrector" for project trajectory
   - Mother Brain Self-Reflection Questions (behavioral only)

3. **Child Brain SKILL.md** - Expanded role:
   - Renamed to "Feedback Expert & Learning Orchestrator"
   - Continuous retro mindset - every user response is data
   - Added preference triggers and continuous retro triggers
   - Added "Three Questions for Every Learning" framework
   - Project Brain updates now include course correction actions

**Sections Updated**:
- Mother Brain: Operating Principles (major restructure)
- Child Brain: Purpose, When to Invoke, Operating Principles, Step 4, Step 5

**Lesson Learned**: The three-brain architecture (Mother/Child/Project) must have absolute separation of concerns. Mother Brain = behavior only. Project Brain = this project's trajectory. Skills = domain knowledge. Child Brain = the router that ensures learnings go to the right place.

---

## 2026-02-06 - Project Archived: Patchwork Bay

**Project Name**: Patchwork Bay
**Archive Location**: C:\Users\adamden\OneDrive - Kainos Software\Desktop\Patchwork-Bay-Archive\
**Skills Archived**: 
- cozy-audio-designer
- design-system-enforcer
- game-narrative-designer
- phaser-scene-builder
- pixel-art-creator

**Tasks Completed**: 5 of 14
- Task 001: Project Foundation
- Task 002: Player Movement & Town
- Task 003: Day/Night Cycle
- Task 004: Dialogue System
- Task 011: Audio Integration

**Key Learnings Preserved**:
- Visual assets must exist before code implementation
- Never use placeholder rectangles
- Stardew-style wooden frames for portraits and UI elements
- Research domain before asking user about implementation approach
- Always use skill-creator skill to create new skills
- External audio requires manual download - generate placeholders for dev

**Reason**: User requested archive to start new project

---

## 2026-02-06 - Mother Brain Self-Update: Eject Cleanup Missing Env Folders

**Issue Type**: Something broke or didn't work
**User Report**: After eject, `.vscode/` folder with project-specific settings (derby-dash paths) and `.vite/` cache folder were left behind.

**Root Cause**: 
- Step 2B.3 explicitly EXCLUDED `.vscode` from cleanup (marked as "keep")
- No mention of `.vite/`, `node_modules/`, or other environment/cache folders
- These folders contain project-specific paths and dependencies

**Mother Brain Changes**:
- Step 2B.3: Updated to INCLUDE environment/cache folders in cleanup:
  - `.vscode/` (project-specific settings)
  - `.vite/` (Vite cache)
  - `node_modules/` (dependencies)
  - `dist/`, `build/`, `.next/`, `.nuxt/`, `.turbo/`, `.cache/`
- Step 2B.4: Added "Environment/Cache to DELETE" section in eject plan display
- Step 2B.5: Added deletion commands for all environment folders
- Removed `.vscode/` from "Will KEEP" list

**Immediate Fix**: Cleaned up leftover `.vscode/` and `.vite/` folders from workspace

**Sections Updated**: Step 2B.3, Step 2B.4, Step 2B.5

---

## 2026-02-06 - Mother Brain Self-Update: Post-Implementation Reflection

**Issue Type**: Suggestion for improvement
**User Report**: After completing an improvement where Child Brain does learning, there should be a mandatory reflection at the end that checks for implementation errors like "No match found" and triggers additional learning to prevent that friction going forward.

**Root Cause**: 
- Step 2A.3 applied changes but had no verification step
- Implementation friction (failed edits, retries) was not captured as learning
- Same friction could occur again without any process improvement

**Mother Brain Change**:
- Added new Step 2A.3.1: Implementation Verification (MANDATORY)
- Scans conversation for implementation friction patterns:
  - "No match found" (edit failures)
  - "File not found" (path errors)
  - Build/test failures
  - Multiple retry attempts
- If friction detected: Analyzes root cause and proposes recursive improvement
- Improvement goes through approval gate before being applied
- Key principle: Every implementation session with friction produces learning

**Sections Updated**: Step 2A.3.1 (new section after Step 2A.3)

---

## 2026-02-06 - Mother Brain Self-Update: Edit Tool Precision

**Issue Type**: Recursive learning from implementation friction
**Trigger**: Multiple "No match found" errors during Step 2A improvement session

**Root Cause**: 
- View tool output doesn't always match raw file content exactly
- Whitespace (spaces vs tabs, indentation count) can differ
- Line endings (CRLF vs LF) not visible in view output

**Mother Brain Change**:
- Added "Edit Tool Precision" principle to Operating Principles
- When edit fails: Use PowerShell to extract exact bytes/characters
- Match indentation precisely - never assume view output is exact

**Sections Updated**: Operating Principles (new principle added)

---

## 2026-02-06 - Mother Brain Self-Update: Framework vs Project Separation

**Issue Type**: Suggestion for improvement
**User Report**: Need clear separation between framework development (improving Mother Brain) and project development (building with Mother Brain). When in a project, commits should go to project repo, not mother-brain. When improving Mother Brain, need ability to release as PR. Eject should sync improvements back and return to framework folder.

**Root Cause**: 
- No clear workspace separation between framework mode and project mode
- All work happened in same folder, risking accidental commits to wrong repo
- No mechanism to sync framework improvements back after project work
- No release workflow for framework updates

**Mother Brain Changes**:
1. **New Step 3.5: Project Folder Setup** (after Vision Discovery):
   - Creates sibling folder for project (`../project-name/`)
   - Copies `.github/skills/` so CLI can find them
   - Copies `docs/learning-log.md`
   - Optionally inits git repo
   - Changes working directory to project folder
   - Option to keep in current folder (framework testing mode)

2. **Updated Step 2B.0: Sync Framework Improvements Back**:
   - Before deleting project files, copies updated framework files back to mother-brain:
     - mother-brain/SKILL.md
     - child-brain/SKILL.md
     - skill-creator/SKILL.md
     - learning-log.md
   - Shows diff summary of changes

3. **Updated Step 2B.7: Return to Framework Folder**:
   - Changes working directory back to mother-brain folder
   - Offers to release Mother Brain immediately
   - Menu includes: Release, Review changes, Start new project, Skip

4. **New Step 2D: Release Mother Brain**:
   - Shows git diff of framework changes
   - Gets commit message from user
   - Optional version bump via package.json
   - Creates release branch, pushes, opens PR via `gh pr create`
   - Displays PR URL for approval

5. **Updated Menus**: Added "Release Mother Brain (commit & PR)" option to main menus

**Key Principle**: Mother Brain folder = framework dev. Project folder = project dev. Skills copied so they work. Improvements sync back on eject. Release creates PR.

**Sections Updated**: Step 2 (menus), Step 2B.0 (new), Step 2B.7 (updated), Step 2D (new), Step 3.5 (new)

---

## 2026-02-06 - Mother Brain Self-Update: Project Folder IDE Context

**Issue Type**: UX friction
**User Report**: When creating a project folder, Mother Brain opened a new VS Code window. User expected to stay in the same terminal session with just the file tree switching to the new project folder.

**Root Cause**: 
- Step 3.5.5 didn't handle IDE context switching properly
- `code "[path]"` opens a new window, breaking the terminal session
- User loses their active terminal/session when this happens

**Mother Brain Changes**:
1. **Step 3.5.5**: Updated to use `code --add "[project-path]"` instead of `code "[project-path]"`
   - `--add` flag adds the folder to current workspace without opening new window
   - Terminal session is preserved
   - User can continue working immediately
2. **Step 3.5**: Added "CRITICAL ORDERING RULE" - project folder must be created BEFORE any project files (vision.md, roadmap.md)
   - Prevents project files from being created in framework folder
   - Correct order: Vision Discovery (questions) → Step 3.5 → Step 4 (create files in project folder)

**Key Principle**: Never break the user's terminal session. Add folders to workspace, don't open new windows.

**Sections Updated**: Step 3.5, Step 3.5.5

---

## 2026-02-06 - Mother Brain Self-Update: Ensure Project Brain Creation

**Issue Type**: Something broke or didn't work
**User Report**: After completing Task 007 (Interactive Font Browser) with multiple friction points (one-line preview issue, font preference discovery), learnings weren't captured because project-brain.md didn't exist.

**Root Cause**: 
- Step 10B (Post-Task Reflection) was marked mandatory but didn't ensure project-brain.md exists
- Child Brain assumed file existed instead of creating it
- Friction points identified but not persisted

**Mother Brain Change**:
- Added critical note to Step 10B.2: Child Brain MUST create project-brain.md if it doesn't exist
- Learnings cannot be captured without this file

**Sections Updated**: Step 10B.2

---

## 2026-02-06 - Mother Brain Self-Update: Don't Copy Core Skills to Projects

**Issue Type**: Suggestion for improvement
**User Report**: During archive, user noticed LetsGO has updated skills but ascii-anything has older copies. Asked "What's the point of duplicated skill files in the project folder?"

**Root Cause**: 
- Step 3.5.3 copied ALL skills including core framework skills (mother-brain, child-brain, skill-creator)
- These core skills get updated in framework but project copies become stale
- Creates sync burden and confusion about which is authoritative
- Project-specific skills make sense in project folder, core skills do not

**Mother Brain Change**:
- Step 3.5.3: Now creates empty `.github/skills/` folder for project-specific skills only
- Core framework skills (mother-brain, child-brain, skill-creator) are NOT copied
- These stay in framework folder and are invoked from there
- Only project-specific skills (created in Step 6) go in project folder

**Key Principle**: Core skills = framework. Project skills = project. No duplication.

**Sections Updated**: Step 3.5.3

---

## 2026-02-06 - Mother Brain Self-Update: Auto-Generate Commit Messages

**Issue Type**: UX friction
**User Report**: "Never ask the user to enter the commit message, it should be written by Mother Brain according to the changes"

**Root Cause**: 
- Step 2D.3 asked user for commit message via freeform input
- Learning-log already has descriptions of all changes
- Redundant to ask user to re-describe what's already documented

**Mother Brain Change**:
- Step 2D.3: Auto-generate commit message from learning-log.md entries
- Do NOT ask user for commit message
- Format: "[Type]: [brief summary of changes]"

**Sections Updated**: Step 2D.3

---

## 2026-02-06 - Project Archived: ASCII Anything

**Project Name**: ASCII Anything
**Archive Location**: C:\Users\adamden\OneDrive - Kainos Software\Desktop\ascii-anything-archive\
**Skills Archived**: None (no project-specific skills created)

**Tasks Completed**: 7 of 9
- Task 001: Project Setup ✅
- Task 002: Text Banner Generation ✅
- Task 003: CLI Interface ✅
- Task 004: AI Description Engine ✅
- Task 005: Package for npm ✅
- Task 006: Pattern Generator ✅
- Task 007: Interactive Font Browser ✅
- Task 008: Image Conversion (future)
- Task 009: Color Support (future)

**Key Learnings Preserved**:
- Prefer Tmplr font for ASCII banners (compact, fast loading)
- Interactive TUI must show full multi-line previews
- Raw readline preferred over inquirer for complex TUI displays
- Don't copy core framework skills to project folders

**Reason**: User archiving to start new project or take a break

---

## 2026-02-06 - Mother Brain Self-Update: Fast Startup Optimization

**Issue Type**: Suggestion for improvement
**User Report**: Mother Brain launches slowly with too many visible checks. User wants instant response.

**Root Cause**: 
- Step 2 ran 6 sequential tool calls to detect project state
- Checked multiple files individually instead of efficiently
- Loaded vision/roadmap/README at startup even when not needed
- Sequential calls = visible spinner time = perceived slowness

**Mother Brain Change**:
- Added "⚡ FAST STARTUP OPTIMIZATION (MANDATORY)" section to Step 2
- Single file check first: `.mother-brain/session-state.json` tells you everything
- Parallel tool calls: Run multiple checks in ONE response when needed
- Lazy loading: Only load vision.md, roadmap.md, README.md when actually needed
- Goal: User sees menu within 1-2 tool calls, not 6+

**Sections Updated**: Step 2 (Detect Project State & Show Progress)

---

## 2026-02-06 - Mother Brain Self-Update: README Version Badge on Release

**Issue Type**: Suggestion for improvement
**User Report**: When releasing, Mother Brain is not updating the README files with the new version

**Root Cause**: 
- Step 2D.4 mentioned updating README.md version badge but lacked explicit instructions
- Just said "Update package.json AND README.md version badge" without specifying how

**Mother Brain Change**:
- Step 2D.4: Made version bump instructions explicit with numbered steps:
  1. Update package.json with new version
  2. Update README.md version badge (find `version-X.X.X-blue` and replace)
  3. Commit the version bump

**Sections Updated**: Step 2D.4 (Determine Version)

---

## 2026-02-06 - Mother Brain Self-Update: Friction Auto-Detection

**Issue Type**: Suggestion for improvement
**User Report**: When user selects "Something broke or didn't work", Mother Brain should scan the recent session for friction (errors, complaints, retries) and ask "I found X - was this what you wanted to fix?" before asking user to describe from scratch.

**Root Cause**: 
- Step 2A jumped straight to freeform description
- User had to re-explain issues that were already visible in the conversation
- Friction signals exist in output history but weren't being utilized

**Mother Brain Change**:
- Added new Step 2A.0: Friction Auto-Detection
- When "Something broke" selected:
  1. Scan conversation for friction signals (errors, complaints, retries, back-and-forth)
  2. If found: Display detected friction, ask "Yes, fix this" or "Something else"
  3. If "Yes" → Skip freeform, jump to Child Brain with pre-populated context
  4. If "Something else" or no friction found → Continue to freeform as normal
- Other issue types skip directly to freeform

**Sections Updated**: Step 2A (new Step 2A.0 added before Step 2A.1)

---

## 2026-02-06 - Mother Brain Self-Update: ASCII Art Alignment Fix

**Issue Type**: Something broke or didn't work
**User Report**: The ASCII art top row is corrupted/pulled left while the rest is normal. Needs to start from a fresh line.

**Root Cause**: 
- ASCII art was starting immediately after previous content
- Terminal rendering could corrupt the first row if it appeared on same line as spinner/output

**Mother Brain Change**:
- Updated both ASCII art instances in Step 2 (project exists + new project)
- Changed instruction to "ALWAYS start with TWO blank lines"
- Added extra blank line before ASCII art in code fence examples

**Sections Updated**: Step 2 (both ASCII art banner sections)

---

## 2026-02-06 - Mother Brain Self-Update: One-Click Release

**Issue Type**: Suggestion for improvement
**User Report**: Don't want to be asked about version number or commit confirmation. Mother Brain should auto-determine release size and make it a one-click release button.

**Root Cause**: 
- Step 2D had multiple confirmation menus (view diff, proceed to commit, choose version)
- User had to make 3+ selections for a simple release
- Version could be auto-determined from learning-log content

**Mother Brain Change**:
- Completely rewrote Step 2D as "ONE-CLICK RELEASE FLOW"
- Auto-determine version:
  - "breaking" or "major" in entries → major bump
  - "feature", "new", "add" in entries → minor bump
  - Otherwise → patch bump
- No confirmation menus - execute all steps automatically
- Single confirmation at the end showing what was released

**Sections Updated**: Step 2D (complete rewrite)

---

## 2026-02-06 - Mother Brain Self-Update: Brainstorm Mode

**Issue Type**: Feature request
**User Report**: Need a feature for "just talking" to Mother Brain - discussing ideas, getting thoughts, using its analytical brain on problems. When ideas form into something concrete, can say "let's build this" to trigger project creation.

**Root Cause**: 
- Mother Brain was purely workflow-driven
- No mode for freeform exploration and thinking
- Sometimes users want a thinking partner before committing to a project

**Mother Brain Change**:
- Added "Just talk (brainstorm mode)" to main menu
- Created new Step 2E: Brainstorm Mode
- Features:
  - Freeform conversation without triggering project workflows
  - Analytical thinking: clarifying questions, pattern identification, challenging assumptions
  - Can use web_search for research during discussion
  - Transition triggers: "let's build this", "start a project", etc.
  - Carries conversation context into Vision Discovery when ready

**Sections Updated**: Step 2 (menu), Step 2E (new section)

---

## 2026-02-13 - Mother Brain Self-Update: Fast Friendly Startup (Update-First)

**Issue Type**: Feature request
**User Report**: Startup felt slow and verbose, and the update check happened late. Want Mother Brain to feel like a friendly application with a quick boot and a quiet startup.

**Root Cause**:
- Update detection could be perceived as “late” because status output/detection happened before the update prompt
- Startup output could include long paragraphs of internal reasoning instead of short user-facing steps

**Mother Brain Change**:
- Added a boot screen template (`boot-screen.md`) for short user-facing startup status
- Added rules to check for updates first and stop immediately when an update is available
- Added a “quiet startup” rule: hide internal thinking and commands during boot

**Sections Updated**: Hard Rules (startup behavior), Step 2 (version check ordering)

---

## 2026-02-13 - Mother Brain Self-Update: Outcome Demo + Sign-Off Gate

**Issue Type**: Feature request
**User Report**: Outcomes should be big user-visible abilities. Each outcome must end with something interactive the user can see and use, and must require explicit sign-off. Mother Brain should launch demos itself and only guide user-only steps when unavoidable.

**Root Cause**:
- Outcomes could be validated as “yes/no” without ensuring a concrete interactive demo was presented
- Validation flows could implicitly rely on the user running commands to start servers/apps

**Mother Brain Change**:
- Added an outcome demo template (`outcome-demo.md`)
- Added an “Outcome Demo + Sign-Off Gate” rule: demo-first, then acceptance-criteria sign-off
- Added a rule: never ask users to run commands to start demos for validation; Mother Brain launches the experience
- Updated roadmap template to include a “Demo / Proof” section per outcome

**Sections Updated**: Operating Principles (outcome completion), Step 7 (roadmap template), Step 10 (outcome validation)
