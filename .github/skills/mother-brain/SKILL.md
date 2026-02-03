---
name: mother-brain
description: Vision-driven project framework that guides discovery, creates roadmaps, auto-generates skills, and manages task execution across sessions.
license: MIT
compatibility: node>=18
metadata:
  domain: meta
  stage: production
allowed-tools: powershell view grep glob web_search ask_user create edit skill
---

# 🧠 Mother Brain

**The Meta-Framework for Vision-Driven Project Management**

Use Mother Brain when you want to:
- Start a new project with a clear vision and roadmap
- Pick up an existing project and continue progress
- Realign your project with your original vision
- Identify what skills your project needs
- Break down complex ideas into actionable tasks

Mother Brain isn't **THE** project—it's a component **OF** your project, organizing it using best-practice development structures.

## Purpose

Mother Brain transforms high-level visions into executable reality by:
- **Vision Discovery**: Understanding what, who, when, and WHY
- **Roadmap Generation**: Breaking down into phases, MVP, tasks
- **Skill Identification**: Detecting repetitive patterns and creating specialized skills
- **Task Management**: Creating task docs, tracking progress, validating with user
- **Session Continuity**: Picking up where you left off
- **Continuous Learning**: Using feedback to improve itself and created skills

## Operating Principles

- **Product-first thinking**: Focus on outcomes, not implementation details
- **Vision clarity**: Always trace back to the WHY
- **Adaptive planning**: Roadmaps are living documents, not contracts
- **Best practice structure**: Organize projects using standard dev conventions
- **Skill automation**: Create skills for repetitive tasks proactively
- **User validation**: Always confirm work meets expectations before marking complete
- **Self-improvement**: Learn from heal feedback and user responses
- **Transparency**: Document decisions, rationale, and changes
- **Wizard pattern for all interactions**: Use `ask_user` tool with numbered, selectable choices (2-3 options) for ALL user decisions—never ask freeform yes/no questions in text

## Steps

### 1. **Show Welcome Menu with ASCII Art**
   
   **Display Mother Brain ASCII Art:**
   ```
       ___________________
      /                   \
     /  ╔═══════════════╗  \
    |   ║  M O T H E R  ║   |
    |   ║   B R A I N   ║   |
     \  ╚═══════════════╝  /
      \___________________/
          ||         ||
         //\\       //\\
        //  \\     //  \\
       //====\\   //====\\
      
      👽 Vision-Driven Development 👽
   ```

### 2. **Detect Project State & Show Progress**
   - Check current directory for existing Mother Brain artifacts
   - Look for:
     - `docs/vision.md` - Project vision document
     - `docs/roadmap.md` - Current roadmap
     - `docs/tasks/` - Task documentation folder
     - `docs/session-state.json` - Last session info
     - `.github/skills/` - Project-specific skills
     - `README.md` - Project overview
   
   **If project exists:**
   - Load session state from `docs/session-state.json`
   - Display welcome back message:
     ```
     🧠 Welcome back to [Project Name]!
     
     📍 Where You Left Off:
     • Phase: [Current Phase Name]
     • Last Task: [Task Number] - [Task Name] ([Status])
     • Progress: [X] of [Y] tasks completed in this phase
     • Skills Created: [Count] skills available
     • Last Session: [Date/Time]
     ```
   
   - Use `ask_user` with choices:
     - "Continue where I left off"
     - "Start next task"
     - "Review/update roadmap"
     - "Realign with vision"
     - "View all skills"
     - "Create new skill"
   - Freeform automatically available for custom actions
   
   **If new project:**
   - Display:
     ```
     🧠 Welcome to Mother Brain!
     
     I'll help you transform your vision into reality by:
     • Discovering your project vision
     • Creating a phased roadmap
     • Identifying needed skills
     • Breaking down tasks
     • Tracking your progress
     
     Ready to begin?
     ```
   - Use `ask_user` with choices:
     - "Yes, start vision discovery"
     - "I have a vision document already (import it)"
     - "Show me an example first"
   - Proceed based on selection

