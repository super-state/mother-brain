# Roadmap Generation — Full Procedure

   - **MVP-First Phasing Using Research Findings + Value Framework**:
   
   **Step 7.0: Load Value Framework**
   - Read `.mother-brain/docs/value-framework.md`
   - Use the priority dimensions and weights to order **outcomes** (not tasks)
   - Every outcome in the roadmap must be scored against the framework
   
   **Step 7.1: Define Phase 1 = MVP (Core User Needs)**
   - Phase 1 scope = shortest path to fulfill core user needs from vision
   - Use:
     - User Needs table from Step 4 (vision document) — filter by MVP=✅
     - Delivery research from Step 6A
     - Mother Brain's expert judgment on optimal scope
   - Mother Brain determines which user needs are essential for Phase 1 vs can wait
   - Each user need becomes an **Outcome** (📋 Ability to...)
   - Each outcome has **Acceptance Criteria** (testable by user)
   - Tasks are internal implementation details — user validates outcomes, not tasks
   
   **Step 7.2: Structure Post-MVP Work (Research-Driven)**
   - Phase 2+ content based on iteration pattern from Step 6A research
   - Use feedback mechanism identified in research
   - Mark clearly as "post-MVP" and "subject to learning/validation"
   - Don't over-plan: assume learnings will inform these phases
   
   **Step 7.3: Create `docs/roadmap.md` (Outcome-Driven Structure)**:
     ```markdown
     # [Project Name] - Roadmap
     
     ## Delivery Strategy (Research-Based)
     **Project Type**: [From Step 5 research]  
     **MVP Approach**: [From Step 6A research - what minimum viable means for this type]  
     **Launch Pattern**: [From Step 6A research - how to reach users]  
     **Iteration Strategy**: [From Step 6A research - how to improve post-launch]
     
     ---
     
     ## User Needs Traceability
     
     | User Need (from Vision) | Fulfilled By |
     |-------------------------|--------------|
     | Ability to [X] | Outcome 1, Outcome 3 |
     | Ability to [Y] | Outcome 2 |
     | Ability to [Z] | Outcome 4 (Phase 2) |
     
     ---
     
     ## Phase 1: MVP — [Core Problem Solution]
     
     **Goal**: Shortest path to deliver user value  
     **Success Gate**: User can [primary outcome from vision]  
     **Strategy**: Fulfill core user needs, defer everything else
     
     ---
     
     ### 📋 Ability to [do something concrete]
     
     > So [the benefit/why this matters — traced to user need]
     
      **Acceptance Criteria:**
      - [ ] [Testable condition 1 — user can verify this]
      - [ ] [Testable condition 2 — user can verify this]
      - [ ] [Testable condition 3 — user can verify this]

      **Demo / Proof (what the user will see):**
      - [What screen/page/flow will exist at the end of this outcome]
      - [How Mother Brain will open it for the user (browser/app route)]
      
      **Priority Score:** [N] (Vision: X, MVP: X, User Impact: X)
     
     **🔧 Tasks (internal — not shown to user during validation):**
     - Task 001: [Technical implementation step]
     - Task 002: [Technical implementation step]
     - Task 003: [Technical implementation step]
     
     ---
     
     ### 📋 Ability to [second outcome]
     
     > So [benefit — traced to user need]
     
      **Acceptance Criteria:**
      - [ ] [Testable condition 1]
      - [ ] [Testable condition 2]

      **Demo / Proof:**
      - [User-visible experience delivered]
      - [How it will be opened for validation]
      
      **Priority Score:** [N]
     
     **🔧 Tasks (internal):**
     - Task 004: [Technical step]
     - Task 005: [Technical step]
     
     ---
     
     ## Phase 2+: Post-MVP Iteration
     
     **Strategy**: [Iteration approach from Step 6A research]  
     **Trigger**: Phase 1 complete + user feedback  
     **Focus**: Learn from users and iterate
     
     ### 📋 Ability to [future outcome]
     
     > So [benefit]
     
      **Acceptance Criteria:**
      - [ ] [Criterion 1]
      - [ ] [Criterion 2]

      **Demo / Proof:**
      - [User-visible experience delivered]
      - [How it will be opened for validation]
      
      **Note**: Subject to validation — may change based on user feedback
     
     ---
     
     ## MVP Checkpoint (End of Phase 1)
     
     ✅ **Phase 1 Complete When ALL acceptance criteria verified for:**
     - Outcome 1: [name]
     - Outcome 2: [name]
     - Outcome 3: [name]
     
     **Validation Method**: User confirms each criterion with "Yes, I can do this"
     
     **Next Step After MVP**: [From Step 6A research]
     
     ---
     
     ## Future Enhancements (Post-MVP Backlog)
     
     **Defer Until After MVP** (nice-to-have):
     - 📋 Ability to [future feature 1]
     - 📋 Ability to [future feature 2]
     
     **Validation Required**: Don't build until validated by user feedback
     
     ---
     
     ## Internal Task Index
     
     > Tasks exist for implementation tracking but are NOT validated by user.
     > User validates outcomes (acceptance criteria), not tasks.
     
     | Task | Under Outcome | Status |
     |------|---------------|--------|
     | 001 | Ability to X | ⬜ |
     | 002 | Ability to X | ⬜ |
     | 003 | Ability to Y | ⬜ |
     
     ---
     
     ## Iteration & Learning Plan (Research-Based)
     
     **Feedback Collection** (from Step 6A research):
     - [How we'll gather user input for this project type]
     - [Metrics/analytics to track]
     
     **Iteration Cycle**:
     1. Complete Phase 1 outcomes
     2. User validates all acceptance criteria
     3. Collect feedback, analyze learnings
     4. Prioritize Phase 2 outcomes based on data
     
     ---
     
     ## Risk Mitigation
     
     **MVP Risks**: [Potential issues with Phase 1 approach]
     
     **Delivery Strategy**: Protect MVP outcomes at all costs. Phase 2+ can be deferred.
     
     ---
     
     **Total Tasks**: [Count]  
     **Phase 1 (MVP) Tasks**: [Count essential tasks]  
     **Post-MVP Tasks**: [Count - subject to change based on feedback]  
     **Estimated Timeline**: [From vision document]
     ```
   
   **Step 7.3.5: CHECKPOINT - Review Roadmap Against Elder Brain**
   - **Purpose**: Surface known pitfalls for the tech stack BEFORE task execution begins
   
   - For EACH technology/platform identified in roadmap tasks:
     1. Extract tech mentions from task descriptions
     2. Invoke Elder Brain RETRIEVE for each technology
     3. Elder Brain returns known gotchas or "no knowledge found"
     4. For each gotcha found: add defensive note to affected task descriptions in roadmap
     5. If no Elder Brain knowledge exists: note for research during task execution
   
   - Display:
     ```
     🧙 Elder Brain consulted
     - [X] technologies checked
     - [Y] known gotchas surfaced in roadmap
     ```
   
   - Update roadmap.md with Elder Brain references
   - This makes pitfalls visible BEFORE tasks start, not during failures
   
   **Step 7.4: Display Roadmap Summary** (No Approval Required)
     - Show roadmap structure to user (for transparency, not approval)
     - Display:
       ```
       📋 Roadmap Created - UK Coffee Discovery
       
       Phase 1 (MVP): [X] tasks
       - [Brief description of what MVP delivers]
       
       Phase 2+: [Y] tasks (subject to user feedback)
       
       Skills Ready: [List skills created]
       ```
     - **Proceed immediately** to Step 7.5 (Setup Complete Menu)
     - Do NOT ask user to approve roadmap - Mother Brain determined optimal phasing
   
   **Step 7.5: Setup Complete - What's Next?**
   - **⚠️ CRITICAL**: This is NOT the end of setup. Step 7.6 (Reflection) is MANDATORY before declaring complete.
   - Display setup completion summary:
     ```
     ✅ Setup Complete!
     
     📋 Vision: Captured
     🔍 Research: Complete
     🛠️ Skills: [X] created and validated
     📊 Roadmap: [Y] tasks across [Z] phases
     📄 First Task: [Task 001 name] ready
     
     🔄 Next: Running mandatory reflection (Step 7.6)...
     ```
   
   - Use `ask_user` with choices:
     - "Start Task 001 now"
     - "Review the full roadmap first"
     - "Review the vision document"
     - "I want to adjust something before starting"
   
   - **⛔ BLOCKING GATE**: Regardless of user selection, you MUST run Step 7.6 (Setup Validation & Self-Healing) BEFORE proceeding to the chosen action.
   
   - If "Start Task 001 now": Run Step 7.6 (mandatory), then proceed to Step 8 (Task Document Creation)
   - If "Review roadmap": Run Step 7.6 (mandatory), display full roadmap, then return to this menu
   - If "Review vision": Run Step 7.6 (mandatory), display vision summary, then return to this menu
   - If "Adjust something": Run Step 7.6 (mandatory), use `ask_user` to ask what needs adjusting, make changes, return to this menu
   
   - **DO NOT declare "setup complete" or proceed to ANY action without running Step 7.6 first**
   
   - Use outcome-focused language (what gets achieved, not just tasks)
   - Link Phase 1 tasks back to MVP criteria from vision
   - Mark post-MVP items clearly as "subject to validation"
   - Emphasize learning and iteration mindset
