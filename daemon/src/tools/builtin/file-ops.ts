import { readFile, writeFile, access, stat } from 'node:fs/promises';
import { resolve, isAbsolute } from 'node:path';
import type { Tool, ToolResult } from '../types.js';

// ---------------------------------------------------------------------------
// file_read — Read file contents
// ---------------------------------------------------------------------------

export const fileReadTool: Tool = {
  name: 'file_read',
  description: 'Read the contents of a file. Returns the text content. For large files, returns the first 10KB.',
  inputSchema: {
    parameters: {
      path: { type: 'string', description: 'Absolute or relative file path', required: true },
    },
  },
  riskLevel: 'low',
  builtin: true,

  async execute(params: Record<string, unknown>): Promise<ToolResult> {
    const start = Date.now();
    const filePath = params.path as string;

    try {
      const resolved = isAbsolute(filePath) ? filePath : resolve(filePath);
      const info = await stat(resolved);

      if (info.isDirectory()) {
        return { success: false, output: null, error: 'Path is a directory, not a file', durationMs: Date.now() - start };
      }

      const content = await readFile(resolved, 'utf-8');
      const truncated = content.length > 10_000 ? content.slice(0, 10_000) + '\n... (truncated)' : content;

      return {
        success: true,
        output: { path: resolved, content: truncated, size: info.size },
        durationMs: Date.now() - start,
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

// ---------------------------------------------------------------------------
// file_write — Write content to a file
// ---------------------------------------------------------------------------

export const fileWriteTool: Tool = {
  name: 'file_write',
  description: 'Write content to a file. Creates the file if it does not exist, overwrites if it does.',
  inputSchema: {
    parameters: {
      path: { type: 'string', description: 'Absolute or relative file path', required: true },
      content: { type: 'string', description: 'Content to write to the file', required: true },
    },
  },
  riskLevel: 'medium',
  builtin: true,

  async execute(params: Record<string, unknown>): Promise<ToolResult> {
    const start = Date.now();
    const filePath = params.path as string;
    const content = params.content as string;

    try {
      const resolved = isAbsolute(filePath) ? filePath : resolve(filePath);
      await writeFile(resolved, content, 'utf-8');

      return {
        success: true,
        output: { path: resolved, bytesWritten: Buffer.byteLength(content, 'utf-8') },
        durationMs: Date.now() - start,
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
