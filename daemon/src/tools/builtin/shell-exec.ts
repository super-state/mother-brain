import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import type { Tool, ToolResult } from '../types.js';

const execAsync = promisify(exec);

// ---------------------------------------------------------------------------
// shell_exec — Run a shell command
// ---------------------------------------------------------------------------

export const shellExecTool: Tool = {
  name: 'shell_exec',
  description: 'Execute a shell command and return its stdout/stderr. Timeout: 30 seconds. Use for git, npm, system commands, etc.',
  inputSchema: {
    parameters: {
      command: { type: 'string', description: 'Shell command to execute', required: true },
      cwd: { type: 'string', description: 'Working directory (optional)', required: false },
    },
  },
  riskLevel: 'high',
  builtin: true,

  async execute(params: Record<string, unknown>): Promise<ToolResult> {
    const start = Date.now();
    const command = params.command as string;
    const cwd = params.cwd as string | undefined;

    // Basic command sanitization — block dangerous patterns
    const blocked = [/rm\s+-rf\s+\//, /mkfs/, /dd\s+if=/, /:\(\)\{/, /fork\s*bomb/i];
    if (blocked.some(p => p.test(command))) {
      return { success: false, output: null, error: 'Command blocked by safety filter', durationMs: 0 };
    }

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd,
        timeout: 30_000,
        maxBuffer: 1024 * 1024, // 1MB
      });

      const output = {
        stdout: stdout.length > 5000 ? stdout.slice(0, 5000) + '\n... (truncated)' : stdout,
        stderr: stderr.length > 2000 ? stderr.slice(0, 2000) + '\n... (truncated)' : stderr,
        exitCode: 0,
      };

      return { success: true, output, durationMs: Date.now() - start };
    } catch (error: unknown) {
      const durationMs = Date.now() - start;
      const execError = error as { stdout?: string; stderr?: string; code?: number; message?: string };

      return {
        success: false,
        output: {
          stdout: execError.stdout?.slice(0, 2000) ?? '',
          stderr: execError.stderr?.slice(0, 2000) ?? '',
          exitCode: execError.code ?? 1,
        },
        error: execError.message ?? String(error),
        durationMs,
      };
    }
  },
};
