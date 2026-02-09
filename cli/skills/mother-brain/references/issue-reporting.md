# Issue Reporting via Freeform Input

## Simplified Approach: Use freeform text for issue reporting

- Use `allow_freeform: true` on all `ask_user` calls (this is the default)
- The tool automatically adds "Other" as the last option for freeform text input
- **No explicit "Report Issue" option needed** - users can type their issues in freeform
- When user's freeform input contains issue-related keywords, jump to **Step 2A: Update Mother Brain**

## Issue Detection Keywords
Check freeform responses for:
- "issue", "problem", "broken", "bug", "not working", "wrong", "error"
- "doesn't work", "fix", "report", "something's wrong", "this is broken"

## Handling Freeform Responses
1. Check if response contains issue-related keywords
2. If issue detected:
   - Capture current context (step, action, phase, task)
   - Display: "🚨 **Issue Detected**"
   - Jump to Step 2A with context
3. If not an issue: Process response normally and continue workflow

## When issue is detected in freeform
1. Capture current context
2. Display: "🚨 **Issue Detected from your feedback**"
3. Pre-populate issue context: "You were at [Step X], attempting [Action Y]"
4. Jump to Step 2A with context
5. Apply 3-layered troubleshooting approach (what happened, root cause, fix)

This ensures users can ALWAYS break out of bad behavior and report issues in-context.

## Handling "Report Issue" Selection

When user selects "🚨 Report Issue (something's not working)" from ANY `ask_user`:

1. **Capture Context:**
   - Current Step: [Step number/name being executed]
   - Action Attempted: [What Mother Brain was trying to do]
   - Phase: [If in project: current phase]
   - Task: [If in task execution: task number/name]
   - Last Command: [Last tool used, if applicable]

2. **Display Issue Capture:**
   ```
   🚨 **Issue Reporting Mode Activated**
   
   I detected you triggered issue reporting from:
   - Step: [Current step]
   - Action: [What was happening]
   [If in task] - Task: [Task number/name]
   
   This will help me understand what went wrong.
   ```

3. **Jump to Step 2A** (Update Mother Brain) with pre-populated context

4. **Ask for issue description** with context already captured:
   - "What went wrong or didn't work as expected?"
   - Pre-fill with context: "At [Step], while [Action], the issue was: [user describes]"

This pattern ensures NO workflow ever traps the user—there's always an escape hatch.
