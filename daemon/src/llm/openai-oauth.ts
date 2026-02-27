/**
 * OpenAI Codex OAuth (ChatGPT subscription auth via PKCE)
 *
 * Authenticates with the user's ChatGPT Plus/Pro subscription.
 * Produces an access token usable as an OpenAI API key.
 *
 * Based on OpenClaw/mastra's implementation of the same flow.
 */

import crypto from 'node:crypto';
import http from 'node:http';
import type { Logger } from 'pino';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CLIENT_ID = 'app_EMoamEEZ73f0CkXaXp7hrann';
const AUTHORIZE_URL = 'https://auth.openai.com/oauth/authorize';
const TOKEN_URL = 'https://auth.openai.com/oauth/token';
const REDIRECT_URI = 'http://localhost:1455/auth/callback';
const SCOPE = 'openid profile email offline_access';
const JWT_CLAIM_PATH = 'https://api.openai.com/auth';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OpenAIOAuthCredentials {
  apiKey: string;          // Exchanged API key (use this for OpenAI API calls)
  accessToken: string;     // OAuth access token
  refreshToken: string;    // For auto-refresh when expired
  idToken: string;         // ID token (needed for API key re-exchange)
  expires: number;         // epoch ms
  accountId: string;
}

// ---------------------------------------------------------------------------
// PKCE helpers
// ---------------------------------------------------------------------------

function generatePKCE(): { verifier: string; challenge: string } {
  const verifier = crypto.randomBytes(64).toString('hex');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}

// ---------------------------------------------------------------------------
// JWT decode (no validation — we just need the accountId claim)
// ---------------------------------------------------------------------------

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(Buffer.from(parts[1]!, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

function extractAccountId(accessToken: string): string | null {
  const payload = decodeJwtPayload(accessToken);
  const auth = payload?.[JWT_CLAIM_PATH] as Record<string, string> | undefined;
  return auth?.chatgpt_account_id ?? null;
}

// ---------------------------------------------------------------------------
// Token exchange
// ---------------------------------------------------------------------------

async function exchangeCode(
  code: string,
  verifier: string,
  logger?: Logger,
): Promise<{ access: string; refresh: string; idToken: string; expiresIn: number } | null> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      code,
      code_verifier: verifier,
      redirect_uri: REDIRECT_URI,
    }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    logger?.error({ status: res.status, body: errText }, 'Code exchange failed');
    return null;
  }
  const json = await res.json() as {
    access_token?: string;
    refresh_token?: string;
    id_token?: string;
    expires_in?: number;
  };
  logger?.info({ hasAccess: !!json.access_token, hasRefresh: !!json.refresh_token, hasId: !!json.id_token }, 'Token exchange response');
  if (!json.access_token || !json.refresh_token || typeof json.expires_in !== 'number') return null;
  return {
    access: json.access_token,
    refresh: json.refresh_token,
    idToken: json.id_token ?? '',
    expiresIn: json.expires_in,
  };
}

// ---------------------------------------------------------------------------
// Token exchange: id_token → OpenAI API key
// ---------------------------------------------------------------------------

async function exchangeForApiKey(
  idToken: string,
): Promise<string | null> {
  const randomId = crypto.randomBytes(4).toString('hex');
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
      client_id: CLIENT_ID,
      requested_token: 'openai-api-key',
      subject_token: idToken,
      subject_token_type: 'urn:ietf:params:oauth:token-type:id_token',
      name: `MotherBrain [auto-generated] (${new Date().toISOString().slice(0, 10)}) [${randomId}]`,
    }),
  });
  if (!res.ok) return null;
  const json = await res.json() as { access_token?: string };
  return json.access_token ?? null;
}

// ---------------------------------------------------------------------------
// Token refresh
// ---------------------------------------------------------------------------

export async function refreshOpenAIToken(
  refreshToken: string,
): Promise<OpenAIOAuthCredentials | null> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
    }),
  });
  if (!res.ok) return null;
  const json = await res.json() as {
    access_token?: string;
    refresh_token?: string;
    id_token?: string;
    expires_in?: number;
  };
  if (!json.access_token || !json.refresh_token || typeof json.expires_in !== 'number') return null;
  const accountId = extractAccountId(json.access_token);
  if (!accountId) return null;

  // Exchange id_token for API key (if id_token present)
  let apiKey = '';
  if (json.id_token) {
    apiKey = await exchangeForApiKey(json.id_token) ?? '';
  }

  return {
    apiKey,
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    idToken: json.id_token ?? '',
    expires: Date.now() + json.expires_in * 1000,
    accountId,
  };
}

// ---------------------------------------------------------------------------
// Login flow (local server + browser)
// ---------------------------------------------------------------------------

const SUCCESS_HTML = `<!doctype html><html><head><meta charset="utf-8"><title>Authenticated</title></head>
<body style="font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
<div style="text-align:center"><h2>✅ Authenticated</h2><p>Return to your terminal.</p></div>
</body></html>`;

