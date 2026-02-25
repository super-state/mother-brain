import type { Logger } from 'pino';
import type OpenAI from 'openai';
import type { ToolRegistry } from '../tools/index.js';
import type { TaskLedger, Task } from './ledger.js';
import type { Plan, PlanStep, VerificationResult } from './plan.js';

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
      max_tokens: 1024,
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
// Step Executor — runs plan steps sequentially using the tool registry
// ---------------------------------------------------------------------------

export async function executeSteps(
  plan: Plan,
  toolRegistry: ToolRegistry,
  taskLedger: TaskLedger,
  taskId: string,
  logger: Logger,
): Promise<Plan> {
  plan.status = 'executing';

  for (const step of plan.steps) {
    step.status = 'running';
    step.startedAt = new Date().toISOString();

    // Save checkpoint after each step starts
    taskLedger.checkpoint(taskId, { plan });

    const tool = toolRegistry.get(step.tool);
    if (!tool) {
      step.status = 'failed';
      step.error = `Tool "${step.tool}" not found`;
      step.completedAt = new Date().toISOString();
      logger.warn({ step: step.name, tool: step.tool }, 'Step failed — tool not found');
      continue;
    }

    try {
      const result = await toolRegistry.execute(step.tool, step.args, logger);
      step.completedAt = new Date().toISOString();

      if (result.success) {
        step.status = 'done';
        step.output = result.output;
        logger.info({ step: step.name, durationMs: result.durationMs }, 'Step completed');
      } else {
        step.status = 'failed';
        step.error = result.error ?? 'Unknown error';
        logger.warn({ step: step.name, error: step.error }, 'Step failed');
      }
    } catch (error) {
      step.status = 'failed';
      step.error = error instanceof Error ? error.message : String(error);
      step.completedAt = new Date().toISOString();
      logger.error({ step: step.name, error: step.error }, 'Step threw exception');
    }

    // Checkpoint after each step
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
        max_tokens: 256,
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
  model: string;
  toolRegistry: ToolRegistry;
  taskLedger: TaskLedger;
  logger: Logger;
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
  const { client, model, toolRegistry, taskLedger, logger } = config;

  // Start the task
  const task = taskLedger.start(taskId);
  if (!task) {
    logger.error({ taskId }, 'Cannot start pipeline — task not startable');
    return null;
  }

  logger.info({ taskId, title: task.title }, 'Pipeline started');

  // Phase 1: Plan
  const toolManifest = toolRegistry.generateManifest();
  const plan = await generatePlan(task.title, toolManifest, client, model, logger);

  if (!plan || plan.steps.length === 0) {
    taskLedger.fail(taskId, 'Planner failed to generate a valid plan');
    return null;
  }

  taskLedger.checkpoint(taskId, { plan, phase: 'planned' });

  // Phase 2: Execute
  const executedPlan = await executeSteps(plan, toolRegistry, taskLedger, taskId, logger);
  taskLedger.checkpoint(taskId, { plan: executedPlan, phase: 'executed' });

  // Phase 3: Verify
  const verification = await verifyPlan(executedPlan, client, model, logger);

  if (verification.verified) {
    executedPlan.status = 'verified';
    const artifacts = executedPlan.steps
      .filter(s => s.output)
      .map(s => ({ type: 'json' as const, label: s.name, value: JSON.stringify(s.output).slice(0, 2000) }));
    taskLedger.complete(taskId, artifacts);
  } else {
    executedPlan.status = 'failed';
    taskLedger.fail(taskId, verification.failedCriteria ?? 'Verification failed');
  }

  const updatedTask = taskLedger.getById(taskId)!;
  logger.info(
    { taskId, verified: verification.verified, steps: executedPlan.steps.length },
    'Pipeline complete',
  );

  return { task: updatedTask, plan: executedPlan, verification };
}
