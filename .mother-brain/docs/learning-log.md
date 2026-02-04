# Learning Log

## 2026-02-04 - Fixed Eject Not Removing Project Skills
**Issue Type**: Something broke or didn't work
**User Report**: "When you ejected you didnt remove the project specific skills. you need to clean them up now and going forward"
**Root Cause**: Step 2B.5 (Execute Deletion) relied on skillsCreated array from session-state.json to identify which skills to delete. If this array was empty, null, or incomplete (e.g., skills created before proper tracking), project skills would NOT be removed during eject.
**Fix Applied**:
- Updated Step 2B.3 to use **comparison method** instead of relying on skillsCreated array
- Updated Step 2B.5 to define core skills explicitly and use set subtraction:
  - coreSkills = @("mother-brain", "skill-creator", "skill-trigger-detector")
  - projectSkills = allSkills | Where-Object {  -notin  }
- Added explicit warnings: "NEVER rely solely on skillsCreated array"
**Sections Updated**: Step 2B.3, Step 2B.5
**Lesson Learned**: When identifying items to delete during cleanup/eject, use a comparison method against a known-good list (allowlist/denylist) rather than relying on tracking arrays that may be incomplete. This is more robust and self-healing.

---
## 2026-02-04 - Added Self-Learning Loop (Step 2A.1)
**Issue Type**: Suggestion for improvement
**User Report**: "I'd like there to be an option to trigger a self learning loop. Mother Brain will simulate a project creation itself, run through all the steps until they have an MVP and come out with a bunch of learnings. It should report what kind of project it made, what steps went wrong, and what it learned. The user can confirm or reject. The project should be different each time and decided by Mother Brain."
**Root Cause**: Mother Brain only learned from real user projects. No way to proactively discover issues through simulation.
**Fix Applied**:
- Added "Trigger self-learning loop (simulate project)" to Step 2A issue type menu
- Added **Step 2A.1: Self-Learning Loop** with 7 sub-steps:
  - 2A.1.1: Generate Random Test Project (random type, domain, vision)
  - 2A.1.2: Simulate Setup Flow (Steps 3-7 mentally/logically)
  - 2A.1.3: Simulate Task Execution (Steps 8-11)
  - 2A.1.4: Simulate MVP Completion (Step 11A)
  - 2A.1.5: Compile Learnings Report (friction points, lessons, proposed improvements)
  - 2A.1.6: User Review & Approval (apply all, select, reject, or run again)
  - 2A.1.7: Log Simulation in learning-log.md
**Sections Updated**: Step 2A (added menu option), Added Step 2A.1
**Lesson Learned**: 
- Self-improvement shouldn't only happen when things go wrong with real users
- Simulated projects can discover edge cases before users encounter them
- Random diversity in simulations maximizes coverage of project types
- User should control what improvements are applied (no auto-apply without consent)

---

## 2026-02-04 - Made Post-Task Reflection Mandatory (Step 10B)
**Issue Type**: Suggestion for improvement
**User Report**: "We have a nice learning feature at the end of the vision stage where mother brain looks at what went wrong and heals. I think this should be applied on a task based level too. Mother Brain must look at the task and the output and self improve any failings in the current task, in the project specific skills and then in mother brain agnostic of project."
**Root Cause**: Step 10B (Post-Task Reflection & Learning) existed but:
1. The flow from Step 10 → 10B was implied, not explicit
2. "When to run" said "after task is marked complete" but didn't say ALWAYS
3. Easy to skip from task completion straight to Next Action Menu without running 10B
**Fix Applied**:
- **Step 10**: Added explicit instruction: "CRITICAL: After marking task complete, ALWAYS run Step 10B before proceeding to Step 11"
- **Step 10B**: Made trigger mandatory: "ALWAYS after task is marked complete - this is mandatory, not optional"
- **Step 10B**: Added explicit flow: "Step 10 task completion → Step 10B runs automatically → then Step 11"
- **Step 10B**: Added scope clarity: "3-layer learning at task level (fix task → heal skills → update Mother Brain)"
- **Step 10B.7**: Added explicit transition: "After Step 10B completes: Proceed to Step 11"
**Sections Updated**: Step 10, Step 10B header, Step 10B.7
**Lesson Learned**: Self-learning must be mandatory, not optional. When a learning step exists, the flow must EXPLICITLY require it - implied flows get skipped. Every task completion is a learning opportunity that must not be bypassed.

---

## 2026-02-04 - Added MVP Complete & Beyond (Step 11A)
**Issue Type**: A feature is missing
**User Report**: "We need a path beyond MVP. Once we reach the end of MVP the important thing is making that 'done' criteria for the user done. If this was an app that needs to get published and released with pipelines and automated testing - that should be the focus. If the user wants to replan or consider a different direction that should be an option. If the user wants to pad out the roadmap for the next phases that should also be an option. It should also use the skill trigger detector when the user suggests new things."
**Root Cause**: Mother Brain was good at creating initial MVP and skills, but lacked a structured path for:
1. Achieving the user's actual "done" criteria (deploy, publish, release)
2. Post-MVP direction choices (extend, replan, new direction)
3. Dynamic skill creation when user describes new features
**Fix Applied**:
- Added **Step 11A: MVP Complete & Beyond** with 7 sub-steps:
  - 11A.1: Detect MVP Completion (auto-trigger when Phase 1 complete)
  - 11A.2: Celebrate & Assess (show what was achieved vs MVP definition)
  - 11A.3: Research "Done" Criteria for This Project Type (web search)
  - 11A.4: Present "Done" Criteria Options (deploy, CI/CD, publish, etc.)
  - 11A.5: Post-MVP Direction Menu (extend, replan, add features, pause, continue)
  - 11A.6: Handle User's Direction Choice (detailed logic for each option)
  - 11A.7: Skill-Trigger-Detector Integration (detect patterns in new features)
**Sections Updated**: Added Step 11A after Step 11
**Lesson Learned**: 
- MVP completion is a decision point, not the end
- "Done" means different things for different projects (deploy vs publish vs local)
- User may want to extend, replan, or pivot after MVP - all need support
- skill-trigger-detector should run on ALL new user input, not just initial vision
- Project-agnostic design: research delivery patterns for whatever project type this is

---

## 2026-02-04 - Added Setup Validation & Self-Healing (Step 7.6)
**Issue Type**: Suggestion for improvement
**User Report**: "At the end of the vision setup process motherbrain needs to look up the command line and see if anything went wrong, and if it did, it needs to do our 2 layer learn - 1. resolve the issue in the setup, 2. consider what changes could be made for the overall motherbrain skill to prevent this from happening again for projects regardless of the context"
**Root Cause**: Setup flow (Steps 3-7) could complete with errors/issues going undetected, missing opportunities to self-heal and learn.
**Fix Applied**:
- Added **Step 7.6: Setup Validation & Self-Healing** with 5 sub-steps:
  - 7.6.1: Scan conversation for setup issues (failures, retries, warnings)
  - 7.6.2: Layer 1 - Fix current project setup
  - 7.6.3: Layer 2 - Extract meta-lessons for Mother Brain
  - 7.6.4: Auto-apply Mother Brain updates
  - 7.6.5: Display summary if issues were found
**Sections Updated**: Added Step 7.6 after Step 7.5
**Lesson Learned**: Every autonomous flow should end with a self-healing validation step that both fixes current issues AND extracts lessons for future projects. Two-layer learning (fix now + prevent forever) should apply to all major workflow endpoints, not just task execution.

---

## 2026-02-04 - Removed Presentation Preferences Menu Option
**Issue Type**: Suggestion for improvement
**User Report**: "we dont need presentation preferences in the mother brain menu"
**Root Cause**: The "Update presentation preferences" menu option was unnecessary clutter. Step 2.5 (Environment & Presentation Discovery) is designed to run lazily/on-demand only when visual output is first presented, not proactively from the main menu.
**Fix Applied**:
- Removed "Update presentation preferences" from Step 2 menu choices
- Removed the handler code for this option
**Sections Updated**: Step 2 (Detect Project State & Show Progress)
**Lesson Learned**: Keep main menus focused on core workflows. Utility features that run automatically on-demand don't need explicit menu entries.

---

## 2026-02-04 - Added Setup Complete Menu (Step 7.5)
**Issue Type**: Something broke or didn't work
**User Report**: "After the initial discover vision was complete it didn't ask the user in a menu to pick something next"
**Problem**:
  - After vision was confirmed and setup flow completed (Steps 5-7), there was no clear menu for user to pick next action
  - Step 7.4 was asking user to "validate phasing" (inconsistent with Expert Autonomy)
  - Flow would complete setup but leave user without clear options
**Fix Applied**:
  - **Step 7.4**: Changed from "Validate Phasing with User" to "Display Roadmap Summary" (no approval needed)
  - **Added Step 7.5**: "Setup Complete - What's Next?" menu with clear options:
    - "Start Task 001 now"
    - "Review the full roadmap first"
    - "Review the vision document"
    - "I want to adjust something before starting"
  - This provides a clear handoff point from autonomous setup to user-driven execution
**Sections Updated**: Step 7.4, Added Step 7.5
**Lesson Learned**:
  - Every autonomous flow must end with a clear user choice point
  - "Expert Autonomy" applies to technical decisions, but user must control WHEN to start work
  - After setup completes, always show summary + menu
**Impact**: 
  - Clear transition from setup to execution
  - User sees what was done and chooses when to start
  - Consistent with Expert Autonomy - no approval gates, but clear control points

---

## 2026-02-04 - Explicit List Formatting Examples
**Issue Type**: Formatting improvement
**User Report**: "Can you make mother brain have its responses of bullet points to be on different lines rather than trying to cram them all horizontally?"
**Problem**:
  - Despite having vertical list formatting rule, outputs still appeared cramped
  - Rule was stated but lacked explicit examples of correct/incorrect formatting
  - No visual reference for what "vertical" vs "horizontal" looks like
**Fix Applied**:
  - Added "Output Formatting Rules (CRITICAL)" section with explicit examples
  - Shows ❌ bad examples (comma-separated, bullet char inline)
  - Shows ✅ good examples (each item on own line with dash)
  - Reinforced: "Each item gets its own line. No exceptions."
**Sections Updated**: Operating Principles, new Output Formatting Rules section
**Lesson Learned**:
  - Explicit examples are more effective than abstract rules
  - Show what NOT to do alongside what TO do
  - Visual contrast helps AI understand formatting requirements
**Impact**: 
  - Clearer formatting guidance prevents cramped horizontal lists

## 2026-02-04 - Expert Autonomy: Remove Setup Approval Gates
**Issue Type**: Suggestion for improvement
**User Report**: "We absolutely should always do the research and pattern analysis and design and skills and delivery strat and roadmap etc - but we just don't need to make the user participate in approving it. We should be doing research making the skills, thinking about delivery and tech stack - but ultimately the user has described their problem and that's all they should be focused on, trying to get something working that solves that core need. So while we must absolutely ask about all the users pain points and what they're looking to achieve, we don't need to confirm with them the possible skills and the research and the delivery strategy because WE are the expert - Mother Brain is the all knowing being that makes it happen."
**Problem**:
  - Steps 5-7 had multiple user approval checkpoints:
    - Step 5.4: Asked user to clarify research findings
    - Step 5.6: Asked user to validate technology choices
    - Step 6: Asked user to approve optional skills
    - Step 6A.4: Asked user to validate delivery strategy
    - Step 7.1: Asked user what's essential for Phase 1
  - This created unnecessary friction during setup
  - User's job is to describe the problem; Mother Brain's job is to solve it
  - Technical decisions should be made by the expert (Mother Brain), not validated by user
**Fix Applied**:
  - Added new Operating Principle: **Expert Autonomy** - Mother Brain makes ALL technical decisions autonomously after vision is confirmed
  - **Step 5.4**: Removed contextual clarification prompts - Mother Brain decides based on research
  - **Step 5.6**: Removed "Validate Findings" - display findings for transparency only, don't ask approval
  - **Step 6**: Changed from "Essential + Optional (user chooses)" to "Create ALL beneficial skills automatically"
  - **Step 6A.4**: Renamed from "Validate Strategy" to "Finalize Scope" - no user approval needed
  - **Step 7.1**: Removed "Ask user what's essential" - Mother Brain determines optimal MVP scope
**Sections Updated**: Operating Principles, Steps 5.4-5.6, Step 6, Step 6A.4-6A.5, Step 7.1
**Lesson Learned**:
  - User focus = describing their problem and validating outputs meet expectations
  - Mother Brain focus = ALL technical decisions (stack, skills, delivery, roadmap structure)
  - Only re-engage user for: (1) vision refinement, (2) task validation, (3) roadmap adjustments post-MVP
  - "Expert systems should act like experts" - don't defer decisions back to non-experts
**Impact**: 
  - Smoother setup flow with fewer interruptions
  - User stays focused on their problem domain
  - Mother Brain takes full ownership of technical excellence
  - Faster time-to-first-task while maintaining quality

---

## 2026-02-04 - Environment Discovery Made Lazy/On-Demand
**Issue Type**: Something broke or didn't work
**User Report**: "The vision process was asking what output browser i preferred - i never want this to happen. this needs to be specific to the project only if mother brain identifies there is even something to show. it cant be upfront because it doesnt know anything about the project yet"
**Problem**:
  - Step 2.5 (Environment Discovery) was running BEFORE vision discovery
  - Asked about browser preferences before knowing project type
  - Wasteful and confusing for non-visual projects (CLI tools, libraries, etc.)
  - Doesn't make sense to ask "how do you want to see output" when we don't know what output exists
