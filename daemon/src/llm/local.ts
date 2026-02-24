import OpenAI from 'openai';
import type { Logger } from 'pino';
import type { FileChange, LLMResult } from './cloud.js';

// ---------------------------------------------------------------------------
// Local / Ollama LLM Client
// ---------------------------------------------------------------------------

/**
 * LLM client for local models (Ollama, LM Studio, etc.).
 * Uses OpenAI-compatible API at the local endpoint.
 *
 * Perfect for system-tier tasks: classification, summarization, heartbeat checks.
 * Cost: $0 (runs on your hardware).
 */
export class LocalLLMClient {
  private client: OpenAI;

  constructor(
    baseUrl: string,
    private model: string,
    private logger: Logger,
  ) {
    this.client = new OpenAI({
      baseURL: `${baseUrl}/v1`,
      apiKey: 'ollama', // Ollama doesn't need a real key
    });
  }

  /**
   * Execute a task using the local model.
   * Local models may not support tool use, so we parse structured output instead.
   */
  async executeTask(systemPrompt: string, taskPrompt: string): Promise<LLMResult> {
    const changes: FileChange[] = [];

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: taskPrompt },
      ],
      max_tokens: 4096,
    });

    const content = response.choices[0]?.message?.content ?? '';
    const inputTokens = response.usage?.prompt_tokens ?? 0;
    const outputTokens = response.usage?.completion_tokens ?? 0;

    // Parse file changes from structured output (JSON blocks)
    const jsonBlocks = content.match(/```json\n([\s\S]*?)```/g) ?? [];
    for (const block of jsonBlocks) {
      try {
        const json = block.replace(/```json\n/, '').replace(/```$/, '');
        const parsed = JSON.parse(json) as { path?: string; content?: string; action?: string };
        if (parsed.path && parsed.content) {
          changes.push({
            path: parsed.path,
            content: parsed.content,
            action: (parsed.action === 'create' ? 'create' : 'update') as 'create' | 'update',
          });
        }
      } catch {
        // Skip malformed JSON blocks
      }
    }

    this.logger.info(
      { changes: changes.length, inputTokens, outputTokens, model: this.model },
      'Local LLM execution complete',
    );

    return {
      changes,
      inputTokens,
      outputTokens,
      model: this.model,
    };
  }

  /**
   * Simple completion without tool use — for classification, summarization.
   */
  async complete(systemPrompt: string, userPrompt: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 1024,
    });
    return response.choices[0]?.message?.content ?? '';
  }
}
