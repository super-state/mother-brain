import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

function header(text: string): void {
  console.log(`\n${BOLD}${CYAN}${text}${RESET}`);
}

function step(num: number, text: string): void {
  console.log(`\n${BOLD}Step ${num}:${RESET} ${text}`);
}

function hint(text: string): void {
  console.log(`  ${DIM}${text}${RESET}`);
}

function success(text: string): void {
  console.log(`  ${GREEN}✓${RESET} ${text}`);
}

function warn(text: string): void {
  console.log(`  ${YELLOW}⚠${RESET} ${text}`);
}

// ---------------------------------------------------------------------------
// Init Wizard
// ---------------------------------------------------------------------------

export async function runInitWizard(): Promise<void> {
  const rl = createInterface({ input: stdin, output: stdout });

  header('🧠 Mother Brain Daemon — Setup Wizard');
  console.log('This will guide you through configuring the daemon.\n');

  const dataDir = join(homedir(), '.mother-brain-daemon');
  const configPath = join(dataDir, 'config.json');

  if (existsSync(configPath)) {
    const overwrite = await rl.question('Config already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      rl.close();
      return;
    }
  }

  // --- Step 1: GitHub PAT ---
  step(1, 'GitHub Personal Access Token');
  hint('Required for Copilot model access (no per-token cost).');
  hint('Create one at: https://github.com/settings/tokens');
  hint('Scope needed: models:read');
  console.log();
  const githubToken = await rl.question('  Paste your GitHub PAT: ');

  if (!githubToken.startsWith('ghp_') && !githubToken.startsWith('github_pat_')) {
    warn('Token doesn\'t look like a GitHub PAT. Continuing anyway...');
  } else {
    success('Token accepted');
  }

  // --- Step 2: Model selection (three-tier) ---
  step(2, 'LLM Model Tiers');
  hint('The daemon uses three model tiers for different jobs:');
  hint('  🔧 System — heartbeat, classification (local = $0)');
  hint('  💬 Chat   — Telegram conversations (mid-tier)');
  hint('  🏗️  Coding — code generation & outcomes (premium)');
  console.log();

  // System tier
  header('  🔧 System Tier (lightweight tasks)');
  console.log('  1. Local Ollama (recommended — free, runs on your machine)');
  console.log('  2. Copilot (uses subscription)');
  console.log('  3. Skip (use Copilot for everything)');
  console.log();
  const sysChoice = await rl.question('  Select (1-3): ');

  let systemTier: { provider: string; model: string };
  let localBaseUrl = 'http://localhost:11434';
  if (sysChoice.trim() === '1') {
    const localModel = (await rl.question('  Ollama model name (default: llama3.2:3b): ')).trim() || 'llama3.2:3b';
    localBaseUrl = (await rl.question(`  Ollama URL (default: ${localBaseUrl}): `)).trim() || localBaseUrl;
    systemTier = { provider: 'local', model: localModel };
    success(`System: local/${localModel}`);
  } else {
    systemTier = { provider: 'copilot', model: 'openai/gpt-4.1-mini' };
    success(`System: copilot/gpt-4.1-mini`);
  }

  // Chat tier
  console.log();
  header('  💬 Chat Tier (Telegram conversations)');
  console.log('  1. openai/gpt-4.1 (recommended — fast, good quality)');
  console.log('  2. openai/gpt-4o');
  console.log('  3. Custom');
  console.log();
  const chatChoice = await rl.question('  Select (1-3): ');

  let chatModel: string;
  switch (chatChoice.trim()) {
    case '1': chatModel = 'openai/gpt-4.1'; break;
    case '2': chatModel = 'openai/gpt-4o'; break;
    case '3': chatModel = await rl.question('  Enter model ID: '); break;
    default: chatModel = 'openai/gpt-4.1';
  }
  success(`Chat: copilot/${chatModel}`);

  // Coding tier
  console.log();
  header('  🏗️  Coding Tier (code generation & outcomes)');
  console.log('  1. anthropic/claude-opus-4-20250514 (recommended — best coder)');
  console.log('  2. anthropic/claude-sonnet-4-20250514');
  console.log('  3. openai/gpt-4.1');
  console.log('  4. Custom');
  console.log();
  const codeChoice = await rl.question('  Select (1-4): ');

  let codingModel: string;
  switch (codeChoice.trim()) {
    case '1': codingModel = 'anthropic/claude-opus-4-20250514'; break;
    case '2': codingModel = 'anthropic/claude-sonnet-4-20250514'; break;
    case '3': codingModel = 'openai/gpt-4.1'; break;
    case '4': codingModel = await rl.question('  Enter model ID: '); break;
    default: codingModel = 'anthropic/claude-opus-4-20250514';
  }
  success(`Coding: copilot/${codingModel}`);

  // --- Step 3: Telegram ---
  step(3, 'Telegram Bot');
  hint('The daemon sends notifications and responds to commands via Telegram.');
  hint('1. Open Telegram → search @BotFather → send /newbot');
  hint('2. Follow the prompts to name your bot');
  hint('3. Copy the bot token BotFather gives you');
  console.log();
  const botToken = await rl.question('  Paste your bot token: ');

  if (!botToken.includes(':')) {
    warn('Token doesn\'t look like a Telegram bot token. Continuing anyway...');
  } else {
    success('Bot token accepted');
  }

  hint('Now send any message to your bot in Telegram, then...');
  hint('To get your Chat ID: Open https://api.telegram.org/bot<TOKEN>/getUpdates');
  hint('Or send /start to your bot and check the response.');
  console.log();
  const chatId = await rl.question('  Enter your Telegram chat ID: ');
  success(`Chat ID: ${chatId}`);

  // --- Step 4: Workspace ---
  step(4, 'Target Project');
  hint('Which repo should the daemon work on?');
  hint('This should be a local git repo with a Mother Brain roadmap.');
  console.log();
  const repoPath = await rl.question('  Absolute path to repo: ');

  if (!existsSync(repoPath)) {
    warn(`Path doesn't exist: ${repoPath}. You can fix this in config.json later.`);
  } else {
    success(`Repo: ${repoPath}`);
  }

  const branchDefault = 'daemon/work';
  const branch = (await rl.question(`  Work branch (default: ${branchDefault}): `)).trim() || branchDefault;
  success(`Branch: ${branch}`);

  // --- Step 5: Schedule ---
  step(5, 'Active Hours');
  hint('When should the daemon run? (24h format, e.g., 23 for 11pm)');
  console.log();
  const startHour = parseInt((await rl.question('  Start hour (default: 23): ')).trim() || '23', 10);
  const endHour = parseInt((await rl.question('  End hour (default: 7): ')).trim() || '7', 10);
  const timezoneDefault = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timezone = (await rl.question(`  Timezone (default: ${timezoneDefault}): `)).trim() || timezoneDefault;
  success(`Schedule: ${startHour}:00 — ${endHour}:00 ${timezone}`);

  // --- Step 6: Budget ---
  step(6, 'Budget');
  hint('With Copilot subscription, costs are flat. This tracks API-level usage.');
  const budgetStr = (await rl.question('  Max spend per night in USD (default: 5.00): ')).trim() || '5.00';
  const budget = parseFloat(budgetStr);
  success(`Budget: $${budget.toFixed(2)} per night`);

  // --- Write config ---
  header('Writing configuration...');

  const config: Record<string, unknown> = {
    activeHours: { start: startHour, end: endHour },
    timezone,
    budget: { perNight: budget, currency: 'USD' },
    telegram: { botToken, chatId, wakeTime: `${endHour.toString().padStart(2, '0')}:00` },
    llm: {
      githubToken,
      ...(systemTier.provider === 'local' ? { local: { enabled: true, baseUrl: localBaseUrl, model: systemTier.model } } : {}),
      tiers: {
        system: systemTier,
        chat: { provider: 'copilot', model: chatModel },
        coding: { provider: 'copilot', model: codingModel },
      },
    },
    workspace: { repoPath, branch },
    heartbeatMinutes: 15,
  };

  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
  writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
  success(`Config written to: ${configPath}`);

  // --- Test connection ---
  header('Testing connections...');

  // Test GitHub Models API
  try {
    const res = await fetch(`https://models.github.ai/inference/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: codingModel,
        messages: [{ role: 'user', content: 'Say "hello" and nothing else.' }],
        max_tokens: 10,
      }),
    });
    if (res.ok) {
      success('GitHub Models API — connected');
    } else {
      const body = await res.text();
      warn(`GitHub Models API — ${res.status}: ${body.slice(0, 100)}`);
    }
  } catch (error) {
    warn(`GitHub Models API — failed: ${error}`);
  }

  // Test Telegram bot
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: '🧠 Mother Brain Daemon connected! Setup complete.',
      }),
    });
    if (res.ok) {
      success('Telegram — message sent! Check your phone.');
    } else {
      const body = await res.text();
      warn(`Telegram — ${res.status}: ${body.slice(0, 100)}`);
    }
  } catch (error) {
    warn(`Telegram — failed: ${error}`);
  }

  // --- Done ---
  header('🎉 Setup Complete!');
  console.log();
  console.log(`  Config: ${configPath}`);
  console.log(`  Repo:   ${repoPath}`);
  console.log(`  🔧 System: ${systemTier.provider}/${systemTier.model}`);
  console.log(`  💬 Chat:   copilot/${chatModel}`);
  console.log(`  🏗️  Coding: copilot/${codingModel}`);
  console.log(`  Hours:  ${startHour}:00 — ${endHour}:00 ${timezone}`);
  console.log();
  console.log(`  ${BOLD}Start the daemon:${RESET}`);
  console.log(`    cd daemon && npm run build && node dist/index.js start`);
  console.log();
  console.log(`  ${BOLD}Or with pm2:${RESET}`);
  console.log(`    pm2 start dist/index.js --name mother-brain-daemon -- start`);
  console.log();

  rl.close();
}
