import type { Tool, ToolResult } from '../types.js';

// ---------------------------------------------------------------------------
// web_fetch — HTTP GET/POST for fetching web content
// ---------------------------------------------------------------------------

export const webFetchTool: Tool = {
  name: 'web_fetch',
  description: 'Fetch content from a URL via HTTP GET or POST. Returns the response body as text. Use for APIs, web pages, RSS feeds, etc.',
  inputSchema: {
    parameters: {
      url: { type: 'string', description: 'The URL to fetch', required: true },
      method: { type: 'string', description: 'HTTP method', enum: ['GET', 'POST'], required: false },
      headers: { type: 'object', description: 'Additional HTTP headers as key-value pairs', required: false },
      body: { type: 'string', description: 'Request body (for POST requests)', required: false },
    },
  },
  riskLevel: 'low',
  builtin: true,

  async execute(params: Record<string, unknown>): Promise<ToolResult> {
    const start = Date.now();
    const url = params.url as string;
    const method = (params.method as string) || 'GET';
    const headers = (params.headers as Record<string, string>) || {};
    const body = params.body as string | undefined;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'User-Agent': 'MotherBrain-Daemon/0.1', ...headers },
        body: method === 'POST' ? body : undefined,
        signal: AbortSignal.timeout(30_000),
      });

      const text = await response.text();
      const durationMs = Date.now() - start;

      if (!response.ok) {
        return {
          success: false,
          output: { status: response.status, statusText: response.statusText, body: text.slice(0, 1000) },
          error: `HTTP ${response.status}: ${response.statusText}`,
          durationMs,
        };
      }

      // Truncate very large responses
      const truncated = text.length > 10_000 ? text.slice(0, 10_000) + '\n... (truncated)' : text;

      return {
        success: true,
        output: { status: response.status, body: truncated, contentType: response.headers.get('content-type') },
        durationMs,
      };
    } catch (error) {
      return {
        success: false,
        output: null,
        error: error instanceof Error ? error.message : String(error),
        durationMs: Date.now() - start,
      };
    }
  },
};
