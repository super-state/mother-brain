import type { Logger } from 'pino';
import { ToolRegistry } from '../registry.js';
import { webFetchTool } from './web-fetch.js';
import { fileReadTool, fileWriteTool } from './file-ops.js';
import { shellExecTool } from './shell-exec.js';
import { browserFetchTool } from './browser-fetch.js';

/**
 * Register all built-in tools with the registry.
 */
export function registerBuiltinTools(registry: ToolRegistry, logger: Logger): void {
  registry.register(webFetchTool);
  registry.register(browserFetchTool);
  registry.register(fileReadTool);
  registry.register(fileWriteTool);
  registry.register(shellExecTool);
  logger.info({ count: 5 }, 'Built-in tools registered');
}
