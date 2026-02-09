# Improvement Submission Pipeline

Automatically detect ALL local Mother Brain improvements, parse learning logs for each distinct improvement, and submit a separate GitHub issue for each one.

## Step 2A.1.1: Gather All Improvement Sources

Collect from THREE sources:

### Source 1: Learning Log Entries
- Read `.mother-brain/project-brain.md` or `docs/learning-log.md`
- Parse for individual learning entries (marked by `## [Date]` or similar)
- Each entry = potential improvement
- Extract: date, trigger, learning, resolution

### Source 2: Core File Changes
- Get changes to Mother Brain core files:
  ```powershell
  git diff HEAD -- ".github/skills/mother-brain/SKILL.md"
  git diff HEAD -- ".github/skills/child-brain/SKILL.md"  
  git diff HEAD -- ".github/skills/skill-creator/SKILL.md"
  ```
- If files are new/untracked: `git diff /dev/null -- [file]`

### Source 3: Conversation Context
- Scan conversation history for:
  - Friction points discussed
  - Problems reported
  - Solutions implemented
  - Pattern: "this isn't working" → "fixed by..."

- **If no improvements found across all sources**:
  - Display: "📭 No local Mother Brain improvements to send."
  - Return to Step 2A (Improve Mother Brain Menu)

## Step 2A.1.1A: Check Issues Tracker (Deduplication)

- Check if `.mother-brain/issues-tracker.md` exists
- **If exists**: Read and parse submitted issues list for comparison
- **If doesn't exist**: Create empty tracker file

## Step 2A.1.2: Correlate Learnings with File Changes

- For each learning entry found:
  1. Identify which file(s) were modified for this learning
  2. Extract the relevant diff sections (not the whole file diff)
  3. Match learning description to code changes

- Group by improvement type:
  - **Behavioral improvements** → Mother Brain SKILL.md changes
  - **Feedback handling** → Child Brain SKILL.md changes
  - **Skill creation** → Skill Creator SKILL.md changes

## Step 2A.1.3: Generate Individual Issues (with Deduplication)

- Check each improvement against issues tracker — skip duplicates
- For EACH NEW improvement, create a separate issue using this template:

```markdown
Title: [Improvement] [Brief title describing THIS specific improvement]

## Summary
[2-3 sentences explaining what this specific improvement does]

## Problem
[What friction was encountered that triggered this improvement]

## Solution
[How Mother Brain addressed the friction]

## Changes Made
**File**: [filename] (lines ~X-Y)

<details>
<summary>View diff</summary>

\```diff
[relevant diff for THIS improvement only - not entire file]
\```
</details>

## Benefits
[How this helps all Mother Brain users]

## Testing
[How the improvement was validated]

---
*Submitted via Mother Brain v[version]*
```

## Step 2A.1.4: Submit Issues via gh CLI

- **Pre-flight Check**: `gh --version && gh auth status`

- **If gh CLI available and authenticated**:
  - For each improvement: `gh issue create --repo super-state/mother-brain --title "[title]" --body "[body]"`
  - Parse output for issue number and URL
  - Add `Start-Sleep -Seconds 2` between submissions (rate limiting)
  - Target repository: `super-state/mother-brain`

- **If gh CLI not available**:
  - Save each issue to `.mother-brain/github-issues/issue-[N].md`
  - Display instructions for manual submission at https://github.com/super-state/mother-brain/issues/new

## Step 2A.1.5: Update Issues Tracker & Display Results

- Update `.mother-brain/issues-tracker.md` with new session entries
- Commit tracker: `git add .mother-brain/issues-tracker.md && git commit -m "docs: track submitted issues"`
- Display summary of all submitted issues with numbers and URLs
- Use `ask_user` with choices:
  - "Keep local changes (for further work)"
  - "Revert Mother Brain files (clean slate)"
- If revert: `git checkout HEAD -- ".github/skills/mother-brain/" ".github/skills/child-brain/" ".github/skills/skill-creator/" "cli/"`
- Return to main menu (Step 2)
