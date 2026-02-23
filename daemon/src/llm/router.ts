import type { Logger } from 'pino';
import type { LLMResult } from './cloud.js';
import { CloudLLMClient } from './cloud.js';
import { CopilotLLMClient } from './copilot.js';
import type { DaemonConfig } from '../core/config.js';

/**
 * Unified interface for LLM execution.
 * Both CloudLLMClient and CopilotLLMClient implement this pattern.
 */
export interface LLMExecutor {
  executeTask(systemPrompt: string, taskPrompt: string): Promise<LLMResult>;
}

/**
 * Create the appropriate LLM client based on config.
 *
 * Priority:
 * 1. Copilot (GitHub Models API) — if githubToken is configured
 * 2. Direct cloud (Anthropic/OpenAI) — if apiKey is configured
 *
 * Copilot is preferred because it uses the $19/month subscription
 * with no per-token costs.
 */
export function createLLMClient(config: DaemonConfig, logger: Logger): LLMExecutor {
  // Prefer Copilot if configured
  if (config.llm.copilot) {
    logger.info(
      { model: config.llm.copilot.model, provider: 'copilot' },
      'Using Copilot (GitHub Models API)',
    );
    return new CopilotLLMClient(config.llm.copilot, logger);
  }

  // Fall back to direct cloud API
  logger.info(
    { model: config.llm.cloud.model, provider: config.llm.cloud.provider },
    'Using direct cloud API',
  );
  return new CloudLLMClient(config.llm.cloud, logger);
}
