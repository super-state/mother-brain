# Review Community Improvements — Full Procedure

   - **Access**: Only shown when meta-mode is active (in Mother Brain framework repo)
   
   **Step 2A.2.1: List Open Improvement Issues**
   
   - Fetch issues with "improvement" or "community-contribution" labels:
     ```
     github-mcp-server: list_issues
     state: open
     labels: ["improvement"]
     ```
   
   - **If no issues**: Display "📭 No community improvements pending review." → Return to menu
   
   - **If issues exist**: Display summarized list:
     ```
     📥 Community Improvements to Review ([count] pending)
     
     ┌─────────────────────────────────────────────────────────────┐
     │ #[number] - [title]                                        │
     │ by @[author] • [time ago]                                   │
     │                                                             │
     │ 📝 [AI-generated 1-sentence summary of what this improves] │
     │ 📁 [files affected count] files • [lines changed] lines    │
     └─────────────────────────────────────────────────────────────┘
     
     [Repeat for each issue, max 5 shown]
     ```
   
   - Use `ask_user` with issue numbers as choices + "Back to menu"
   
   **Step 2A.2.2: Review Selected Issue**

   - Fetch full issue details

   - Display with AI-generated analysis:
     ```
     📋 Issue #[number]: [title]
     
     Submitted by: @[author] • [created_at]
     
     ═══════════════════════════════════════════════════════════════
     
     🔍 IMPACT SUMMARY
     
     What It Does:
     [AI-generated 2-3 sentence explanation of the improvement]
     
     Why It Was Submitted:
     [Extract from "Friction Encountered" section of issue]
     
     Risk Assessment:
     • Scope: [Low/Medium/High] - [brief reason]
     • Breaking Changes: [None/Minor/Major]
     • Files: [list affected files]
     
     ═══════════════════════════════════════════════════════════════
     
     📄 FULL DIFF
     [Collapsible or scrollable diff from issue body]
     ```
   
   - Use `ask_user` with choices:
     - "✅ Accept - integrate this improvement"
     - "❌ Reject - close with explanation"
     - "💬 Request changes - ask for modifications"
     - "⏭️ Skip - review later"
   
   **Step 2A.2.3: Accept Improvement**

   - If accepted:
     1. Parse the diffs from the issue body
     2. Apply changes using `edit` tool
     3. Run validation (npm build if CLI changes)
     4. **Auto-comment** on issue:
        ```markdown
        ✅ **Improvement Integrated**
        
        Thank you for this contribution! Your improvement has been integrated 
        and will be included in the next release.
        
        Changes applied:
        - [list of files modified]
        
        🚀 *Integrated by Mother Brain*
        ```
     5. Close issue with "integrated" label
   
   - Display: "✅ Improvement from #[number] integrated. Ready for release."
   
   **Step 2A.2.4: Reject Improvement**
   
   - If rejected:
     1. Use `ask_user` to get brief reason (or offer common reasons):
        - "Doesn't align with framework direction"
        - "Implementation approach needs rework"
        - "Duplicate of existing functionality"
        - "Custom reason..."
     2. **Auto-comment** on issue:
        ```markdown
        ❌ **Improvement Not Accepted**
        
        Thank you for taking the time to submit this improvement. 
        After review, we've decided not to integrate it at this time.
        
        **Reason:** [selected/custom reason]
        
        [If appropriate: "Feel free to revise and resubmit if you'd like 
        to address this feedback."]
        
        🙏 *We appreciate your contribution to Mother Brain*
        ```
     3. Close issue with "wontfix" label
   
   - Display: "Issue #[number] closed with explanation."
   
   **Step 2A.2.5: Request Changes**
   
   - If "Request changes" selected:
     1. Use `ask_user` to get feedback text
     2. **Auto-comment** on issue:
        ```markdown
        💬 **Changes Requested**
        
        Thanks for this improvement! Before we can integrate it, 
        please address the following:
        
        [user's feedback]
        
        Once updated, we'll review again.
        
        🔄 *Feedback from Mother Brain maintainer*
        ```
     3. Add "changes-requested" label
   
   - Display: "Feedback posted to #[number]."


