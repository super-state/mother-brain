# State Detection Logic — Full Procedure

    **🚨 MANDATORY VERSION CHECK (FIRST - BEFORE ANYTHING ELSE)**:
    - This check is NON-NEGOTIABLE. Do this BEFORE any other detection.
    - **Before the version check output**, display a friendly boot screen:
      - Read `references/boot-screen.md`
      - Print ONLY the short user-facing startup lines from the template
      - Do NOT print commands or internal reasoning
    - Run version check:
      ```powershell
      npm view mother-brain version --json 2>$null
      ```
    - Compare against:
      - If in framework repo: `cli/package.json` version field
      - If in project: `.mother-brain/version.json` version field
    - **If newer version exists**:
      ```
      ⚠️ Mother Brain Update Available
      
      Installed: v[current]
      Latest: v[npm version]
      
      Update recommended before continuing.
      ```
      - Use `ask_user` with choices:
        - "Update now (recommended)"
        - "Skip this time"
      - **If "Update now"**: Run auto-update (see update commands below), then continue
      - **If "Skip"**: Continue but note version mismatch
    - **If current or check fails**: Continue silently
   
   **🧬 META-MODE DETECTION (AFTER VERSION CHECK)**:
   - Detect if we are IN the Mother Brain framework repo itself:
     1. Check for `cli/` folder with `package.json` containing `"name": "mother-brain"`
     2. Check for `.github/skills/mother-brain/SKILL.md` (this file)
     3. Check for `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md` in root
     4. If ALL of these exist → we are in the Mother Brain framework repo
   
   - **If in Mother Brain framework repo**:
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
   - **Single file check first**: Check ONLY `.mother-brain/session-state.json` - if it exists, project exists
   - **Parallel tool calls**: When multiple checks are needed, run them in ONE response (not sequentially)
   - **Lazy loading**: Only load vision.md, roadmap.md, README.md when actually needed (not at startup)
   - **Minimal detection**: For new project detection, a single glob for `.mother-brain/` is sufficient
   - Goal: User sees menu within 1-2 tool calls, not 6+
   
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
   