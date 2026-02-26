#!/usr/bin/env node

/**
 * Mother Brain Daemon — Entry Point
 *
 * Commands:
 *   mother-brain-daemon init       — Interactive setup wizard
 *   mother-brain-daemon auth openai — Authenticate with OpenAI (ChatGPT subscription)
 *   mother-brain-daemon start      — Start the daemon
 *   mother-brain-daemon            — Default: start
 */

export {};  // Make this a module for top-level await

const command = process.argv[2];

if (command === 'init') {
  const { runInitWizard } = await import('./cli/init.js');
  await runInitWizard();
} else if (command === 'auth') {
  const { runAuth } = await import('./cli/auth.js');
  await runAuth(process.argv[3]);
} else {
  // start (default)
  const { Daemon } = await import('./core/daemon.js');
  const { createLogger } = await import('./core/logger.js');

  const logger = createLogger(process.env['LOG_LEVEL'] ?? 'info');
  const configPath = command === 'start' ? process.argv[3] : command;

  const daemon = new Daemon(logger, configPath);

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutdown signal received');
    await daemon.stop();
    process.exit(0);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  process.on('uncaughtException', (error) => {
    logger.fatal({ error }, 'Uncaught exception');
    void shutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Unhandled rejection');
  });

  daemon.start().catch((error) => {
    logger.fatal({ error: String(error), stack: error?.stack }, 'Failed to start daemon');
    console.error('Startup error:', error);
    process.exit(1);
  });
}
