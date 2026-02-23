import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Logger } from 'pino';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GateResult = 'pass' | 'fail';

export interface GateOutput {
  gate: string;
  result: GateResult;
  output: string;
  durationMs: number;
}

// ---------------------------------------------------------------------------
// Build Command Detection
// ---------------------------------------------------------------------------

interface ProjectDetection {
  buildCommand: string | null;
  testCommand: string | null;
  projectType: string;
}

/** Auto-detect build and test commands from the project structure. */
export function detectProjectCommands(repoPath: string): ProjectDetection {
  // Node.js (package.json)
  const pkgPath = join(repoPath, 'package.json');
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(execSync(`cat "${pkgPath}"`, { encoding: 'utf-8' })) as {
        scripts?: Record<string, string>;
      };
      return {
        buildCommand: pkg.scripts?.['build'] ? 'npm run build' : null,
        testCommand: pkg.scripts?.['test'] ? 'npm test' : null,
        projectType: 'node',
      };
    } catch {
      // Fall through
    }
  }

  // Rust (Cargo.toml)
  if (existsSync(join(repoPath, 'Cargo.toml'))) {
    return {
      buildCommand: 'cargo build',
      testCommand: 'cargo test',
      projectType: 'rust',
    };
  }

  // Go (go.mod)
  if (existsSync(join(repoPath, 'go.mod'))) {
    return {
      buildCommand: 'go build ./...',
      testCommand: 'go test ./...',
      projectType: 'go',
    };
  }

  // Python (pyproject.toml or setup.py)
  if (existsSync(join(repoPath, 'pyproject.toml')) || existsSync(join(repoPath, 'setup.py'))) {
    return {
      buildCommand: null,
      testCommand: 'python -m pytest',
      projectType: 'python',
    };
  }

  return { buildCommand: null, testCommand: null, projectType: 'unknown' };
}

// ---------------------------------------------------------------------------
// Gates
// ---------------------------------------------------------------------------

const GATE_TIMEOUT_MS = 120_000; // 2 minutes max for build/test

/** Run a shell command as a verification gate. */
function runGate(name: string, command: string, cwd: string, logger: Logger): GateOutput {
  const start = Date.now();
  try {
    const output = execSync(command, {
      cwd,
      encoding: 'utf-8',
      timeout: GATE_TIMEOUT_MS,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const durationMs = Date.now() - start;
    logger.info({ gate: name, durationMs }, 'Gate passed');
    return { gate: name, result: 'pass', output: output.slice(-2000), durationMs };
  } catch (error) {
    const durationMs = Date.now() - start;
    const stderr = (error as { stderr?: string }).stderr ?? '';
    const stdout = (error as { stdout?: string }).stdout ?? '';
    const output = (stderr + '\n' + stdout).slice(-2000);

    logger.warn({ gate: name, durationMs }, 'Gate failed');
    return { gate: name, result: 'fail', output, durationMs };
  }
}

/** Run the build gate. Returns null if no build command detected. */
export function runBuildGate(repoPath: string, detection: ProjectDetection, logger: Logger): GateOutput | null {
  if (!detection.buildCommand) {
    logger.info('No build command detected — skipping build gate');
    return null;
  }
  return runGate('build', detection.buildCommand, repoPath, logger);
}

/** Run the test gate. Returns null if no test command detected. */
export function runTestGate(repoPath: string, detection: ProjectDetection, logger: Logger): GateOutput | null {
  if (!detection.testCommand) {
    logger.info('No test command detected — skipping test gate');
    return null;
  }
  return runGate('test', detection.testCommand, repoPath, logger);
}
