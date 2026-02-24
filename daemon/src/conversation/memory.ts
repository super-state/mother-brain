import type { Logger } from 'pino';
import type Database from 'better-sqlite3';

// ---------------------------------------------------------------------------
// Conversation Memory — persistent chat context across sessions
// ---------------------------------------------------------------------------

export interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  intent?: string;       // Classified intent (project_description, casual_chat, etc.)
  metadata?: string;     // JSON string for extracted entities (repo paths, project names)
  timestamp: string;
}

export class ConversationMemory {
  constructor(
    private db: Database.Database,
    _logger: Logger,
  ) {
    this.ensureTable();
  }

  /** Expose the underlying database for shared use by BrainStateManager. */
  getDb(): Database.Database {
    return this.db;
  }

  private ensureTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS conversation_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
        content TEXT NOT NULL,
        intent TEXT,
        metadata TEXT,
        timestamp TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_conv_timestamp ON conversation_history(timestamp);
    `);
  }

  /** Store a message in conversation history. */
  addMessage(role: ChatMessage['role'], content: string, intent?: string, metadata?: Record<string, unknown>): void {
    this.db.prepare(`
      INSERT INTO conversation_history (role, content, intent, metadata)
      VALUES (?, ?, ?, ?)
    `).run(role, content, intent ?? null, metadata ? JSON.stringify(metadata) : null);
  }

  /** Get recent conversation history (most recent N messages). */
  getRecentMessages(limit = 20): ChatMessage[] {
    return this.db.prepare(`
      SELECT id, role, content, intent, metadata, timestamp
      FROM conversation_history
      ORDER BY id DESC
      LIMIT ?
    `).all(limit).reverse() as ChatMessage[];
  }

  /** Get messages since a specific timestamp. */
  getMessagesSince(since: string): ChatMessage[] {
    return this.db.prepare(`
      SELECT id, role, content, intent, metadata, timestamp
      FROM conversation_history
      WHERE timestamp >= ?
      ORDER BY id ASC
    `).all(since) as ChatMessage[];
  }

  /** Get messages with a specific intent. */
  getMessagesByIntent(intent: string, limit = 10): ChatMessage[] {
    return this.db.prepare(`
      SELECT id, role, content, intent, metadata, timestamp
      FROM conversation_history
      WHERE intent = ?
      ORDER BY id DESC
      LIMIT ?
    `).all(intent, limit).reverse() as ChatMessage[];
  }

  /** Check if this is a brand new user (no conversation history). */
  isNewUser(): boolean {
    const row = this.db.prepare(
      'SELECT COUNT(*) as count FROM conversation_history WHERE role = ?'
    ).get('user') as { count: number };
    return row.count === 0;
  }

  /** Get total message count. */
  getMessageCount(): number {
    const row = this.db.prepare(
      'SELECT COUNT(*) as count FROM conversation_history'
    ).get() as { count: number };
    return row.count;
  }

  /** Build conversation context for LLM (formatted for chat completions). */
  buildLLMContext(systemPrompt: string, limit = 10): Array<{ role: string; content: string }> {
    const messages = this.getRecentMessages(limit);
    const context: Array<{ role: string; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    for (const msg of messages) {
      context.push({ role: msg.role, content: msg.content });
    }

    return context;
  }
}
