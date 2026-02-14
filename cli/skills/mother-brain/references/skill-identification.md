# Skill Identification & Creation — Full Procedure

   - **Dynamic Skill Discovery** (from Step 5 research findings):
     
     - For each **role/discipline** identified in research:
       - Evaluate if that role's work involves repetitive patterns
       - Example: Designer role → design system skill, brand guidelines skill
       - Example: QA role → testing automation skill, test plan generator
     
     - For each **technical pattern** identified in research:
       - Evaluate if pattern warrants a skill:
         - **Frequency**: Will this happen 3+ times in project?
         - **Complexity**: Is there wizard-worthy context to gather?
         - **Reusability**: Could this apply to other [project type] projects?
     
     - For each **documentation need** identified:
       - Consider if generation should be automated
       - Example: Architecture diagrams, API documentation, test plans
     
     - Categorize skills by necessity:
       - **Essential Skills** (create automatically): Core roles/patterns/needs required for MVP delivery
       - **Optional Skills** (offer choice): Nice-to-have features, post-MVP enhancements, documentation generators
     
     - Identify essential vs optional:
       - **Essential criteria**: Needed for MVP, core technical pattern (3+ uses), fundamental role (designer, QA, architect)
       - **Optional criteria**: Post-MVP features, one-time documentation, nice-to-have automation
     
     - Display categorized list (for transparency, not approval):
       ```
       🎯 Research-Based Skills Identified:
       
       Essential Skills (creating automatically):
       1. [skill-name] - [what role/pattern needs it] - [why essential for MVP]
       2. [skill-name] - [what role/pattern needs it] - [why essential for MVP]
       
       Optional Skills (creating if beneficial):
       3. [skill-name] - [what it does] - [when useful]
       4. [skill-name] - [what it does] - [when useful]
       ```
     
     - **Skill Creation Lifecycle Strategy**:
       - **Upfront Phase** (Step 6): Create minimum 3 foundational skills
         - Select 3 most critical skills from essential list
         - These provide core capabilities needed immediately
         - Document remaining identified skills in Project Brain
       
       - **Continuous Creation** (Throughout project):
         - Skills should be created throughout project lifecycle, not all upfront
         - At start of each task (Step 9), check Project Brain for:
           - Existing skills that apply to this task
           - Skills identified but not yet created (create now if task needs them)
           - New patterns emerging in this task (create new skills mid-task)
         - Project Brain tracks:
           - `skillsCreated`: Skills that exist
           - `skillsPending`: Skills identified but not yet created
           - `skillsNeededForTasks`: Map of which tasks need which skills
         
       - **Task-Start Skill Assessment** (Mandatory at Step 9):
         1. Load Project Brain before starting task
         2. Check which skills exist and apply to this task
         3. Check if task requires pending skills (create them now)
         4. Check if task reveals new skill needs (document in Project Brain)
         5. Use relevant skills during task execution
       
       - **Why This Approach**:
         - Minimum viable skill set upfront (3) doesn't delay project start
         - Skills created when actually needed = better context and design
         - Continuous skill creation = skills evolve with project understanding
         - Project Brain coordination = no duplicate skill creation
     
     
     - **Create Initial 3 Skills** (Upfront - minimum viable skill set):
       - Display: "🔨 Creating initial 3 skills for project..."
       - Select 3 most critical skills from essential list (based on immediate MVP needs)
       
       - **CHECKPOINT: Consult Elder Brain for Each Skill**
         - Before invoking skill-creator for each skill:
           1. Identify domains/technologies this skill will work with
           2. Invoke Elder Brain RETRIEVE for each technology
           3. Elder Brain returns known gotchas and patterns (or "no knowledge found")
           4. Pass Elder Brain results as context to skill-creator
       
       - For each of the 3 initial skills:
         - Show progress: "Creating [skill-name]..."
         - Invoke skill-creator with THREE knowledge sources:
           1. **Research findings** from Step 5 analysis (role/pattern/need)
           2. **Gotchas research** from Step 5.4.1 (project-specific research)
           3. **Elder Brain knowledge** (cross-project domain wisdom from RETRIEVE)
         - Let skill-creator run its wizard with all three knowledge sources
         - **Store created skills in `.github/skills/`** (CLI-discoverable location)
         - **Symlink to `.agents/skills/`** for Codex CLI compatibility
         - **Track in session-state.json**: Add skill name to `skillsCreated` array
         - **VALIDATE SKILL** (CRITICAL - prevents task execution failures):
           1. Check `.github/skills/[skill-name]/SKILL.md` exists
           2. Test invoke the skill with a simple "hello" or status check
           3. If invocation fails:
              - Show error: "⚠️ Skill [name] created but can't be invoked"
              - Diagnose issue (path, permissions, SKILL.md format)
              - Retry automatically up to 2 times
              - If still fails, log and continue - don't block on one skill
           4. Only mark complete if skill invokes successfully
         - Show completion: "✅ [skill-name] created and validated"
       
       - **Document remaining skills in Project Brain**:
         - Create/update `.mother-brain/project-brain.md` with:
           - `skillsCreated`: [list of 3 created skills]
           - `skillsPending`: [list of remaining identified skills]
           - `skillsNeededForTasks`: Map of which upcoming tasks will need which pending skills
         - Display: "📘 Documented [N] additional skills for later creation"
       
       - **After initial 3 skills created**:
         - Display summary: "Initial skills ready: [list of 3 validated skills]"
         - Display: "Additional skills will be created as tasks require them"
         - Log in session-state.json: skillsCreated array with validated names
         - This ensures Step 9 can reliably invoke these skills
         - **Proceed immediately** - do not ask user to approve skills created
   - **After skills are created**: Proceed immediately to Step 6A (Delivery Strategy Research)
