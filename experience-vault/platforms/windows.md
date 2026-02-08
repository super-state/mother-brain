# Windows Platform Specifics

## PowerShell Directory Creation

**Problem**: `New-Item -ItemType Directory` fails with "already exists" error

**Gotcha**: 
- Unlike Unix `mkdir -p`, PowerShell throws error if directory exists
- This breaks scripts that assume idempotent directory creation

**Solution**:
```powershell
New-Item -ItemType Directory -Path "path\to\folder" -Force | Out-Null
```

The `-Force` flag makes it idempotent (no error if exists)

**When to Use**:
- ALL directory creation in PowerShell scripts
- Project setup (Step 3.6)
- Task execution when creating folders

---

## Path Separators

**Problem**: Forward slashes (`/`) don't work in Windows paths

**Gotcha**:
- Works in some contexts (web URLs, Git paths)
- Fails in file system operations
- Mixing styles causes "path not found" errors

**Solution**:
```powershell
# ✅ Windows-style (correct)
$path = "C:\Users\Project\src"

# ❌ Unix-style (fails)
$path = "C:/Users/Project/src"

# Use Join-Path for cross-platform
$path = Join-Path $env:USERPROFILE "Projects" "MyApp"
```

**When to Use**:
- ALL file operations in PowerShell
- Path construction in Mother Brain steps

---

## Environment Variables

**Problem**: `$HOME` doesn't exist in Windows PowerShell

**Gotcha**:
- Unix uses `$HOME`
- PowerShell uses `$env:USERPROFILE`

**Solution**:
```powershell
# ✅ Windows (correct)
$userFolder = $env:USERPROFILE

# ❌ Unix-style (fails on Windows)
$userFolder = $HOME
```

---

## Process Termination

**Problem**: Killing processes by name affects ALL instances

**Gotcha**:
- `Stop-Process -Name chrome` kills ALL Chrome windows
- `taskkill /IM chrome.exe` affects all instances
- User loses work in unrelated windows

**Solution**:
```powershell
# ✅ Kill specific process by PID
Stop-Process -Id 12345

# ❌ NEVER use these (kills all instances)
Stop-Process -Name chrome
taskkill /IM chrome.exe
```

**When to Use**:
- ALWAYS get PID when starting process: `$proc = Start-Process -PassThru`
- Use `$proc.Id` for termination

---

## File Encoding

**Problem**: Text files created with wrong encoding cause rendering issues

**Gotcha**:
- PowerShell defaults to UTF-16 LE (BOM)
- Most tools expect UTF-8 without BOM
- Can break Git, npm, and other tools

**Solution**:
```powershell
# ✅ UTF-8 without BOM (correct)
Set-Content -Path "file.txt" -Value $content -Encoding UTF8

# ❌ Default encoding (causes issues)
$content | Out-File "file.txt"
```

---

## Browser Executable Paths

**Problem**: Browser commands not in PATH

**Gotcha**:
- `chrome`, `msedge`, `firefox` commands may not work
- Need full executable paths
- Different install locations (x86 vs x64)

**Solution**:
```powershell
# Common browser paths
$edgePaths = @(
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
)

$chromePaths = @(
  "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
  "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
)

$firefoxPaths = @(
  "${env:ProgramFiles(x86)}\Mozilla Firefox\firefox.exe",
  "$env:ProgramFiles\Mozilla Firefox\firefox.exe"
)

# Find first existing path
$browserPath = $edgePaths | Where-Object { Test-Path $_ } | Select-Object -First 1
```

**When to Use**:
- Step 2.5 (Environment Discovery)
- Browser detection and launching

---

## When to Consult This

- **All PowerShell execution** in Mother Brain
- **Step 3.6**: Project initialization
- **Step 9**: Task execution with file operations
- **Step 2.5**: Environment discovery

## Related Gotchas

See also:
- `platforms/cross-platform.md` - Writing cross-platform scripts

## Sources

- [PowerShell Documentation](https://docs.microsoft.com/en-us/powershell/)
- [Windows Environment Variables](https://ss64.com/nt/syntax-variables.html)
