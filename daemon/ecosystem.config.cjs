// PM2 Ecosystem Configuration for Mother Brain Daemon
// Usage: pm2 start ecosystem.config.cjs

module.exports = {
  apps: [{
    name: 'mother-brain-daemon',
    script: 'dist/index.js',
    interpreter: 'node',
    exec_mode: 'fork',
    instances: 1,
    autorestart: true,
    watch: false,

    // Raspberry Pi memory management
    // Adjust based on your Pi model:
    //   Pi 4 (4GB): 256M
    //   Pi 4 (8GB): 512M
    //   Pi 5 (8GB): 512M
    max_memory_restart: '256M',

    // Logging — pm2 captures stdout/stderr from Pino
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: '~/.pm2/logs/mother-brain-error.log',
    out_file: '~/.pm2/logs/mother-brain-out.log',
    merge_logs: true,

    // Auto-restart tuning
    restart_delay: 5000,       // 5s delay between restarts
    max_restarts: 10,          // Max restarts in min_uptime window
    min_uptime: '60s',         // Must run 60s to count as "started"

    // Environment
    env: {
      NODE_ENV: 'production',
    },
  }],
};
