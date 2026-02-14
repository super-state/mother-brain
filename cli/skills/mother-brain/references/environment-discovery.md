# Environment & Presentation Discovery — Full Procedure

   
   **Purpose**: Discover user's environment and establish reliable output presentation methods
   
   **When to Run**:
   - **NOT during project setup** - don't ask about browsers before knowing if project needs visual output
   - **On first visual output**: When a task produces HTML, images, or other visual files for the first time
   - **On demand**: If presentation fails during task validation, re-run this step
   - **Skip entirely**: For CLI tools, libraries, or other non-visual projects
   
   **Trigger Condition**:
   - During Step 10 (Task Validation), if deliverables include visual files (HTML, images, etc.)
   - AND `environment.presentationPreferences` doesn't exist in session-state.json
   - THEN run this discovery before presenting output
   
   **Discovery Process**:
   
   **Step 2.5.1: Detect Available Tools**
   - Display: "🔍 Discovering your environment for presenting output..."
   - **Check for common browsers (multi-method detection)**:
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
   - Check for VS Code (if running in VS Code context):
     - Check for Live Preview extension
     - Check for Live Server extension
   - Check for Node.js (can run local http-server):
     ```powershell
     node --version
     ```
   - Log what was found:
     ```
     ✅ Found: Microsoft Edge (C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe)
     ✅ Found: VS Code with Live Preview
     ❌ Chrome not found
     ✅ Node.js installed (v22.17.1)
     ```
   
   **Step 2.5.2: Ask User for Presentation Preferences**
   
   - **For HTML/web files**:
     - If browsers found:
       - Use `ask_user` with choices (list found browsers):
         - "Microsoft Edge"
         - "Google Chrome"
         - "Firefox"
         - "VS Code Live Preview"
       - Question: "For HTML/web output, which tool should I use to show you results?"
     - If NO browsers but VS Code detected:
       - Use `ask_user` with choices:
         - "Install VS Code Live Preview extension (recommended)"
         - "I'll open HTML files manually"
       - If user chooses install, attempt to install extension
     - If nothing found:
       - Use `ask_user` with choices:
         - "Install VS Code Live Preview (I can do this)"
         - "I'll open files manually with my own tools"
   
   - **For image files**:
     - Use `ask_user` with choices:
       - "VS Code (default image viewer)"
       - "System default image viewer"
       - "I'll open images manually"
   
   - **For other file types** (JSON, markdown, etc.):
     - Default to VS Code or text editor
     - No prompt needed unless user requests
   
   **Step 2.5.3: Store Preferences in session-state.json**
   - Add `environment` object to session-state.json:
     ```json
     {
       "projectName": "Project Name",
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
     }
     ```
   
   **Step 2.5.4: Confirm Setup**
   - Display summary:
     ```
     ✅ Environment configured!
     
     Presentation methods:
     - HTML/Web: Microsoft Edge
     - Images: VS Code
     - Other files: VS Code
     
     You can update these anytime from the main menu.
     ```
   
   - Proceed to Step 3 (Vision Discovery) or next selected step