**Fix Applied**:
  - Changed Step 2.5 from "One-Time Setup" to "Lazy/On-Demand"
  - **Removed** trigger: "After user selects vision discovery (before Step 3)"
  - **Added** trigger: "On first visual output" - during Step 10 when task produces visual files
  - Only runs when:
    1. Task produces HTML, images, or other visual files
    2. AND environment preferences don't exist yet
  - Skip entirely for non-visual projects
**Sections Updated**: Step 2.5 header and "When to Run" section
**Lesson Learned**: 
  - Don't ask setup questions before understanding the problem domain
  - Lazy initialization > eager initialization for context-dependent config
  - Environment discovery should be triggered by need, not by workflow position
  - "Just in time" is better than "just in case"
**Impact**: Vision discovery is now cleaner; environment questions only appear when actually needed.

---

## 2026-02-04 - Restart Step Made Optional (User Insight)
**Issue Type**: User observation / process improvement
**User Report**: "This does work without restarting - do we really need this restart step?"
**Analysis**:
  - User correctly observed that behavioral changes can take effect immediately
  - The agent learns new patterns DURING the conversation
  - SKILL.md updates are for FUTURE sessions
  - Mandatory restart was unnecessarily disruptive
**Fix Applied**:
  - Made restart step OPTIONAL instead of mandatory
  - Default is "Continue (recommended)" - agent already knows new behavior
  - Restart only needed for complex multi-step workflow changes
  - Updated messaging to explain why restart is usually not needed
**Sections Updated**: Step 2A → Session Restart section
**Lesson Learned**: 
  - Don't assume restart is always needed for self-updates
  - Agent context learning during conversation often sufficient
  - SKILL.md is for future sessions; current session learns dynamically
  - Minimize disruption to user workflow when possible
**Impact**: Smoother self-update experience without unnecessary session interruptions.

---

