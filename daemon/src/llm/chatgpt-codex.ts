import type { Logger } from 'pino';
import type { FileChange, LLMResult } from './cloud.js';

// ---------------------------------------------------------------------------
// ChatGPT Codex Client — Responses API via chatgpt.com subscription
// ---------------------------------------------------------------------------
// Uses the ChatGPT backend-api/codex endpoint which bills to ChatGPT Plus/Pro
// subscription instead of API credits. Discovered from OpenAI Codex CLI source
// (model_provider_info.rs) and OpenClaw reference implementation.

const CODEX_BASE_URL = 'https://chatgpt.com/backend-api/codex';

const CODEX_HEADERS: Record<string, string> = {
  'originator': 'codex_cli_rs',
  'User-Agent': 'codex_cli_rs/1.0.0 (Windows_NT x86_64)',
};

// Responses API input types
export type ResponsesInput =
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string }
  | { type: 'function_call'; name: string; arguments: string; call_id: string }
  | { type: 'function_call_output'; call_id: string; output: string };

// Responses API tool definition
export interface ResponsesTool {
  type: 'function';
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

// Parsed response from SSE stream
export interface CodexResponse {
  text: string;
  toolCalls: Array<{
    callId: string;
    name: string;
    arguments: string;
  }>;
  inputTokens: number;
  outputTokens: number;
}

// Tool definitions for task execution (same as copilot.ts)
const TASK_TOOLS: ResponsesTool[] = [
  {
    type: 'function',
    name: 'create_file',
    description: 'Create a new file with the given content.',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Relative file path from the project root' },
        content: { type: 'string', description: 'The full content of the file to create' },
      },
      required: ['path', 'content'],
    },
  },
  {
    type: 'function',
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
];

/**
 * LLM client that uses ChatGPT subscription billing via the Codex Responses API.
 * Endpoint: chatgpt.com/backend-api/codex/responses
 * Auth: OAuth access_token as Bearer (from PKCE flow)
 * Format: OpenAI Responses API with mandatory streaming
 */
export class ChatGPTCodexClient {
  constructor(
    private accessToken: string,
    private model: string,
    private logger: Logger,
  ) {}

  /** Get the model name for logging. */
  getModel(): string {
    return this.model;
  }

  /**
   * Execute a task with tool use (implements LLMExecutor pattern).
   * Uses create_file/update_file tools and returns file changes.
   */
  async executeTask(systemPrompt: string, taskPrompt: string): Promise<LLMResult> {
    const changes: FileChange[] = [];
    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    const input: ResponsesInput[] = [
      { role: 'user', content: taskPrompt },
    ];

    let response = await this.callResponsesAPI(systemPrompt, input, TASK_TOOLS);
    totalInputTokens += response.inputTokens;
    totalOutputTokens += response.outputTokens;

    // Process tool calls in a loop
    while (response.toolCalls.length > 0) {
      for (const tc of response.toolCalls) {
        input.push({
          type: 'function_call',
          name: tc.name,
          arguments: tc.arguments,
          call_id: tc.callId,
        });

        try {
          const args = JSON.parse(tc.arguments) as { path: string; content: string };
          if (tc.name === 'create_file' || tc.name === 'update_file') {
            changes.push({
              path: args.path,
              content: args.content,
              action: tc.name === 'create_file' ? 'create' : 'update',
            });
            this.logger.info({ tool: tc.name, path: args.path }, 'File change recorded');
            input.push({
              type: 'function_call_output',
              call_id: tc.callId,
              output: `File ${tc.name === 'create_file' ? 'created' : 'updated'}: ${args.path}`,
            });
          } else {
            input.push({
              type: 'function_call_output',
              call_id: tc.callId,
              output: `Unknown tool: ${tc.name}`,
            });
          }
        } catch {
          input.push({
            type: 'function_call_output',
            call_id: tc.callId,
            output: 'Error parsing tool arguments',
          });
        }
      }

      response = await this.callResponsesAPI(systemPrompt, input, TASK_TOOLS);
      totalInputTokens += response.inputTokens;
      totalOutputTokens += response.outputTokens;
    }

    this.logger.info(
      { changes: changes.length, inputTokens: totalInputTokens, outputTokens: totalOutputTokens },
      'ChatGPT Codex task execution complete',
    );

    return {
      changes,
      inputTokens: totalInputTokens,
      outputTokens: totalOutputTokens,
      model: this.model,
    };
  }

  /**
   * Chat completion via the Codex Responses API.
   * Used by ConversationHandler for Telegram conversations.
   */
  async chat(
    instructions: string,
    input: ResponsesInput[],
    tools?: ResponsesTool[],
  ): Promise<CodexResponse> {
    return this.callResponsesAPI(instructions, input, tools);
  }

  // -------------------------------------------------------------------------
  // Private — Responses API call + SSE parsing
  // -------------------------------------------------------------------------

  private async callResponsesAPI(
    instructions: string,
    input: ResponsesInput[],
    tools?: ResponsesTool[],
  ): Promise<CodexResponse> {
    const body: Record<string, unknown> = {
      model: this.model,
      instructions,
      input,
      stream: true,
      store: false,
    };

    if (tools && tools.length > 0) {
      body.tools = tools;
      body.tool_choice = 'auto';
    }

    this.logger.debug(
      { model: this.model, inputItems: input.length },
      'Calling Codex Responses API',
    );

    const response = await fetch(`${CODEX_BASE_URL}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
        ...CODEX_HEADERS,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Codex API error ${response.status}: ${errorText}`);
    }

    return this.parseSSEStream(response);
  }

  private async parseSSEStream(response: Response): Promise<CodexResponse> {
    const body = await response.text();
    const events = this.parseSSEEvents(body);

    let text = '';
    const toolCalls: CodexResponse['toolCalls'] = [];
    let inputTokens = 0;
    let outputTokens = 0;

    for (const event of events) {
      if (!event.data) continue;

      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'response.output_text.delta':
            text += data.delta ?? '';
            break;

          case 'response.output_item.done':
            if (data.item?.type === 'function_call') {
              toolCalls.push({
                callId: data.item.call_id,
                name: data.item.name,
                arguments: data.item.arguments,
              });
            }
            break;

          case 'response.completed':
            inputTokens = data.response?.usage?.input_tokens ?? 0;
            outputTokens = data.response?.usage?.output_tokens ?? 0;
            break;
        }
      } catch {
        // Skip malformed SSE events
      }
    }

    this.logger.debug(
      { textLen: text.length, toolCalls: toolCalls.length, inputTokens, outputTokens },
      'Codex SSE stream parsed',
    );

    return { text, toolCalls, inputTokens, outputTokens };
  }

  private parseSSEEvents(body: string): Array<{ event?: string; data?: string }> {
    const events: Array<{ event?: string; data?: string }> = [];
    const blocks = body.split('\n\n');

    for (const block of blocks) {
      if (!block.trim()) continue;

      const lines = block.split('\n');
      let event: string | undefined;
      let data: string | undefined;

      for (const line of lines) {
        if (line.startsWith('event: ')) {
          event = line.slice(7);
        } else if (line.startsWith('data: ')) {
          data = line.slice(6);
        }
      }

      if (event || data) {
        events.push({ event, data });
      }
    }

    return events;
  }
}