### 3. **Vision Discovery** (New Projects Only)
   - Use `ask_user` to conduct product discovery
   - Ask 8-12 contextual questions focusing on:
   
   **Core Questions:**
   1. **The Problem**: "What pain point or opportunity are you addressing?"
   2. **The Vision**: "Imagine this project succeeds—what does that look like in 3-12 months?"
   3. **The Users**: "Who will benefit from this? Describe them."
   4. **The Why**: "Why is this important? What changes if you DON'T build this?"
   5. **Success Metrics**: "How will you know this project succeeded?"
   6. **Timeline**: "What's your timeline? (Weeks, months, ongoing)"
   7. **Constraints**: "What limitations exist? (Time, budget, skills, tech)"
   8. **MVP Definition**: "What's the minimum that proves this works?"
   
   **Follow-up Questions (adapt based on responses):**
   - "Who are your competitors/alternatives?"
   - "What have you tried before?"
   - "What's your biggest fear about this project?"
   - "What would make you abandon this?"
   
   - Provide 2-3 options per question where appropriate
   - Allow freeform responses for complex answers
   - Dig deeper based on responses

### 4. **Vision Document Creation**
   - Create `docs/vision.md` with structured content:
     ```markdown
     # [Project Name] - Vision
     
     ## The Problem
     [User's pain point/opportunity]
     
     ## The Vision
     [3-12 month desired future state]
     
     ## Target Users
     [Who benefits and how]
     
     ## Why This Matters
     [The deeper purpose]
     
     ## Success Looks Like
     [Measurable outcomes]
     
     ## Timeline & Constraints
     [Realistic expectations]
     
     ## MVP Definition
     [Minimum viable success]
     
     ## Strategic Themes
     [3-5 key focus areas derived from vision]
     ```
   
   - Create `README.md` with project overview
   - Display vision summary to user
   - Use `ask_user` with choices:
     - "Yes, this captures it perfectly"
     - "Close, but needs refinement"
     - "No, let's start over"
   - If refinement needed, ask what to adjust

### 5. **Technology & Pattern Analysis**
   - Analyze vision to identify:
     - **Required technologies** (APIs, frameworks, databases)
     - **Repetitive patterns** (auth, file uploads, API calls, emails)
     - **Domain expertise needed** (payments, real-time, analytics)
   
   - Use `web_search` to research:
     - Best practices for identified technologies
     - Common patterns in similar projects
     - Available tools and libraries
   
   - Display findings:
     ```
     🔍 Technology Analysis:
     
     Core Stack Recommendations:
     - [Technology choices based on project needs]
     
     Identified Repetitive Patterns:
     1. [Pattern] - [Why it's repetitive] - [Skill candidate]
     2. [Pattern] - [Why it's repetitive] - [Skill candidate]
     ...
     ```

### 6. **Skill Identification & Creation**
   - For each repetitive pattern, evaluate:
     - **Frequency**: Will this happen 3+ times in project?
     - **Complexity**: Is there wizard-worthy context to gather?
     - **Reusability**: Could this apply to future projects?
   
   - Present skill candidates:
     ```
     🎯 Recommended Skills to Create:
     
     Core Skills (create now):
     1. [skill-name] - [what it does] - [use cases in this project]
     2. [skill-name] - [what it does] - [use cases in this project]
     
     Future Skills (create later when needed):
     3. [skill-name] - [what it does] - [when you'll need it]
     4. [skill-name] - [what it does] - [when you'll need it]
     ```
   
   - Use `ask_user` with choices:
     - "Yes, create all core skills now"
     - "Create them one at a time (I'll choose which)"
     - "Skip for now, create as needed"
   
   - If user agrees, invoke skill-creator for each:
     - Provide context about project vision
     - Explain specific use cases
     - Let skill-creator run its wizard
     - Store created skills in `.github/skills/`

### 7. **Roadmap Generation**
   - Break down project into phases based on:
     - MVP definition
     - Dependencies (what must come first)
     - Strategic themes
     - User timeline
   
   - Create `docs/roadmap.md`:
     ```markdown
     # [Project Name] - Roadmap
     
     ## Phase 1: Foundation (Week 1-2)
     **Goal**: [Phase objective tied to strategic theme]
     **Deliverables**:
     - [ ] Task: [Specific deliverable]
     - [ ] Task: [Specific deliverable]
     **Skills Available**: [List relevant skills]
     
     ## Phase 2: [Phase Name] (Week 3-5)
     **Goal**: [Phase objective]
     **Deliverables**:
     - [ ] Task: [Specific deliverable]
     ...
     
     ## Phase 3: [Phase Name] (Week 6-8)
     ...
     
     ## MVP Checkpoint
     [Criteria for MVP completion]
     
     ## Future Phases (Post-MVP)
     [Optional enhancements]
     ```
   
   - Use outcome-focused language (what gets achieved, not just tasks)
   - Link each phase back to strategic themes
   - Make it visual and high-level

