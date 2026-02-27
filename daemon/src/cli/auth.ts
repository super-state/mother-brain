/**
 * CLI: mother-brain-daemon auth <provider>
 *
 * Authenticates with external LLM providers and saves credentials to config.
 *
 * Supported providers:
 *   openai — OAuth PKCE flow via ChatGPT subscription
 */

import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { startLoginServer, createOpenAIAuthUrl, loginOpenAIManual } from '../llm/openai-oauth.js';
import type { OpenAIOAuthCredentials } from '../llm/openai-oauth.js';

// Simple console logger matching pino Logger interface (info/warn/error)
const cliLogger = {
  info: (...args: unknown[]) => { if (typeof args[0] === 'string') console.log(`  ${DIM}[info] ${args[0]}${RESET}`); else console.log(`  ${DIM}[info]${RESET}`, args[0]); },
  warn: (...args: unknown[]) => { if (typeof args[0] === 'string') console.log(`  ${YELLOW}[warn] ${args[0]}${RESET}`); else console.log(`  ${YELLOW}[warn]${RESET}`, args[0]); },
  error: (...args: unknown[]) => { if (typeof args[0] === 'string') console.log(`  ${RED}[error] ${args[0]}${RESET}`); else console.log(`  ${RED}[error]${RESET}`, args[0]); },
} as unknown as import('pino').Logger;

// ---------------------------------------------------------------------------
// Terminal formatting
// ---------------------------------------------------------------------------

const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

function header(text: string): void {
  console.log(`\n${BOLD}${CYAN}${text}${RESET}`);
}

function success(text: string): void {
  console.log(`  ${GREEN}✓${RESET} ${text}`);
}

function warn(text: string): void {
  console.log(`  ${YELLOW}⚠${RESET} ${text}`);
}

function error(text: string): void {
  console.log(`  ${RED}✗${RESET} ${text}`);
}

// ---------------------------------------------------------------------------
// Config helpers
// ---------------------------------------------------------------------------

function getConfigPath(): string {
  return join(homedir(), '.mother-brain-daemon', 'config.json');
}

function loadConfigRaw(): Record<string, unknown> {
  const configPath = getConfigPath();
  if (!existsSync(configPath)) {
    return {};
  }
  return JSON.parse(readFileSync(configPath, 'utf-8')) as Record<string, unknown>;
}

