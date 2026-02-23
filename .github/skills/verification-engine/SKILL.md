---
name: verification-engine
description: Multi-layer verification gates for autonomous daemon output — build, test, and functional verification with independent checking.
license: MIT
compatibility: node>=18
metadata:
  domain: quality
  stage: production
allowed-tools: powershell view grep glob web_search ask_user create edit
---

# Verification Engine

Provides the verification pipeline for the daemon's autonomous output. Every task the daemon completes must pass through verification gates before being committed. Use this skill when implementing or modifying verification logic.

## Purpose

The verification engine ensures autonomous output is trustworthy by:
- Running multi-layer verification gates (build → test → functional)
- Using independent verification (the implementer context ≠ the verifier context)
- Classifying results by confidence (HIGH / MEDIUM / FAILED)
- Providing evidence for morning reports

## Operating Principles

### Core Rules
- **Implementer ≠ Verifier** — The LLM context that wrote the code MUST NOT be the same context that verifies it. No "marking your own homework."
- **Fail-safe defaults** — If verification is inconclusive, default to MEDIUM (not HIGH). Err on the side of caution.
- **Free gates first** — Build and test gates cost $0 (shell commands). Only call LLM for functional verification if needed.
- **Revert on failure** — Failed verification = git revert. Don't accumulate broken changes.
- **Evidence collection** — Every gate produces evidence (logs, test output) stored for morning report.

### Verification Pipeline

```
Task Output
    │
    ▼
┌──────────────┐
│  BUILD GATE  │  Cost: $0 (shell command)
│              │  Command: npm run build / cargo build / etc.
│  Pass? ──────┼──→ If fail: FAILED, revert, log, move on
│              │
└──────┬───────┘
       │ Pass
       ▼
┌──────────────┐
│  TEST GATE   │  Cost: $0 (shell command)
│              │  Command: npm test / pytest / etc.
│  Pass? ──────┼──→ If fail: FAILED, revert, log, move on
│  No tests? ──┼──→ Skip gate, note "no tests available"
│              │
└──────┬───────┘
       │ Pass (or skip)
       ▼
┌──────────────┐
│  FUNCTIONAL  │  Cost: ~500 tokens (LLM call)
│  GATE        │  Independent LLM reviews the diff
│  (Post-MVP)  │  Checks: Does this actually solve the task?
│              │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  CONFIDENCE  │
│  CLASSIFIER  │
│              │
│  HIGH ───────┼──→ Auto-commit to main branch
│  MEDIUM ─────┼──→ Commit to review branch, flag for human
│  FAILED ─────┼──→ Revert, log error, notify
│              │
└──────────────┘
```

### Confidence Classification

| Result | Build | Tests | Functional | Action |
|--------|-------|-------|-----------|--------|
| HIGH | ✅ Pass | ✅ Pass | ✅ Pass | Auto-commit |
| HIGH | ✅ Pass | ✅ Pass | ⬜ Skip (MVP) | Auto-commit |
| MEDIUM | ✅ Pass | ⬜ No tests | ⬜ Skip | Commit to branch, flag |
| MEDIUM | ✅ Pass | ✅ Pass | ❌ Concerns | Commit to branch, flag |
| FAILED | ❌ Fail | Any | Any | Revert, log, move on |
| FAILED | ✅ Pass | ❌ Fail | Any | Revert, log, move on |

### Gate Implementation Patterns

#### Build Gate
```typescript
interface GateResult {
  gate: 'build' | 'test' | 'functional';
  passed: boolean;
  output: string;       // stdout/stderr
  duration: number;     // ms
  evidence: string;     // for morning report
}

async function buildGate(workspace: Workspace): Promise<GateResult> {
  const startTime = Date.now();
  
  // Detect build command from project
  const buildCmd = detectBuildCommand(workspace);
  // npm run build, cargo build, go build, etc.
  
  if (!buildCmd) {
    return {
      gate: 'build',
      passed: true,
      output: 'No build command detected — skipping',
      duration: 0,
      evidence: 'Build gate skipped (no build command found)',
    };
  }

  try {
    const result = await exec(buildCmd, { 
      cwd: workspace.path,
      timeout: 120_000  // 2 minute timeout
    });
    
    return {
      gate: 'build',
      passed: result.exitCode === 0,
      output: result.stdout + result.stderr,
      duration: Date.now() - startTime,
      evidence: result.exitCode === 0 
        ? `Build passed in ${Date.now() - startTime}ms`
        : `Build failed: ${extractError(result.stderr)}`,
    };
  } catch (error) {
    return {
      gate: 'build',
      passed: false,
      output: error.message,
      duration: Date.now() - startTime,
      evidence: `Build crashed: ${error.message}`,
    };
  }
}
```

