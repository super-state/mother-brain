# MVP Complete & Beyond — Full Procedure

   - **When to run**: Automatically triggered when the last task in Phase 1 (MVP) is marked complete
   - **Purpose**: Help user achieve their actual "done" goal and chart path forward
   
   **Step 11A.1: Detect MVP Completion**
   - After any task is marked complete:
     - Load `docs/roadmap.md`
     - Check if all Phase 1 tasks are complete
     - If not all complete: Skip this step, proceed normally
     - If all Phase 1 complete: Proceed with MVP completion flow
   
   **Step 11A.2: Celebrate & Assess**
   - Display:
     ```
     🎉 MVP Complete!
     
     You've completed all Phase 1 tasks for [Project Name].
     
     ✅ What's Done:
     - [List key deliverables from Phase 1]
     
     📋 Original MVP Definition (from vision):
     - [MVP criteria 1]
     - [MVP criteria 2]
     - [MVP criteria N]
     
     Now let's make sure you achieve your actual goal.
     ```
   
   **Step 11A.3: Research "Done" Criteria for This Project Type**
   - Use `web_search` to research (project-agnostic):
     1. "[project type from roadmap] deployment best practices 2026"
     2. "[project type] CI/CD pipeline setup"
     3. "[project type] release checklist"
     4. "[project type] production launch requirements"
   
   - Extract delivery patterns:
     - **Deployment Options**: (Vercel, AWS, self-hosted, app stores, etc.)
     - **CI/CD Requirements**: (automated testing, build pipelines, etc.)
     - **Release Checklists**: (what needs to happen before "live")
     - **Monitoring/Observability**: (logging, error tracking, analytics)
   
   **Step 11A.4: Present "Done" Criteria Options**
   - Use `ask_user` with dynamically generated choices based on project type:
     - Example for web app: "Deploy to production (Vercel/Netlify)"
     - Example for web app: "Set up CI/CD pipeline (GitHub Actions)"
     - Example for mobile app: "Prepare app store submission"
     - Example for library: "Publish to npm/PyPI"
     - "My MVP is already 'done' - I just wanted it working locally"
     - "I need something else for 'done' (describe)"
   
   - Question: "What does 'done' mean for you? What makes this MVP complete?"
   
   - If user selects a delivery option:
     - Check if relevant skill exists (e.g., "deployment-manager", "cicd-setup")
     - If skill doesn't exist: Invoke skill-creator to create delivery skill
     - Execute delivery using appropriate skill
     - Validate deployment/release succeeded
   
   **Step 11A.5: Post-MVP Direction Menu**
   - After "done" criteria achieved (or skipped), present direction options:
   
   - Display:
     ```
     🧠 MVP Delivered! What's Next?
     
     Your project is now at a decision point:
     
     Current State:
     - Phase 1: ✅ Complete
     - "Done" Criteria: [Achieved/Skipped]
     - Phases Remaining: [Count]
     - Tasks in Post-MVP Backlog: [Count]
     ```
   
   - Use `ask_user` with choices:
     - "Extend roadmap - plan Phase 2 tasks in detail"
     - "Take a new direction - replan based on learnings"
     - "Add new features to roadmap (describe what you want)"
     - "Pause project - save progress and stop here"
     - "Continue exactly as planned in roadmap"
   
   **Step 11A.6: Handle User's Direction Choice**
   
   **If "Extend roadmap":**
   - Load Phase 2+ from roadmap (high-level items)
   - For each Phase 2+ item:
     - Break down into detailed tasks
     - Create task documents (like Step 8)
     - Identify patterns that need new skills
   - If new patterns detected: Create skills using skill-creator
   - Update roadmap with detailed tasks
   - Return to Step 11 (Roadmap Menu)
   
   **If "Take a new direction":**
   - Use `ask_user` (freeform): "What direction do you want to take the project?"
   - Re-run vision discovery (Step 3) with context of what exists
   - Generate new roadmap phases while preserving completed work
   - Create any needed new skills using skill-creator
   - Return to Step 11 (Roadmap Menu)
   
   **If "Add new features":**
   - Use `ask_user` (freeform): "What features do you want to add?"
   - Analyze feature description for skill patterns
   - If patterns detected that need skills:
     - Display: "I detect patterns that could benefit from new skills:"
     - List detected patterns
     - Invoke skill-creator for each pattern
   - Add features as new tasks to appropriate phase
   - Update roadmap
   - Return to Step 11 (Roadmap Menu)
   
   **If "Pause project":**
   - Save comprehensive session state
   - Display summary of what was achieved
   - Explain how to resume
   - End session
   
   **If "Continue as planned":**
   - Load next phase from roadmap
   - Proceed to first task of next phase
   - Return to Step 8 (Task Document Creation)
   
   **Step 11A.7: Skill Pattern Detection**
   - Throughout this step, monitor user's freeform inputs for skill patterns
   - When user describes new features/directions:
     1. Analyze description for repetitive patterns that warrant skills
     2. If patterns detected:
        - Display: "🎯 I detected patterns that could use specialized skills:"
        - List patterns with potential skill names
        - Proceed to create skills automatically (Expert Autonomy)
     3. For each pattern:
        - Invoke skill-creator with context
        - Validate skill works
        - Add to session-state.json skillsCreated array
   
   **Key Principles**:
   - **"Done" is user-defined**: Don't assume what "complete" means
   - **Research-driven delivery**: Use web search to find best practices for this project type
   - **Skill detection on new input**: Any time user describes new features, analyze for skill patterns
   - **Project-agnostic**: Works for web apps, mobile apps, libraries, CLIs, games, etc.
   - **Preserve learnings**: Replanning doesn't discard completed work or learned skills
