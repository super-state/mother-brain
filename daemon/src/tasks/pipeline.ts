import type { Logger } from 'pino';
import type OpenAI from 'openai';
import type { ToolRegistry } from '../tools/index.js';
import type { TaskLedger, Task } from './ledger.js';
import type { Plan, PlanStep, VerificationResult, BlockerType } from './plan.js';
import { BlockerMemory } from './blocker-memory.js';

// ---------------------------------------------------------------------------
// Progress Heartbeat — structured updates emitted during pipeline execution
// ---------------------------------------------------------------------------

export type HeartbeatPhase = 'planning' | 'executing' | 'verifying' | 'complete' | 'failed';

export interface ProgressHeartbeat {
  taskId: string;
  phase: HeartbeatPhase;
  stepIndex?: number;
  totalSteps?: number;
  currentStep?: string;
  action: string;       // What we're doing right now
  result?: string;      // What happened (after step completes)
  next?: string;        // What comes next
  blockers?: string[];  // Active blockers
  timestamp: string;
}

export type HeartbeatCallback = (heartbeat: ProgressHeartbeat) => void | Promise<void>;

// ---------------------------------------------------------------------------
// Planner — LLM generates a structured plan given a task and tools
// ---------------------------------------------------------------------------

const PLANNER_PROMPT = `You are a task planner for an autonomous agent. Given a task and available tools, produce a JSON plan.

RULES:
- Output ONLY valid JSON, no markdown or explanation
- Each step must use exactly one available tool
- Include clear success criteria for each step and the overall task
- Keep plans minimal — fewest steps possible
- If the task can be done in one step, use one step

OUTPUT FORMAT:
{
  "goal": "what we're trying to achieve",
  "steps": [
    { "name": "step description", "tool": "tool_name", "args": { ... }, "successCriteria": "how to verify this step" }
  ],
  "overallCriteria": "how to verify the entire task is done"
}`;

export async function generatePlan(
  taskDescription: string,
  toolManifest: string,
  client: OpenAI,
  model: string,
  logger: Logger,
): Promise<Plan | null> {
  try {
    const response = await client.chat.completions.create({
      model,
      max_completion_tokens: 1024,
      messages: [
        { role: 'system', content: PLANNER_PROMPT },
        { role: 'user', content: `AVAILABLE TOOLS:\n${toolManifest}\n\nTASK: ${taskDescription}` },
      ],
    });

    const text = response.choices[0]?.message?.content?.trim();
    if (!text) return null;

    // Strip markdown code fences if present
    const jsonStr = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '');
    const parsed = JSON.parse(jsonStr);

    const plan: Plan = {
      goal: parsed.goal ?? taskDescription,
      steps: (parsed.steps ?? []).map((s: Record<string, unknown>) => ({
        name: s.name as string,
        tool: s.tool as string,
        args: (s.args ?? {}) as Record<string, unknown>,
        successCriteria: (s.successCriteria ?? '') as string,
        status: 'pending' as const,
      })),
      overallCriteria: parsed.overallCriteria ?? 'Task completed successfully',
      createdAt: new Date().toISOString(),
      status: 'planned',
    };

    logger.info({ goal: plan.goal, stepCount: plan.steps.length }, 'Plan generated');
    return plan;
  } catch (error) {
    logger.error({ error }, 'Failed to generate plan');
    return null;
  }
}

// ---------------------------------------------------------------------------
// Blocker Classifier — categorize failures for remediation
// ---------------------------------------------------------------------------

function classifyBlocker(error: string, tool: string): BlockerType {
  const e = error.toLowerCase();
  if (e.includes('403') || e.includes('forbidden') || e.includes('access denied') || e.includes('blocked')) return 'access_denied';
  if (e.includes('401') || e.includes('unauthorized') || e.includes('auth')) return 'missing_permission';
  if (e.includes('api key') || e.includes('token') || e.includes('credential')) return 'missing_secret';
  if (e.includes('not found') && (e.includes('binary') || e.includes('command'))) return 'missing_capability';
  if (e.includes('captcha') || e.includes('mfa') || e.includes('two-factor')) return 'external_gate';
  if (e.includes('enoent') || e.includes('no such file')) return 'environment_mismatch';
  if (e.includes('timeout') || e.includes('timed out')) return 'access_denied';
  return 'bad_plan';
}

