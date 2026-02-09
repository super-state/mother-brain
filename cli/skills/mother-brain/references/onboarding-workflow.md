# Existing Project Onboarding Workflow

When user selects to onboard Mother Brain into an existing project, follow these steps:

## Step 2.2.1: Deep Repo Analysis
- Scan ALL files in the directory (not just specific ones)
- Use `glob` and `view` to understand:
  - **Project Type**: What kind of project is this? (web app, game, library, CLI, etc.)
  - **Tech Stack**: Languages, frameworks, dependencies
  - **Architecture**: Folder structure, patterns, modules
  - **Features Built**: What functionality already exists?
  - **Current State**: Is it working? Partially complete? Early stage?

- Display findings:
  ```
  🔍 Project Analysis Complete
  
  What I Found:
  - Type: [Project type detected]
  - Tech Stack: [Languages, frameworks]
  - Features Built: [List of detected features]
  - Current State: [Assessment of completeness]
  ```

## Step 2.2.2: Vision Extraction (Clarifying Questions)
- Ask user questions to fill gaps (like vision discovery, but informed by analysis):
  - "What is the main goal of this project?"
  - "Who is this for? Who will use it?"
  - "What problem does this solve?"
  - "What inspired this project?" (to trigger domain research)
  - "What's the most important thing to get right?"
  - "Where are you trying to get to next? What's your next milestone?"

- Create `.mother-brain/docs/vision.md` with extracted vision

## Step 2.2.3: Retrospective Roadmap
- Build roadmap that reflects reality:
  - **Phase 0 (Done)**: What's already built (based on repo analysis)
  - **Phase 1 (Current)**: What's in progress or next immediate steps
  - **Phase 2+**: Future milestones based on user's stated goals

- Mark completed work as DONE in roadmap
- Identify current position in timeline
- Create `.mother-brain/docs/roadmap.md`

## Step 2.2.4: Skill Identification
- Analyze patterns in existing code
- Identify repetitive work that warrants skills
- Invoke skill-creator for detected patterns

## Step 2.2.5: Confirmation
- Display:
  ```
  ✅ Mother Brain Onboarded!
  
  📋 Vision: Captured
  📊 Roadmap: [X] tasks identified
    - [Y] already complete
    - [Z] remaining
  🛠️ Skills: [N] identified for creation
  
  Ready to help you reach your next milestone!
  ```

- Use `ask_user` with choices:
  - "Start next task"
  - "Review the roadmap"
  - "Review the vision"
  - "Adjust something before continuing"

- Proceed to normal workflow (Step 8+)
