# Raspberry Pi Deployment Guide

## Prerequisites

- Raspberry Pi 4/5 with 4GB+ RAM
- Node.js 20+ installed
- Git installed
- GitHub PAT with `models:read` scope

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/super-state/mother-brain.git
cd mother-brain/daemon

# 2. Install dependencies and build
npm install
npm run build

# 3. Initialize config (interactive wizard)
node dist/index.js init

# 4. Test manually first
node dist/index.js
# Ctrl+C when satisfied it starts correctly
```

## PM2 Setup (Production)

```bash
# 5. Install PM2 globally
npm install -g pm2

# 6. Start the daemon with PM2
cd /path/to/mother-brain/daemon
pm2 start ecosystem.config.cjs

# 7. Verify it's running
pm2 status
pm2 logs mother-brain-daemon --lines 20

# 8. Enable auto-start on boot
pm2 startup systemd
# Copy and run the command it outputs (requires sudo)
pm2 save
```

## PM2 Commands

```bash
pm2 status                     # Check daemon status
pm2 logs mother-brain-daemon   # View live logs
pm2 monit                      # Real-time monitoring (CPU/memory)
pm2 restart mother-brain-daemon # Restart
pm2 stop mother-brain-daemon   # Stop
pm2 delete mother-brain-daemon # Remove from PM2
```

## Log Management

Install log rotation to prevent disk fill:

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

Logs are at `~/.pm2/logs/mother-brain-*.log`.

## Memory Tuning

Edit `ecosystem.config.cjs` `max_memory_restart` based on your Pi:

| Pi Model | RAM | Recommended Limit |
|----------|-----|------------------|
| Pi 4     | 4GB | 256M             |
| Pi 4     | 8GB | 512M             |
| Pi 5     | 8GB | 512M             |

## Updating

```bash
cd /path/to/mother-brain
git pull origin main
cd daemon
npm install
npm run build
pm2 restart mother-brain-daemon
```

## Troubleshooting

```bash
# Check if daemon is running
pm2 status

# View recent errors
pm2 logs mother-brain-daemon --err --lines 50

# Check memory usage
pm2 show mother-brain-daemon

# Full restart (if stuck)
pm2 delete mother-brain-daemon
pm2 start ecosystem.config.cjs
```
