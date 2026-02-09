# Working Directory Management

**Category**: Platforms > Shell/Terminal
**Tags**: powershell, working-directory, file-operations, cross-platform

## Pattern

Never assume working directory persists between tool calls in AI agent environments.

## Gotchas

- Each tool call may execute in a different working directory context
- PowerShell `Set-Location` does not persist across separate tool invocations
- Relative paths break silently when the working directory shifts
- `file not found` and `module not found` errors are often working directory issues, not missing files

## Solutions

1. **Always prefix commands with explicit directory change**: `Set-Location [project-path]; npm install`
2. **Use full absolute paths** for all file operations when possible
3. **Track current project path** in session state or as a variable at task start
4. **Verify location** after `Set-Location` before proceeding

## Windows-Specific: Directory Creation

When creating nested directory structures on Windows:

1. **Change to project directory FIRST**: `Set-Location "[project-path]"`
2. **Verify location**: Check command output shows correct path
3. **Use relative paths after location set**: `.github\skills\`
4. **Create parents with -Force flag**: `New-Item -ItemType Directory -Path "path" -Force`

```powershell
Set-Location "C:\Users\...\project-name"
New-Item -ItemType Directory -Path ".mother-brain\docs\research" -Force
```

**Why `-Force` works**: Creates parent directories automatically, prevents "parent directory does not exist" errors.

## Applicability

- Any AI agent runtime (Copilot CLI, Codex CLI, IDE extensions)
- Any operating system, but especially Windows where path separators differ
- Any multi-step task execution where commands run in separate processes