/** Suggest a fallback tool based on blocker type and current tool. */
function suggestFallback(blockerType: BlockerType, currentTool: string): { tool: string; args?: Record<string, unknown> } | null {
  if (blockerType === 'access_denied' && currentTool === 'web_fetch') {
    return { tool: 'browser_fetch' }; // Use real browser for blocked sites
  }
  return null;
}

// ---------------------------------------------------------------------------
// Step Executor — runs plan steps with retry/fallback on failure
// ---------------------------------------------------------------------------

const MAX_RETRIES = 2;

export async function executeSteps(
  plan: Plan,
  toolRegistry: ToolRegistry,
  taskLedger: TaskLedger,
  taskId: string,
  logger: Logger,
  blockerMemory?: BlockerMemory,
  onHeartbeat?: HeartbeatCallback,
): Promise<Plan> {
  plan.status = 'executing';

  const emit = (hb: Omit<ProgressHeartbeat, 'taskId' | 'timestamp' | 'totalSteps'>) => {
    if (!onHeartbeat) return;
    try {
      onHeartbeat({ ...hb, taskId, totalSteps: plan.steps.length, timestamp: new Date().toISOString() });
    } catch { /* heartbeat failures must not break the pipeline */ }
  };

  for (let i = 0; i < plan.steps.length; i++) {
    const step = plan.steps[i];
    const nextStepName = i + 1 < plan.steps.length ? plan.steps[i + 1].name : 'verify results';

    step.status = 'running';
    step.startedAt = new Date().toISOString();
    step.retryCount = 0;

    taskLedger.checkpoint(taskId, { plan });

    emit({
      phase: 'executing',
      stepIndex: i + 1,
      currentStep: step.name,
      action: `Running: ${step.name} (${step.tool})`,
      next: nextStepName,
    });

    let resolved = false;

    while (!resolved && (step.retryCount ?? 0) <= MAX_RETRIES) {
      const tool = toolRegistry.get(step.tool);
      if (!tool) {
        step.status = 'failed';
        step.error = `Tool "${step.tool}" not found`;
        step.outcome = 'blocked';
        step.blockerType = 'missing_capability';
        step.completedAt = new Date().toISOString();
        logger.warn({ step: step.name, tool: step.tool }, 'Step blocked — tool not found');
        resolved = true;
        break;
      }

      try {
        const originalTool = step.tool;
        const result = await toolRegistry.execute(step.tool, step.args, logger);
        step.completedAt = new Date().toISOString();

        if (result.success) {
          step.status = 'done';
          step.outcome = 'done';
          step.output = result.output;
          logger.info({ step: step.name, durationMs: result.durationMs }, 'Step done');

          emit({
            phase: 'executing',
            stepIndex: i + 1,
            currentStep: step.name,
            action: `Completed: ${step.name}`,
            result: 'Success',
            next: nextStepName,
          });

          // If this was a fallback/retry, record the resolution for future learning
          if ((step.retryCount ?? 0) > 0 && blockerMemory && step.error) {
            blockerMemory.record({
              originalTool,
              originalError: step.error,
              blockerType: step.blockerType ?? 'bad_plan',
              resolutionTool: step.tool,
              resolutionArgs: step.args,
              taskId,
            });
          }

          resolved = true;
        } else {
          // Classify the failure
          const errorStr = result.error ?? 'Unknown error';
          step.blockerType = classifyBlocker(errorStr, step.tool);
          step.error = errorStr;

          // 1. Consult memory for a known resolution
          if (blockerMemory) {
            const learned = blockerMemory.lookup(step.tool, errorStr);
            if (learned && toolRegistry.get(learned.tool)) {
              logger.info(
                { step: step.name, from: step.tool, to: learned.tool, source: 'memory' },
                'Step using learned resolution',
              );
              emit({
                phase: 'executing',
                stepIndex: i + 1,
                currentStep: step.name,
                action: `Retrying with learned fix: ${learned.tool}`,
                result: `Failed with ${step.tool}: ${errorStr.slice(0, 100)}`,
                blockers: [step.blockerType],
              });
              step.tool = learned.tool;
              if (Object.keys(learned.args).length > 0) step.args = { ...step.args, ...learned.args };
              step.outcome = 'retry';
              step.retryCount = (step.retryCount ?? 0) + 1;
              continue;
            }
          }

          // 2. Try generic fallback
          const fallback = suggestFallback(step.blockerType, step.tool);
          if (fallback && toolRegistry.get(fallback.tool)) {
            logger.info(
              { step: step.name, from: step.tool, to: fallback.tool, blocker: step.blockerType },
              'Step falling back to alternative tool',
            );
            emit({
              phase: 'executing',
              stepIndex: i + 1,
              currentStep: step.name,
              action: `Falling back: ${step.tool} → ${fallback.tool}`,
              result: `Blocked: ${errorStr.slice(0, 100)}`,
              blockers: [step.blockerType],
            });
            step.tool = fallback.tool;
            if (fallback.args) step.args = { ...step.args, ...fallback.args };
            step.outcome = 'fallback';
            step.retryCount = (step.retryCount ?? 0) + 1;
            continue;
          }

          // 3. No resolution — blocked
          if (blockerMemory) {
            blockerMemory.recordFailure({
              originalTool: step.tool,
              originalError: errorStr,
              blockerType: step.blockerType,
              resolutionTool: step.tool,
              taskId,
            });
          }

          step.status = 'failed';
          step.outcome = 'blocked';
          logger.warn({ step: step.name, error: errorStr, blocker: step.blockerType }, 'Step failed — no fallback');
          emit({
            phase: 'executing',
            stepIndex: i + 1,
            currentStep: step.name,
            action: `Blocked: ${step.name}`,
            result: errorStr.slice(0, 150),
            blockers: [step.blockerType],
          });
          resolved = true;
        }
      } catch (error) {
        step.status = 'failed';
        step.error = error instanceof Error ? error.message : String(error);
        step.outcome = 'blocked';
        step.blockerType = classifyBlocker(step.error, step.tool);
        step.completedAt = new Date().toISOString();
        logger.error({ step: step.name, error: step.error, blocker: step.blockerType }, 'Step threw exception');
        resolved = true;
      }
    }

    taskLedger.checkpoint(taskId, { plan });
  }

  return plan;
}

