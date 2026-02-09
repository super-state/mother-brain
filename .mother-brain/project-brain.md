# Mother Brain — Project Brain

> Development-specific knowledge for working on Mother Brain itself.
> This is NOT packaged to npm — it's for framework contributors only.

## Release Process

### Tag-Triggered Publishing
- **Workflow**: `.github/workflows/publish.yml` triggers on tag push (`v*`)
- **What happens automatically**:
  1. Build runs in GitHub Actions
  2. Skills are synced to cli/skills/
  3. npm publish runs with `NPM_TOKEN` secret
  4. GitHub Release is created

### Release Steps (for developers)
1. Update version in `cli/package.json`
2. Commit with message: `v0.X.Y: [description]`
3. Create and push tag: `git tag v0.X.Y && git push origin main --tags`
4. **STOP** — Check workflow status, do NOT run `npm publish` locally
5. Verify on npm: `npm view mother-brain version`

### Anti-Pattern (Don't Do This)
- Push tag → then try `npm publish` locally → fails with auth error → ask user to login
- The automation already handled it!

## Versioning Policy

- **Conservative versioning**: 20+ patch releases before minor bump
- Example: 0.6.1 → 0.6.2 → ... → 0.6.21 → 0.7.0
- Prevents version number inflation

## File Sync Requirements

After editing `.github/skills/mother-brain/SKILL.md`:
- Must sync to `cli/skills/mother-brain/SKILL.md`
- The publish workflow does this automatically, but for local testing sync manually

## Learning Log

### 2026-02-09 — Don't duplicate automated actions
**Trigger**: Tried to run `npm publish` locally after pushing tag, when workflow already handles it
**Learning**: Always check if CI/CD workflow was triggered before attempting manual action
**Check Added**: After pushing release tag, verify workflow status before any manual intervention
