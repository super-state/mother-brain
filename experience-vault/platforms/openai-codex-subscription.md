# OpenAI Codex — ChatGPT Subscription API

> Domain: APIs/Authentication | Discovered: 2025-07 | Source: OpenAI Codex CLI (Rust), OpenClaw

## The Gotcha

OpenAI has **two separate API paths** for Codex models:

1. **API Credits** (`api.openai.com/v1`) — standard, bills per-token to API credits
2. **Subscription** (`chatgpt.com/backend-api/codex`) — bills to ChatGPT Plus/Pro subscription

If you try to use a subscription OAuth token with `api.openai.com`, you get:
- `401 Missing scopes: api.responses.write` (access_token)
- `429 insufficient_quota` (exchanged sk-proj key, no credits)

## Subscription Endpoint Requirements

**URL**: `https://chatgpt.com/backend-api/codex/responses`

**Mandatory request fields**:
- `stream: true` — non-streaming is rejected
- `store: false` — storing is not supported on subscription path
- `instructions: "..."` — system prompt (separate from input)
- `input: [...]` — array of messages/tool results (not a string)

**Mandatory headers**:
- `Authorization: Bearer <access_token>` — OAuth access token (NOT sk-proj key)
- `originator: codex_cli_rs` — identifies the client type
- `User-Agent: codex_cli_rs/1.0.0 (<OS> <arch>)` — needed to bypass Cloudflare

**Unsupported parameters** (will cause 400 error):
- `max_output_tokens` — not accepted on this endpoint

## Supported Models

Only Codex-specific model names work. Standard models (gpt-4.1, o3, etc.) return:
> "The '<model>' model is not supported when using Codex with a ChatGPT account."

Working models (ChatGPT Plus):
- `gpt-5.3-codex` — most capable
- `gpt-5.2-codex`
- `gpt-5.1-codex`, `gpt-5.1-codex-max`
- `gpt-5-codex`, `gpt-5-codex-mini`

## Response Format (SSE)

The response is Server-Sent Events. Key event types:
- `response.created` — response metadata
- `response.output_text.delta` — text chunk (`data.delta`)
- `response.output_item.done` — completed output item (check `item.type === 'function_call'`)
- `response.completed` — final event with `response.usage.{input_tokens, output_tokens}`

## Multi-turn with Tool Calls

For subsequent turns after tool execution, append to the `input` array:
```json
[
  {"role": "user", "content": "original message"},
  {"type": "function_call", "name": "tool_name", "arguments": "{...}", "call_id": "call_xxx"},
  {"type": "function_call_output", "call_id": "call_xxx", "output": "result"}
]
```

## OAuth PKCE Flow

Standard OAuth PKCE with OpenAI's auth server:
- Client ID: `app_EMoamEEZ73f0CkXaXp7hrann` (Codex CLI client)
- Auth URL: `https://auth.openai.com/oauth/authorize`
- Token URL: `https://auth.openai.com/oauth/token`
- Redirect: `http://localhost:1455/auth/callback`
- Scopes: `openid profile email offline_access`

The `access_token` from the token exchange is used directly as Bearer auth.
Do NOT exchange for an sk-proj API key — that's for API credits path only.

## Reference Implementation

OpenClaw (github.com/openclaw/openclaw) successfully uses this with ChatGPT Plus:
- Provider name: `openai-codex`
- Defaults to WebSocket transport (`transport: "auto"`)
- Stores `store: false` for codex responses
- Uses `@mariozechner/pi-ai` for OAuth flow

## Cross-References

- [Azure Content Filter](./azure-content-filter.md) — related API error handling
- [GitHub Models API](./github-models-api.md) — alternative free-tier provider
