# GitHub Models API — Model Access via Copilot

## Summary
All LLM models in the daemon are accessed through GitHub Models API (`models.github.ai`), which is included with the GitHub Copilot subscription ($19/month). Models are NOT accessed via direct Anthropic or OpenAI API keys.

## Key Facts

- **Endpoint**: `https://models.github.ai/inference`
- **Auth**: GitHub PAT with `models:read` scope
- **Format**: OpenAI-compatible chat completions (all providers)
- **Cost**: Covered by Copilot subscription — no per-token charges

## Model ID Format

All models use a `provider/model-name` format:
- `openai/gpt-4.1` ✅ Works
- `openai/gpt-4.1-mini` ✅ Works
- `openai/gpt-4o` ✅ Works
- `openai/gpt-5.3-codex` ✅ Works

## Known Issues

- **Anthropic-prefixed Claude models return 404**: `anthropic/claude-sonnet-4-20250514`, `anthropic/claude-opus-4-20250514`, etc. all return "Unknown model" errors on GitHub Models API (as of 2025)
- Root cause unknown — may require different plan tier, different model IDs, or models may not yet be available through this endpoint

## Gotcha

When configuring model tiers for the daemon, always default to models confirmed to work on GitHub Models API (OpenAI models). Claude models should only be configured if confirmed available on the user's API tier.

## Cross-References
- Pricing is tracked for cost awareness even though Copilot subscription covers actual charges
- The `CopilotLLMClient` in `daemon/src/llm/copilot.ts` handles all API calls
