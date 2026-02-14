# Task Validation — Full Procedure

   - **DATA EXPOSURE VALIDATION (MANDATORY - BEFORE DEPLOYMENT)**:
     - If task involves deployment or making UI/API publicly accessible:
       1. Check what data is exposed by this interface
       2. If interface shows user/customer data (PII, orders, payments, health records, personal info):
          - Verify authentication/authorization is implemented
          - Test that unauthenticated users CANNOT access sensitive data
          - If NO auth → BLOCK deployment
          - Display: "⚠️ DEPLOYMENT BLOCKED: This interface exposes [data type] without access control."
       3. Only allow deployment if:
          - Authentication exists AND is tested, OR
          - User explicitly confirms data is public/non-sensitive, OR
          - Data is anonymized/aggregated with no PII
     - This is a BLOCKING GATE for deployments - never deploy data-exposing interfaces without access control
   
   - After completing deliverables:
     - ✅ **Build Test**: If code, build/compile it
     - ✅ **Functional Test**: Present output to user using environment-aware strategy
       
       **Environment-Aware Presentation**:
       1. Load `presentationPreferences` from session-state.json → environment
       2. Identify output type (HTML, image, JSON, PDF, etc.)
       3. Match output type to preferred method from environment discovery
       4. **Presentation Strategy** (layered fallback):
          - **Primary**: Use stored preference (browser path, VS Code extension, etc.)
          - **Validate**: Check if method succeeded (process started, no error)
          - **Fallback 1**: If primary fails, try alternative from `detectedBrowsers` or VS Code
          - **Fallback 2**: Provide clear manual instructions with full file path
          - **Update prompt**: If methods fail repeatedly, offer to re-run Step 2.5
       5. Log presentation method used in task document Notes section
       
       **Example - HTML Output**:
       ```powershell
       # Load preference from session-state: e.g., "edge" or full path
       $browserPref = $env.presentationPreferences.html
       $htmlPath = Resolve-Path "index.html"
       $fileUrl = "file:///$($htmlPath.Path.Replace('\', '/'))"
       
       # If preference is command name (e.g., "msedge"), try it
       # If preference is full path, use it directly
       if (Test-Path $browserPref) {
         Start-Process $browserPref $fileUrl
       } else {
         Start-Process $browserPref $fileUrl  # Try as command
       }
       
       # If error, try fallback browser from detectedBrowsers array
       # Always show: "Or manually open: C:\full\path\index.html"
       ```
       
       **Important**: Browser preference may be:
       - Command name: "msedge", "chrome", "firefox"
       - Full path: "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
       - Handle both cases when invoking
       
       **If presentation fails**:
       - Don't keep retrying the same method
       - Offer user choice: "Would you like to update presentation preferences?"
       - Jump to Step 2.5 if user wants to reconfigure
     
     - ✅ **Verification**: Test against success criteria
   
   - **Roadmap Cross-Check** (CRITICAL - prevents out-of-order implementation):
     1. Load current outcome from `docs/roadmap.md`
     2. Identify which acceptance criteria this work addresses
     3. If user mentions missing features:
        - Check if feature is in a future outcome
        - Explain: "That's planned for [Outcome Name]"
        - Offer: "Continue as planned" or "Adjust roadmap"
   
    - **OUTCOME VALIDATION (User validates acceptance criteria, not tasks)**:
    
      When ALL tasks under an outcome are complete, present the outcome for validation:
      
      ```
      📋 Outcome Complete: [Ability to do X]
      
      Acceptance Criteria:
      - I can ...
      - I can ...
      ```

    - **MANDATORY: Outcome Demo First (Interactive Experience)**:
      1. Read `references/outcome-demo.md`
      2. Launch the experience for the user (app/page/flow) so they can interact with the outcome
         - Do NOT ask the user to run startup commands
         - If launching fails, use one fallback, then provide clear manual steps
      3. Only after the demo is in front of the user, proceed to acceptance-criteria sign-off (batch-first)
    
    - **Batch acceptance sign-off (preferred)**:
      - Display the FULL acceptance-criteria list at once
      - Then use `ask_user` with choices:
        - "✅ Everything works (all criteria pass)"
        - "⚠️ Something isn't working (tell me what's failing)"
        - "🛠 Works but needs adjustment (tell me what to change)"
      - If the user reports failures/adjustments:
        - Ask them to paste the failing criteria text or numbers (freeform)
        - Invoke Child Brain immediately (friction detected), fix, then re-run demo + batch sign-off
      - Only drill into per-criterion Yes/No when:
        - The user says "some fail" but can't identify which, or
        - The outcome has many criteria and pinpointing is unclear
   
   - **Example validation flow**:
     ```
     📋 Ability to see my emails inside the portal
     
     Acceptance Criteria:
     1. I can see my inbox with sender, subject, and preview
     2. I can click an email to read the full content
     3. New emails appear without refreshing the page
     
     Now that the demo is in front of you, which is true?
     1. ✅ Everything works (all criteria pass)
     2. ⚠️ Something isn't working (tell me what's failing)
     3. 🛠 Works but needs adjustment (tell me what to change)
     ```
   
   - **All criteria pass**: Mark outcome complete (✅)
   - Update roadmap.md to check off the outcome
   - Display: "✅ [Outcome name] — complete!"
   - If issues: Jump to **Step 10A: Three-Layered Learning from Feedback**
   - Update task document with final status
   - Update roadmap checklist
   
   - **Post-outcome wrap-up + commit discipline (order matters)**:
     1. Run Steps 10B and 10C (mandatory learning + documentation checkpoint)
     2. If the outcome was accepted, run the outcome-level retrospective:
        - Invoke Child Brain (post-delivery retrospective)
        - Apply any approved Mother Brain / Project Brain / skill updates
     3. If the repo is a git repo and there are uncommitted changes:
        - Create a commit AFTER the retrospective updates are applied
        - Then return the user to the Layer 2 Roadmap Menu
   
   **⚠️ CRITICAL: After marking task complete, proceed through Steps 10B, 10C, and optionally 10D before returning to the Outcome Execution Menu (Layer 3).**
   
   **⛔ BLOCKING GATE - Steps 10B and 10C are MANDATORY:**
   ```
   Task marked complete by user
       ↓
   [STOP] Run Step 10B (Post-Task Reflection) ← Friction analysis via Child Brain
       ↓
   [STOP] Run Step 10C (Project Brain Checkpoint) ← Update living documentation
       ↓
   IF last task in phase → Run Step 10D (Phase Feedback Checkpoint)
       ↓
   IF more tasks in outcome → Return to Step 10E (Outcome Execution Menu - Layer 3)
   IF outcome complete → Proceed to Step 11 (Roadmap Menu - Layer 2)
   ```
   
   **DO NOT skip Steps 10B or 10C.** Even if the task had no issues:
   1. Step 10B: Scan for friction, invoke Child Brain if found
   2. Step 10C: Update project documentation silently
   3. Step 10D: If phase complete, gather user feedback
   4. After checkpoints → return to Layer 3 (or Layer 2 if outcome is done)
