import type Database from 'better-sqlite3';
import type { Logger } from 'pino';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { basename } from 'node:path';

// ---------------------------------------------------------------------------
// Project types
// ---------------------------------------------------------------------------

export interface Project {
  id: string;
  name: string;
  repoPath: string;
  branch: string;
  active: boolean;
  addedAt: string;
  lastWorkedAt: string | null;
  tasksCompleted: number;
}

// ---------------------------------------------------------------------------
// Project Manager — manages multiple projects in the database
// ---------------------------------------------------------------------------

export class ProjectManager {
  constructor(
    private db: Database.Database,
    private logger: Logger,
  ) {}

  /** Add a new project. Returns the project or null if path doesn't exist. */
  addProject(repoPath: string, branch = 'daemon/work', name?: string): Project | null {
    if (!existsSync(repoPath)) {
      this.logger.warn({ repoPath }, 'Project path does not exist');
      return null;
    }

    const projectName = name ?? basename(repoPath);
    const id = randomUUID();

    this.db.prepare(`
      INSERT INTO projects (id, name, repo_path, branch, active)
      VALUES (?, ?, ?, ?, 0)
    `).run(id, projectName, repoPath, branch);

    this.logger.info({ name: projectName, repoPath }, 'Project added');
    return this.getProject(id)!;
  }

  /** Get the currently active project. */
  getActiveProject(): Project | null {
    const row = this.db.prepare('SELECT * FROM projects WHERE active = 1 LIMIT 1').get() as ProjectRow | undefined;
    return row ? toProject(row) : null;
  }

  /** Set a project as active (deactivates others). */
  setActiveProject(nameOrId: string): Project | null {
    this.db.prepare('UPDATE projects SET active = 0').run();

    const result = this.db.prepare(
      'UPDATE projects SET active = 1 WHERE id = ? OR name = ?'
    ).run(nameOrId, nameOrId);

    if (result.changes === 0) {
      this.logger.warn({ nameOrId }, 'Project not found');
      return null;
    }

    return this.getActiveProject();
  }

  /** List all projects. */
  listProjects(): Project[] {
    const rows = this.db.prepare('SELECT * FROM projects ORDER BY active DESC, name ASC').all() as ProjectRow[];
    return rows.map(toProject);
  }

  /** Remove a project by name or ID. */
  removeProject(nameOrId: string): boolean {
    const result = this.db.prepare(
      'DELETE FROM projects WHERE id = ? OR name = ?'
    ).run(nameOrId, nameOrId);
    return result.changes > 0;
  }

  /** Record that work was done on a project. */
  recordWork(projectId: string): void {
    this.db.prepare(`
      UPDATE projects SET
        last_worked_at = datetime('now'),
        tasks_completed = tasks_completed + 1
      WHERE id = ?
    `).run(projectId);
  }

  /** Get a project by ID. */
  private getProject(id: string): Project | null {
    const row = this.db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as ProjectRow | undefined;
    return row ? toProject(row) : null;
  }
}

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

interface ProjectRow {
  id: string;
  name: string;
  repo_path: string;
  branch: string;
  active: number;
  added_at: string;
  last_worked_at: string | null;
  tasks_completed: number;
}

function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    repoPath: row.repo_path,
    branch: row.branch,
    active: row.active === 1,
    addedAt: row.added_at,
    lastWorkedAt: row.last_worked_at,
    tasksCompleted: row.tasks_completed,
  };
}
