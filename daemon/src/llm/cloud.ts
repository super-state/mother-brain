import Anthropic from '@anthropic-ai/sdk';
import type { Logger } from 'pino';
import type { CloudLLMConfig } from '../core/config.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FileChange {
  path: string;
  content: string;
  action: 'create' | 'update';
}

export interface LLMResult {
  changes: FileChange[];
  inputTokens: number;
  outputTokens: number;
  model: string;
}

// ---------------------------------------------------------------------------
// Tool definitions for file operations
// ---------------------------------------------------------------------------

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'create_file',
    description: 'Create a new file with the given content. Use this when the file does not yet exist.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'Relative file path from the project root' },
        content: { type: 'string', description: 'The full content of the file to create' },
      },
      required: ['path', 'content'],
    },
  },
  {
    name: 'update_file',
    description: 'Update an existing file with new content. Replaces the entire file.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'Relative file path from the project root' },
        content: { type: 'string', description: 'The complete new content of the file' },
      },
      required: ['path', 'content'],
    },
  },
];

// ---------------------------------------------------------------------------
// Cloud LLM Client
// ---------------------------------------------------------------------------

export class CloudLLMClient {
  private client: Anthropic;

  constructor(
    private config: CloudLLMConfig,
    private logger: Logger,
  ) {
    this.client = new Anthropic({ apiKey: config.apiKey });
  }

  /**
   * Execute a task by calling the Claude API with tool use.
   * Returns file changes extracted from tool calls.
   */
  async executeTask(systemPrompt: string, taskPrompt: string): Promise<LLMResult> {
    const changes: FileChange[] = [];
    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    // Initial request
    const messages: Anthropic.MessageParam[] = [
      { role: 'user', content: taskPrompt },
    ];

    let response = await this.client.messages.create({
      model: this.config.model,
      max_tokens: 8192,
      system: systemPrompt,
      tools: TOOLS,
      messages,
    });

    totalInputTokens += response.usage.input_tokens;
    totalOutputTokens += response.usage.output_tokens;

    // Process tool use in a loop (Claude may make multiple tool calls)
    while (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use',
      );

      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const toolUse of toolUseBlocks) {
        const input = toolUse.input as { path: string; content: string };

        if (toolUse.name === 'create_file' || toolUse.name === 'update_file') {
          changes.push({
            path: input.path,
            content: input.content,
            action: toolUse.name === 'create_file' ? 'create' : 'update',
          });

          this.logger.info(
            { tool: toolUse.name, path: input.path },
            'File change recorded',
          );

          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: `File ${toolUse.name === 'create_file' ? 'created' : 'updated'}: ${input.path}`,
          });
        } else {
          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: `Unknown tool: ${toolUse.name}`,
            is_error: true,
          });
        }
      }

      // Continue the conversation with tool results
      messages.push(
        { role: 'assistant', content: response.content },
        { role: 'user', content: toolResults },
      );

      response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: 8192,
        system: systemPrompt,
        tools: TOOLS,
        messages,
      });

      totalInputTokens += response.usage.input_tokens;
      totalOutputTokens += response.usage.output_tokens;
    }

    this.logger.info(
      { changes: changes.length, inputTokens: totalInputTokens, outputTokens: totalOutputTokens },
      'LLM execution complete',
    );

    return {
      changes,
      inputTokens: totalInputTokens,
      outputTokens: totalOutputTokens,
      model: this.config.model,
    };
  }
}
