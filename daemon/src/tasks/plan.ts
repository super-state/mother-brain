// ---------------------------------------------------------------------------
// Plan Schema — Structured plans for the planner/executor/verifier pipeline
// ---------------------------------------------------------------------------

export type PlanStepStatus = 'pending' | 'running' | 'done' | 'failed' | 'skipped';

/** Every step must resolve to exactly one of these outcomes. */
export type StepOutcome = 'done' | 'next' | 'retry' | 'fallback' | 'blocked';

/** Blocker categories for diagnosis. */
export type BlockerType =
  | 'missing_capability'  // Need tool, binary, package
  | 'missing_permission'  // Need scope, token, role
  | 'missing_secret'      // Need API key, credential
  | 'environment_mismatch' // Wrong version, missing dep
  | 'external_gate'       // MFA, CAPTCHA, human approval
  | 'bug_in_code'         // Runtime error, test failure
  | 'bad_plan'            // Wrong assumption, need replan
  | 'access_denied';      // Site blocked, 403, rate limited

export interface PlanStep {
  name: string;
  tool: string;
  args: Record<string, unknown>;
  successCriteria: string;
  status: PlanStepStatus;
  output?: unknown;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  outcome?: StepOutcome;
  blockerType?: BlockerType;
  retryCount?: number;
}

export interface Plan {
  goal: string;
  steps: PlanStep[];
  overallCriteria: string;
  createdAt: string;
  status: 'planned' | 'executing' | 'verifying' | 'verified' | 'failed';
}

export interface VerificationResult {
  verified: boolean;
  evidence: string;
  failedCriteria?: string;
}
