import { readFileSync } from 'node:fs';
import type { Logger } from 'pino';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TaskStatus = 'pending' | 'done';

export interface RoadmapTask {
  id: string;           // e.g., "001"
  description: string;  // e.g., "Project scaffolding — package.json, tsconfig.json..."
  status: TaskStatus;
  outcomeId: string;    // Which outcome this task belongs to
}

export interface RoadmapOutcome {
  id: string;           // e.g., "outcome-1"
  title: string;        // e.g., "Ability to start the daemon..."
  description: string;  // The "So..." benefit line
  tasks: RoadmapTask[];
}

export interface Roadmap {
  outcomes: RoadmapOutcome[];
  allTasks: RoadmapTask[];
}

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

const OUTCOME_PATTERN = /^###\s+📋\s+(.+)$/;
const BENEFIT_PATTERN = /^>\s+(.+)$/;
const TASK_PATTERN = /^-\s+Task\s+(\d+):\s+(.+)$/;
const TASK_STATUS_PATTERN = /^\|\s*(\d+)\s*\|[^|]+\|\s*(✅|⬜)\s*\|$/;

/**
 * Parse a Mother Brain roadmap.md into structured outcomes and tasks.
 * Only parses Phase 1 (MVP) content — post-MVP is ignored for execution.
 */
export function parseRoadmap(filePath: string, logger: Logger): Roadmap {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // First pass: extract task statuses from the Internal Task Index table
  const taskStatuses = new Map<string, TaskStatus>();
  for (const line of lines) {
    const match = TASK_STATUS_PATTERN.exec(line);
    if (match) {
      const [, taskNum, status] = match;
      taskStatuses.set(taskNum!, status === '✅' ? 'done' : 'pending');
    }
  }

  // Second pass: extract outcomes and their tasks
  const outcomes: RoadmapOutcome[] = [];
  let currentOutcome: RoadmapOutcome | null = null;
  let outcomeIndex = 0;
  let inPhase1 = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;

    // Track which phase we're in
    if (line.startsWith('## Phase 1:')) {
      inPhase1 = true;
      continue;
    }
    if (line.startsWith('## Phase 2') || line.startsWith('## MVP Checkpoint') || line.startsWith('## Future')) {
      inPhase1 = false;
      continue;
    }

    // Only parse Phase 1 outcomes
    if (!inPhase1) continue;

    // Match outcome heading
    const outcomeMatch = OUTCOME_PATTERN.exec(line);
    if (outcomeMatch) {
      outcomeIndex++;
      currentOutcome = {
        id: `outcome-${outcomeIndex}`,
        title: outcomeMatch[1]!,
        description: '',
        tasks: [],
      };
      outcomes.push(currentOutcome);
      continue;
    }

    // Match benefit line (the "So..." line after outcome)
    if (currentOutcome && !currentOutcome.description) {
      const benefitMatch = BENEFIT_PATTERN.exec(line);
      if (benefitMatch) {
        currentOutcome.description = benefitMatch[1]!;
        continue;
      }
    }

    // Match task line
    if (currentOutcome) {
      const taskMatch = TASK_PATTERN.exec(line);
      if (taskMatch) {
        const taskNum = taskMatch[1]!;
        const task: RoadmapTask = {
          id: taskNum.padStart(3, '0'),
          description: taskMatch[2]!,
          status: taskStatuses.get(taskNum) ?? 'pending',
          outcomeId: currentOutcome.id,
        };
        currentOutcome.tasks.push(task);
      }
    }
  }

  const allTasks = outcomes.flatMap((o) => o.tasks);
  logger.info(
    { outcomes: outcomes.length, tasks: allTasks.length, done: allTasks.filter((t) => t.status === 'done').length },
    'Roadmap parsed',
  );

  return { outcomes, allTasks };
}
