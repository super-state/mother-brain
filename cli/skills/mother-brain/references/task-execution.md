# Task Execution — Full Procedure


   **⛔ MANDATORY TASK START GATE - DO NOT SKIP**
   
   Before implementing ANY task, you MUST complete this gate:
   
   **Step 9.0: Story Start Assessment**
   
   1. **Load Project Brain** (if exists):
      - Read `.mother-brain/project-brain.md`
      - Review "Validation Checks" section
      - Check "Style & Tone" preferences for relevant categories
      - **Check skill tracking sections**:
        - `skillsCreated`: Skills that exist and are available
        - `skillsPending`: Skills identified but not yet created
        - `skillsNeededForTasks`: Map of which tasks need which skills
      - **If this task needs a pending skill**:
        - Create that skill NOW before implementing task
        - Update skillsCreated and skillsPending arrays
        - Validate skill works before proceeding
   
   2. **Analyze Task Requirements**:
      - What creative/visual/narrative elements does this task involve?
      - What domain knowledge is required?
      - What style/tone preferences apply?
      - **What technologies/platforms does this task use?** (for Elder Brain check)
   
   2.5. **CHECKPOINT: Consult Elder Brain for This Task**
      - Extract technology/platform mentions from task title, description, and deliverables
      - Invoke Elder Brain RETRIEVE for each technology
      - Elder Brain returns known gotchas and defensive patterns (or "no knowledge found")
      
      - If gotchas found:
        - Display relevant gotchas for awareness
        - Apply defensive patterns automatically during execution
        ```
        🧙 Elder Brain: [Technology]
        
        Known gotchas for this task:
        - [gotcha 1]
        - [gotcha 2]
        
        Applying defensive patterns automatically.
        ```
      
      - If NO gotchas found:
        - Note: "No Elder Brain knowledge for [technology]"
        - Plan to contribute back via Elder Brain RECEIVE after task
   
   **Step 9.0.1: Blocking Dependencies Collection (MANDATORY)**
   
   Before starting ANY story, identify what the AI CANNOT do autonomously:
   
   **Check for these dependency types:**
   - **Account/Service Setup**: Creating accounts, subscribing to services, accepting terms of service
   - **API Keys & Credentials**: Obtaining keys, secrets, OAuth tokens the AI cannot generate
   - **External Configuration**: Setting up third-party consoles, enabling features in dashboards
   - **Physical Actions**: Device setup, hardware configuration, local installations the AI can't perform
   - **Payment/Billing**: Anything requiring financial transactions
   
   **If ANY blocking dependencies found:**
   ```
   ⏸️ Before I can work autonomously on this story, I need you to:
   
   1. [Blocking dependency 1 - what exactly to do]
   2. [Blocking dependency 2 - what exactly to do]
   3. [Blocking dependency 3 - what exactly to do]
   
   Let me know when these are ready, or if you need help with any step.
   ```
   
   - **WAIT for user confirmation before proceeding**
   - Update session-state.json with `blockingDependencies` array
   - When user confirms, verify programmatically where possible (see VERIFICATION OVER TRUST principle)
   - Only proceed to implementation when all blocking dependencies resolved
   
   3. **Skill Sufficiency Check** (CRITICAL):
      - List existing skills in `.github/skills/`
      - For EACH creative/specialized element in this task, ask:
        - "Is there a skill that covers this?"
        - "Does that skill have the domain knowledge needed?"
        - "Does that skill know this project's style preferences?"
      - If ANY answer is "No" → STOP and address before implementing
   
   4. **User Discovery Questions** (if gaps found):
      - Before creating missing skills, ask user about preferences:
        - "What style/tone do you want for [element]?"
        - "Any examples or references I should look at?"
        - "Any specific conventions or requirements?"
      - Store answers in Project Brain AND use them for skill creation
      - **Note**: For broader preference discovery beyond skills (layout, interaction patterns, UX choices), see **Step 9.1: Mini Discovery**
   
   5. **Skill Creation/Enhancement** (if needed):
      - Research the domain (web_search for best practices)
      - Invoke skill-creator with user preferences + research
      - Validate skill was created successfully
      - Log in Project Brain: "Skills Created for This Project"
   
   6. **Proceed to Implementation**:
      - Only after gate passes, begin actual implementation
      - Use appropriate skills for execution
   
   Display at task start:
   ```
   🎯 Task [Number] Start Assessment
   
   📘 Project Brain:
   - Style preferences: [found/not found]
   - Validation checks: [X] checks to run
   - Skills created: [X] available
   - Skills pending: [Y] identified for later
   - This task needs: [list pending skills this task requires, if any]
   
   🛠️ Skill Coverage:
   - [element 1]: [skill-name] ✅ or [PENDING - creating now] ⏳ or [MISSING] ❌
   - [element 2]: [skill-name] ✅ or [PENDING - creating now] ⏳ or [MISSING] ❌
   
   [If all covered]: Proceeding to implementation...
   [If pending skills needed]: Creating required skills first...
   [If gaps]: Need to address gaps before implementing...
   ```
   
   ---

   **Step 9.1: Mini Discovery (On-Demand Preference Check)**

   Mini Discovery is a lightweight discovery phase that triggers MID-BUILD when Mother Brain identifies it knows the OUTCOME but not the SPECIFICS of how the user wants it delivered. It's like a focused version of Vision Discovery (Step 3) that happens during task execution.

   **When to Trigger (ANY of these):**
   - Task involves **user-facing output** (UI, content, messaging, branding) and Project Brain has no style preferences for this category
   - Task has **multiple valid approaches** and user hasn't indicated preference (e.g., modal vs page, tabs vs accordion, dark vs light)
   - Task involves **creative/aesthetic choices** (color, layout, tone, personality)
   - Task requires **workflow/interaction design** (how will users actually USE this feature?)
   - Mother Brain catches itself about to **guess or assume** specifics the user hasn't specified

   **When to SKIP:**
   - Technical infrastructure (CI/CD, database migrations, dependency installs)
   - Bug fixes with clear reproduction steps and expected behavior
   - Tasks where Project Brain already has documented preferences for this category
   - Tasks where the user explicitly said "just make it work, I'll refine later"

   **Mini Discovery Process:**

   1. **Identify the Unknowns** — List what you DON'T know:
      ```
      🔍 Mini Discovery — Task [Number]

      I know the goal: [outcome]
      But I need to understand:
      - [Unknown 1: e.g., "How should the settings page be laid out?"]
      - [Unknown 2: e.g., "What tone should error messages use?"]
      - [Unknown 3: e.g., "Should this be a modal or a full page?"]
      ```

   2. **Ask Targeted Questions** — NOT open-ended. Offer concrete options:
      ```
      For [unknown], which approach do you prefer?
      1. [Option A] — [brief description/tradeoff]
      2. [Option B] — [brief description/tradeoff]
      3. [Option C] — [brief description/tradeoff]
      
      Reply with the number or describe what you have in mind.
      ```
      - Ask 1-3 questions max per Mini Discovery (don't overwhelm)
      - Show visual examples or references when possible
      - If user says "you decide" → pick the most common/conventional approach and note it in Project Brain

   3. **Research if Needed** — If user references something unfamiliar:
      - Use `web_search` to find examples, patterns, or best practices
      - Show user what you found: "Here's what [reference] looks like — is this the direction?"

   4. **Record Discoveries** — Update Project Brain with new preferences:
      - Add to Style & Tone section
      - Add to Validation Checks if applicable
      - Update vision doc if discoveries reveal scope changes

   5. **Expand Roadmap if Needed** — If Mini Discovery reveals:
      - The task is bigger than estimated → split into sub-tasks
      - A prerequisite is missing → add it before current task
      - A new feature emerged from discussion → add to roadmap backlog
      - Display: "📋 Roadmap updated with [X] new items from Mini Discovery"

   6. **Build/Update Skills** — If discoveries reveal domain knowledge:
      - Create or update skills with user preferences
      - These skills now carry the user's specific choices for future tasks

   **Display at Mini Discovery start:**
   ```
   🔍 Mini Discovery — before I build this, let me understand what you're looking for...
   ```

   **Display at Mini Discovery end:**
   ```
   ✅ Mini Discovery complete — proceeding with implementation
   📘 Project Brain updated with [X] new preferences
   ```

   **KEY PRINCIPLE**: The goal is to understand HOW the user will experience the outcome, not just WHAT the outcome is. A login page can be minimal or elaborate, friendly or corporate, social-login-first or email-first — Mini Discovery captures these specifics so Mother Brain builds what the user actually envisioned.

   ---

   - **Pre-Task Analysis** (after gate passes):
     - Load current task document
     - Look ahead at next 3-5 tasks in current phase
     - Identify patterns across these tasks that might warrant new skills
     - If patterns found:
       - Invoke skill-creator to create skills proactively
       - Do NOT ask user for approval (Expert Autonomy)
   
   - **DATA EXPOSURE CHECK (MANDATORY - BLOCKING GATE)**:
     - Before implementing ANY task, check:
       - Does this task involve displaying/exposing user or customer data?
       - Data types to watch for: PII, orders, payments, health records, personal info, financial data, private messages, user activity
     - If task exposes sensitive data:
       1. Check if authentication/authorization exists in project
       2. If NO auth exists → BLOCK implementation
       3. Display: "⚠️ BLOCKED: This task exposes [data type] without access control. Authentication required first."
       4. Check roadmap for auth task → If missing, add "Authentication & Authorization" task to Phase 1
       5. Guide user: "Let's implement authentication before continuing with data-facing features"
     - This is a BLOCKING GATE - do NOT implement data-exposing features without access control
     - Only unblock when auth is implemented OR user explicitly confirms data is public/non-sensitive
   
   - **MANDATORY Skill Check for Creative/Visual/Narrative Tasks**:
     - Before implementing ANY task that involves:
       - **Visual art**: Pixel art, sprites, character design, scene backgrounds, UI design
       - **Narrative**: Dialogue, story text, character voice, personality writing
       - **Audio**: Sound design, music, audio cues
       - **Animation**: Movement cycles, visual effects, transitions
     - MUST check `.github/skills/` for relevant existing skills
     - If NO relevant skill exists:
       1. STOP implementation immediately
       2. Research the domain (use web_search for best practices)
       3. Invoke skill-creator to create the required skill(s)
       4. THEN resume task execution using the new skill(s)
     - This is NON-NEGOTIABLE for quality - never improvise creative work without proper skill creation
     - Example triggers:
       - "Pixel art horses" → requires pixel-art-renderer skill
       - "Personality dialogue" → requires game-narrative-designer skill
       - "Stable background scene" → requires pixel-art-renderer skill
       - "Character expressions" → requires both pixel-art-renderer AND game-narrative-designer
   
   - **Mid-Task Skill Detection (MANDATORY)**:
     - During task execution, continuously check: "Is this task revealing a reusable pattern?"
     - Patterns that warrant skill creation:
       - **Complexity**: Task requires 100+ lines of specialized code
       - **Domain expertise**: Task needs research into a specific domain (audio, networking, AI, etc.)
       - **Reusability**: Pattern would apply to other projects of this type
       - **Wizard opportunity**: Future invocations would benefit from discovery questions
     - If pattern detected mid-task:
       1. Complete current task manually (don't interrupt for skill creation)
       2. After task completion, before validation, note: "This task revealed a skill opportunity"
       3. Add to post-task reflection: "[domain]-skill could automate this for future projects"
       4. In Step 10B, create the skill for future use
     - Example patterns that should trigger skill creation:
       - Game sound design → game-sound-designer skill
       - Database schema design → schema-generator skill  
       - API integration → api-integrator skill
       - Animation systems → animation-engine skill
   
   - **Skill Matching**:
     - **Check `.github/skills/`** for all skills (framework + project-specific)
     - Scan task requirements against available skill capabilities
     - Identify which skills to use (if any)
     - Project skills are differentiated by `skillsCreated` array in session-state.json
   
   - **Working Directory & Platform Patterns**: Consult Elder Brain for platform-specific patterns (working directory management, Windows directory creation). See `experience-vault/platforms/working-directory-management.md` for known gotchas. Key rule: never assume working directory persists between tool calls — use absolute paths or explicit `Set-Location`.
   
   - **Execution**:
     - If skill exists: Invoke it using `skill` tool with task context
     - If no skill: Execute task following approach in task doc
     - Log decisions and progress in task document's "Notes & Decisions" section
     - Create deliverables as specified
   
   - **Error Detection** (if issues occur during execution):
     - If build fails, tests fail, or output is broken:
       - Don't just fix and move on
       - Jump to **Step 9A: Error Detection & Self-Healing**
