import simpleGit from 'simple-git';
import type { SimpleGit } from 'simple-git';
import type { Logger } from 'pino';
import type { DaemonModule } from '../core/lifecycle.js';

/**
 * Manages git operations for the target workspace.
 * Handles branching, committing, and reverting.
 */
export class WorkspaceManager implements DaemonModule {
  readonly name = 'workspace';
  private git: SimpleGit | null = null;

  constructor(
    private repoPath: string,
    private branch: string,
    private logger: Logger,
  ) {}

  async start(): Promise<void> {
    this.git = simpleGit(this.repoPath);

    // Verify the repo is valid
    const isRepo = await this.git.checkIsRepo();
    if (!isRepo) {
      throw new Error(`Not a git repository: ${this.repoPath}`);
    }

    this.logger.info({ path: this.repoPath, branch: this.branch }, 'Workspace ready');
  }

  async stop(): Promise<void> {
    this.git = null;
  }

  /** Ensure we're on the daemon's work branch. Creates it if needed. */
  async ensureBranch(): Promise<void> {
    if (!this.git) throw new Error('Workspace not started');

    const branches = await this.git.branchLocal();
    if (!branches.all.includes(this.branch)) {
      await this.git.checkoutLocalBranch(this.branch);
      this.logger.info({ branch: this.branch }, 'Created work branch');
    } else {
      await this.git.checkout(this.branch);
      this.logger.info({ branch: this.branch }, 'Switched to work branch');
    }
  }

  /** Get current status (changed files). */
  async getStatus(): Promise<{ staged: string[]; modified: string[]; untracked: string[] }> {
    if (!this.git) throw new Error('Workspace not started');
    const status = await this.git.status();
    return {
      staged: status.staged,
      modified: status.modified,
      untracked: status.not_added,
    };
  }

  /** Stage all changes and commit with a descriptive message. */
  async commitChanges(taskId: string, taskDescription: string): Promise<string> {
    if (!this.git) throw new Error('Workspace not started');

    await this.git.add('.');
    const result = await this.git.commit(
      [
        `daemon: Task ${taskId} — ${taskDescription}`,
        '',
        'Autonomous execution by Mother Brain Daemon.',
        '',
        'Co-authored-by: Mother Brain Daemon <daemon@mother-brain.local>',
      ].join('\n'),
    );

    const sha = result.commit || 'unknown';
    this.logger.info({ taskId, sha }, 'Changes committed');
    return sha;
  }

  /** Revert all uncommitted changes (used when verification fails). */
  async revertChanges(): Promise<void> {
    if (!this.git) throw new Error('Workspace not started');

    await this.git.checkout('.');
    await this.git.clean('f', ['-d']); // Remove untracked files and dirs
    this.logger.info('Changes reverted');
  }

  /** Get the diff of current changes (for reporting). */
  async getDiff(): Promise<string> {
    if (!this.git) throw new Error('Workspace not started');
    return this.git.diff();
  }
}
