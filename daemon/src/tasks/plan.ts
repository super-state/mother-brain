// ---------------------------------------------------------------------------
// Plan Schema — Structured plans for the planner/executor/verifier pipeline
// ---------------------------------------------------------------------------

export type PlanStepStatus = 'pending' | 'running' | 'done' | 'failed' | 'skipped';

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