## 2026-02-04 - Simplified Issue Reporting: Freeform Detection (7th & FINAL)
**Issue Type**: User preference / simplification request
**User Report**: "Remove the report issue option and put issue back as free form"
**Context**: After 6 iterations trying to get "Report Issue" positioned correctly with the `ask_user` tool's limitations, user requested a simpler approach.
**Solution Applied**:
  - **Removed explicit "🚨 Report Issue" option from menus entirely**
  - Use `allow_freeform: true` (tool's natural behavior)
  - Tool auto-adds "Other" at the end for freeform text input
  - **Detect issues from freeform text** using keywords: "issue", "problem", "broken", "bug", "not working", etc.
  - When issue keywords detected, automatically jump to Step 2A (Update Mother Brain)
**Benefits**:
  - Cleaner menus (fewer options)
  - Natural freeform input at the end (tool's default)
  - No fighting with tool behavior
  - Issues still get caught and handled via keyword detection
**Sections Updated**: Universal Patterns for All Workflows → Complete rewrite to "Issue Reporting via Freeform Input"
**Lesson Learned**: 
  - Sometimes the simplest solution is to work WITH tool behavior, not against it
  - Keyword detection in freeform can replace explicit menu options
  - After multiple failed attempts to control tool behavior, consider alternative approaches
  - User preference for simplicity should override technical "correctness"
**Impact**: Cleaner user experience with fewer menu options while maintaining issue reporting capability.

---

## 2026-02-04 - "Report Issue" FINAL SOLUTION (6th Report - allow_freeform: false)
**Issue Type**: Something broke or didn't work
**User Report**: "It was correct except the other did not let me type" + previous reports about ordering and duplicate "Other" options
**Root Cause**: 
  - The `ask_user` tool by default (or with allow_freeform: true) adds an auto-"Other" option at the END
  - When we manually added "Other" + "Report Issue", we got DOUBLE "Other" options
  - The only way to prevent auto-"Other" is to explicitly set `allow_freeform: false`
**Fix Applied**:
  - **MUST use `allow_freeform: false`** on all menus to prevent auto-generated "Other"
  - Manually add "Other (describe what you want)" as second-to-last choice
  - Manually add "🚨 Report Issue" as absolute last choice
  - When user selects manual "Other", follow up with a SECOND `ask_user` that has `allow_freeform: true` for text input
  - This two-step pattern ensures: correct order + freeform capability when needed
**Test Results**:
  - With `allow_freeform: false` + manual Other + Report Issue → Correct order, no duplicates ✅
  - User can type when they select "Other" and get follow-up question ✅
**Sections Updated**: Universal Patterns for All Workflows → The "Report Issue" Escape Hatch (complete rewrite with explicit allow_freeform: false)
**Lesson Learned**: 
  - Tool behaviors (like auto-adding "Other") must be explicitly disabled when custom ordering needed
  - `allow_freeform: false` is the key to preventing auto-"Other" from appearing
  - Two-step pattern (menu → follow-up freeform) is necessary for correct UX
  - Always test with actual tool calls to verify expected behavior
**Impact**: All future ask_user calls will use `allow_freeform: false` to get predictable, correct ordering.

---

## 2026-02-04 - "Report Issue" Implementation Gap (5th Report - Agent Not Following Instructions)
**Issue Type**: Something broke or didn't work
**User Report**: "still seeing report an issue as number 3 not number 4... it kept putting the 'other' option where you can type... now we've ended up with 2 other options either side the 'report a problem' it is a bit of a mess"
**Root Cause**: 
  - The SKILL.md documentation was correct (4th fix)
  - However, the AGENT was not following the instructions properly
  - Agent was still using `allow_freeform: true` in some calls
  - Agent was inconsistently adding both manual "Other" AND using allow_freeform
  - Result: Messy menus with duplicate "Other" options and wrong ordering
**Fix Applied**:
  - Documentation already correct - no SKILL.md changes needed for ordering
  - Added handling for when user selects "Other (describe what you want)":
    - Follow up with pure freeform question (allow_freeform: true, NO choices array)
    - This gives clean text input after user explicitly chooses "Other"
  - **Key Insight**: The fix was already in place; the agent just needed to restart and follow it
**Sections Updated**: Added "When 'Other' is selected" handling instructions
**Lesson Learned**: 
  - When documentation is correct but behavior is wrong, the issue is often:
    1. Agent loaded old version of SKILL.md before updates
    2. Agent not strictly following documented patterns
    3. Need restart to pick up SKILL.md changes
  - After multiple fixes to same issue, verify agent is actually reading updated SKILL.md
  - Document the TWO-STEP pattern: choices menu (no freeform) → follow-up freeform (when Other selected)
**Impact**: Clear two-step pattern for freeform input ensures correct ordering every time.

---

## 2026-02-04 - "Report Issue" Final Order Correction (4th Report - Manual "Other" Solution)
**Issue Type**: Something broke or didn't work
**User Report**: "The 'other' option should always appear above 'report and issue on the menu'"
**Root Cause**: 
  - Previous fix clarified "last explicit choice" but still relied on `allow_freeform: true`
  - This caused `ask_user` tool to automatically append "Other" AFTER all explicit choices
  - Result: "Report Issue" appeared before auto-generated "Other"
  - User expectation: "Other" should appear BEFORE "Report Issue" (Report Issue is absolute last)
  - Fundamental issue: Cannot control tool's automatic "Other" placement when using allow_freeform
**Fix Applied**:
  - Changed strategy: DO NOT use `allow_freeform: true` parameter
  - Manually add "Other (describe what you want)" as second-to-last explicit choice
  - Add "🚨 Report Issue" as absolute last explicit choice
  - This gives full control over order: [Options] → "Other" → "Report Issue"
  - Updated all examples to show manual "Other" approach
  - Added ❌ INCORRECT example showing why allow_freeform shouldn't be used
**Sections Updated**: Universal Patterns for All Workflows → The "Report Issue" Escape Hatch
**Lesson Learned**: 
  - When tool has automatic behavior (like appending "Other"), and you need specific ordering, don't rely on that automatic behavior
  - Manually implement what the tool would auto-generate to gain full control
  - "Last" means absolute last, not "last before tool auto-appends things"
  - User ordering preferences override convenience of tool automation
**Impact**: All future ask_user calls will have predictable, user-preferred order: workflow options, then "Other", then "Report Issue" last.

---

## 2026-02-04 - "Report Issue" Position Clarification (3rd Report - Tool Behavior)
**Issue Type**: Something broke or didn't work
**User Report**: "The 'report an issue' option is supposed appear last on the list of options every time, but it always keeps appearing above 'other'. this is the third time i have reported this problem and the changes have not taken effect, even restarting mother brain and opening a new terminal did not work"
**Root Cause**: 
  - Documentation said "Add as the LAST choice" but didn't account for `ask_user` tool behavior
  - The `ask_user` tool automatically adds "Other" option at the end when `allow_freeform: true`
  - This means "🚨 Report Issue" was technically the last EXPLICIT choice but appeared before auto-generated "Other"
  - User expectation: "🚨 Report Issue" should be last visible option (including "Other")
  - Reality: "🚨 Report Issue" was last in choices array, but tool adds "Other" after it
  - Previous fixes updated documentation but didn't clarify this tool behavior
**Fix Applied**:
  - Updated Universal Patterns section to clarify: "Add as the LAST EXPLICIT choice"
  - Added note: "The ask_user tool automatically adds 'Other' after all explicit choices when allow_freeform: true. That's expected behavior."
  - Added example showing correct behavior with both "🚨 Report Issue" and "Other" visible
  - Fixed Step reference: Changed "Step 2D" to "Step 2A" (correct step number)
**Sections Updated**: Universal Patterns for All Workflows → The "Report Issue" Escape Hatch
**Lesson Learned**: 
  - When tool behavior affects user expectations, document BOTH the code instruction AND the visible result
  - Clarify difference between "last in array" vs "last visible to user"
  - Tool auto-behavior (like freeform "Other") must be explicitly documented in patterns
  - Third report of same issue = documentation wasn't clear enough about tool behavior
**Impact**: Future Mother Brain implementers will understand that "last explicit choice" means last in their array, acknowledging that tool may add additional options after it.

---

## 2026-02-04 - Session Restart Capability Added After Mother Brain Self-Updates
**Issue Type**: Something broke or didn't work
**User Report**: "the 'report an issue' is still appearing 3rd in the list and looks like it is replacing an option that should be there. it should be an addition after all other options. I have made this correction 3 minutes ago but it doesn't seem to have taken place. can we also force some kind of session restart if these types of changes need to be restarted to be active?"
**Root Cause**: 
  - Documentation was updated correctly (✅ added correct pattern)
  - But current Mother Brain execution still using old pattern from when skill was loaded at session start
  - Skills load into memory at startup; changes to SKILL.md don't affect running instance
  - No mechanism to reload skill after self-updates
**Fix Applied**:
  - Added "Session Restart" step after Mother Brain self-updates (new Step 2D substep)
  - After applying fixes, offers choice: "Restart Mother Brain now" or "Continue without restart"
  - If restart selected: saves context, displays reload instructions, ends session gracefully
  - User re-invokes mother-brain skill to load updated version
  - Context preserved so workflow can resume
**Sections Added**: Session Restart (Critical for Immediate Effect) in Step 2D
**Lesson Learned**: 
  - Self-modifying systems need explicit reload mechanisms for changes to take effect
  - Always inform users when changes require restart vs. apply immediately
  - Preserve context across restarts so users don't lose progress
**Impact**: Mother Brain can now apply self-updates and reload itself to use new behavior immediately, rather than waiting until next session.

---

## 2026-02-04 - Universal "Report Issue" Escape Hatch Added to All Workflows
**Issue Type**: Suggestion for improvement
**User Report**: "There seems to be a lot instances lately where it is behaving in a bad way and i need to exit the wizard and run commands and get there, so i need an option on the multiselect for EVERY question that allows me to report issue"
**User Clarification**: "I want the 'report issue' to be last on the options always, and not replace anything in the existing set of questions"
**Problem**: When Mother Brain behaves incorrectly or gets stuck, users have to manually exit workflows. No in-context way to report issues.
**Solution Applied**:
  - Added universal "🚨 Report Issue (something's not working)" option as LAST option in ALL `ask_user` calls
  - **IMPORTANT**: This ADDS to existing options, does NOT replace them
  - Created "Universal Patterns" section with correct/incorrect examples
  - Added context capture system: captures current step, action, phase, task
  - When selected, jumps to Step 2D (Update Mother Brain) with pre-populated context
  - Updated 6+ critical ask_user examples with the new option
**Sections Added**: Universal Patterns section, Handling "Report Issue" Selection subsection
**Lesson Learned**: 
  - Users need an escape hatch from EVERY decision point
  - Escape hatch must be ADDITIVE (don't replace existing options)
  - Always show as last option for consistency
**Impact**: Users can report issues immediately when behavior goes wrong, without losing existing workflow options or context.

---

## 2026-02-04 - Architecture Simplified: All Skills in .github/skills/ for CLI Compatibility
**Issue Type**: Architecture clarification
**User Insight**: "the architecture seem a bit weird. like the actual core mother brain files live in the github folder? and then there is a mother brain folder which doesn't contain those skills? is this because github needs them in there to work via copilot cli?"
**Root Cause**: Initial "isolated architecture" put project skills in `.mother-brain/skills/`, but GitHub Copilot CLI only scans `.github/skills/` for skill discovery
**Decision**: Simplified to keep ALL skills (framework + project) in `.github/skills/` for CLI compatibility
**Fix Applied**:
  - ALL skills now in `.github/skills/` (CLI-discoverable)
  - `session-state.json` tracks `skillsCreated` array to differentiate project skills from core skills
  - Core skills (mother-brain, skill-creator, skill-trigger-detector) are hardcoded, never in `skillsCreated`
  - On eject: Delete skills listed in `skillsCreated` array from `.github/skills/`
  - Simpler, more reliable, follows CLI conventions
**Sections Updated**: Step 2B (eject process), Step 6 (skill creation/tracking), Step 9 (skill discovery), File Structure
**Lesson Learned**: Follow platform conventions (Copilot CLI skill discovery) over custom architecture preferences. Simplicity and reliability trump isolation when it conflicts with tooling expectations.

---

## 2026-02-04 - Mother Brain Self-Update: Isolated Architecture Skill Management
**Issue Type**: Something broke or didn't work
**User Report**: "we've changed our architecture, so mother brain can be loaded into a project but then kept separate from the project. this has worked but the problem is the project specific skills have not been ejected, and sometimes during development it couldn't find them, so i think you need sort that out"
**Root Cause**: Mother Brain was still using old file paths (`.github/skills/` and `docs/`) instead of new isolated architecture (`.mother-brain/skills/` and `.mother-brain/docs/`)
**Fix Applied**: 
  - Updated Step 2B.1 to check BOTH `.mother-brain/skills/` AND `.github/skills/` for project skills
  - Updated Step 2B.3 to scan `.mother-brain/skills/` for project skills (isolated architecture)
  - Updated Step 2B.4 to show correct deletion paths (`.mother-brain/docs/*` and `.mother-brain/skills/*`)
  - Updated Step 2B.5 to delete from correct locations (`.mother-brain/` directories)
  - Updated Step 6 to store created skills in `.mother-brain/skills/` (not `.github/skills/`)
  - Updated Step 9 to check `.mother-brain/skills/` first, then fall back to `.github/skills/`
  - Updated File Structure section to document isolated architecture
**Sections Updated**: Step 2B (entire eject process), Step 6 (skill creation), Step 9 (skill discovery), File Structure
**Lesson Learned**: When architecture changes (isolated directories), all file path references must be updated consistently across discovery, creation, execution, and deletion

---

## 2026-02-04 - Project Ejected
**Project Name**: UK Coffee Finder
**Reason**: Testing/prototyping complete, resetting to framework
**Files Removed**: 
  - gaming-backlog-manager/ directory
  - index.html, styles.css
  - .mother-brain/docs/vision.md
  - .mother-brain/docs/roadmap.md
  - .mother-brain/docs/tasks/
  - .mother-brain/session-state.json
**Skills Removed**: None (project skills were not yet created in .github/skills/)
**Files Preserved**: learning-log.md, core framework skills (mother-brain, skill-creator, skill-trigger-detector)
**Learnings Preserved**: 30 entries in learning log
**Status**: Framework ready for new project

---

This document tracks improvements to Mother Brain and project skills based on user feedback and issues encountered.

---

## 2026-02-04 - Isolated Architecture: Mother Brain Files Separated from Project Files

**Issue Type**: Something broke or didn't work  
**User Report**: 
"The problem is right now we are using mother brain to generate projects quick, learn from them and then eject. This means that some of things you'd usually have in a project like a README file get updated to what that temporary project is, then when we make another we get an error saying there is already a readme. Ideally mother-brain will have its own repo and we can have the actual project it creates to be separated somehow. My dream is that people fork the repo or download the repo and use it, but it'd be good if it could be inherited into their project and not disrupt existing things they have. So ideally we keep our project specific files separate but mother-brain as its own entity."

**Root Cause**: 
- Mother Brain stored its files mixed with project files in the root directory
- Vision, roadmap, tasks in `docs/` folder (conflicts with existing project docs)
- Skills in `.github/skills/` (conflicts with existing GitHub workflows)
- **README.md overwritten** every time a new project was created
- When ejecting project, couldn't cleanly separate Mother Brain from project code
- Made it impossible to use Mother Brain in existing projects without disruption
- Couldn't distribute Mother Brain as standalone framework

**Why This Matters**:
- Users testing multiple projects quickly hit file conflicts (README already exists)
- Existing projects couldn't adopt Mother Brain without file overwrites
- Eject operation was destructive and unclear (what gets deleted?)
- Framework couldn't be forked/shared as clean entity
- No separation of concerns (framework vs project)

**Fix Applied**:

**Isolated `.mother-brain/` Directory Architecture**:

**Before** (Mixed files - causes conflicts):
```
project-root/
├── README.md          ← Mother Brain overwrites this!
├── docs/vision.md     ← Mixed with project docs
├── .github/skills/    ← Mixed with project workflows
└── [project-code]/
```

**After** (Isolated - no conflicts):
```
project-root/
├── .mother-brain/              ← All Mother Brain files here
│   ├── README.md               ← MB's own docs
│   ├── docs/
│   │   ├── vision.md
│   │   ├── roadmap.md
│   │   ├── learning-log.md
│   │   └── tasks/
│   ├── skills/                 ← All skills (core + project)
│   │   ├── mother-brain/
│   │   ├── skill-creator/
│   │   └── [project-skills]/
│   └── session-state.json
│
├── README.md                   ← User's README untouched!
├── src/                        ← Project code
└── [user's existing files]     ← All preserved
```

**Changes Made**:
1. **Architecture section added** to SKILL.md showing isolated structure
2. **All file paths updated** throughout SKILL.md:
   - `docs/vision.md` → `.mother-brain/docs/vision.md`
   - `docs/roadmap.md` → `.mother-brain/docs/roadmap.md`
   - `docs/tasks/` → `.mother-brain/docs/tasks/`
   - `docs/learning-log.md` → `.mother-brain/docs/learning-log.md`
   - `docs/session-state.json` → `.mother-brain/session-state.json`
   - `.github/skills/` → `.mother-brain/skills/`
3. **Step 2 (Detect Project State)** - Updated to look for `.mother-brain/` directory
4. **Step 2B (Eject Project)** - Simplified to delete `.mother-brain/` only (project code stays)
5. **Step 4 (Vision Creation)** - No longer creates/overwrites root README.md
6. **File Structure section** - Updated to show isolated architecture
7. **All steps updated** to use `.mother-brain/` paths

**Benefits**:
- ✅ No conflicts with existing README, docs, or .github folders
- ✅ Easy to add Mother Brain to existing projects (just copy `.mother-brain/`)
- ✅ Easy to eject (delete `.mother-brain/`, project code stays)
- ✅ Easy to distribute (git clone or fork)
- ✅ Can test multiple projects without file overwrites
- ✅ Framework updates don't touch project files
- ✅ Clear separation of concerns (Mother Brain vs project)

**Sections Updated**: 
- Architecture section (new)
- Step 2 - Detect Project State
- Step 2B - Eject Project (completely rewritten)
- Step 4 - Vision Document Creation
- Steps 6, 7, 8, 9, 10, 11, 12, 13 - File path updates
- File Structure section

**Lesson Learned**: 
Framework tools should be **isolated and non-intrusive**:
1. Never overwrite user's existing files (especially README.md)
2. Use dedicated directory (`.tool-name/`) to avoid conflicts
3. Make ejection simple and clear (delete one folder)
4. Separate framework concerns from project concerns
5. Enable easy distribution and adoption in existing projects

**General Principle**: 
Tools that manage projects should be **guests, not owners**. Isolate all framework files in a dedicated directory to avoid disrupting the host project.

---

## 2026-02-04 - Mother Brain Self-Update: Essential Skills Should Not Prompt User

**Issue Type**: Something broke or didn't work  
**User Report**: 
"Mother Brain asked 'I identified 3 skills to create based on research. Should...' with choice 'Create all 3 essential skills automatically'. The user isn't supposed to be asked about what skills they would like - this should happen automatically."

**Root Cause**: 
- Step 6 (Skill Identification & Creation) clearly states: "**Automatically create essential skills** (no user prompt)" (line 686)
- However, the display format in lines 673-684 showed a categorized list that looked like a menu
- This misleading format caused implementations to add an `ask_user` prompt for essential skills
- The instructions said "no user prompt" but the structure made it look like user input was expected
- Result: Mother Brain violated its own principle by asking about essential skills

**Why This Matters**:
- Essential skills are required for MVP delivery - they're not optional
- Asking users about essential skills wastes time on a decision with only one correct answer
- User shouldn't need to "approve" things that are necessary by definition
- Only optional (post-MVP) skills warrant user choice

**Fix Applied**:

**Updated Step 6 (lines 673-712) - Clearer Separation of Essential vs Optional**:

**Before** (ambiguous display that looked like a choice):
```markdown
- Display categorized list:
  ```
  🎯 Research-Based Skills Identified:
  
  Essential Skills (will create automatically):
  ...
  ```

- **Automatically create essential skills** (no user prompt):
  - Display: "🔨 Creating essential skills for project..."
```

**After** (explicitly prevents user prompts):
```markdown
- Display categorized list (informational only, NOT a question):
  ```
  🎯 Essential Skills Identified (creating automatically):
  ...
  
  Optional Skills (you'll choose after essentials are created):
  ...
  ```

- **Automatically create essential skills WITHOUT asking user**:
  - **IMPORTANT**: Do NOT use `ask_user` for essential skills
  - Display: "🔨 Creating essential skills automatically..."
  
- **THEN handle optional skills** (ask user AFTER essentials are done):
  - For optional skills, use `ask_user` with choices:
```

**Sections Updated**: Step 6 - Skill Identification & Creation (lines 673-712)

**Lesson Learned**: 
When instructions say "automatically" and "no user prompt", the display format must reinforce this by:
1. Using language like "Identified (creating automatically)" not "Identified:"
2. Adding explicit warnings: "Do NOT use ask_user for essential skills"
3. Separating the user choice section with clear sequencing: "THEN handle optional..."
4. Making it structurally impossible to misinterpret as requiring user input

**General Principle**: 
Essential = automatic (no choice), Optional = user decides (always ask). Display structure should prevent any ambiguity.

---

## 2026-02-04 - Browser Detection Failed to Find Installed Browsers (PATH Issue)

**Issue Type**: Something broke or didn't work  
**User Report**: 
"For some reason you checked my tools and said that edge isn't available, but edge is my main browser. Why didn't you find it?"

**Root Cause**: 
- Step 2.5.1 (Detect Available Tools) only used `Get-Command` to find browsers
- `Get-Command` only finds executables in PATH environment variable
- Many browsers (especially Edge, Chrome, Firefox) install to standard locations but **don't add themselves to PATH**
- Microsoft Edge on this system: `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`
- Not in PATH → `Get-Command msedge` returns nothing → Mother Brain said "not found"
- User has working browser but Mother Brain couldn't detect it

**Why This is Critical**:
- Browser detection is foundation of environment-aware presentation (Step 2.5)
- If browsers aren't detected, Mother Brain falls back to inferior methods
- User experience: "I have Edge but you're not using it"
- Wastes user's time to manually configure something that could be auto-detected

**Fix Applied**:

**Updated Step 2.5.1 - Multi-Method Browser Detection**:

**Before** (PATH-only detection):
```powershell
$chrome = Get-Command chrome -ErrorAction SilentlyContinue
$edge = Get-Command msedge -ErrorAction SilentlyContinue
$firefox = Get-Command firefox -ErrorAction SilentlyContinue
```

**After** (Multi-method with fallback to standard paths):
```powershell
# Method 1: Check PATH
$chrome = Get-Command chrome -ErrorAction SilentlyContinue
$edge = Get-Command msedge -ErrorAction SilentlyContinue
$firefox = Get-Command firefox -ErrorAction SilentlyContinue

# Method 2: Check common installation paths (if not in PATH)
if (-not $edge) {
  $edgePaths = @(
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
  )
  foreach ($path in $edgePaths) {
    if (Test-Path $path) { $edge = $path; break }
  }
}

if (-not $chrome) {
  $chromePaths = @(
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
  )
  foreach ($path in $chromePaths) {
    if (Test-Path $path) { $chrome = $path; break }
  }
}

if (-not $firefox) {
  $firefoxPaths = @(
    "${env:ProgramFiles(x86)}\Mozilla Firefox\firefox.exe",
    "$env:ProgramFiles\Mozilla Firefox\firefox.exe"
  )
  foreach ($path in $firefoxPaths) {
    if (Test-Path $path) { $firefox = $path; break }
  }
}

# Store full paths for later use
```

**Updated Display** (show full paths):
```
✅ Found: Microsoft Edge (C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe)
✅ Found: VS Code with Live Preview
❌ Chrome not found
✅ Node.js installed (v22.17.1)
```

**Updated Step 10 (Task Validation)** - Handle Full Paths:
- Presentation preference may be command name ("msedge") OR full path
- Check if preference is a file path: `if (Test-Path $browserPref)`
- Use directly if path, otherwise invoke as command
- Ensures both PATH-based and standard location browsers work

**Sections Updated**:
- Step 2.5.1 (Detect Available Tools): Added multi-method browser detection
- Step 10 (Task Validation): Added handling for full path browser preferences
- Example code updated to show path-aware invocation

**Lesson Learned**:
- **Don't rely on PATH alone** - many applications install without modifying PATH
- **Check standard installation locations** - browsers have predictable install paths
- **Store full paths** - more reliable than command names
- **Show paths to user** - helps them understand what was detected
- **Test actual file existence** - `Test-Path` is more reliable than command lookup
- **Multi-method detection** - try PATH first, fall back to standard locations

**Meta-Principle**:
When discovering system tools/applications:
1. Try fast method first (PATH lookup)
2. Fall back to standard locations for that OS/application
3. Store full paths for later use
4. Validate existence before storing
5. Show user what was actually found

**Impact**:
- Mother Brain now reliably detects browsers even if not in PATH
- Works on default Windows installations without user configuration
- Edge, Chrome, Firefox detected in standard install locations
- Users see browser detected and can use preferred browser immediately
- No more "I have [browser] but you didn't find it" issues
- Future sessions use stored full path reliably

**Standard Locations Added**:
- **Edge**: Program Files (x86), Program Files
- **Chrome**: Program Files (x86), Program Files, LocalAppData
- **Firefox**: Program Files (x86), Program Files

**Example Difference**:
- **Before**: `Get-Command msedge` → Not found → "No browsers detected"
- **After**: `Get-Command msedge` → Not found → Check standard paths → Found at "C:\Program Files (x86)\..." → "✅ Microsoft Edge detected"

---

## 2026-02-04 - Environment-Aware Output Presentation Strategy

**Issue Type**: Something broke or didn't work  
**User Report**:
"The mother brain is doing a project with a user, and it makes a web browser based game. It then tries to launch the game for the user but it just keeps opening the index text file in notepad instead of actually loading a game. The user then told motherbrain about it but it just keeps trying to load the game in things like chrome, but the user does not even have chrome. We need the tasks that motherbrain creates to be testable but also be able to provide the user with seeing it working so that they can give feedback. However in this situation it felt like motherbrain was guessing what applications the user had or how it could be shown to them. Mother brain should KNOW what the user has or how best to serve them the output, and if it can get things for the user it should automatically do it. For example mother brain could have opened it up in preview for the user in vs code. If it doesn't have a guaranteed way of presenting it back to the user it should seek a method of doing so. if it needs to get an extension or a browser or something it should at least check with the user how it would like to be presented back if it doesn't already know."

**Root Cause**: 
- **No environment discovery** - Mother Brain doesn't know what tools user has
- **Guessing presentation methods** - assumes Chrome/Edge/Firefox exist
- **No fallback strategy** - when primary method fails, keeps retrying same approach
- **No user preference capture** - doesn't ask user once and remember
- **No guaranteed presentation method** - misses VS Code preview as reliable fallback
- Step 10 (Task Validation) had generic "open file" logic without environment awareness

**Why This is a Meta-Level Issue**:
- Affects ANY output type (HTML, images, PDFs, JSON, etc.)
- Not project-specific - applies to web apps, games, tools, documentation projects
- Presentation is part of validation loop - can't get user feedback without showing output
- Environment varies by user - can't hardcode assumptions

**Fix Applied**:

**New Step 2.5: "Environment & Presentation Discovery"** (One-Time Setup):

**When to Run**:
- New projects: After project initialization (before vision discovery)
- Existing projects: Skip if already in session-state.json
- On demand: If presentation fails, re-run to update preferences

**Discovery Process**:
1. **Detect Available Tools** (Step 2.5.1):
   - Check for browsers: `Get-Command chrome/msedge/firefox`
   - Check for VS Code extensions (Live Preview, Live Server)
   - Check for Node.js (local http-server capability)
   - Log what was found

2. **Ask User for Preferences** (Step 2.5.2):
   - **HTML/web files**: Present found browsers + VS Code preview, let user choose
   - **Image files**: VS Code vs system default viewer
   - **Other files**: Default to VS Code/text editor
   - Smart prompting: If no browsers found, offer to install VS Code extension

3. **Store Preferences** (Step 2.5.3):
   - Add `environment` object to session-state.json:
     ```json
     "environment": {
       "detectedBrowsers": ["msedge", "firefox"],
       "vsCodeAvailable": true,
       "vsCodeExtensions": ["live-preview"],
       "nodeInstalled": false,
       "presentationPreferences": {
         "html": "msedge",
         "image": "vscode",
         "json": "vscode"
       },
       "discoveredAt": "2026-02-04T10:00:00Z"
     }
     ```

4. **Confirm Setup** (Step 2.5.4):
   - Display summary of configured presentation methods
   - Note that preferences can be updated anytime from main menu

**Updated Step 10 (Task Validation) - Environment-Aware Presentation**:

**Before**:
```markdown
- ✅ **Functional Test**: Run/open/execute the output
```

**After** (with environment awareness):
```markdown
- ✅ **Functional Test**: Present output using environment-aware strategy
  1. Load presentationPreferences from session-state.json
  2. Identify output type (HTML, image, JSON, etc.)
  3. Match to preferred method from environment discovery
  4. Presentation Strategy (layered fallback):
     - Primary: Use stored preference (browser, VS Code extension)
     - Validate: Check if method succeeded
     - Fallback 1: Try alternative from detected tools
     - Fallback 2: Provide manual instructions with full path
     - Update prompt: Offer to re-run Step 2.5 if failures persist
  5. Log presentation method used in task document
```

**Example Flow**:
```powershell
# Load preference: "msedge"
$htmlPath = Resolve-Path "index.html"
Start-Process "msedge" "file:///$htmlPath"

# If error, try VS Code Live Preview
# Always show: "Or manually open: C:\full\path\index.html"
```

**Updated Step 2 (Main Menu)**:
- Added menu option: "Update presentation preferences"
- Jumps to Step 2.5 for reconfiguration
- Allows user to change browser, enable extensions, etc.

**Updated session-state.json Documentation**:
- Added `environment` object structure with example
- Shows detected tools and user preferences
- Timestamp for when discovery was performed

**Sections Updated**:
- New Step 2.5: Complete environment discovery workflow
- Step 2 (Main Menu): Added "Update presentation preferences" option
- Step 10 (Task Validation): Rewritten with environment-aware presentation strategy
- Step 11 (Next Action): Updated session-state.json structure to include environment
- Session Continuity: Environment persists across sessions

**Lesson Learned**:
- **Environment discovery is mandatory** - can't assume user's tools
- **Ask once, remember forever** - capture preferences and store in session-state
- **Layered fallback strategy** - primary method → alternative → manual instructions
- **Guaranteed presentation method** - VS Code is reliable fallback for most file types
- **One-time setup** - don't ask repeatedly, store in session state
- **Validation matters** - check if presentation method actually worked
- **Meta-agnostic principle** - this applies to ANY output type, not just HTML
- **User empowerment** - if tools missing, offer to install or provide alternatives

**Impact**:
- Mother Brain now knows user's available tools before creating output
- Presentation methods are reliable and user-approved
- No more guessing or repeated failures
- Users can update preferences anytime from main menu
- VS Code provides guaranteed fallback for most file types
- Manual instructions always provided as ultimate fallback
- Works across all project types (web, games, images, docs, etc.)
- One-time setup persists across all tasks in project
- Environment discovery teaches Mother Brain how to serve each specific user

**Meta-Principle Reinforced**:
❌ **Don't assume user's environment** (tools, browsers, extensions)  
✅ **Discover environment once, remember preferences** (store in session-state)  
✅ **Provide layered fallback strategy** (primary → alternative → manual)  
✅ **Guaranteed method for common outputs** (VS Code for HTML/images/JSON)  
✅ **Validate presentation worked** (don't assume success)  
✅ **Allow preference updates** (users' environments change)

**Example Difference**:
- **Before**: "Opening index.html..." → Opens in Notepad → "Opening in Chrome..." → Chrome not found → Fails repeatedly
- **After (with discovery)**: 
  - First session: "🔍 Discovering environment... Found: Edge, VS Code. Which for HTML? [User chooses Edge]"
  - All future tasks: "Opening index.html in Microsoft Edge... ✅ Or manually: C:\path\index.html"
  - If Edge fails: "Trying VS Code Live Preview... ✅"

---

## 2026-02-04 - Skill Invocation Failures During Task Execution

**Issue Type**: Something broke or didn't work  
**User Report**: 
"When running a project and working through the tasks the motherbrain is coming up against the same error all the time. i did request it was fixed but it doesn't seems to be: Task 003 needs to be created... skill(game-state-manager) ✗ Skill not found: game-state-manager. The skill wasn't properly registered. The skills exist but may not be properly set up."

**Root Cause**: 
- Step 6 (Skill Identification & Creation) creates skills but **never validates they're invokable**
- After invoking skill-creator, Mother Brain assumes success without testing
- Shows "✅ [skill-name] created" but never verifies the skill can actually be invoked
- When Step 9 (Task Execution) tries to invoke skill, it fails with "Skill not found"
- Mother Brain falls back to manual implementation, defeating the purpose of creating skills
- No error handling between skill creation (Step 6) and skill usage (Step 9)

**Why This Happens**:
- Skill directories exist (`.github/skills/game-state-manager/`)
- SKILL.md files exist
- But skill isn't registered/loadable by the skill invocation system
- Could be path issues, naming mismatches, or skill loader problems
- Without validation at creation time, failures only surface during execution

**Fix Applied**:

**Updated Step 6 (Lines 483-491) - Skill Validation After Creation**:

**Before**:
```markdown
- **Automatically create essential skills** (no user prompt):
  - Display: "🔨 Creating essential skills for project..."
  - For each essential skill:
    - Show progress: "Creating [skill-name]..."
    - Invoke skill-creator with context from research findings
    - Let skill-creator run its wizard
    - Store created skills in `.github/skills/`
    - Show completion: "✅ [skill-name] created"
```

**After** (with validation):
```markdown
- **Automatically create essential skills** (no user prompt):
  - Display: "🔨 Creating essential skills for project..."
  - For each essential skill:
    - Show progress: "Creating [skill-name]..."
    - Invoke skill-creator with context from research findings
    - Let skill-creator run its wizard
    - Store created skills in `.github/skills/`
    - **VALIDATE SKILL** (CRITICAL - prevents task execution failures):
      1. Check `.github/skills/[skill-name]/SKILL.md` exists
      2. Test invoke the skill with a simple "hello" or status check
      3. If invocation fails:
         - Show error: "⚠️ Skill [name] created but can't be invoked"
         - Diagnose issue (path, permissions, SKILL.md format)
         - Ask user: "Retry creation?" or "Skip this skill?"
      4. Only mark complete if skill invokes successfully
    - Show completion: "✅ [skill-name] created and validated"
  
  - **After all skills created**:
    - Display summary: "Skills ready: [list of validated skills]"
    - Log in session-state.json: skillsCreated array with validated names
    - This ensures Step 9 can reliably invoke these skills
```

**Why This Fix Works**:
✅ **Validates at creation time** (not execution time when task is already underway)  
✅ **Tests actual invocation** (not just file existence)  
✅ **Clear error messages** if something's wrong  
✅ **Offers recovery options** (retry or skip)  
✅ **Only logs validated skills** (session-state only contains working skills)  
✅ **Prevents cascade failures** (Step 9 won't try to use broken skills)

**Sections Updated**:
- Step 6 (Skill Identification & Creation) - Lines 483-491
- Added validation workflow after each skill creation
- Added summary display of validated skills
- Added session-state.json logging guidance

**Lesson Learned**:
- **Never assume success** - always validate critical operations
- **Fail fast at creation** - catch issues before they cascade to execution
- **Test integration points** - file existence ≠ system integration
- **Provide actionable errors** - "created but can't invoke" is more useful than "skill not found" later
- **Log only success** - session-state.json should only contain validated, working skills
- **Early validation prevents late failures** - catch issues in Step 6, not Step 9

**Impact**:
- Skills are validated immediately after creation
- Task execution (Step 9) only attempts to invoke verified working skills
- Clear errors surface during planning, not mid-execution
- Users get immediate feedback if skill creation fails
- Prevents "skill not found" errors during task work
- Reduces frustration and manual implementation fallbacks
- session-state.json becomes a reliable source of truth for available skills

**Meta-Principle**:
When creating infrastructure/tools that will be used later in the workflow:
1. Create it
2. **Validate it works** ← THIS STEP WAS MISSING
3. Log it as available
4. Use it with confidence

Apply this to: skills, files, dependencies, configurations, services

---

## 2026-02-04 - Browser File Opening Issue

**Issue Type**: Something broke or didn't work  
**User Report**: "You loaded up the index.html file to me but it was opened in txt editor so I only got a text file. I later opened the file separately with a browser and I could see it was beautiful. So this needs to be a learning for mother brain"

**Root Cause**:
- Used `Start-Process "index.html"` which opens file with default application
- On some systems, .html files are associated with text editors, not browsers
- Should explicitly specify browser executable for HTML files

**Fix to Apply**:
- Update Step 9 (Task Execution) validation process
- When validating HTML files, use explicit browser launch:
  - Windows: `Start-Process "chrome" "file://$(Resolve-Path index.html)"`
  - Or: `Start-Process "msedge" "file://$(Resolve-Path index.html)"`
  - Fallback: Provide clear instructions for user to manually open
- Add validation step: "Opened in browser (not text editor)"

**Prevention Strategy**:
1. Always use explicit browser path for HTML validation
2. Try common browsers in order: Chrome, Edge, Firefox
3. If all fail, instruct user to manually open with browser
4. Verify with user that browser opened correctly

**Lesson Learned**:
- Don't assume `Start-Process` on HTML files opens a browser
- File associations vary by user system configuration
- Always validate that web files open in correct application
- When in doubt, give user explicit instructions

**Impact**:
- Future HTML/web tasks will properly open in browsers for validation
- Reduces confusion when user needs to verify visual output
- Better task validation workflow

**Sections to Update in Mother Brain**:
- Step 9 (Task Execution) - Add browser-specific opening logic
- Step 10 (Task Validation) - Include "opened in correct application" check
- Task templates for web projects should note browser validation method

---

## 2026-02-03 - Project Ejected: Pixel Art Generator

**Project Name**: Pixel Art Generator  
**Reason**: Installation blocked by corporate network issues (SSL certs, PATH), starting fresh with different approach

**Files Removed**:
- docs/vision.md
- docs/roadmap.md
- docs/tasks/ (Task 001: Install Stable Diffusion local)
- docs/session-state.json

**Skills Removed**:
- pixel-art-prompt-builder (SD prompt construction skill)
- ai-to-pixel-converter (post-processing to pixel art)
- sprite-sheet-assembler (animation frame organization)

**Files Preserved**:
- ✅ docs/learning-log.md
- ✅ .github/skills/mother-brain/
- ✅ .github/skills/skill-creator/
- ✅ .github/skills/skill-trigger-detector/
- ✅ README.md (framework documentation)
- ✅ .vscode/, .gitignore

**External Artifacts**:
- ⚠ C:\ComfyUI\ (partial installation, user can manually delete if no longer needed)

**Learnings Preserved**: 6 entries in learning log

**Notes**: Task 001 encountered environment challenges (SSL certificate verification errors, Python PATH issues in corporate network). User chose to eject and try different approach rather than continue troubleshooting complex local SD installation.

---

## 2026-02-03 - Project Ejected: Gaming Backlog Manager

**Project Name**: Gaming Backlog Manager  
**Reason**: Testing/prototyping complete, resetting to framework  

**Files Removed**:
- gaming-backlog-manager/ (project source code - 14,921 files, 139.8 MB)
- docs/vision.md
- docs/roadmap.md
- docs/tasks/ (all task documents)
- docs/skill-schema.md

**Skills Removed**:
- pwa-builder (project-specific PWA skill)

**Files Preserved**:
- ✅ docs/learning-log.md
- ✅ .github/skills/mother-brain/
- ✅ .github/skills/skill-creator/
- ✅ .github/skills/skill-trigger-detector/
- ✅ README.md (framework documentation)
- ✅ .vscode/, .gitignore

**Learnings Preserved**: 3 entries in learning log (self-update feature, research-driven discovery, eject feature)

---

## 2026-02-03 - Eject Feature Added

**Issue Type**: Feature Request  
**User Report**: 
"I'd like to add a feature to mother brain called 'Eject' - it should remove everything it has created as part of the project specific files and take itself back to just the framework but with all its learnings baked in. In this instance we would basically destroy the gaming backlog manager and the pwa build skill and all the docs, but the mother brain skill, skill creator, skill trigger detector and vs code, git ignore would stay. The idea is we ran through a mock project testing out mother brain but then take our learnings with us but dispose of the things we created."

**Root Cause**: 
- No way to reset to clean framework state after testing/prototyping
- Users running test projects had to manually delete project artifacts
- Learning log valuable but got mixed with project files
- Need to separate "framework" from "project-specific" artifacts

**Fix Applied**:

**New Step 2B: "Eject Project"**:
1. Menu option added: "Eject project (reset to framework + learnings)"
2. Shows warning about what will be removed vs kept
3. Double confirmation required
4. Identifies core framework skills vs project-specific skills
5. Creates deletion plan and shows to user
6. Final confirmation before execution
7. Deletes:
   - Project source code directories
   - docs/vision.md, docs/roadmap.md, docs/tasks/
   - Project-created skills
   - Session state
8. Preserves:
   - Core framework skills (mother-brain, skill-creator, skill-trigger-detector)
   - docs/learning-log.md ✅
   - Framework config (.vscode/, .gitignore, README.md)
9. Logs eject event in learning-log.md
10. Returns to clean state, ready for new project

**Sections Updated**:
- Purpose: Added "Project Ejection" capability
- Use cases: Added "Eject a test/prototype project while keeping framework + learnings"
- Step 2: Added menu option "Eject project (reset to framework + learnings)"
- New Step 2B: Complete eject workflow with safety confirmations

**Lesson Learned**:
- Test/prototype projects generate valuable learnings but clutter the workspace
- Framework improvements should persist across projects
- Clear separation needed between "framework" and "project-specific" artifacts
- Safety confirmations critical when deleting files
- Learning log is a framework asset, not a project asset

**Impact**:
- Users can test Mother Brain on mock projects without fear of clutter
- Learnings accumulate across multiple projects
- Framework improves with each project, even test ones
- Easy to start fresh while keeping all improvements
- Encourages experimentation and iteration

**Use Cases**:
- Testing Mother Brain on sample project
- Prototyping project idea, then discarding
- Starting over with different approach but same learnings
- Cleaning workspace while preserving skill improvements

---

## 2026-02-03 - Research-Driven Discovery (Major Refinement)

**Issue Type**: Fundamental Design Flaw  
**User Report**: 
"I shouldn't have to list every element of a project process. Mother Brain should research which skills and roles are employed in best practice for the specific project type. If someone wants to make a cooking app or video game or image generation software, Mother Brain should research and discover what's needed - maybe an agile lead, architect, additional project documents. These have to come from Mother Brain through research at the point of decision, not from hardcoded lists."

**Root Cause**: 
- **Hardcoded assumptions** instead of dynamic discovery
- Steps 5 & 6 had predetermined lists of patterns/domains (auth, file uploads, UI/Design, etc.)
- ❌ This approach only knows what was explicitly programmed
- ❌ Doesn't adapt to different project types (gaming vs SaaS vs CLI tools)
- ❌ Assumes all projects need the same categories
- ❌ Puts burden on user to know what's missing

**Fix Applied**:

**Step 5 - Complete Overhaul to "Research-Driven Discovery"**:
1. **Step 5.1**: Identify project type from vision (web app, game, CLI, library, etc.)
2. **Step 5.2**: Research via web_search:
   - Best practices for that specific project type
   - Team roles needed for that type
   - Common technical patterns in that domain
   - Project management methodologies
   - Documentation standards
   - Quality assurance approaches
3. **Step 5.3**: Extract insights from research:
   - Roles/disciplines (designer, architect, QA, etc.)
   - Methodologies (Agile, TDD, DoD)
   - Technical patterns (whatever research reveals)
   - Documentation needs (arch docs, test plans, etc.)
   - Tools & libraries
   - Quality standards
4. **Step 5.4**: Ask user for context when research offers multiple options
5. **Step 5.5**: Present findings organized by category
6. **Step 5.6**: Validate with user, iterate if needed

**Step 6 - Updated to "Dynamic Skill Discovery"**:
- Removed hardcoded domain lists (Backend, Frontend, UI/Design, DevOps, Data)
- Now derives skill needs from Step 5 research findings:
  - **Role-based skills**: What does each identified role need?
  - **Pattern-based skills**: What technical patterns from research are repetitive?
  - **Documentation skills**: What docs can be automated?
- Organizes recommendations by source (role/pattern/documentation)

**Lesson Learned**:
- **Don't hardcode domain knowledge** - research it dynamically
- **Project types differ fundamentally** - gaming ≠ SaaS ≠ CLI tooling
- **Best practices evolve** - web_search gets current standards
- **User shouldn't fill gaps** - Mother Brain should discover gaps through research
- **Context determines needs** - let research reveal what matters for this specific project type

**Impact**:
- Mother Brain now adapts to ANY project type, not just web apps
- Discovers domain-specific roles, patterns, and needs through research
- No more "missing" considerations - research reveals what's important
- Works for gaming, SaaS, ecommerce, CLI tools, libraries, mobile apps, etc.
- Future-proof: research always uses current best practices

**Example Difference**:
- **Before**: "Let's check for auth, file uploads, API calls..." (hardcoded web app assumptions)
- **After**: "This is a video game. Research says you need: game designer, sound engineer, QA tester, game loop pattern, save system, asset pipeline..." (discovered from research)

---

## 2026-02-03 - Proactive Skill Discovery & Error Self-Healing

**Issue Type**: Something broke or didn't work  
**User Report**: 
- Mother Brain should identify new skills needed along the way, not just at project start
- Should analyze tasks for each phase and identify appropriate skills
- Failed to ask about brand look/feel, UI skills
- Failed to load styling for app, fixed it but never self-reported or healed
- Should integrate with skill-trigger-detector to auto-invoke relevant skills

**Root Cause**: 
- Step 6 (Skill Identification) only ran once during initial project setup
- No continuous skill discovery during task execution
- No error detection + self-healing workflow when things break
- Missing UI/design domain in pattern recognition
- No integration with skill-trigger-detector

**Sections Updated**:

1. **Step 5 (Technology Analysis)**: Expanded to include:
   - UI/UX considerations (design systems, component libraries, styling)
   - Brand identity needs (colors, fonts, logo, visual consistency)
   - Accessibility requirements (WCAG, keyboard nav, screen readers)
   - Design system research in web_search

2. **Step 6 (Skill Identification)**: Added domain awareness:
   - Backend, Frontend, UI/Design, DevOps, Data domains
   - Explicit UI/Design category with: design systems, brand guidelines, accessibility, animations

3. **Step 9 (Task Execution)**: Complete overhaul:
   - **Pre-Task Analysis**: Look ahead at next 3-5 tasks to identify emerging patterns
   - **Proactive skill creation**: Offer to create skills before they're needed
   - **Skill Matching**: Integration with skill-trigger-detector to auto-match existing skills
   - **Error Detection**: When execution fails, trigger Step 9A instead of just fixing

4. **New Step 9A (Error Detection & Self-Healing)**: Complete workflow:
   - Document what broke, root cause analysis
   - Log in learning-log.md automatically
   - Identify if issue is skill/task/Mother Brain/environment
   - Offer to update the appropriate component
   - Jump to Step 2A (Update Mother Brain) or skill-creator heal mode
   - Resume task after fixing

**Fix Applied**: 
- Mother Brain now continuously scans for skill opportunities during execution
- Automatically detects and responds to errors with self-healing workflow
- Integrates with skill-trigger-detector for automatic skill invocation
- Considers UI/design domains in initial analysis and ongoing discovery

**Lesson Learned**: 
- Meta-frameworks need **continuous pattern detection**, not just initial setup
- **Error detection must trigger learning**, not just fixes
- **Domain coverage matters** - UI/design is as important as backend patterns
- **Integration with other skills** (like skill-trigger-detector) should be explicit

**Impact**: 
- Mother Brain now proactively identifies skills throughout project lifecycle
- Errors trigger automatic learning and prevention mechanisms
- Better coverage of UI/design/brand concerns
- Tighter integration with skill ecosystem

---

## 2026-02-03 - Mother Brain Self-Update Feature Added

**Issue Type**: Feature Request  
**User Report**: "I want a new menu item for motherbrain that is 'Update MotherBrain' where you can tell her problems and it will update the skill for future usage"  
**Root Cause**: Mother Brain lacked a direct mechanism for users to report issues and trigger self-improvement  
**Fix Applied**: Added Step 2A "Update Mother Brain" with complete self-improvement workflow  

**Sections Updated**:
- Purpose: Added "Self-Updating" capability
- Operating Principles: Enhanced self-improvement principle, added user-driven evolution
- Use Cases: Added "Report issues or improvements to Mother Brain itself"
- Step 2: Added menu option "Update Mother Brain (report issues/improvements)"
- New Step 2A: Complete workflow for handling user-reported issues including:
  - Issue type classification (broke/missing/confusing/suggestion)
  - Detailed description gathering
  - Analysis of which sections to update
  - Solution design with before/after comparison
  - User approval process
  - Application of updates via edit tool
  - Logging in learning-log.md
  - Validation and refinement loop

**Lesson Learned**: Meta-skills should have explicit self-improvement workflows accessible via menu, not just reactive healing. Users should be empowered to directly improve the tools they use.

**Impact**: Mother Brain can now be improved by any user at any time, creating a continuous feedback loop for skill enhancement.

---

## 2026-02-04 - Automatic Essential Skill Creation

**Issue Type**: User Suggestion for Improvement  
**User Report**: 
"I don't want motherbrain to ask the user if they want to create the skills - it is just part of the deal that if they are identified, and the skills are essential to building it with the right expertise, the user doesn't need to know or be asked about it"

**Root Cause**: 
- Step 6 treated all skill creation as requiring user approval
- Asked users: "Yes, create all recommended skills now" / "Let me choose which to create" / "Skip for now"
- This interrupted flow and forced users to micromanage skill creation decisions
- Users hired Mother Brain to handle expertise setup - shouldn't need to approve essential tooling
- Broke the principle of "Product-first thinking" by focusing on implementation details

**Fix Applied**:

**Step 6 (Skill Identification & Creation) - Lines 462-490**:

**Before**:
- Presented all skills as "recommendations" with user prompt
- Required user approval before creating any skills
- Treated essential and optional skills the same way

**After**:
- **Categorizes skills into Essential vs Optional**:
  - **Essential**: Core roles/patterns/needs required for MVP delivery (create automatically)
  - **Optional**: Nice-to-have features, post-MVP, documentation generators (offer choice)
- **Essential criteria**: Needed for MVP, core technical pattern (3+ uses), fundamental role (designer, QA, architect)
- **Optional criteria**: Post-MVP features, one-time documentation, nice-to-have automation
- **Automatically creates essential skills** without user prompt:
  - Shows progress: "🔨 Creating essential skills for project..."
  - Creates each skill with progress updates
  - No interruption or decision fatigue
- **Only prompts for optional skills**: User can choose to create, skip, or defer
- Displays clear categorization so user understands what's happening

**Sections Updated**:
- Step 6 (Skill Identification & Creation): Complete rewrite of skill presentation and creation flow
- Lines 462-490: Replaced user prompt flow with automatic essential skill creation

**Lesson Learned**:
- **Essential expertise shouldn't require approval** - users hired Mother Brain to set up the right tools
- **Categorize by necessity** - not all skills are equal; some are MVP-critical, others are nice-to-have
- **Reduce decision fatigue** - automate obvious decisions, only prompt for choices that matter
- **Product-first thinking** - users care about outcomes, not tool installation micro-decisions
- **Trust the framework** - if research identifies essential patterns/roles, create the skills automatically

**Impact**:
- Users focus on vision and goals, not infrastructure micro-management
- Essential project expertise is set up automatically based on research
- Faster project setup with less cognitive load
- Optional skills still offer choice without blocking progress
- Aligns with operating principle: "Product-first thinking"

**Example Difference**:
- **Before**: "I found 5 skills. Do you want to create them? Yes/Choose/Skip"
- **After**: "🔨 Creating 3 essential skills for your game project: game-state-manager, game-ai-engine, board-game-renderer... Done! Would you like these 2 optional skills?"

---

## 2026-02-04 - Three-Layered Learning System from User Feedback

**Issue Type**: User Suggestion for Improvement  
**User Report**: 
"After finishing a task, motherbrain asks if implementation is as expected, which is good, however we need to do three things. We need to take the feedback from the user to learn. First, learn about what went wrong and update the skill we used. Second (most important), contextually update motherbrain to learn what went wrong - not in project specific way, it needs to update its meta understanding of what it needs to avoid in future projects. Maybe it didn't do enough deep research. Third - which we already do - is fix the actual current project itself."

**Root Cause**: 
- Step 10 (Task Validation) only fixed immediate problems without extracting lessons
- User feedback stopped at "fix and re-validate" 
- No skill healing based on user feedback
- No meta-level Mother Brain learning from feedback patterns
- No skill-creator updates to improve future skill generation
- Missed opportunity to improve entire framework from every user adjustment

**Fix Applied**:

**New Step 10A: "Three-Layered Learning from Feedback"** (inserted after Step 10):

**Layer 1 - Project Layer** (already existed):
- Ask what needs changing
- Fix current deliverables
- Re-validate with user

**Layer 2 - Skill Layer** (NEW):
- Identify which skill was used during task
- Analyze user feedback for skill-level lessons:
  - What did skill miss? (domain rules, UI patterns, technical details)
  - What assumptions were wrong?
  - What domain knowledge insufficient?
- Invoke skill-creator in "heal" mode:
  - Update skill's domain knowledge and references
  - Enhance research/reference gathering steps
  - Add validation checks
  - Improve examples with correct approach
- Log skill healing in learning-log.md

**Layer 3 - Meta Layer** (NEW - MOST IMPORTANT):
- **Abstract the lesson** beyond project specifics:
  - ❌ "Snakes and Ladders UI was wrong"
  - ✅ "Insufficient research into domain-specific rules and conventions"
- **Identify which Mother Brain process failed**:
  - Was research too shallow? (Step 5)
  - Skills created without domain context? (Step 6)
  - Task definition unclear about domain correctness? (Step 8)
- **Extract meta-principle** for all future projects:
  - Example: "Domain-specific projects need research into established rules/conventions/visual standards"
  - Example: "Skills need reference materials, not just patterns"
  - Example: "Validation should check domain correctness, not just technical function"
- **Update Mother Brain SKILL.md**:
  - Enhance relevant step with learned principle
  - Add to Operating Principles if broadly applicable
  - Update validation checklists
- Log meta-learning in learning-log.md

**Layer 4 - Skill-Creator Enhancement** (NEW - if applicable):
- Determine if lesson applies to how skills are created generally
- Ask user if skill-creator should be updated
- If yes, update skill-creator SKILL.md:
  - Enhance skill generation templates
  - Add new validation requirements
  - Improve example generation process
- Log skill-creator improvement in learning-log.md

**Execution Flow**:
1. User feedback → Fix project (Layer 1)
2. Heal specific skill (Layer 2)
3. Update Mother Brain with abstract lesson (Layer 3)
4. Enhance skill-creator if applicable (Layer 4)
5. Log all layers
6. Return to validation

**Sections Updated**:
- Step 10 (Task Validation): Line 681 - changed to jump to Step 10A when issues found
- New Step 10A (Three-Layered Learning from Feedback): Complete workflow for all four layers
- Added detailed logging templates for each layer
- Integration with skill-creator heal mode
- Meta-principle abstraction examples

**Lesson Learned**:
- **Every user adjustment is a learning opportunity** - don't just fix, learn and prevent
- **Three layers of learning**: Project (immediate), Skill (specific), Meta (abstract)
- **Abstract beyond specifics**: "Game UI wrong" → "Domain research insufficient" 
- **Identify process failure**: Which step/principle in Mother Brain was insufficient?
- **Cascade improvements**: User feedback → Skill → Mother Brain → Skill-Creator → All future projects
- **Meta-learning is most valuable**: Project-agnostic principles improve ALL future work

**Impact**:
- Framework gets smarter with every user adjustment
- Skills heal themselves based on real feedback
- Mother Brain learns abstract principles that apply across project types
- Skill-creator generates better skills over time
- User feedback creates compound improvements
- Prevents entire classes of errors, not just specific instances
- Learning accumulates across projects via learning-log.md

**Example Cascade**:
- **User**: "Snakes and Ladders board doesn't follow standard game layout"
- **Layer 1**: Fix the board layout in current project
- **Layer 2**: Heal board-game-renderer skill to research game conventions first
- **Layer 3**: Update Mother Brain Step 5 to "For established domains (games, finance), research must include industry standards and conventions"
- **Layer 4**: Update skill-creator to ensure all skills include reference gathering step
- **Result**: All future game projects will research conventions. All future domain-specific projects will gather standards. All future skills will collect references.

---

## 2026-02-04 - MVP-First Phasing with Research-Driven Delivery Strategy

**Issue Type**: User Suggestion for Improvement  
**User Report**: 
"I'd like motherbrain in the planning to assess the best path for the specific project during initial planning where it identifies the MVP and treats that as phase 1, but there is also a plan beyond the initial phase. Getting the user to a viable product in the shortest route should be the key objective. We also need to account for feedback and learning - if user is building a SaaS project, they need to get live, get user feedback, and iterate. We need to build motherbrain's meta thinking to account for this or check what suitable plan should exist for the user's specific context."

**Follow-up Concern**:
"I worry that your meta brain is becoming too specific for contexts of projects you've worked on. Don't write specific instructions for games, web apps, tools etc. Take learnings and apply them at a meta thinking level. Text inside motherbrain should be agnostic of project contexts - but build in instructions to still apply those things."

**Root Cause**: 
- Step 7 (Roadmap Generation) used generic phasing ("Foundation → Phase 2 → Phase 3")
- MVP was a "checkpoint" not the organizing principle of Phase 1
- No research into optimal delivery strategy for project type
- No consideration of post-launch iteration patterns
- Initial fix attempted to hardcode project-specific patterns (SaaS, games, tools) - violating meta-agnostic principle

**Fix Applied**:

**New Step 6A: "Delivery Strategy Research"** (inserted before Step 7):

**Meta-Level Approach** (no hardcoding):
- Use web_search to research:
  - "[project type] MVP strategy"
  - "[project type] launch best practices"
  - "[project type] iteration and feedback approach"
  - "phasing strategy for [project type] projects"
- Extract delivery principles from research:
  - What does "minimum viable" mean for THIS project type?
  - What's the typical launch pattern? (early feedback vs complete release)
  - How do successful projects iterate post-launch?
  - What's shortest path to user value?
  - How do they collect feedback and learn?
- Present findings to user (no assumptions)
- Validate strategy with user (lean/complete MVP preference)

**Updated Step 7: "Roadmap Generation" to MVP-First Structure**:

**Before**:
- Generic phases (Foundation, Phase 2, Phase 3)
- MVP as a checkpoint somewhere
- No delivery strategy consideration

**After**:
- Phase 1 = MVP (shortest path to solve core problem)
- Scope determined by: vision MVP criteria + Step 6A research + user preference
- Phase 2+ = Post-MVP iteration (based on feedback mechanism from research)
- Clearly marked as "subject to learning/validation"
- Iteration cycle defined by research findings
- Risk mitigation: "Protect MVP at all costs, everything else can wait"

**Roadmap Template Updated**:
`markdown
## Delivery Strategy (Research-Based)
[Project type, MVP approach, launch pattern, iteration strategy - all from research]

## Phase 1: MVP - Core Problem Solution
[Shortest path to value, MVP criteria from vision]

## Phase 2+: Post-MVP Iteration
[Iteration approach from research, subject to user feedback]

## MVP Checkpoint
[When Phase 1 is complete, what happens next based on research]

## Future Enhancements (Post-MVP Backlog)
[Defer until validated by users]

## Iteration & Learning Plan (Research-Based)
[Feedback collection and iteration cycle from research]
`

**Sections Updated**:
- New Step 6A: Complete delivery strategy research workflow (research-driven, not hardcoded)
- Step 7.1: Define Phase 1 = MVP (shortest path to value)
- Step 7.2: Structure Post-MVP Work (research-driven)
- Step 7.3: Roadmap template (MVP-first with iteration plan)
- Step 7.4: Validate phasing with user

**Lesson Learned**:
- **MVP = Phase 1** (organizing principle, not checkpoint)
- **Shortest path to value** is the goal of Phase 1
- **Research delivery strategy** dynamically - don't hardcode project type patterns
- **Meta-agnostic instructions** - let research fill in project-specific details
- **Iteration and learning** must be planned from the start
- **Post-MVP work adapts** based on user feedback (don't over-plan)
- **Same principle as Step 5** - research domain knowledge, don't assume it

**Impact**:
- All projects now get MVP-first planning (fastest path to value)
- Delivery strategy adapted to project type via research (not assumptions)
- Clear distinction between MVP (must build) vs post-MVP (validate first)
- Iteration and feedback mechanisms planned from start
- Mother Brain remains meta-agnostic (no hardcoded SaaS/game/tool patterns)
- Users get to value faster with clear path to iterate based on learnings

**Meta-Principle Reinforced**:
❌ **Don't hardcode domain/context knowledge** (violates meta-agnostic design)  
✅ **Research it dynamically via web_search** (discovers current best practices)  
✅ **Let research findings populate templates** (keeps instructions project-agnostic)  
✅ **Apply learning at meta level** (principles, not specific contexts)

**Example Difference**:
- **Before**: "Phase 1: Foundation, Phase 2: Features, Phase 3: Polish" (generic, not value-focused)
- **After (with research)**: "Phase 1: MVP to solve core problem (2 weeks), Phase 2: Iteration based on user feedback (research says SaaS needs launch→feedback→iterate cycle)" (researched, value-focused, context-aware without hardcoding)

---

## 2026-02-04 11:42:13 - Mother Brain Self-Update

**Issue Type**: Something broke or didn't work  
**User Report**: During task validation, Mother Brain asked about features that weren't implemented yet (e.g., asking about animated piece movement when that was Task 006, not Task 003). When user said feature was missing, Mother Brain tried to implement it immediately instead of checking the roadmap, breaking the phased approach.

**Root Cause**: Step 10 (Task Validation) didn't cross-reference the current task's deliverables with the roadmap. It asked generic questions about the entire vision/MVP without checking what THIS specific task was supposed to deliver vs what FUTURE tasks would deliver.

**Fix Applied**: Added "Roadmap Cross-Check" section to Step 10 before user validation. Now Mother Brain:
1. Loads current task document to identify what THIS task delivers
2. Loads roadmap to identify what FUTURE tasks deliver
3. Only validates what THIS task was supposed to deliver
4. If user mentions missing features, checks if they're in future tasks
5. Explains when feature will be delivered and offers choice to continue as planned or adjust roadmap

**Sections Updated**: Step 10 - Task Validation (lines 999-1017)

**Lesson Learned**: Task validation must be scoped to the CURRENT task's deliverables, not the entire project vision. Always cross-reference roadmap to understand what's coming next before asking validation questions. Prevents out-of-order implementation and maintains phased approach integrity.


## 2026-02-04 11:49:42 - Mother Brain Self-Update

**Issue Type**: Suggestion for improvement  
**User Report**: User wants /motherbrain command to automatically switch Copilot to approval-free mode. Finds it annoying to realize mid-task that approval mode is still active, causing workflow interruptions from file change prompts.

**Root Cause**: Mother Brain creates/modifies many files (vision docs, roadmaps, tasks, skills) and requires frequent file operations. Without approval-free mode, users get constant prompts that interrupt the development flow. No mechanism existed to ensure approval-free mode is active before starting.

**Fix Applied**: Added "Step 0 - Pre-Execution Setup" that executes BEFORE showing welcome screen. This step:
1. Displays notice that Mother Brain is switching to approval-free mode
2. Instructs agent to inform user to press Shift+Tab to enable YOLO mode
3. Waits for acknowledgment before proceeding to main menu
4. Documents rationale: prevents frustration of discovering mid-task that mode wasn't switched

Also added Operating Principle documenting that approval-free workflow is required for Mother Brain sessions.

**Sections Updated**: 
- Added Step 0 (Pre-Execution Setup) before Step 1
- Updated Operating Principles to include approval-free workflow requirement

**Lesson Learned**: Workflow interruptions from approval prompts significantly impact user experience during multi-file operations. Tools that perform many file changes should proactively ensure optimal mode is set at session start, not just suggest it. Prevents user frustration from discovering mode issue mid-task when switching is disruptive.


## 2026-02-04 13:11:31 - Mother Brain Self-Update

**Issue Type**: Suggestion for improvement  
**User Report**: During Task 004, multiple adjustment cycles occurred where Mother Brain misunderstood speech bubble placement despite user clarifications. User suggested adding a "Post-Task Reflection & Learning Phase" that scans conversation after task completion, identifies all adjustment cycles, analyzes WHY problems occurred, and generates both project-specific and meta-level improvements to prevent similar issues in future projects.

**Root Cause**: Mother Brain had Step 10A (Three-Layered Learning) that triggered during adjustment cycles, but NO post-task reflection after completion. This meant friction points were fixed but not analyzed holistically. No mechanism existed to extract patterns from multiple adjustment cycles or distinguish between project-specific lessons vs project-agnostic meta-principles.

**Fix Applied**: Added "Step 10B - Post-Task Reflection & Learning" that executes AFTER task is marked complete. This new step:
1. Scans conversation for all "Works but needs adjustment" cycles
2. Extracts what was done, what user said was wrong, what fix was applied
3. Performs root cause analysis (ambiguity, assumptions, domain knowledge gaps, etc.)
4. Generates TWO types of improvements:
   - Project-specific: Updates the skill used in this task
   - Meta-level: Updates Mother Brain/skill-creator for ALL future projects
5. Presents findings to user with choice to apply improvements
6. Logs reflection in learning-log.md

**Example from Task 004**:
- 3 adjustment cycles for speech bubble positioning
- Root cause: Spatial reference misunderstandings (screen vs element)
- Project improvement: game-ai-engine could add positioning clarification questions
- Universal improvement: Mother Brain Operating Principle about spatial clarification

**Sections Updated**: 
- Added Step 10B (Post-Task Reflection & Learning) after Step 10A
- Comprehensive workflow for proactive learning from friction points
- Distinguishes project-specific vs project-agnostic improvements

**Lesson Learned**: Learning should happen BOTH during adjustment (reactive - Step 10A) AND after completion (proactive - Step 10B). Post-task reflection captures patterns across multiple adjustments that aren't visible during individual fix cycles. This creates compound learning where each completed task makes the entire framework smarter for future projects, not just fixes the immediate issue.


## 2026-02-04 13:14:20 - Mother Brain Self-Update (Refinement)

**Issue Type**: Refinement of Step 10B  
**User Feedback**: Step 10B should capture ALL friction types, not just "Works but needs adjustment". This includes: "Doesn't meet expectations/needs rework", build/test failures, errors, user selecting "Other" or freeform complaints, and multiple validation cycles.

**Root Cause**: Initial implementation of Step 10B only scanned for "Works but needs adjustment" cycles. This missed other critical friction points like complete reworks, technical failures, and errors.

**Refinement Applied**: Updated Step 10B.1 and 10B.2 to scan for and extract ALL friction types:
- "Works but needs adjustment" selections
- "Doesn't meet expectations, needs rework" selections
- Build/test failures
- Errors (console errors, crashes, exceptions)
- User selecting "Other" or freeform complaints
- Multiple validation cycles (had to present output >1 time)

Also expanded:
- Root cause categories to include: Error Handling, Environment issues, Performance
- Examples to show different friction types (adjustment, rework, build error, validation failure)
- Logging format to break down friction by type

**Lesson Learned**: Post-task reflection must be comprehensive and capture ALL types of friction, not just user adjustments. Technical failures and errors are equally valuable learning signals. Friction categorization helps identify patterns (e.g., "3 adjustment cycles + 2 build errors = validation gap in skill").


## 2026-02-04 13:16:15 - Post-Task Reflection: Task 004

**Total Friction Points**: 4
**Breakdown**:
- Adjustments: 3 ("Works but needs adjustment")
- Validation Failures: 1 (browser directory listing)

**Friction Details**:
1. Adjustment: AI comments in message box, user wanted speech bubble
2. Adjustment: Speech bubble as centered overlay, user wanted small bubble near AI
3. Adjustment: Speech bubble on right side of screen, user wanted on AI card corner
4. Validation Failure: Browser opened directory listing due to Windows path with spaces

**Root Causes**:
- Spatial/Visual: Misunderstood placement instructions across 3 adjustment cycles
- Assumption: Implemented without asking for specific element positioning
- Environment: Didn't handle Windows file paths with spaces

**Project Improvements**: Updated game-ai-engine skill
- Added Question 4: "Will AI need personality?"
- Added Question 5: "Where should personality elements be positioned?" (asks for specific placement)
- Added Step 2 pre-implementation: Research game UI conventions + confirm HTML structure

**Universal Improvements**: Updated Mother Brain Operating Principles
- Added "Spatial UI Clarification" principle: Always ask for placement relative to SPECIFIC existing elements before implementing UI
- Prevents assumption-based spatial implementations

**Lesson**: Spatial/visual requirements need explicit clarification. "Near X" has multiple interpretations (inside, adjacent, overlay, etc.). Always ask user to specify the exact HTML structure relationship and element reference before implementing UI features.


## 2026-02-04 13:24:20 - Post-Task Reflection: Task 005

**Total Friction Points**: 2
**Breakdown**:
- Reworks: 1 ("Doesn't meet expectations")
- Adjustments: 1 ("Works but needs adjustment")

**Friction Details**:
1. Rework: Snake/ladder logic wasn't triggering (bug in position variable reference)
2. Adjustment: User wanted piece animations, but that's Task 006 scope

**Root Causes**:
- Technical Implementation Error: Logic checked wrong position variable after modification
- Scope Clarity: User expected visual animations in logic task (understandable given fun factor)

**Project Improvements**: Updated game-state-manager skill
- Added validation step: Test logic with console.logs before presenting
- Added edge case testing checklist (snakes, ladders, win conditions)
- Added testing pattern example for validation

**Universal Improvements**: Updated Mother Brain Step 8 (Task Document Creation)
- Added "Scope Clarity" section to task template
- Task titles now include type tag: [Logic/UI/Animation/Integration/Testing]
- Explicitly states "NOT in scope" to prevent confusion with future tasks
- Helps users understand what THIS task delivers vs what's coming next

**Lesson**: Task scope confusion happens when functional and visual features are split across tasks. Clear labeling (Logic vs Animation) and explicit "not in scope" sections prevent users from expecting features that are intentionally deferred to future tasks. This is especially important for features with high "fun factor" like animations.


## 2026-02-04 13:27:41 - Mother Brain Self-Update

**Issue Type**: Suggestion for improvement  
**User Report**: Post-Task Reflection (Step 10B.5) asks user if they want to apply improvements. This creates unnecessary friction and contradicts the "self-learning" principle. Mother Brain should automatically apply all improvements without asking.

**Root Cause**: Added user approval gate out of caution, but this defeats the purpose of self-learning. Creates decision fatigue and slows down the learning loop. User has to approve every improvement even though that's Mother Brain's core purpose.

**Fix Applied**: Removed approval sk_user from Step 10B.5. Now automatically applies ALL improvements (both project-specific and universal) without user intervention. Changes:
- Renamed step to "Auto-Apply Improvements & Present Findings"
- Display shows what was learned and what was changed (transparency)
- Automatically proceeds to Step 10B.6 to apply changes
- All changes still logged in learning-log.md (auditability)
- User can still review/revert via "Update Mother Brain" menu (reversibility)

**Sections Updated**: Step 10B.5 (Post-Task Reflection presentation and approval)

**Lesson Learned**: Self-learning systems should learn automatically, not ask permission. Approval gates create friction that defeats the purpose. The solution is transparency (show what changed), auditability (log everything), and reversibility (allow undo) rather than approval-before-action. Trust the system to learn and let users intervene only when needed, not every time.


## 2026-02-04 14:03:41 - Mother Brain Self-Update: Design System Discovery

**Issue Type**: Suggestion for improvement  
**User Report**: Projects with visual requirements ("visual beauty") ended up with "quite vile" visuals because design foundations (palette, brand, art direction) were never established. Skills implemented features technically but with no visual consistency or design system. User doesn't have design skills and shouldn't need to manually specify visual requirements.

**Root Cause**: Mother Brain treated "visual beauty" as polish/aesthetics to be added later, not as a foundational constraint requiring design system research upfront. Skills created for technical implementation (rendering, animation) but not for design consistency. No proactive detection of when visual quality matters.

**Fix Applied**: 
1. Added "Visual Quality First" operating principle
2. Added Step 5A: Design System Discovery (automatic, triggered by visual keywords in vision)
3. Step 5A researches:
   - Color palette best practices for project type
   - Typography and spacing standards
   - Visual patterns and references
   - Brand personality options
4. Flags "design-system-enforcer" as essential skill when visual requirements detected
5. Updated skill-creator integration to embed design knowledge in visual/UI skills

**Sections Updated**: 
- Operating Principles (added Visual Quality First)
- New Step 5A (between Technology Analysis and Skill Identification)
- Integration with skill-creator (design system enforcement)

**Lesson Learned**: Visual requirements are not "polish"—they're foundational constraints that need research and enforcement from day 1. When vision mentions aesthetic/visual/beauty/design, automatically trigger design system discovery. Don't wait for user to request it or complain about results. Mother Brain should detect this need and proactively research visual best practices, creating skills that enforce consistency against external design standards (not personal taste).

**Key Principle**: Mother Brain detects WHEN design knowledge is needed (visual keywords in vision), skill-creator acquires and embeds WHAT that design knowledge is (research-based guidelines), skills ENFORCE consistency through validation. Keeps Mother Brain project-agnostic while ensuring visual quality is baked in from the start.


## 2026-02-04 14:05:49 - Project Ejected

**Project Name**: Snakes and Ladders  
**Reason**: Testing/prototyping complete, resetting to framework  
**Files Removed**:
- Project files: index.html, styles.css, board-renderer.js, game-state.js, game-controller.js, animator.js, celebration.js
- Documentation: docs/vision.md, docs/roadmap.md, docs/tasks/ (9 tasks), docs/session-state.json
**Skills Removed**: 
- board-game-renderer
- game-piece-animator
- game-ai-engine
- game-state-manager
**Files Preserved**: 
- docs/learning-log.md
- Core framework skills (mother-brain, skill-creator, skill-trigger-detector)
- Framework configuration (.vscode/, .gitignore, README.md)
**Learnings Preserved**: All learning log entries including:
- Post-task reflection system improvements
- Self-learning automation (removed approval gates)
- Design system discovery for visual projects


---

## 2026-02-04 - Eject Missing README.md Cleanup
**Issue Type**: Something broke or didn't work
**User Report**: "There was a README file left over from a previous session so I don't think eject worked properly - when creating vision, edit README.md failed with 'No match found'"
**Problem**:
  - Step 2B.5 (Execute Deletion) listed specific files to delete but missed README.md
  - After eject, old project's README.md persisted
  - New project's vision creation tried to edit README.md assuming fresh state
  - Edit failed because old content didn't match expected patterns
**Root Cause**: 
  - Eject step was too conservative - only listed .mother-brain/ files
  - README.md is project-specific content but was in the "keep" category implicitly
**Fix Applied**:
  - Added Remove-Item README.md -Force -ErrorAction SilentlyContinue to Step 2B.5
  - Updated Step 2B.4 (Show Deletion Plan) to display README.md in files to delete
**Sections Updated**: Step 2B.4 (Show Deletion Plan), Step 2B.5 (Execute Deletion)
**Lesson Learned**: 
  - Project-level files (README.md, package.json, etc.) should be ejected too
  - Eject should leave repo in "framework-only" state ready for new project
  - Be explicit about what "project artifacts" means - includes root-level project files
**Impact**: Future eject operations will properly clean up README.md, preventing new project failures.

---

## 2026-02-04 - Post-Update Menu Missing "Another Improvement" Option
**Issue Type**: A feature is missing
**User Report**: "Whenever a new update is done and you're asking what to do next, there should be an option for making another improvement"
**Problem**:
  - After completing an update to Mother Brain, the menu only offered:
    1. Restart Mother Brain
    2. Continue
  - No way to chain multiple improvements in one session
  - User had to return to main menu and re-select "Update Mother Brain"
**Fix Applied**:
  - Added "Report another issue/improvement" as a third choice in Session Restart menu
  - Added handler: loops back to beginning of Step 2A if selected
  - Reordered: "Continue" is now first (recommended default)
**Sections Updated**: Step 2A (Session Restart section)
**Lesson Learned**: 
  - Self-improvement flows should support iteration/chaining
  - After completing one update, user likely has more feedback
  - "Report another" pattern is common in support/feedback systems
**Impact**: Users can now chain multiple improvements without navigating back to main menu.

---

## 2026-02-04 - Missing Step Transitions Caused Incomplete Setup
**Issue Type**: Something broke or didn't work
**User Report**: "I started a new project with Mother Brain but it never created any skills - why did this happen?"
**Problem**:
  - Vision document was created successfully (Step 4)
  - But Steps 5-8 (Research, Skills, Roadmap, Tasks) were never executed
  - Project was left incomplete with just a vision document
  - Session ended or agent didn't proceed after vision confirmation
**Root Cause**: 
  - Steps 4, 5, 5A, 6, 6A lacked explicit "proceed to next step" instructions
  - Agent could interpret each step as a stopping point
  - No clear instruction that the full setup flow (Steps 3-8) must complete as a unit
**Fix Applied**:
  - Added explicit transition instructions at the end of:
    - Step 4: "After user confirms vision: Proceed immediately to Step 5"
    - Step 5: "After user confirms: Proceed to Step 5A or Step 6"
    - Step 5A: "After completing: Proceed immediately to Step 6"
    - Step 6: "After skills are created: Proceed immediately to Step 6A"
    - Step 6A: "After delivery strategy confirmed: Proceed immediately to Step 7"
  - Added note: "Do NOT stop or return to menu - the full setup flow (Steps 5-8) must complete"
**Sections Updated**: Steps 4, 5, 5A, 6, 6A
**Lesson Learned**: 
  - Multi-step workflows need explicit transition instructions
  - Never assume agent will automatically flow to next step
  - Critical flows (like project setup) should be marked as "must complete as a unit"
**Impact**: Future project setups will complete the full flow (vision → research → skills → roadmap → tasks) without gaps.

---

## 2026-02-04 - Branded Menu Styling Added
**Issue Type**: I have a suggestion for improvement
**User Report**: "Can we make this little selection menu more branded when we're in the Mother Brain menu? like retro purple borders and stuff?"
**Improvement**:
  - Added "Branded Menu Styling" to Operating Principles
  - Created new "Branded Menu Frame" section in Universal Patterns
  - Defined consistent ASCII box-drawing template using box characters
  - Added 🧠 MOTHER BRAIN header to all menus
  - Created examples for Welcome Back and Selection menus
**Sections Updated**: Operating Principles, Universal Patterns (new section)
**Styling Details**:
  - Uses box-drawing chars: ╔═══╗, ║, ╚═══╝
  - Header separator: ╠═══╣
  - Max width: 62 characters
  - Brain emoji: 🧠 for brand identity
**Impact**: All Mother Brain menus now have consistent retro terminal styling, reinforcing the brand identity.

---

## 2026-02-04 - Simplified Visual Branding
**Issue Type**: I have a suggestion for improvement
**User Report**: "Remove the ASCII art and the alien emojis and the vision driven development and the vision driven sections. We just need the box"
**Changes Made**:
  - Removed ASCII art from Step 1 (now just proceeds to Step 2)
  - Removed alien emoji (👽) from welcome screen
  - Removed footer decoration ("< < < VISION DRIVEN > > >")
  - Kept only the clean branded box with 🧠 emoji in header
**Sections Updated**: Step 1, Branded Menu Frame section
**Result**: Cleaner, more minimal visual identity - just the essentials
**Impact**: Mother Brain now has a simpler, less cluttered appearance while retaining brand identity via the box header.

---

## 2026-02-04 - Project Ejected
**Project Name**: UK Coffee Finder
**Reason**: Testing/prototyping complete, resetting to framework
**Files Removed**: 
  - uk-coffee-finder/ (project source)
  - docs/ (root docs folder)
  - .mother-brain/docs/vision.md
  - .mother-brain/docs/roadmap.md
  - .mother-brain/docs/tasks/ (3 task files)
  - .mother-brain/session-state.json
  - README.md
**Skills Removed**: None (no project skills were created)
**Files Preserved**: learning-log.md, core framework skills
**Learnings Preserved**: All previous entries in learning log

---

## 2026-02-04 - Update Mother Brain Option Missing from New Project Menu
**Issue Type**: A feature is missing
**User Report**: "When Mother Brain skill is launched it should always have the option to update Mother Brain"
**Problem**:
  - New project menu (Step 2, new project branch) only had:
    - "Yes, start vision discovery"
    - "I have a vision document already"
    - "Show me an example first"
    - "Report Issue"
  - Missing "Update Mother Brain" option that exists in returning project menu
**Fix Applied**:
  - Replaced "Report Issue" with "Update Mother Brain (report issues/improvements)"
  - This is more discoverable and consistent with returning project menu
**Sections Updated**: Step 2 (new project menu choices)
**Lesson Learned**: 
  - All Mother Brain menus should have consistent options for self-improvement
  - "Update Mother Brain" is more user-friendly than "Report Issue"
**Impact**: Users can now improve Mother Brain from any state (new or existing project).

---

## 2026-02-04 - Removed Markdown-Triggering Characters from Branding
**Issue Type**: Something broke or didn't work
**User Report**: "The text inside the Mother Brain branding keeps going red and I don't know why"
**Problem**:
  - Text inside the branded box was rendering in red
  - Likely caused by terminal/CLI interpreting certain characters as markdown
  - Suspects: '>' (blockquote), '-' (list item), '----' (horizontal rule)
**Root Cause**: 
  - Terminal or Copilot CLI markdown renderer applies styling to these characters
  - This is outside SKILL.md control but we can avoid triggering it
**Fix Applied**:
  - Removed '>' prefix from menu titles
  - Removed '-' bullet points from content lines
  - Changed progress bars from [####----] to [####....] (dots instead of dashes)
  - Updated Theme Elements and Styling Rules sections
  - Updated all example menus
**Sections Updated**: Branded Menu Frame (template, elements, rules, examples)
**Lesson Learned**: 
  - Avoid markdown-significant characters inside branded output
  - Terminal rendering varies; stick to truly neutral ASCII
  - Characters to avoid in content: '>', '-' (at line start), '----' sequences
**Impact**: Branded menus should now render without unexpected color styling.

---

## 2026-02-04 - Replaced ASCII Box with Simple Header Format
**Issue Type**: Something broke or didn't work
**User Report**: "Only the words are red - the border is fine" (continuing from previous fix attempt)
**Problem**:
  - ASCII box with code fence wrapping caused red text in terminal
  - Removing '>' and '-' characters didn't fix it
  - The code fence + box pattern combination triggered CLI styling
**Root Cause**: 
  - Copilot CLI's markdown renderer applies syntax highlighting to code blocks
  - Text content inside ASCII box within code fence was being styled red
  - This is a CLI rendering behavior, not controllable via SKILL.md
**Fix Applied**:
  - Replaced entire ASCII box format with simple header style
  - New format: 🧠 **MOTHER BRAIN** header + plain text content
  - Use horizontal rules (---) for visual framing instead of box
  - Use bullet character • instead of '-' for lists
  - Added explicit note: "Do NOT wrap in code fences when displaying"
**Sections Updated**: Branded Menu Frame (complete rewrite)
**Lesson Learned**: 
  - Code fences in CLI output can trigger unwanted syntax highlighting
  - Simple markdown formatting is more reliable than ASCII art
  - When visual styling causes issues, prefer content clarity over decoration
**Impact**: Mother Brain menus now display without red text styling.

---

## 2026-02-04 - Added No Question Duplication Principle
**Issue Type**: I have a suggestion for improvement
**User Report**: "There is some duplication in the command line and the selection box. For example, there's a bullet then 'asking user: Please describe your suggestion' then below that in the box it says 'please describe your suggestion' - it always repeats it."
**Problem**:
  - Agent was outputting question text in response BEFORE calling ask_user
  - ask_user tool ALSO displays the question in its UI
  - Result: user sees the same question twice
**Root Cause**: 
  - No explicit guidance to avoid duplicating ask_user's question parameter
  - Agent naturally writes context + question, then calls tool with same question
**Fix Applied**:
  - Added new Operating Principle: "No question duplication"
  - Rule: Do NOT repeat the question in text output before calling ask_user
  - Only include context/explanation text, not the question itself
  - Also updated Branded Menu Styling to reflect new simple format
**Sections Updated**: Operating Principles
**Lesson Learned**: 
  - When tools display their own prompts, don't duplicate in text output
  - Keep pre-tool text to context/explanation only
  - Less is more in CLI output
**Impact**: Future sessions should have cleaner output without question repetition.

---

## 2026-02-04 - Added Vertical List Formatting Rule
**Issue Type**: I have a suggestion for improvement
**User Report**: "I'd like Mother Brain not list out tasks in this horizontal way, it makes it harder to read, it should be in a table or vertical points"
**Problem**:
  - Tasks were displayed as horizontal comma-separated list
  - Hard to scan and read in terminal output
**Fix Applied**:
  - Added Operating Principle: "Vertical list formatting"
  - Rule: Use vertical bullet points or tables instead of horizontal lists
**Sections Updated**: Operating Principles
**Lesson Learned**: Terminal output is easier to read when lists are vertical, not horizontal
**Impact**: All future task/option lists will be displayed vertically.

## 2026-02-04 - Timeline Questions Removed (Quality-First)
**Issue Type**: Suggestion for improvement
**User Report**: "Timeline questions are degrading quality. Weekend project leads to skipped skills and shortcuts. AI can do a weekend project in minutes anyway. Always aim for best quality regardless of perceived size. Focus on vision, features, problem, audience - not artificial time constraints."
**Root Cause**:
  - Step 3 included "What's your timeline?" as a core discovery question
  - Short timelines (e.g., "weekend project") triggered reduced quality:
    - Fewer skills created
    - Less design research
    - More rework needed later
  - Timeline is irrelevant to AI execution - quality should be constant
**Fix Applied**:
  - **Removed** "Timeline" question from Step 3 Core Questions
  - **Added** explicit note: "Do NOT ask about timeline/duration"
  - **Updated** Constraints question to exclude time (now: "Budget, skills, tech preferences")
  - **Updated** vision document template section from "Timeline & Constraints" to just constraints
  - **Added** new Operating Principle: "Quality-First Execution"
**Sections Updated**:
  - Operating Principles (added Quality-First Execution)
  - Step 3 Core Questions (removed timeline, updated constraints)
  - Step 4 Vision Document Template (updated section name)
**Lesson Learned**: AI execution time is not a human constraint. Every project deserves the same quality treatment: proper research, design thinking, skill creation, and best practices. "Weekend project" vs "enterprise project" makes no difference to output quality standards.

## 2026-02-04 - Simplified Menu Format
**Issue Type**: Suggestion for improvement
**User Report**: "I like the brain icon and text but find the format and branding hard to read. Can go back to original? But without ASCII art or 'Vision-Driven Development' bit."
**Root Cause**:
  - Previous format used markdown tables which are hard to read in terminals
  - Bold **MOTHER BRAIN** header with horizontal rules was cluttered
  - User found original bullet-point format cleaner
**Fix Applied**:
  - Changed header format from "🧠 **MOTHER BRAIN**" to "🧠 Welcome back to [Project]!"
  - Removed horizontal rules (---) around menu blocks
  - Removed markdown tables, replaced with bullet points (•)
  - Kept 📍 emoji for status section
  - Explicitly noted: No ASCII art, no "Vision-Driven Development" tagline
**Sections Updated**:
  - Universal Patterns → Branded Menu Frame (complete rewrite)
**Lesson Learned**: Simple bullet-point formatting with emoji markers is more readable in terminal environments than tables, bold headers, or horizontal rules.

## 2026-02-04 - Project Ejected
**Project Name**: Snakes and Ladders
**Reason**: User requested eject
**Files Removed**: 
  - .mother-brain/docs/vision.md
  - .mother-brain/docs/roadmap.md
  - .mother-brain/docs/tasks/
  - .mother-brain/session-state.json
  - README.md
**Files Pending Manual Deletion**:
  - snakes-and-ladders/ (locked by another process)
**Skills Removed**: None (no project skills created)
**Files Preserved**: learning-log.md, core framework skills
**Learnings Preserved**: All entries in learning log

## 2026-02-04 - Enforce Vertical Bullet Points
**Issue Type**: Suggestion for improvement
**User Report**: "Can you make mother brain have its responses of bullet points to be on different lines rather than trying to cram them all horizontally?"
**Root Cause**:
  - Operating principle mentioned vertical formatting but wasn't strong enough
  - Agent was still occasionally cramming bullets horizontally
**Fix Applied**:
  - Strengthened "Vertical list formatting" principle with explicit "ALWAYS" and "one item per line"
  - Added: "Never use horizontal comma-separated lists or inline bullet points"
  - Added: "Each bullet point (•) must be on its own line"
  - Added: "This applies to ALL output"
**Sections Updated**:
  - Operating Principles → Vertical list formatting
**Lesson Learned**: Formatting rules need to be explicit and absolute ("ALWAYS", "NEVER") to be consistently followed.

## 2026-02-04 - Use Standard Markdown Dashes for Lists
**Issue Type**: Suggestion for improvement (continued)
**User Report**: "just default ai formation command line"
**Root Cause**:
  - Was using special bullet character (•) which doesn't render well in all terminals
  - Standard markdown dashes (-) are more universally supported
**Fix Applied**:
  - Updated "Vertical list formatting" principle to specify dashes (-) instead of bullet chars (•)
  - Replaced all 46 instances of bullet character (•) with dash (-) in SKILL.md
  - Examples now use standard markdown format
**Sections Updated**:
  - Operating Principles → Vertical list formatting
  - All examples throughout SKILL.md
**Lesson Learned**: Use standard markdown formatting (dashes for lists) for maximum terminal compatibility. Avoid special characters.

## 2026-02-04 - Added Mandatory Checkpoint for Steps 5-6A
**Issue Type**: Something broke or didn't work
**User Report**: Agent skipped Steps 5 (Technology & Pattern Analysis), 5A (Design System Discovery), and 6 (Skill Identification) entirely. Went straight from vision confirmation to roadmap creation without research or skills.
**Root Cause**:
  - The instruction "Proceed immediately to Step 5" existed but was ignored
  - No explicit blocker/checkpoint to prevent skipping
  - Agent treated user's "Yes, this captures it perfectly" as permission to rush ahead
**Fix Applied**:
  - Added prominent "⚠️ MANDATORY CHECKPOINT - DO NOT SKIP" section after Step 4
  - Listed all required steps as checklist: Step 5, 5A, 6, 6A
  - Added explicit warning: "NEVER skip directly to roadmap creation"
  - Added self-check instruction: "If you find yourself about to create a roadmap without having done research and created skills, STOP and go back"
**Sections Updated**:
  - Step 4 (Vision Document Creation) - added mandatory checkpoint block
**Lesson Learned**: Instructions to "proceed to X" are not enough. Need explicit STOP signs and self-check instructions to prevent workflow shortcuts. Make the consequence of skipping clear.

---

## 2026-02-04 - Guided External Service Setup (Skill-Creator Update)
**Issue Type**: UX improvement
**User Report**: "This is a pretty important step for the user. The average product person won't know how to setup a supabase project or what it is even for. You can't expect to just dump it on them. You need to give them instructions and help them through the process. You need to explain these things not as technology terms, but what is needed from the user and how you will guide them through."
**Root Cause**: When skills require external services (Supabase, APIs, cloud platforms), the agent dumped technical instructions on users instead of guiding them step-by-step.
**Fix Applied**:
- Added "Guided external service setup" principle to skill-creator's Operating Principles
- Principle requires:
  - Plain language explanations of WHAT and WHY
  - Time estimates ("This takes about 5 minutes")
  - Step-by-step guidance with checkpoints
  - Translation of technical terms (e.g., "API key" → "secret password")
  - Option to pause and resume later
  - Product owner perspective, not developer perspective
**Sections Updated**: skill-creator/SKILL.md - Operating Principles
**Lesson Learned**: Technical setup steps are user experience moments, not just documentation. Users are product owners who want to achieve a goal, not developers who understand infrastructure. Every external service setup should feel like a guided tour, not a manual.
