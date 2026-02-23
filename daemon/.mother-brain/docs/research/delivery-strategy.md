# Delivery Strategy Research

## Project Type
Self-hosted autonomous Node.js daemon running on Raspberry Pi.

## MVP Definition (from research + vision)

**Minimum viable daemon** = the smallest thing that proves the concept works:
1. Daemon starts, reads a roadmap from a local git repo
2. Picks the next uncompleted task
3. Builds minimal context (skill + task + relevant files)
4. Calls Claude API with tool use to generate code changes
5. Applies changes and runs build/test gates
6. Commits verified changes to a branch
7. Sends a Telegram notification with results
8. Respects a budget cap (stops when limit reached)
9. Runs on a configurable schedule (e.g., 11pm-7am)

**NOT in MVP**: Web dashboard, Ollama local models, multi-repo, soul/personality, screenshot proofs, Playwright functional gates, multi-agent orchestration.

## Launch Pattern
This is a personal tool — no "launch" needed. The MVP is complete when:
- The daemon can run overnight on the Pi
- We wake up to a Telegram message showing what was completed
- Budget was respected
- Committed code actually builds and passes tests

## Iteration Strategy
Iterate based on personal daily usage:
1. **Phase 1 (MVP)**: Core loop + Telegram + verification + budget
2. **Phase 2**: Ollama local models, morning reports, dashboard basics
3. **Phase 3**: Multi-agent, income generation, advanced orchestration
4. **Phase N**: Whatever we need based on real usage

## Process Management
- **pm2** for daemon lifecycle management (auto-restart, logging, startup-on-boot)
- pm2 on Raspberry Pi is well-tested and lightweight
- `pm2 start daemon.js --name mother-brain-daemon`
- `pm2 startup` for auto-start on boot

## No Docker for MVP
- Docker adds complexity without benefit for a single-user Pi deployment
- Direct pm2 management is simpler and more transparent
- Docker can be added later if distribution becomes important

## Deployment Path (Pi-specific)
1. Clone repo to Pi
2. `npm install` in daemon/
3. Create config file with API key + Telegram bot token + chat ID
4. `pm2 start` the daemon
5. Done
