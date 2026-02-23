# Daemon Architect — Resources

## Core Dependencies

- **Node.js 22+**: https://nodejs.org/en/docs/
- **TypeScript 5.x**: https://www.typescriptlang.org/docs/
- **better-sqlite3**: https://github.com/WiseLibs/better-sqlite3 — Synchronous SQLite for Node.js
- **pino**: https://github.com/pinojs/pino — High-performance structured logging
- **croner**: https://croner.56k.guru/ — Lightweight cron scheduler
- **simple-git**: https://github.com/steveukx/git-js — Git operations in Node.js

## Architecture References

- **Anthropic — Building Effective Agents**: https://www.anthropic.com/research/building-effective-agents
  - Key takeaway: Composable modules over frameworks. Direct API calls.
- **OpenAI — Practical Guide to Building Agents**: https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/
  - Key takeaway: Robust error handling, retry strategies, audit trails.

## Raspberry Pi Constraints

- Pi 5 8GB: ~8GB RAM total, ~6GB available for daemon + Ollama
- Storage: Use SSD/NVMe, not SD card (too slow for SQLite + model loading)
- Cooling: Active cooling mandatory for sustained workloads
- Power: 3-8W under load depending on model size

## Token Efficiency Research

- OpenClaw uses ~25,000+ tokens per LLM call (conversation history)
- Mother Brain Daemon target: ~4,700 tokens per task call
- Strategy: Pre-computed project context in SQLite, no conversation history, skill-scoped instructions only