// ---------------------------------------------------------------------------
// Verifier — checks success criteria against actual outputs
// ---------------------------------------------------------------------------

const VERIFIER_PROMPT = `You are a verification agent. Given a task plan with its outputs and success criteria, determine if the task is truly complete.

RULES:
- Output ONLY valid JSON
- Be strict — if criteria aren't clearly met by the evidence, mark as not verified
- Check both individual step criteria and overall criteria

OUTPUT FORMAT:
{ "verified": true/false, "evidence": "summary of what was accomplished", "failedCriteria": "what wasn't met (if not verified)" }`;

export async function verifyPlan(
  plan: Plan,
  client: OpenAI,
  model: string,
  logger: Logger,
): Promise<VerificationResult> {
  plan.status = 'verifying';

  // If all steps failed, no need to call LLM
  const allFailed = plan.steps.every(s => s.status === 'failed');
  if (allFailed) {
    return {
      verified: false,
      evidence: 'All plan steps failed',
      failedCriteria: plan.overallCriteria,
    };
  }

  // Simple verification: if there are outputs and no failures, pass
  const failedSteps = plan.steps.filter(s => s.status === 'failed');
  const doneSteps = plan.steps.filter(s => s.status === 'done');

  if (failedSteps.length === 0 && doneSteps.length > 0) {
    // All steps passed — use LLM to verify against overall criteria
    try {
      const planSummary = plan.steps.map(s => {
        const output = s.output ? JSON.stringify(s.output).slice(0, 500) : '(no output)';
        return `Step: ${s.name}\n  Status: ${s.status}\n  Output: ${output}\n  Criteria: ${s.successCriteria}`;
      }).join('\n\n');

      const response = await client.chat.completions.create({
        model,
        max_completion_tokens: 256,
        messages: [
          { role: 'system', content: VERIFIER_PROMPT },
          { role: 'user', content: `OVERALL CRITERIA: ${plan.overallCriteria}\n\nPLAN RESULTS:\n${planSummary}` },
        ],
      });

      const text = response.choices[0]?.message?.content?.trim();
      if (text) {
        const jsonStr = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '');
        const result = JSON.parse(jsonStr) as VerificationResult;
        logger.info({ verified: result.verified }, 'Plan verification complete');
        return result;
      }
    } catch (error) {
      logger.error({ error }, 'LLM verification failed — falling back to step-based check');
    }
  }

  // Fallback: if some steps failed, report partial
  if (failedSteps.length > 0) {
    return {
      verified: false,
      evidence: `${doneSteps.length}/${plan.steps.length} steps completed`,
      failedCriteria: failedSteps.map(s => `${s.name}: ${s.error}`).join('; '),
    };
  }

  return {
    verified: true,
    evidence: `All ${plan.steps.length} steps completed successfully`,
  };
}

