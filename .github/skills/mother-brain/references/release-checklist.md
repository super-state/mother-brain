# Release Checklist — Mother Brain Framework

One-click release: commit, version bump, push, tag, and publish.

**Prerequisite**: Must be in the mother-brain framework folder (not a project folder)

## Mandatory Checklist (ALL items MUST be completed)

```
[ ] cli/package.json - version field
[ ] cli/src/cli.ts - version constant (if exists)
[ ] README.md - version badge AND version text
[ ] Git commit with changes
[ ] Git tag (v0.0.X)
[ ] Push to remote (main + tags)
[ ] GitHub Release (created automatically by workflow)
[ ] npm publish (triggered by tag push via workflow)
```

**⛔ BLOCKING RULE**: Do NOT return to menu until ALL items above are completed.

## Step 2D.1: Verify & Analyze
- Check current folder is mother-brain framework folder
- If in a project folder: Display error and offer to return to framework
- Run `git status` to verify there are changes to release
- If no changes: Display "Nothing to release" and return to menu

## Step 2D.2: Auto-Determine Version
- Read current version from `cli/package.json`
- Scan learning-log.md entries since last release tag (if exists)
- **Auto-determine version bump**:
  - If any entry contains "breaking" or "major" → **major** bump (X.0.0)
  - If any entry contains "feature", "new", "add" → **minor** bump (0.X.0)
  - Otherwise → **patch** bump (0.0.X)
- Do NOT ask user - auto-decide based on content

## Step 2D.3: Update ALL Version References (MANDATORY)
- Update `cli/package.json`: `"version": "[new-version]"`
- Update `cli/src/cli.ts`: version constant (search for old version, replace with new)
- Update `README.md`:
  - Find `version-X.X.X-blue` badge and replace with new version
  - Find `**Version**: X.X.X` text and replace with new version
- **Verify all files updated before proceeding**

## Step 2D.4: Sync Skills to CLI and Agents
- Copy `.github/skills/*` to `cli/skills/` (overwrite) — for npm package
- Verify `.agents/skills/` symlinks point to `.github/skills/` — for Codex CLI in framework repo

## Step 2D.5: Build CLI
- Run `cd cli && npm run build`
- If build fails: STOP and display error

## Step 2D.6: Execute Git Operations
- Stage all changes: `git add -A`
- Commit: `git commit -m "[type]: [description] (v[version])"`
- Create tag: `git tag v[version]`
- **Push to origin (super-state) ONLY**: `git push origin main --tags`
- **NEVER push to personal fork** - only super-state has npm publish token

## Step 2D.7: Confirmation
- Display release summary with all checkmarks
- Use `ask_user` with choices:
  - "Open release on GitHub"
  - "Return to main menu"
  - "Start new project"
