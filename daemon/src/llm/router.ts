import type { Logger } from 'pino';
import type { LLMResult } from './cloud.js';
import { CloudLLMClient } from './cloud.js';
import { CopilotLLMClient } from './copilot.js';
import { ChatGPTCodexClient } from './chatgpt-codex.js';
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
 *   background → mindless tasks, heartbeat, classification — local/free (fallback: cheap copilot)
 *   chat       → Telegram conversations, organising — Codex 5.3
 *   planning   → planning, approach breakdown — Opus 4.6
 *   coding     → implementation — Codex 5.3
 *   review     → code review — Codex 5.3
 */
export type LLMTier = 'background' | 'chat' | 'planning' | 'coding' | 'review';

/**
 * Wraps a primary LLM client with automatic fallback on failure.
 * Used for the background tier: tries local Ollama first, falls back to Copilot.
 */
class FallbackLLMClient implements LLMExecutor {
  constructor(
    private primary: LLMExecutor,
    private fallback: LLMExecutor,
    private logger: Logger,
    private tier: LLMTier,
  ) {}

  async executeTask(systemPrompt: string, taskPrompt: string): Promise<LLMResult> {
    try {
      return await this.primary.executeTask(systemPrompt, taskPrompt);
    } catch (error) {
      this.logger.warn(
        { tier: this.tier, error: String(error) },
        'Primary LLM unavailable, using fallback',
      );
      return this.fallback.executeTask(systemPrompt, taskPrompt);
    }
  }
}

/**
 * Create an LLM client for a specific tier.
 *
 * Resolution order for each tier:
 * 1. If tiers config exists → use the tier's provider+model (with optional fallback)
 * 2. If copilot config exists → use copilot (legacy single-tier)
 * 3. If cloud config exists → use cloud (legacy fallback)
 */
export function createLLMClient(
  config: DaemonConfig,
  logger: Logger,
  tier: LLMTier = 'coding',
): LLMExecutor {
  const { llm } = config;

  // Five-tier routing (new config format)
  if (llm.tiers) {
    const tierConfig = llm.tiers[tier];
    const primary = createClientForProvider(tierConfig.provider, tierConfig.model, config, logger, tier);

    // If this tier has a fallback, wrap with FallbackLLMClient
    if (tierConfig.fallback) {
      const fallback = createClientForProvider(
        tierConfig.fallback.provider,
        tierConfig.fallback.model,
        config,
        logger,
        tier,
      );
      logger.info(
        { tier, primary: `${tierConfig.provider}/${tierConfig.model}`, fallback: `${tierConfig.fallback.provider}/${tierConfig.fallback.model}` },
        'Tier configured with fallback',
      );
      return new FallbackLLMClient(primary, fallback, logger, tier);
    }

    return primary;
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

    case 'openai': {
      // Prefer ChatGPT subscription (OAuth access_token → chatgpt.com/backend-api/codex)
      const oauth = config.llm.openaiOAuth;
      if (oauth?.accessToken) {
        logger.info({ model, provider: 'openai-subscription', tier }, `Using ChatGPT subscription for ${tier} tier`);
        return new ChatGPTCodexClient(oauth.accessToken, model, logger);
      }
      // Fallback to API key (api.openai.com — requires credits)
      const openaiKey = oauth?.apiKey ?? config.llm.openaiApiKey;
      if (!openaiKey) {
        throw new Error(`OpenAI tier "${tier}" requires openaiOAuth or openaiApiKey in llm config`);
      }
      logger.info({ model, provider: 'openai-apikey', tier }, `Using OpenAI API key for ${tier} tier`);
      return new CopilotLLMClient(
        { githubToken: openaiKey, model, baseUrl: 'https://api.openai.com/v1' },
        logger,
      );
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
