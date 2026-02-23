import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type { Logger } from 'pino';

// ---------------------------------------------------------------------------
// Config types
// ---------------------------------------------------------------------------

export interface ActiveHoursConfig {
  start: number;   // Hour 0-23 (e.g., 23 = 11pm)
  end: number;     // Hour 0-23 (e.g., 7 = 7am)
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  wakeTime?: string;  // HH:MM — when to send morning report
}

export interface CloudLLMConfig {
  provider: 'anthropic' | 'openai';
  apiKey: string;
  model: string;
}

export interface LocalLLMConfig {
  enabled: boolean;
  baseUrl: string;
  model: string;
}

export interface LLMConfig {
  cloud: CloudLLMConfig;
  local?: LocalLLMConfig;
}

export interface BudgetConfig {
  perNight: number;    // Max spend per session in currency units
  currency: string;    // e.g., "GBP", "USD"
}

export interface WorkspaceConfig {
  repoPath: string;     // Absolute path to the target repo
  branch: string;       // Branch to commit verified work to
}

export interface DaemonConfig {
  activeHours: ActiveHoursConfig;
  timezone: string;
  budget: BudgetConfig;
  telegram: TelegramConfig;
  llm: LLMConfig;
  workspace: WorkspaceConfig;
  heartbeatMinutes?: number;  // Default: 15
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

class ConfigError extends Error {
  readonly code = 'CONFIG_ERROR';
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

function assertString(obj: Record<string, unknown>, path: string): string {
  const value = obj[path];
  if (typeof value !== 'string' || value.length === 0) {
    throw new ConfigError(`${path} must be a non-empty string`);
  }
  return value;
}

function assertNumber(obj: Record<string, unknown>, path: string): number {
  const value = obj[path];
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new ConfigError(`${path} must be a finite number`);
  }
  return value;
}

function validateActiveHours(raw: unknown): ActiveHoursConfig {
  if (!raw || typeof raw !== 'object') {
    throw new ConfigError('activeHours must be an object with start and end');
  }
  const obj = raw as Record<string, unknown>;
  const start = assertNumber(obj, 'start');
  const end = assertNumber(obj, 'end');
  if (start < 0 || start > 23 || end < 0 || end > 23) {
    throw new ConfigError('activeHours start/end must be 0-23');
  }
  return { start, end };
}

function validateTelegram(raw: unknown): TelegramConfig {
  if (!raw || typeof raw !== 'object') {
    throw new ConfigError('telegram must be an object with botToken and chatId');
  }
  const obj = raw as Record<string, unknown>;
  return {
    botToken: assertString(obj, 'botToken'),
    chatId: assertString(obj, 'chatId'),
    wakeTime: typeof obj['wakeTime'] === 'string' ? obj['wakeTime'] : undefined,
  };
}

function validateCloudLLM(raw: unknown): CloudLLMConfig {
  if (!raw || typeof raw !== 'object') {
    throw new ConfigError('llm.cloud must be an object');
  }
  const obj = raw as Record<string, unknown>;
  const provider = assertString(obj, 'provider');
  if (provider !== 'anthropic' && provider !== 'openai') {
    throw new ConfigError('llm.cloud.provider must be "anthropic" or "openai"');
  }
  return {
    provider,
    apiKey: assertString(obj, 'apiKey'),
    model: assertString(obj, 'model'),
  };
}

function validateLLM(raw: unknown): LLMConfig {
  if (!raw || typeof raw !== 'object') {
    throw new ConfigError('llm must be an object with cloud config');
  }
  const obj = raw as Record<string, unknown>;
  return {
    cloud: validateCloudLLM(obj['cloud']),
    // local is optional for MVP
  };
}

function validateBudget(raw: unknown): BudgetConfig {
  if (!raw || typeof raw !== 'object') {
    throw new ConfigError('budget must be an object with perNight and currency');
  }
  const obj = raw as Record<string, unknown>;
  const perNight = assertNumber(obj, 'perNight');
  if (perNight <= 0) {
    throw new ConfigError('budget.perNight must be greater than 0');
  }
  return {
    perNight,
    currency: assertString(obj, 'currency'),
  };
}

function validateWorkspace(raw: unknown): WorkspaceConfig {
  if (!raw || typeof raw !== 'object') {
    throw new ConfigError('workspace must be an object with repoPath and branch');
  }
  const obj = raw as Record<string, unknown>;
  const repoPath = assertString(obj, 'repoPath');
  if (!existsSync(repoPath)) {
    throw new ConfigError(`workspace.repoPath does not exist: ${repoPath}`);
  }
  return {
    repoPath,
    branch: assertString(obj, 'branch'),
  };
}

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

/** Default config file location: ~/.mother-brain-daemon/config.json */
export function defaultConfigPath(): string {
  return join(homedir(), '.mother-brain-daemon', 'config.json');
}

/**
 * Load and validate configuration from a JSON file.
 * Fails fast with clear error messages on invalid config.
 */
export function loadConfig(configPath: string, logger: Logger): DaemonConfig {
  if (!existsSync(configPath)) {
    throw new ConfigError(
      `Config file not found: ${configPath}\n` +
      `Create it at ${defaultConfigPath()} or pass --config <path>`
    );
  }

  let raw: unknown;
  try {
    const text = readFileSync(configPath, 'utf-8');
    raw = JSON.parse(text);
  } catch (error) {
    throw new ConfigError(`Failed to parse config file: ${configPath} — ${error}`);
  }

  if (!raw || typeof raw !== 'object') {
    throw new ConfigError('Config must be a JSON object');
  }

  const obj = raw as Record<string, unknown>;

  const config: DaemonConfig = {
    activeHours: validateActiveHours(obj['activeHours']),
    timezone: assertString(obj as Record<string, unknown>, 'timezone'),
    budget: validateBudget(obj['budget']),
    telegram: validateTelegram(obj['telegram']),
    llm: validateLLM(obj['llm']),
    workspace: validateWorkspace(obj['workspace']),
    heartbeatMinutes: typeof obj['heartbeatMinutes'] === 'number' ? obj['heartbeatMinutes'] : 15,
  };

  logger.info({ configPath }, 'Configuration loaded and validated');
  return config;
}
