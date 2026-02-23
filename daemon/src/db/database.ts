import Database from 'better-sqlite3';
import type { Logger } from 'pino';
import type { DaemonModule } from '../core/lifecycle.js';

/**
 * SQLite database manager.
 * Uses better-sqlite3 for synchronous, reliable operations on Pi.
 * Handles schema migrations on startup.
 */
export class DatabaseManager implements DaemonModule {
  readonly name = 'database';
  private db: Database.Database | null = null;

  constructor(
    private dbPath: string,
    private logger: Logger,
  ) {}

  /** Get the underlying database instance. Throws if not started. */
  get connection(): Database.Database {
    if (!this.db) {
      throw new Error('Database not started');
    }
    return this.db;
  }

  async start(): Promise<void> {
    this.db = new Database(this.dbPath);

    // WAL mode for better concurrent read performance
    this.db.pragma('journal_mode = WAL');
    // Enforce foreign keys
    this.db.pragma('foreign_keys = ON');

    this.runMigrations();
    this.logger.info({ path: this.dbPath }, 'Database ready');
  }

  async stop(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.logger.info('Database closed');
    }
  }

  private runMigrations(): void {
    if (!this.db) return;

    // Migration tracking table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    const applied = new Set(
      this.db
        .prepare('SELECT name FROM migrations')
        .all()
        .map((row) => (row as { name: string }).name)
    );

    for (const migration of MIGRATIONS) {
      if (!applied.has(migration.name)) {
        this.logger.info({ migration: migration.name }, 'Applying migration');
        this.db.exec(migration.sql);
        this.db
          .prepare('INSERT INTO migrations (name) VALUES (?)')
          .run(migration.name);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Migrations — append-only, never modify existing migrations
// ---------------------------------------------------------------------------

interface Migration {
  name: string;
  sql: string;
}

const MIGRATIONS: Migration[] = [
  {
    name: '001_initial_schema',
    sql: `
      CREATE TABLE sessions (
        id TEXT PRIMARY KEY,
        started_at TEXT NOT NULL,
        ended_at TEXT,
        status TEXT CHECK(status IN ('active', 'completed', 'failed', 'budget_exceeded')),
        tasks_completed INTEGER DEFAULT 0,
        tokens_used INTEGER DEFAULT 0,
        cost_usd REAL DEFAULT 0.0
      );

      CREATE TABLE task_executions (
        id TEXT PRIMARY KEY,
        session_id TEXT REFERENCES sessions(id),
        task_id TEXT NOT NULL,
        outcome_id TEXT NOT NULL,
        started_at TEXT NOT NULL,
        completed_at TEXT,
        status TEXT CHECK(status IN ('running', 'verified', 'failed', 'skipped')),
        tokens_used INTEGER DEFAULT 0,
        verification_result TEXT,
        commit_sha TEXT
      );

      CREATE TABLE budget_tracking (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT REFERENCES sessions(id),
        timestamp TEXT NOT NULL,
        provider TEXT NOT NULL,
        model TEXT NOT NULL,
        input_tokens INTEGER NOT NULL,
        output_tokens INTEGER NOT NULL,
        cost_usd REAL NOT NULL
      );

      CREATE TABLE project_context (
        repo_path TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        PRIMARY KEY (repo_path, key)
      );
    `,
  },
];
