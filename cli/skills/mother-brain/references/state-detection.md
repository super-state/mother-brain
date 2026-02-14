# State Detection Logic — Full Procedure

    **🚨 MANDATORY VERSION CHECK (FIRST - BEFORE ANYTHING ELSE)**:
    - This check is NON-NEGOTIABLE. Do this BEFORE any other detection.
    - **Before the version check output**, display a friendly boot screen:
      - Read `references/boot-screen.md`
      - Print ONLY the short user-facing startup lines from the template
      - Do NOT print commands or internal reasoning
    - **Fast-first version check (cache before network)**:
      1. Read installed version from `.mother-brain/version.json` (project) or `cli/package.json` (framework repo)
      2. If in a project folder, check whether `.mother-brain/version.json` has a fresh cached update check:
         - Fields: `lastUpdateCheckAt` + `lastKnownLatest`
         - TTL: 24 hours
         - If fresh: treat `lastKnownLatest` as "Latest" for this startup and SKIP the network call
      3. If no cache or cache is stale: run the network check:
         ```powershell
         npm view mother-brain version --json 2>$null
         ```
         - After a successful check, update `.mother-brain/version.json` with:
           - `lastUpdateCheckAt`: now
           - `lastKnownLatest`: the npm version
         - If check fails (offline), continue silently without blocking startup
    - **If newer version exists**:
      - **If in a project folder** (has `.mother-brain/version.json`):
        ```
        ⚠️ Mother Brain Update Available
        
        Installed: v[current]
        Latest: v[npm version]
        
        Update recommended before continuing.
        ```
        - Use `ask_user` with choices:
          - "Update now (recommended)"
          - "Skip this time"
        - **If "Update now"**: Run `npx -y mother-brain update`, then continue
        - **If "Skip"**: Continue but note version mismatch
      
      - **If in the Mother Brain framework repo** (source code checkout):
        ```
        ⚠️ Mother Brain Release Ahead of This Checkout
        
        Repo version (cli/package.json): v[current]
        Latest release (npm): v[npm version]
        
        This usually means your local checkout hasn’t been pulled to the latest tag yet.
        ```
        - Use `ask_user` with choices:
          - "Fetch tags + pull latest framework changes (recommended)"
          - "Skip this time"
        - **If "Fetch tags + pull"**:
          - Run `git fetch --tags origin`
          - Run `git pull --ff-only origin main`
          - Then continue detection
        - **If "Skip"**: Continue but note mismatch
    - **If current or check fails**: Continue silently
   
   **🧬 META-MODE DETECTION (AFTER VERSION CHECK)**:
   - Detect if we are IN the Mother Brain framework repo itself:
     1. Check for `cli/` folder with `package.json` containing `"name": "mother-brain"`
     2. Check for `.github/skills/mother-brain/SKILL.md` (this file)
     3. Check for `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md` in root
     4. If ALL of these exist → we are in the Mother Brain framework repo
   
   - **If in Mother Brain framework repo**:
     - Refresh tags before reporting "last release" (quiet):
       - Run `git fetch --tags origin`
     - Check `.mother-brain/meta-mode.json` for existing meta session state
     - Display:
       ```
       🧠 You're in the Mother Brain Framework
       
       This is the framework itself, not a project using Mother Brain.
       
       Current Status:
       - Version: [read from cli/package.json]
       - Last release: [read from git tag or npm]
       - Pending changes: [git status summary]
       ```
     
     - Use `ask_user` with choices:
       - "Improve Mother Brain (meta-mode)"
       - "Start a completely new project somewhere else"
       - "Release current changes to npm"
       - "View recent changes and releases"
     
     - **If "Improve Mother Brain"**: 
       - Set meta-mode state in `.mother-brain/meta-mode.json`:
         ```json
         {
           "metaMode": true,
           "startedAt": "[timestamp]",
           "focus": null
         }
         ```
       - Jump to **Step 2.3: Meta-Mode (Framework Improvement)**
     
     - **If "Start new project"**:
       - Ask for project location (default: sibling folder)
       - Change directory to that location
       - Continue with normal flow (Step 2 from that location)
     
     - **If "Release"**: Jump to **Step 2D**
   
   - **If NOT in framework repo**: Continue with normal detection below
   
   **⚡ FAST STARTUP OPTIMIZATION (MANDATORY)**:
   - **Single file check first**: Check ONLY `.mother-brain/session-state.json`
     - If it exists: Mother Brain is installed in this folder (NOT necessarily an "existing project")
     - If it does not exist: treat as "no Mother Brain artifacts" (possible onboarding or brand-new folder)
   - **Parallel tool calls**: When multiple checks are needed, run them in ONE response (not sequentially)
   - **Lazy loading**: Only load vision.md, roadmap.md, README.md when actually needed (not at startup)
   - **Minimal detection**: For new project detection, a single glob for `.mother-brain/` is sufficient
   - Goal: User sees menu within 1-2 tool calls, not 6+

   **🧩 SCAFFOLDING-ONLY DETECTION (CRITICAL - fixes false "existing project" onboarding)**
   - A freshly created folder can look like an "existing project" after `mother-brain init` because init creates:
     - `.mother-brain/session-state.json` (with `project: null`)
     - `.mother-brain/version.json`
     - `.github/skills/*`
     - `.agents/skills/*`
     - `AGENTS.md`
     - `.git/` (if git init is performed)
   - **Rule**: If the folder contains ONLY Mother Brain scaffolding, treat it as a **new project** (show the new-project welcome flow), NOT onboarding.
   - Detect scaffolding-only as:
     1. `.mother-brain/session-state.json` exists AND its JSON has `project: null` (or no project name)
     2. `.mother-brain/docs/vision.md` does NOT exist
     3. The repo root contains no "real project files" beyond:
        - `.mother-brain/`
        - `.github/`
        - `.agents/`
        - `.git/`
        - `AGENTS.md`
     - If all true → show **New Project** welcome menu (Step 2 new project)
     - If false → proceed with normal project/onboarding detection
   
   **📦 AUTO-UPDATE CHECK (on startup, if project exists)**:
   - If `.mother-brain/version.json` exists:
     1. Read installed version from file
     2. Check npm for latest: `npm view mother-brain version --json 2>$null`
     3. If newer version available:
        ```
        ⚠️ Mother Brain Update Available
        
        Installed: v[current]
        Latest: v[npm version]
        ```
        - Use `ask_user` with choices:
          - "Update now (recommended)"
          - "Skip this time"
        - **If "Update now"**: Run `npx -y mother-brain update` — the CLI handles everything (skill replacement, version tracking, project file preservation)
        - **If "Skip"**: Continue but note version mismatch
     4. If check fails (offline), skip silently - don't block startup
     5. If already on latest version, continue silently
   
   - Check current directory for existing Mother Brain artifacts
   - Look for:
     - `.mother-brain/session-state.json` - **CHECK THIS FIRST** (tells you everything)
     - `.mother-brain/docs/vision.md` - Project vision document (load only when needed)
     - `.mother-brain/docs/roadmap.md` - Current roadmap (load only when needed)
     - `.mother-brain/docs/tasks/` - Task documentation folder
     - `.github/skills/` - Project-specific skills
   