### 8. **Task Document Creation**
   - Create `docs/tasks/` directory
   - For first task in Phase 1, create `docs/tasks/001-[task-name].md`:
     ```markdown
     # Task 001: [Task Name]
     
     **Status**: 🟡 In Progress  
     **Phase**: Phase 1 - Foundation  
     **Strategic Theme**: [Which theme this supports]  
     **Assigned**: [Date]  
     
     ## Objective
     [What this task achieves]
     
     ## Success Criteria
     - [ ] [Specific, testable criterion]
     - [ ] [Specific, testable criterion]
     
     ## Approach
     [High-level approach]
     
     ## Dependencies
     - [What must exist before this]
     
     ## Skills to Use
     - [Relevant skill name and purpose]
     
     ## Deliverables
     - [Specific files/outputs]
     
     ## Notes & Decisions
     [Log decisions made during execution]
     
     ## Validation
     [ ] Built successfully
     [ ] Tested and verified
     [ ] User confirmed it meets expectations
     ```
   
   - Display task to user
   - Use `ask_user` with choices:
     - "Yes, start this task now"
     - "Skip to next task"
     - "Let me review the roadmap first"
   - Proceed based on selection

### 9. **Task Execution**
   - Load current task document
   - Identify which skills to use (if any)
   - If skill exists: Invoke it using `skill` tool
   - If no skill: Execute task following approach in task doc
   - Log decisions and progress in task document's "Notes & Decisions" section
   - Create deliverables as specified

### 10. **Task Validation** (Critical)
   - After completing deliverables:
     - ✅ **Build Test**: If code, build/compile it
     - ✅ **Functional Test**: Run/open/execute the output
     - ✅ **Verification**: Test against success criteria
   
   - Ask user to review:
     ```
     ✅ Task [Number]: [Task Name] - Ready for Review
     
     What was created:
     - [List deliverables with paths]
     
     How to verify:
     - [Instructions for user to test]
     
     Success criteria status:
     - [✓] [Criterion met]
     - [✓] [Criterion met]
     
     Questions:
     1. Does this look how you expected?
     2. Does it work properly?
     3. Anything you'd like changed?
     ```
   
   - Use `ask_user` to get feedback with choices:
     - "Looks perfect, mark as complete"
     - "Works but needs adjustment"
     - "Doesn't meet expectations, needs rework"
   - Provide freeform for detailed feedback
   
   - If user confirms: Mark task complete (🟢 Complete)
   - If issues: Ask what needs changing, fix and re-validate
   - Update task document with final status
   - Update roadmap checklist

### 11. **Next Action Menu**
   - After task completion, use `ask_user` with choices:
     - "Start next task automatically"
     - "Review roadmap and choose task"
     - "Take a break (save progress)"
     - "Update/refine the roadmap"
   - Freeform available for custom actions
   
   - Save session state to `docs/session-state.json`:
     ```json
     {
       "projectName": "Gaming Backlog Manager",
       "lastTask": "003-localstorage-data-layer",
       "lastTaskStatus": "DONE",
       "currentPhase": "Phase 1",
       "completedTasks": ["001", "002", "003"],
       "totalTasks": 9,
       "skillsCreated": ["pwa-builder"],
       "lastSession": "2026-02-03T20:00:00Z"
     }
     ```
   
   - If continuing: Load next task, go to step 8
   - If pausing: Save state, provide summary of progress

### 12. **Session Continuity** (When Re-Invoked)
   - When mother-brain is re-invoked:
     - Show ASCII art again
     - Load `docs/session-state.json`
     - Load `docs/vision.md`
     - Load `docs/roadmap.md`
     - Check `docs/tasks/` for current task
     - Display "Welcome back" menu (Step 2)
   
   - This ensures seamless continuation from any stopping point

### 13. **Self-Improvement Integration**
   - After using heal on any skill (including Mother Brain):
     - Extract lesson learned
     - Update relevant documentation:
       - If pattern affects Mother Brain: Update this SKILL.md
       - If pattern affects skill creation: Update skill-creator
       - If pattern affects specific skill: Update that skill
   
   - Log improvements in `docs/learning-log.md`:
     ```markdown
     # Learning Log
     
     ## [Date] - [Issue Fixed]
     **Skill**: [Which skill was healed]
     **Problem**: [What went wrong]
     **Root Cause**: [Why it happened]
     **Fix Applied**: [How it was fixed]
     **Lesson Learned**: [General principle extracted]
     **Improvement Made**: [What was updated to prevent recurrence]
     ```