#### Test Gate
```typescript
async function testGate(workspace: Workspace): Promise<GateResult> {
  const testCmd = detectTestCommand(workspace);
  
  if (!testCmd) {
    return {
      gate: 'test',
      passed: true, // Skip, don't fail
      output: 'No test command detected — skipping',
      duration: 0,
      evidence: 'Test gate skipped (no tests found)',
    };
  }

  const result = await exec(testCmd, {
    cwd: workspace.path,
    timeout: 300_000  // 5 minute timeout
  });

  return {
    gate: 'test',
    passed: result.exitCode === 0,
    output: result.stdout + result.stderr,
    duration: Date.now() - startTime,
    evidence: result.exitCode === 0
      ? `Tests passed: ${extractTestCount(result.stdout)}`
      : `Tests failed: ${extractFailures(result.stdout)}`,
  };
}
```

#### Build/Test Command Detection
```typescript
function detectBuildCommand(workspace: Workspace): string | null {
  const packageJson = workspace.readFileIfExists('package.json');
  if (packageJson) {
    const pkg = JSON.parse(packageJson);
    if (pkg.scripts?.build) return 'npm run build';
  }

  if (workspace.fileExists('Cargo.toml')) return 'cargo build';
  if (workspace.fileExists('go.mod')) return 'go build ./...';
  if (workspace.fileExists('Makefile')) return 'make';
  if (workspace.fileExists('pom.xml')) return 'mvn compile';

  return null;
}

function detectTestCommand(workspace: Workspace): string | null {
  const packageJson = workspace.readFileIfExists('package.json');
  if (packageJson) {
    const pkg = JSON.parse(packageJson);
    if (pkg.scripts?.test && pkg.scripts.test !== 'echo "Error: no test specified" && exit 1') {
      return 'npm test';
    }
  }

  if (workspace.fileExists('Cargo.toml')) return 'cargo test';
  if (workspace.fileExists('go.mod')) return 'go test ./...';
  if (workspace.fileExists('pytest.ini') || workspace.fileExists('pyproject.toml')) return 'pytest';

  return null;
}
```

### Independent Verifier (Post-MVP)

The functional gate uses a SEPARATE LLM context to review the changes:

```typescript
async function functionalGate(
  task: Task,
  diff: string,
  llm: LLMClient
): Promise<GateResult> {
  // Fresh context — no knowledge of implementation process
  const verifierPrompt = `
    You are a code reviewer. You have NOT seen the implementation process.
    
    Task objective: ${task.objective}
    
    Here is the diff of changes made:
    ${diff}
    
    Answer these questions:
    1. Does this diff achieve the stated objective?
    2. Are there any obvious bugs or issues?
    3. Does the code follow reasonable patterns?
    
    Respond with:
    VERDICT: PASS or FAIL
    CONCERNS: [list any concerns, or "none"]
  `;

  const response = await llm.call(verifierPrompt);
  const verdict = response.includes('VERDICT: PASS');

  return {
    gate: 'functional',
    passed: verdict,
    output: response,
    duration: 0,
    evidence: verdict
      ? 'Independent reviewer approved changes'
      : `Independent reviewer flagged concerns: ${extractConcerns(response)}`,
  };
}
```

### Evidence Storage

```sql
CREATE TABLE verification_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_execution_id TEXT REFERENCES task_executions(id),
  gate TEXT CHECK(gate IN ('build', 'test', 'functional')),
  passed INTEGER NOT NULL,
  output TEXT,
  evidence TEXT NOT NULL,
  duration_ms INTEGER,
  created_at TEXT DEFAULT (datetime('now'))
);
```

## Steps

1. **Identify Verification Need**
   - Determine which gates apply to the current task
   - Check for build command, test command, functional requirements

2. **Run Gates in Order**
   - Always: Build gate first (free, fast)
   - If build passes: Test gate (free, may be slower)
   - Post-MVP: Functional gate (LLM cost, independent context)
   - Stop at first failure

3. **Classify Confidence**
   - Use the classification matrix above
   - Default to MEDIUM when uncertain

4. **Store Evidence**
   - Save all gate results to SQLite
   - Format evidence for morning report
   - Include command output, timing, and verdict

## Validation Checklist

- [ ] Build gate detects correct build command for project type
- [ ] Test gate detects correct test command
- [ ] Gates timeout (don't hang forever)
- [ ] Failed gates trigger git revert
- [ ] Evidence is stored for every gate result
- [ ] Confidence classification matches the matrix
- [ ] Functional gate uses independent LLM context (not implementer context)
- [ ] Gate output is captured for morning report
