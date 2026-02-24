import type { Logger } from 'pino';
import type { LLMResult } from './cloud.js';
import { CloudLLMClient } from './cloud.js';
import { CopilotLLMClient } from './copilot.js';
import { LocalLLMClient } from './local.js';
import type { DaemonConfig, LLMTierProvider } from '../core/config.js';

/**
 * Unified interface for LLM execution.
 * All LLM clients (Cloud, Copilot, Local) implement this.
 */
export interface LLMExecutor {
  executeTask(systemPrompt: string, taskPrompt: string): Promise<LLMResult>;
}

/**
 * LLM tier — determines which model to use for what purpose.
 *
 *   background → mindless tasks, heartbeat, classification — local/free
 *   chat       → Telegram conversations, organising — mid-tier (GPT-4.1)
 *   planning   → planning, approach breakdown — reasoning (Codex)
 *   coding     → implementation — premium (GPT-5.3-Codex)
 *   review     → code review — reasoning (Codex)
 */
export type LLMTier = 'background' | 'chat' | 'planning' | 'coding' | 'review';

/**
 * Create an LLM client for a specific tier.
 *
 * Resolution order for each tier:
 * 1. If tiers config exists → use the tier's provider+model
 * 2. If copilot config exists → use copilot (legacy single-tier)
 * 3. If cloud config exists → use cloud (legacy fallback)
 */
export function createLLMClient(
  config: DaemonConfig,
  logger: Logger,
  tier: LLMTier = 'coding',
): LLMExecutor {
  const { llm } = config;

  // Three-tier routing (new config format)
  if (llm.tiers) {
    const tierConfig = llm.tiers[tier];
    return createClientForProvider(tierConfig.provider, tierConfig.model, config, logger, tier);
  }

  // Legacy single-tier: prefer Copilot, then cloud
  if (llm.copilot) {
    logger.info(
      { model: llm.copilot.model, provider: 'copilot', tier },
      'Using Copilot (GitHub Models API)',
    );
    return new CopilotLLMClient(llm.copilot, logger);
  }

  if (llm.cloud) {
    logger.info(
      { model: llm.cloud.model, provider: llm.cloud.provider, tier },
      'Using direct cloud API',
    );
    return new CloudLLMClient(llm.cloud, logger);
  }

  throw new Error('No LLM provider configured. Run `mother-brain-daemon init` to set up.');
}

function createClientForProvider(
  provider: LLMTierProvider,
  model: string,
  config: DaemonConfig,
  logger: Logger,
  tier: LLMTier,
): LLMExecutor {
  switch (provider) {
    case 'local': {
      const baseUrl = config.llm.local?.baseUrl ?? 'http://localhost:11434';
      logger.info({ model, provider: 'local', tier, baseUrl }, `Using local model for ${tier} tier`);
      return new LocalLLMClient(baseUrl, model, logger);
    }

    case 'copilot': {
      const githubToken = config.llm.githubToken ?? config.llm.copilot?.githubToken;
      if (!githubToken) {
        throw new Error(`Copilot tier "${tier}" requires githubToken in llm config`);
      }
      logger.info({ model, provider: 'copilot', tier }, `Using Copilot for ${tier} tier`);
      return new CopilotLLMClient({ githubToken, model }, logger);
    }

    case 'cloud': {
      if (!config.llm.cloud) {
        throw new Error(`Cloud tier "${tier}" requires llm.cloud config`);
      }
      logger.info({ model, provider: 'cloud', tier }, `Using cloud API for ${tier} tier`);
      return new CloudLLMClient({ ...config.llm.cloud, model }, logger);
    }

    default:
      throw new Error(`Unknown LLM provider: ${provider}`);
  }
}