function saveConfig(config: Record<string, unknown>): void {
  const configPath = getConfigPath();
  const dir = join(homedir(), '.mother-brain-daemon');
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

// ---------------------------------------------------------------------------
// OpenAI auth
// ---------------------------------------------------------------------------

async function authOpenAI(): Promise<void> {
  header('🔐 OpenAI Authentication (ChatGPT Subscription)');
  console.log(`\n  This will authenticate with your ChatGPT Plus/Pro/Team subscription.`);
  console.log(`  Your access token will be saved to the daemon config.`);
  console.log(`  No API credits are consumed — uses your subscription allowance.\n`);

  const rl = createInterface({ input: stdin, output: stdout });

  try {
    // Ask for flow mode
    console.log(`  ${BOLD}Authentication method:${RESET}`);
    console.log(`  ${CYAN}1${RESET}  Browser (opens a browser on this machine)`);
    console.log(`  ${CYAN}2${RESET}  Manual  (for headless/remote — paste callback URL)\n`);

    const mode = (await rl.question(`  ${DIM}Select [1]:${RESET} `)).trim() || '1';

    let credentials: OpenAIOAuthCredentials | null = null;

    if (mode === '1') {
      // Browser flow
      console.log(`\n  Starting local callback server on port 1455...`);

      const login = startLoginServer(cliLogger);
      if (!login) {
        error('Could not start callback server (port 1455 in use?).');
        return;
      }

      const authUrl = login.authUrl;
      console.log(`\n  ${BOLD}Open this URL in your browser:${RESET}`);
      console.log(`  ${DIM}${authUrl}${RESET}\n`);

      // Try to open browser automatically
      try {
        const { exec } = await import('node:child_process');
        const openCmd = process.platform === 'win32'
          ? `start "" "${authUrl}"`
          : process.platform === 'darwin'
            ? `open "${authUrl}"`
            : `xdg-open "${authUrl}"`;
        exec(openCmd);
        console.log(`  ${DIM}(Browser should open automatically)${RESET}\n`);
      } catch {
        // Ignore — user can open manually
      }

      console.log(`  Waiting for callback (5 min timeout)...`);
      credentials = await login.waitForCallback();
    } else {
      // Manual flow
      const { authUrl, verifier, state } = createOpenAIAuthUrl();

      console.log(`\n  ${BOLD}Step 1:${RESET} Open this URL in any browser:\n`);
      console.log(`  ${authUrl}\n`);

      console.log(`  ${BOLD}Step 2:${RESET} After authenticating, you'll be redirected to localhost:1455.`);
      console.log(`  ${DIM}(This will fail since no server is running here — that's OK)${RESET}`);
      console.log(`  Copy the FULL URL from your browser's address bar.\n`);

      const callbackUrl = (await rl.question(`  ${BOLD}Paste the callback URL:${RESET} `)).trim();
      if (!callbackUrl) {
        error('No URL provided.');
        return;
      }

      credentials = await loginOpenAIManual(callbackUrl, verifier, state);
    }

    if (!credentials) {
      error('Authentication failed — could not obtain credentials.');
      return;
    }

    // Save to config
    const config = loadConfigRaw();
    const llm = (config['llm'] ?? {}) as Record<string, unknown>;
    llm['openaiOAuth'] = {
      apiKey: credentials.apiKey,
      accessToken: credentials.accessToken,
      refreshToken: credentials.refreshToken,
      idToken: credentials.idToken,
      expires: credentials.expires,
      accountId: credentials.accountId,
    };
    config['llm'] = llm;
    saveConfig(config);

    success(`Authenticated with OpenAI (account: ${credentials.accountId})`);
    success(`API key obtained: ${credentials.apiKey ? 'yes' : 'no (will use access token fallback)'}`);
    success(`Token expires: ${new Date(credentials.expires).toLocaleString()}`);
    success(`Saved to: ${getConfigPath()}`);

    console.log(`\n  ${BOLD}Next steps:${RESET}`);
    console.log(`  Update your tier config to use the ${CYAN}openai${RESET} provider:`);
    console.log(`  ${DIM}  "coding": { "provider": "openai", "model": "codex-mini-latest" }${RESET}`);
    console.log(`  ${DIM}  "planning": { "provider": "openai", "model": "o3" }${RESET}\n`);

    // Test the API key with a real completion
    const testKey = credentials.apiKey || credentials.accessToken;
    console.log(`  Testing OpenAI API access...`);
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Say hi' }],
          max_completion_tokens: 5,
        }),
      });
      if (res.ok) {
        success('API access verified — chat completions working');
      } else {
        const body = await res.text();
        warn(`API returned ${res.status}: ${body.slice(0, 200)}`);
      }
    } catch (err) {
      warn(`Could not verify API access: ${err}`);
    }
  } finally {
    rl.close();
  }
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export async function runAuth(provider?: string): Promise<void> {
  if (!provider) {
    console.log(`\n${BOLD}Usage:${RESET} mother-brain-daemon auth <provider>\n`);
    console.log(`Supported providers:`);
    console.log(`  ${CYAN}openai${RESET}  — Authenticate with ChatGPT subscription (OAuth PKCE)\n`);
    process.exit(1);
  }

  switch (provider.toLowerCase()) {
    case 'openai':
      await authOpenAI();
      break;
    default:
      error(`Unknown provider: ${provider}`);
      console.log(`\nSupported: openai\n`);
      process.exit(1);
  }
}
