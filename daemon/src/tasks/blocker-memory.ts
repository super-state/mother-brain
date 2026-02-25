import type Database from 'better-sqlite3';
import type { Logger } from 'pino';
import type { BlockerType } from './plan.js';

// ---------------------------------------------------------------------------
// Blocker Memory — self-learning from resolved blockers
// ---------------------------------------------------------------------------
// Every resolved blocker is stored as a symptom → fix pair.
// Before trying a generic fallback, we consult past resolutions first.

export interface BlockerResolution {
  id: number;
  symptom: string;
  blockerType: BlockerType;
  originalTool: string;
  originalError: string;
  resolutionTool: string;
  resolutionArgs: Record<string, unknown>;
  success: boolean;
  taskId?: string;
  createdAt: string;
}

/** Normalize an error string into a stable symptom key. */
function toSymptom(tool: string, error: string): string {
  // Strip variable parts: URLs, timestamps, IDs
  const normalized = error
    .toLowerCase()
    .replace(/https?:\/\/[^\s]+/g, '<url>')
    .replace(/\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}[:\d.]*/g, '<time>')
    .replace(/[0-9a-f]{8,}/g, '<id>')
    .trim();
  return `${tool}::${normalized}`;
}

export class BlockerMemory {
  constructor(
    private db: Database.Database,
    private logger: Logger,
  ) {}

  /** Record a successful resolution. */
  record(opts: {
    originalTool: string;
    originalError: string;
    blockerType: BlockerType;
    resolutionTool: string;
    resolutionArgs?: Record<string, unknown>;
    taskId?: string;
  }): void {
    const symptom = toSymptom(opts.originalTool, opts.originalError);
    this.db.prepare(`
      INSERT INTO blocker_resolutions
        (symptom, blocker_type, original_tool, original_error, resolution_tool, resolution_args, success, task_id)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?)
    `).run(
      symptom,
      opts.blockerType,
      opts.originalTool,
      opts.originalError,
      opts.resolutionTool,
      JSON.stringify(opts.resolutionArgs ?? {}),
      opts.taskId ?? null,
    );
    this.logger.info({ symptom, resolution: opts.resolutionTool }, 'Blocker resolution recorded');
  }

  /** Record a failed resolution attempt (so we don't repeat it). */
  recordFailure(opts: {
    originalTool: string;
    originalError: string;
    blockerType: BlockerType;
    resolutionTool: string;
    resolutionArgs?: Record<string, unknown>;
    taskId?: string;
  }): void {
    const symptom = toSymptom(opts.originalTool, opts.originalError);
    this.db.prepare(`
      INSERT INTO blocker_resolutions
        (symptom, blocker_type, original_tool, original_error, resolution_tool, resolution_args, success, task_id)
      VALUES (?, ?, ?, ?, ?, ?, 0, ?)
    `).run(
      symptom,
      opts.blockerType,
      opts.originalTool,
      opts.originalError,
      opts.resolutionTool,
      JSON.stringify(opts.resolutionArgs ?? {}),
      opts.taskId ?? null,
    );
  }

  /**
   * Look up past successful resolutions for a similar blocker.
   * Returns the most recently successful resolution, excluding known failures.
   */
  lookup(tool: string, error: string): { tool: string; args: Record<string, unknown> } | null {
    const symptom = toSymptom(tool, error);

    // Find tools that FAILED for this symptom (to avoid repeating)
    const failedTools = new Set(
      (this.db.prepare(`
        SELECT DISTINCT resolution_tool FROM blocker_resolutions
        WHERE symptom = ? AND success = 0
      `).all(symptom) as { resolution_tool: string }[]).map(r => r.resolution_tool),
    );

    // Find most recent successful resolution that hasn't also failed
    const row = this.db.prepare(`
      SELECT resolution_tool, resolution_args FROM blocker_resolutions
      WHERE symptom = ? AND success = 1
      ORDER BY created_at DESC
      LIMIT 1
    `).get(symptom) as { resolution_tool: string; resolution_args: string } | undefined;

    if (row && !failedTools.has(row.resolution_tool)) {
      try {
        return { tool: row.resolution_tool, args: JSON.parse(row.resolution_args) };
      } catch {
        return { tool: row.resolution_tool, args: {} };
      }
    }

    // Also try fuzzy match: same blocker_type + original_tool
    const fuzzyRow = this.db.prepare(`
      SELECT resolution_tool, resolution_args FROM blocker_resolutions
      WHERE original_tool = ? AND success = 1
      ORDER BY created_at DESC
      LIMIT 1
    `).get(tool) as { resolution_tool: string; resolution_args: string } | undefined;

    if (fuzzyRow && !failedTools.has(fuzzyRow.resolution_tool)) {
      try {
        return { tool: fuzzyRow.resolution_tool, args: JSON.parse(fuzzyRow.resolution_args) };
      } catch {
        return { tool: fuzzyRow.resolution_tool, args: {} };
      }
    }

    return null;
  }

  /** Get recent resolutions for display. */
  recent(limit = 10): BlockerResolution[] {
    return (this.db.prepare(`
      SELECT * FROM blocker_resolutions
      WHERE success = 1
      ORDER BY created_at DESC
      LIMIT ?
    `).all(limit) as Array<Record<string, unknown>>).map(row => ({
      id: row.id as number,
      symptom: row.symptom as string,
      blockerType: row.blocker_type as BlockerType,
      originalTool: row.original_tool as string,
      originalError: row.original_error as string,
      resolutionTool: row.resolution_tool as string,
      resolutionArgs: JSON.parse((row.resolution_args as string) || '{}'),
      success: Boolean(row.success),
      taskId: row.task_id as string | undefined,
      createdAt: row.created_at as string,
    }));
  }

  /** Stats for display. */
  stats(): { total: number; successRate: number; topBlockers: Array<{ type: string; count: number }> } {
    const total = (this.db.prepare('SELECT COUNT(*) as c FROM blocker_resolutions').get() as { c: number }).c;
    const successes = (this.db.prepare('SELECT COUNT(*) as c FROM blocker_resolutions WHERE success = 1').get() as { c: number }).c;
    const topBlockers = this.db.prepare(`
      SELECT blocker_type as type, COUNT(*) as count FROM blocker_resolutions
      GROUP BY blocker_type ORDER BY count DESC LIMIT 5
    `).all() as Array<{ type: string; count: number }>;

    return {
      total,
      successRate: total > 0 ? successes / total : 0,
      topBlockers,
    };
  }
}
