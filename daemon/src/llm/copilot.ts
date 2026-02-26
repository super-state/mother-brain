import OpenAI from 'openai';
import type { Logger } from 'pino';
import type { FileChange, LLMResult } from './cloud.js';

// ---------------------------------------------------------------------------
// GitHub Models / Copilot LLM Client
// ---------------------------------------------------------------------------

const GITHUB_MODELS_BASE_URL = 'https://models.github.ai/inference';
const OPENAI_BASE_URL = 'https://api.openai.com/v1';

/**
 * Configuration for the Copilot/GitHub Models provider.
 * Uses your GitHub PAT (with models:read scope) — covered by Copilot subscription.
 */
export interface CopilotLLMConfig {
  githubToken: string;       // GitHub PAT with models:read scope
  model: string;             // e.g., "openai/gpt-4.1" — all models accessed via Copilot
  baseUrl?: string;          // Override base URL (for direct OpenAI API)
}

// Tool definitions (OpenAI function calling format)
const TOOLS: OpenAI.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'create_file',
      description: 'Create a new file with the given content. Use this when the file does not yet exist.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Relative file path from the project root' },
          content: { type: 'string', description: 'The full content of the file to create' },
        },
        required: ['path', 'content'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_file',
      description: 'Update an existing file with new content. Replaces the entire file.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Relative file path from the project root' },
          content: { type: 'string', description: 'The complete new content of the file' },
        },
        required: ['path', 'content'],
      },
    },
  },
];

/**
 * LLM client that calls models through GitHub Models API.
 * Uses your Copilot subscription ($19/month) — no per-token costs.
 *
 * Endpoint: https://models.github.ai/inference
 * Auth: GitHub PAT with models:read scope
 * Format: OpenAI-compatible chat completions
 */
export class CopilotLLMClient {
  private client: OpenAI;

  constructor(
    private config: CopilotLLMConfig,
    private logger: Logger,
  ) {
    this.client = new OpenAI({
      baseURL: config.baseUrl ?? GITHUB_MODELS_BASE_URL,
      apiKey: config.githubToken,
    });
  }

  /**
   * Execute a task by calling the GitHub Models API with tool use.
   * Returns file changes extracted from function calls.
   */
  async executeTask(systemPrompt: string, taskPrompt: string): Promise<LLMResult> {
    const changes: FileChange[] = [];
    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: taskPrompt },
    ];

    let response = await this.client.chat.completions.create({
      model: this.config.model,
      max_completion_tokens: 8192,
      tools: TOOLS,
      messages,
    });

    totalInputTokens += response.usage?.prompt_tokens ?? 0;
    totalOutputTokens += response.usage?.completion_tokens ?? 0;

    // Process tool calls in a loop
    while (response.choices[0]?.finish_reason === 'tool_calls') {
      const assistantMessage = response.choices[0].message;
      const toolCalls = assistantMessage.tool_calls ?? [];

      messages.push(assistantMessage);

      for (const toolCall of toolCalls) {
        if (toolCall.type !== 'function') continue;
        const args = JSON.parse(toolCall.function.arguments) as { path: string; content: string };
        const toolName = toolCall.function.name;

        if (toolName === 'create_file' || toolName === 'update_file') {
          changes.push({
            path: args.path,
            content: args.content,
            action: toolName === 'create_file' ? 'create' : 'update',
          });

          this.logger.info(
            { tool: toolName, path: args.path },
            'File change recorded',
          );

          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: `File ${toolName === 'create_file' ? 'created' : 'updated'}: ${args.path}`,
          });
        } else {
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: `Unknown tool: ${toolName}`,
          });
        }
      }

      response = await this.client.chat.completions.create({
        model: this.config.model,
        max_completion_tokens: 8192,
        tools: TOOLS,
        messages,
      });

      totalInputTokens += response.usage?.prompt_tokens ?? 0;
      totalOutputTokens += response.usage?.completion_tokens ?? 0;
    }

    this.logger.info(
      { changes: changes.length, inputTokens: totalInputTokens, outputTokens: totalOutputTokens },
      'Copilot LLM execution complete',
    );

    return {
      changes,
      inputTokens: totalInputTokens,
      outputTokens: totalOutputTokens,
      model: this.config.model,
    };
  }
}
