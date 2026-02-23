import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import type { Logger } from 'pino';
import type { FileChange } from '../llm/cloud.js';

/**
 * Apply file changes from LLM output to the workspace.
 * Validates paths to prevent writes outside the repo boundary.
 */
export function applyFileChanges(
  changes: FileChange[],
  repoPath: string,
  logger: Logger,
): { applied: number; skipped: number } {
  let applied = 0;
  let skipped = 0;
  const resolvedRepo = resolve(repoPath);

  for (const change of changes) {
    const targetPath = resolve(join(repoPath, change.path));

    // Security: prevent path traversal outside repo
    if (!targetPath.startsWith(resolvedRepo)) {
      logger.warn({ path: change.path }, 'Path traversal blocked — skipping');
      skipped++;
      continue;
    }

    // Ensure parent directory exists
    const dir = dirname(targetPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(targetPath, change.content, 'utf-8');
    logger.info({ path: change.path, action: change.action }, 'File change applied');
    applied++;
  }

  logger.info({ applied, skipped, total: changes.length }, 'File changes complete');
  return { applied, skipped };
}
