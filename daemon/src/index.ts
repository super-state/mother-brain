#!/usr/bin/env node

/**
 * Mother Brain Daemon — Entry Point
 *
 * Autonomous development agent that executes Mother Brain roadmaps overnight.
 * Runs on Raspberry Pi, communicates via Telegram, verifies all output.
 */

import { Daemon } from './core/daemon.js';
import { createLogger } from './core/logger.js';

const logger = createLogger(process.env['LOG_LEVEL'] ?? 'info');
const configPath = process.argv[2]; // optional: path to config.json

const daemon = new Daemon(logger, configPath);

// Graceful shutdown on signals
const shutdown = async (signal: string) => {
  logger.info({ signal }, 'Shutdown signal received');
  await daemon.stop();
  process.exit(0);
};

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

// Unhandled errors — log and continue (never crash silently)
process.on('uncaughtException', (error) => {
  logger.fatal({ error }, 'Uncaught exception');
  void shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled rejection');
});

// Start
daemon.start().catch((error) => {
  logger.fatal({ error }, 'Failed to start daemon');
  process.exit(1);
});