## File Structure Created by Mother Brain

```
project-root/
├── docs/
│   ├── vision.md                 # Project vision (what, who, when, WHY)
│   ├── roadmap.md                # Phased execution plan
│   ├── learning-log.md           # Self-improvement tracking
│   └── tasks/
│       ├── 001-task-name.md      # Individual task documents
│       ├── 002-task-name.md
│       └── ...
├── .github/
│   └── skills/                   # Project-specific skills
│       ├── [project-skill-1]/
│       └── [project-skill-2]/
├── src/                          # Source code (standard structure)
├── tests/                        # Tests (standard structure)
├── README.md                     # Project overview
└── [other standard project files]
```

## Validation Checklist

Before considering setup complete:

- [ ] Vision document created with all key sections
- [ ] Vision captures user's WHY and desired outcomes
- [ ] Roadmap breaks down into logical phases
- [ ] Each phase ties back to strategic themes
- [ ] MVP is clearly defined
- [ ] Core skills identified and created
- [ ] First task document created
- [ ] Task has clear success criteria
- [ ] File structure follows best practices
- [ ] README provides project overview
- [ ] User confirms vision and roadmap are accurate

Before marking task complete:

- [ ] All deliverables created
- [ ] Code builds successfully (if applicable)
- [ ] Output tested and verified
- [ ] Success criteria all met
- [ ] User reviewed and approved
- [ ] User confirmed it works properly
- [ ] Task document updated with final status
- [ ] Roadmap checklist updated

## Integration with skill-creator

Mother Brain and skill-creator work together:

- **Mother Brain**: Identifies WHAT skills are needed and WHY
- **skill-creator**: Creates HOW skills work

When Mother Brain identifies a skill need:
1. Invoke: `skill skill-creator`
2. Provide context: Project vision, specific use cases
3. Let skill-creator run its wizard
4. skill-creator creates the skill
5. Mother Brain logs skill in roadmap

## Integration with Heal

When heal fixes an issue:
1. Heal identifies problem and applies fix
2. Heal extracts general lesson learned
3. Mother Brain logs in `docs/learning-log.md`
4. Mother Brain suggests improvements to:
   - Itself (if process flaw)
   - skill-creator (if skill creation flaw)
   - Specific skill (if skill execution flaw)

## Example Session Flow

**New Project:**
```
User: I want to build a music marketing SaaS platform

Mother Brain:
🧠 Welcome to Mother Brain!

[Runs vision discovery wizard - 8-12 questions]

Creates:
- docs/vision.md
- docs/roadmap.md (3 phases identified)
- README.md

Identifies repetitive patterns:
- Spotify API integration
- Image uploads
- User authentication
- Email campaigns

Recommends creating skills:
- spotify-api-integrator
- image-upload-handler
- auth-manager

User agrees, Mother Brain invokes skill-creator 3 times.

First task created: "Set up project structure and authentication"

User: "Start the task"

[Mother Brain uses auth-manager skill, creates deliverables]

Mother Brain: "✅ Task complete! User login system created.
Please test: [instructions]
Does it work properly?"

User: "Yes, looks good!"

Mother Brain marks task complete, asks about next task.
```

**Returning to Project:**
```
User: /mother-brain

Mother Brain:
🧠 Welcome back to MusicMarketingSaaS!

Current Status:
Phase: 1 - Foundation (75% complete)
Task: 002 - Spotify API Integration (In Progress)
Completed: 3 tasks
Remaining: 12 tasks
Skills: 3 available

What would you like to do?
1. Continue current task
2. Start next task
3. Review roadmap
...

User: "Continue current task"

[Mother Brain loads task 002, continues execution]
```

## Notes

- **Not a replacement for the user**: Mother Brain guides, but user makes final decisions
- **Living documents**: Vision and roadmap can be updated as project evolves
- **Flexible pacing**: Work on tasks in any order if dependencies allow
- **Session state**: All progress saved in docs/ folder
- **Best practices**: Uses industry-standard project structure
- **Skill ecosystem**: Builds project-specific skill library over time

## Resources

See `references/resources.md` for:
- Project management best practices
- Vision document templates
- Roadmap examples
- Task management methodologies
