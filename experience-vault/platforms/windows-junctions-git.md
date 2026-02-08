# Windows NTFS Junctions vs Symlinks & Git

## Problem
NTFS **junctions** created with `New-Item -ItemType Junction` don't survive git operations. After `git clone`, junction targets are lost and directories appear empty.

## Gotcha
Git does NOT track NTFS junctions. However, git DOES track proper **symbolic links** (mode 120000). The key distinction:

- **NTFS Junction** (`-ItemType Junction`): NOT stored in git. Lost on clone. ❌
- **Symbolic Link** (`-ItemType SymbolicLink`): Stored in git as relative path text. Recreated on clone. ✅

For symlinks to work on Windows:
- `git config core.symlinks true` must be set
- Developer Mode must be enabled (Windows 10+), OR run as Administrator

## Solution
Use **relative symbolic links** (not junctions) when files need to survive git:

```powershell
# Instead of (doesn't survive git):
New-Item -ItemType Junction -Path $link -Target $target -Force

# Do (survives git):
New-Item -ItemType SymbolicLink -Path $link -Target "../../.github/skills/mother-brain" -Force
```

Git stores the symlink as a tiny file containing just the relative path. On checkout with `core.symlinks=true`, it recreates real symlinks.

If symlinks fail (no Developer Mode), fall back to copies:
```powershell
try {
    New-Item -ItemType SymbolicLink -Path $link -Target $relTarget -Force
} catch {
    Copy-Item $source $dest -Recurse -Force
}
```

**When to Consult**: Step 3.6.2 (project initialization), Step 6 (skill creation), Step 2D (release process)

## Related Gotchas
See also:
- experience-vault/platforms/ (other Windows-specific patterns)

## Sources
- https://git-scm.com/docs/git-config#Documentation/git-config.txt-coresymlinks
- https://learn.microsoft.com/en-us/windows/win32/fileio/hard-links-and-junctions
