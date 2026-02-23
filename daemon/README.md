# Mother Brain Daemon

An autonomous development agent that runs on a Raspberry Pi, executes [Mother Brain](https://github.com/super-state/mother-brain) roadmap outcomes overnight while you sleep, and reports via Telegram.

## What It Does

- 🌙 **Overnight Worker** — Assign work before bed, wake up to completed outcomes
- 📱 **Telegram Interface** — Monitor, command, and receive reports from your phone
- 💰 **Token Efficient** — $0 when idle, minimal context per task, budget caps enforced
- 🔒 **Self-Hosted** — Runs on your Raspberry Pi. Your machine, your data
- ✅ **Verified Output** — Multi-layer verification gates ensure quality

## Architecture

```
┌─────────────────────────────────────────────┐
│  Mother Brain Daemon (Raspberry Pi)         │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐ │
│  │ Scheduler │→ │ Runtime  │→ │ Verifier  │ │
│  │ (croner)  │  │ (LLM)   │  │ (gates)   │ │
│  └──────────┘  └──────────┘  └───────────┘ │
│       ↑              ↑             ↓        │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐ │
│  │ Roadmap  │  │ Budget   │  │ Workspace │ │
│  │ (files)  │  │ (SQLite) │  │ (git)     │ │
│  └──────────┘  └──────────┘  └───────────┘ │
│                      ↓                      │
│              ┌──────────────┐               │
│              │   Reporter   │               │
│              │  (Telegram)  │               │
│              └──────────────┘               │
└─────────────────────────────────────────────┘
```

## Quick Start

```bash
# Install
npm install -g mother-brain-daemon

# Configure
mother-brain-daemon init

# Start
mother-brain-daemon start
```

## Part of Mother Brain

This is a runtime for the [Mother Brain framework](https://github.com/super-state/mother-brain). The CLI is for interactive sessions. The daemon is for autonomous execution. Same brain, different mode.

## Status

🚧 Under active development — not yet released.
