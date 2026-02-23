import pino from 'pino';
import { mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

/**
 * Create the daemon logger.
 *
 * Development: pretty-print to stdout
 * Production: structured JSON to stdout (pm2 captures to log files)
 *
 * pm2 handles log rotation via pm2-logrotate module,
 * so we don't need to implement our own file rotation.
 */
export function createLogger(level: string = 'info'): pino.Logger {
  const isDev = process.env['NODE_ENV'] === 'development';

  if (isDev) {
    return pino({
      name: 'mother-brain-daemon',
      level,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
    });
  }

  return pino({
    name: 'mother-brain-daemon',
    level,
  });
}

/** Ensure the daemon data directory exists. */
export function ensureDataDir(): string {
  const dataDir = join(homedir(), '.mother-brain-daemon');
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
  return dataDir;
}
