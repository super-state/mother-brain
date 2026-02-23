import type { Logger } from 'pino';
import type { Roadmap, RoadmapTask, RoadmapOutcome } from './roadmap-parser.js';

export interface PickedTask {
  task: RoadmapTask;
  outcome: RoadmapOutcome;
}

/**
 * Pick the next task to execute from the roadmap.
 *
 * Strategy: Sequential execution by outcome order, then task order.
 * - Find the first outcome with pending tasks
 * - Pick the first pending task in that outcome
 *
 * This is deliberately simple — outcomes are already ordered by
 * dependency in the roadmap (each builds on the previous).
 */
export function pickNextTask(roadmap: Roadmap, logger: Logger): PickedTask | null {
  for (const outcome of roadmap.outcomes) {
    for (const task of outcome.tasks) {
      if (task.status === 'pending') {
        logger.info(
          { taskId: task.id, outcome: outcome.title },
          'Next task selected',
        );
        return { task, outcome };
      }
    }
  }

  logger.info('All tasks complete — nothing to pick');
  return null;
}
