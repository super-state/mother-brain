# Idea Capture & Prioritization — Full Procedure

   - When user selects "💡 I have a new idea" from ANY menu:
   
   **Purpose**: Let users quickly capture ideas mid-project without derailing current work. Ideas are analyzed against the vision, prioritized, and inserted into the roadmap at the right position. The user never loses an idea, and the current plan stays intact unless the idea is truly urgent.
   
   **Step 2F.1: Capture the Idea**
   
   - Display:
     ```
     💡 New Idea Capture
     
     Tell me your idea — what is it and what would it achieve?
     Don't worry about where it fits yet, just get it down.
     ```
   
   - Use `ask_user` with `allow_freeform: true` (no predefined choices — pure capture mode)
   
   **Step 2F.2: Analyze & Score the Idea**
   
   - Load `.mother-brain/docs/vision.md` (for alignment check)
   - Load `.mother-brain/docs/roadmap.md` (for context on existing tasks)
   - Load `.mother-brain/docs/value-framework.md` (for prioritization criteria)
   - Load `.mother-brain/project-brain.md` (for project preferences, if exists)
   
   - **Score the idea using the Value Framework** (if it exists):
     - Rate each dimension from the framework (1-5)
     - Multiply by weight
     - Calculate total priority score
     - Compare against existing task scores to determine placement
   
   - **If no Value Framework exists** (legacy projects), use basic analysis:
     1. **Vision Alignment**: How well does this idea serve the project's stated WHY and success criteria?
     2. **User Impact**: How much does this benefit the target users defined in the vision?
     3. **Effort Estimate**: Relative complexity — is this a single task or a multi-task effort?
     4. **Dependency Check**: Does this idea depend on existing tasks, or do existing tasks depend on it?
   
   - Determine priority level:
     - **🔴 Critical (insert into current phase)**: Directly blocks or significantly enhances the MVP. Aligns strongly with vision AND has high user impact.
     - **🟡 Important (next phase priority)**: Aligns well with vision but isn't needed for MVP. Should be tackled soon after current phase.
     - **🟢 Backlog (future enhancement)**: Nice-to-have that aligns with vision but can wait. Added to Future Enhancements.
   
   **Step 2F.3: Present Analysis to User**
   
   - Display (with Value Framework scores if available):
     ```
     💡 Idea Analysis
     
     Your Idea: [1-2 sentence summary of what they described]
     
     📊 Assessment:
     - Vision Alignment: [High/Medium/Low] — [brief reason]
     - User Impact: [High/Medium/Low] — [brief reason]
     - Effort: [Small (1 task) / Medium (2-3 tasks) / Large (new phase)]
     - Dependencies: [None / Depends on Task X / Blocks Task Y]
     [If Value Framework exists:]
     - Value Framework Score: [N] — ranked [position] out of [total] current tasks
     
     🎯 Recommended Priority: [🔴 Critical / 🟡 Important / 🟢 Backlog]
     
     Reasoning: [2-3 sentences explaining why this priority level was chosen,
     referencing Value Framework dimensions and current roadmap state]
     ```
   
   - Use `ask_user` with choices:
     - "Accept this priority — add to roadmap"
     - "I think it's more urgent than that"
     - "I think it's less urgent — backlog is fine"
     - "Let me refine the idea first"
     - "Discard — I changed my mind"
   
   **Step 2F.4: Handle Priority Override**
   
   - **If "Accept this priority"**: Proceed to Step 2F.5
   
   - **If "I think it's more urgent"**:
     - Bump priority one level up (🟢→🟡 or 🟡→🔴)
     - If already 🔴: Acknowledge and proceed
     - Display: `📘 Project Brain will remember this — you prioritize [idea type] higher than expected`
     - **Update Value Framework**: If user consistently overrides for certain types, adjust relevant dimension weights
     - Invoke Child Brain with preference context (user values this type of feature highly)
     - Proceed to Step 2F.5
   
   - **If "I think it's less urgent"**:
     - Bump priority one level down (🔴→🟡 or 🟡→🟢)
     - If already 🟢: Keep at backlog
     - Display: `📘 Project Brain will remember this — you prefer to defer [idea type]`
     - **Update Value Framework**: Log the override in the Evolution Log section
     - Proceed to Step 2F.5
   
   - **If "Let me refine the idea"**:
     - Return to Step 2F.1 with previous input as context
   
   - **If "Discard"**:
     - Display: "💭 No problem — idea discarded. Nothing was changed."
     - Return to the menu the user came from (Step 2 or Step 11)
   
   **Step 2F.5: Insert into Roadmap**
   
   - Based on final priority level:
   
   - **🔴 Critical (current phase insertion)**:
     1. Load roadmap and identify current phase tasks
     2. Determine optimal insertion point:
        - After dependencies are met
        - Before tasks that would benefit from this idea
        - If no dependencies: insert as next uncompleted task
     3. Create task number (next sequential number)
     4. Create task document in `.mother-brain/docs/tasks/[number]-[name].md`
     5. Insert task into `roadmap.md` at determined position
     6. **Renumber subsequent tasks if needed** to maintain order
     7. Display:
        ```
        ✅ Idea Added to Current Phase!
        
        📋 Task [Number]: [Task Name]
        - Priority: 🔴 Critical
        - Inserted: Phase [X], position [Y] of [Z]
        - Status: 🟡 Ready
        
        ⚠️ Current plan adjusted:
        - [Brief description of what moved to accommodate this]
        
        Your current task is still: [Current task name]
        This will be picked up [when in sequence].
        ```
   
   - **🟡 Important (next phase priority)**:
     1. Identify the next phase in roadmap (or create Phase N+1 if needed)
     2. Create task number
     3. Create task document
     4. Insert at the TOP of the next phase (high priority within that phase)
     5. Display:
        ```
        ✅ Idea Added to Next Phase!
        
        📋 Task [Number]: [Task Name]
        - Priority: 🟡 Important
        - Placed: Phase [X], position 1 (top priority)
        - Status: ⬜ Planned
        
        Current plan unchanged — this is queued for after [current phase name].
        ```
   
   - **🟢 Backlog (future enhancement)**:
     1. Add to "Future Enhancements" section of roadmap
     2. Create a lightweight task entry (no full task doc yet — created when promoted)
     3. Display:
        ```
        ✅ Idea Added to Backlog!
        
        📋 [Idea Name]
        - Priority: 🟢 Backlog
        - Section: Future Enhancements
        - Status: 💭 Captured
        
        Current plan unchanged. This will be reviewed during phase transitions.
        ```
   
   **Step 2F.6: Update Session State & Return**
   
   - Update `session-state.json` to reflect roadmap changes (new task count, etc.)
   - If task was added to current phase: Update `totalTasks` count
   
   - Display:
     ```
     💡 Idea captured! Back to where you were.
     ```
   
   - **Return to the menu the user came from**:
     - If came from Step 2 (main menu): Return to Step 2
     - If came from Step 11 (post-task menu): Return to Step 11
     - If came from mid-task: Resume task execution
   
   **Key Principles**:
   - **Speed over ceremony**: Get the idea down fast, analyze quickly, don't interrupt flow
   - **Vision is the compass**: Priority is always relative to the stated vision
   - **Current work is protected**: Only 🔴 Critical ideas touch the current phase
   - **Nothing is lost**: Even discarded ideas could be re-suggested if patterns emerge
   - **User has final say**: Mother Brain recommends priority, user can override
