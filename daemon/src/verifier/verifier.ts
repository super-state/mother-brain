import type { Logger } from 'pino';
import { detectProjectCommands, runBuildGate, runTestGate } from './gates.js';
import type { GateOutput } from './gates.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'FAILED';

export interface VerificationResult {
  confidence: ConfidenceLevel;
  buildGate: GateOutput | null;
  testGate: GateOutput | null;
  summary: string;
}

// ---------------------------------------------------------------------------
// Confidence Classification
// ---------------------------------------------------------------------------

/**
 * Classify confidence based on gate results.
 *
 * HIGH:   Build pass + Test pass (or no tests exist)
 * MEDIUM: Build pass + Tests skipped (no test command)
 * FAILED: Build fail OR Test fail
 */
function classifyConfidence(
  buildGate: GateOutput | null,
  testGate: GateOutput | null,
): ConfidenceLevel {
  // If build failed, it's FAILED regardless
  if (buildGate?.result === 'fail') return 'FAILED';

  // If tests failed, it's FAILED
  if (testGate?.result === 'fail') return 'FAILED';

  // If build passed and tests passed, HIGH
  if (buildGate?.result === 'pass' && testGate?.result === 'pass') return 'HIGH';

  // If build passed but no test command exists, MEDIUM
  if (buildGate?.result === 'pass' && testGate === null) return 'MEDIUM';

  // No build command, but tests passed
  if (buildGate === null && testGate?.result === 'pass') return 'HIGH';

  // Neither build nor test commands detected
  if (buildGate === null && testGate === null) return 'MEDIUM';

  return 'MEDIUM';
}

// ---------------------------------------------------------------------------
// Verifier
// ---------------------------------------------------------------------------

/**
 * Run the full verification pipeline against the workspace.
 *
 * Pipeline:
 * 1. Detect project build/test commands
 * 2. Run build gate
 * 3. Run test gate
 * 4. Classify confidence
 *
 * Returns the verification result with confidence level.
 * The caller (daemon loop) decides what to do based on confidence:
 * - HIGH → auto-commit
 * - MEDIUM → commit to branch, flag for review
 * - FAILED → revert changes
 */
export function verify(repoPath: string, logger: Logger): VerificationResult {
  logger.info({ repoPath }, 'Starting verification pipeline');

  const detection = detectProjectCommands(repoPath);
  logger.info({ projectType: detection.projectType }, 'Project type detected');

  const buildGate = runBuildGate(repoPath, detection, logger);
  const testGate = runTestGate(repoPath, detection, logger);

  const confidence = classifyConfidence(buildGate, testGate);

  const summary = [
    `Confidence: ${confidence}`,
    buildGate ? `Build: ${buildGate.result} (${buildGate.durationMs}ms)` : 'Build: skipped',
    testGate ? `Test: ${testGate.result} (${testGate.durationMs}ms)` : 'Test: skipped',
  ].join(' | ');

  logger.info({ confidence, summary }, 'Verification complete');

  return { confidence, buildGate, testGate, summary };
}