// ---------------------------------------------------------------------------
// Pipeline Orchestrator — plan → execute → verify → update task
// ---------------------------------------------------------------------------

export interface PipelineConfig {
  client: OpenAI;
  model: string;            // Default model (chat tier)
  plannerModel?: string;    // Override for planning phase
  verifierModel?: string;   // Override for verification phase
  toolRegistry: ToolRegistry;
  taskLedger: TaskLedger;
  logger: Logger;
  blockerMemory?: BlockerMemory;
  onHeartbeat?: HeartbeatCallback;
}

export interface PipelineResult {
  task: Task;
  plan: Plan;
  verification: VerificationResult;
}

/**
 * Run the full planner → executor → verifier pipeline for a task.
 * The task must already exist in the ledger (queued status).
 */
export async function runPipeline(
  taskId: string,
  config: PipelineConfig,
): Promise<PipelineResult | null> {
  const { client, model, plannerModel, verifierModel, toolRegistry, taskLedger, logger, blockerMemory, onHeartbeat } = config;

  const emit = (hb: Omit<ProgressHeartbeat, 'taskId' | 'timestamp'>) => {
    if (!onHeartbeat) return;
    try { onHeartbeat({ ...hb, taskId, timestamp: new Date().toISOString() }); } catch { /* ignore */ }
  };

  // Start the task
  const task = taskLedger.start(taskId);
  if (!task) {
    logger.error({ taskId }, 'Cannot start pipeline — task not startable');
    return null;
  }

  logger.info({ taskId, title: task.title }, 'Pipeline started');

  // Phase 1: Plan
  emit({ phase: 'planning', action: `Planning: ${task.title}` });
  const toolManifest = toolRegistry.generateManifest();
  const plan = await generatePlan(task.title, toolManifest, client, plannerModel ?? model, logger);

  if (!plan || plan.steps.length === 0) {
    emit({ phase: 'failed', action: 'Planning failed — no valid plan generated' });
    taskLedger.fail(taskId, 'Planner failed to generate a valid plan');
    return null;
  }

  emit({
    phase: 'planning',
    action: `Plan ready: ${plan.steps.length} steps`,
    next: plan.steps[0]?.name ?? 'execute',
  });

  taskLedger.checkpoint(taskId, { plan, phase: 'planned' });

  // Phase 2: Execute
  const executedPlan = await executeSteps(plan, toolRegistry, taskLedger, taskId, logger, blockerMemory, onHeartbeat);
  taskLedger.checkpoint(taskId, { plan: executedPlan, phase: 'executed' });

  // Phase 3: Verify
  emit({ phase: 'verifying', action: 'Verifying results against success criteria' });
  const verification = await verifyPlan(executedPlan, client, verifierModel ?? model, logger);

  if (verification.verified) {
    executedPlan.status = 'verified';
    const artifacts = executedPlan.steps
      .filter(s => s.output)
      .map(s => ({ type: 'json' as const, label: s.name, value: JSON.stringify(s.output).slice(0, 2000) }));
    taskLedger.complete(taskId, artifacts);
    emit({ phase: 'complete', action: 'Task verified and complete', result: verification.evidence });
  } else {
    executedPlan.status = 'failed';
    taskLedger.fail(taskId, verification.failedCriteria ?? 'Verification failed');
    emit({ phase: 'failed', action: 'Verification failed', result: verification.failedCriteria });
  }

  const updatedTask = taskLedger.getById(taskId)!;
  logger.info(
    { taskId, verified: verification.verified, steps: executedPlan.steps.length },
    'Pipeline complete',
  );

  return { task: updatedTask, plan: executedPlan, verification };
}