/**
 * Run the full OpenAI OAuth PKCE flow.
 *
 * 1. Starts HTTP server on localhost:1455
 * 2. Returns the authorization URL immediately (caller opens browser)
 * 3. waitForCallback() resolves when the callback arrives (up to 120s)
 * 4. Exchanges the code for tokens
 */
export function startLoginServer(
  logger?: Logger,
): { authUrl: string; waitForCallback: () => Promise<OpenAIOAuthCredentials | null> } | null {
  const { verifier, challenge } = generatePKCE();
  const state = crypto.randomBytes(16).toString('hex');

  // Build authorization URL
  const authUrl = new URL(AUTHORIZE_URL);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('scope', SCOPE);
  authUrl.searchParams.set('code_challenge', challenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('id_token_add_organizations', 'true');
  authUrl.searchParams.set('codex_cli_simplified_flow', 'true');

  let resolveCallback: (creds: OpenAIOAuthCredentials | null) => void;
  const callbackPromise = new Promise<OpenAIOAuthCredentials | null>((resolve) => {
    resolveCallback = resolve;
  });

  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url || '', 'http://localhost');
      if (url.pathname !== '/auth/callback') {
        res.statusCode = 404;
        res.end('Not found');
        return;
      }
      if (url.searchParams.get('state') !== state) {
        res.statusCode = 400;
        res.end('State mismatch');
        return;
      }
      const code = url.searchParams.get('code');
      if (!code) {
        res.statusCode = 400;
        res.end('Missing code');
        return;
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      res.end(SUCCESS_HTML);

      logger?.info('OAuth callback received, exchanging code for tokens');
      const tokens = await exchangeCode(code, verifier, logger);
      if (!tokens) {
        logger?.error('Token exchange failed');
        server.close();
        resolveCallback(null);
        return;
      }

      const accountId = extractAccountId(tokens.access);
      if (!accountId) {
        logger?.error('Could not extract accountId from access token');
        server.close();
        resolveCallback(null);
        return;
      }

      // Exchange id_token for API key
      logger?.info('Exchanging id_token for OpenAI API key');
      const apiKey = await exchangeForApiKey(tokens.idToken);
      if (!apiKey) {
        logger?.warn('API key exchange failed — will use access token as fallback');
      }

      server.close();
      resolveCallback({
        apiKey: apiKey ?? '',
        accessToken: tokens.access,
        refreshToken: tokens.refresh,
        idToken: tokens.idToken,
        expires: Date.now() + tokens.expiresIn * 1000,
        accountId,
      });
    } catch (err) {
      logger?.error({ err }, 'OAuth callback error');
      res.statusCode = 500;
      res.end('Error');
    }
  });

  try {
    server.listen(1455, '127.0.0.1');
  } catch {
    logger?.error('Could not start OAuth server (port 1455 in use?)');
    return null;
  }

  server.on('error', (err) => {
    logger?.error({ err }, 'OAuth server error');
    resolveCallback(null);
  });

  // Timeout after 5 minutes
  const timer = setTimeout(() => {
    server.close();
    resolveCallback(null);
  }, 300_000);

  return {
    authUrl: authUrl.toString(),
    waitForCallback: async () => {
      const result = await callbackPromise;
      clearTimeout(timer);
      return result;
    },
  };
}

/**
 * Exchange a manually-pasted callback URL for credentials.
 * For headless/remote setups where browser can't reach localhost.
 */
export async function loginOpenAIManual(
  callbackUrl: string,
  verifier: string,
  expectedState: string,
): Promise<OpenAIOAuthCredentials | null> {
  try {
    const url = new URL(callbackUrl);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    if (!code || state !== expectedState) return null;

    const tokens = await exchangeCode(code, verifier);
    if (!tokens) return null;

    const accountId = extractAccountId(tokens.access);
    if (!accountId) return null;

    const apiKey = await exchangeForApiKey(tokens.idToken);

    return {
      apiKey: apiKey ?? '',
      accessToken: tokens.access,
      refreshToken: tokens.refresh,
      idToken: tokens.idToken,
      expires: Date.now() + tokens.expiresIn * 1000,
      accountId,
    };
  } catch {
    return null;
  }
}

/**
 * Create the auth URL and PKCE codes for a manual flow.
 * Returns the URL to display + codes needed for the exchange step.
 */
export function createOpenAIAuthUrl(): {
  authUrl: string;
  verifier: string;
  state: string;
} {
  const { verifier, challenge } = generatePKCE();
  const state = crypto.randomBytes(16).toString('hex');

  const authUrl = new URL(AUTHORIZE_URL);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('scope', SCOPE);
  authUrl.searchParams.set('code_challenge', challenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('id_token_add_organizations', 'true');
  authUrl.searchParams.set('codex_cli_simplified_flow', 'true');

  return { authUrl: authUrl.toString(), verifier, state };
}
