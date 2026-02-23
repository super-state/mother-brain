import type { Logger } from 'pino';

/**
 * A module that participates in the daemon lifecycle.
 * Every daemon subsystem implements this interface.
 */
export interface DaemonModule {
  readonly name: string;
  start(): Promise<void>;
  stop(): Promise<void>;
}

export type DaemonState = 'stopped' | 'starting' | 'running' | 'stopping';

/**
 * Coordinates ordered startup and shutdown of daemon modules.
 * Modules start in registration order, stop in reverse order.
 */
export class Lifecycle {
  private modules: DaemonModule[] = [];
  private _state: DaemonState = 'stopped';

  constructor(private logger: Logger) {}

  get state(): DaemonState {
    return this._state;
  }

  /** Register a module. Start order = registration order. */
  register(module: DaemonModule): void {
    this.modules.push(module);
    this.logger.debug({ module: module.name }, 'Module registered');
  }

  /** Start all modules in registration order. */
  async startAll(): Promise<void> {
    if (this._state !== 'stopped') {
      throw new Error(`Cannot start from state: ${this._state}`);
    }
    this._state = 'starting';
    this.logger.info({ count: this.modules.length }, 'Starting modules');

    for (const mod of this.modules) {
      this.logger.info({ module: mod.name }, 'Starting module');
      try {
        await mod.start();
      } catch (error) {
        this.logger.fatal({ module: mod.name, error }, 'Module failed to start');
        // Stop any modules that already started (reverse order)
        await this.stopStarted(this.modules.indexOf(mod));
        this._state = 'stopped';
        throw error;
      }
    }

    this._state = 'running';
    this.logger.info('All modules started');
  }

  /** Stop all modules in reverse registration order. */
  async stopAll(): Promise<void> {
    if (this._state === 'stopped' || this._state === 'stopping') {
      return;
    }
    this._state = 'stopping';
    await this.stopStarted(this.modules.length);
    this._state = 'stopped';
    this.logger.info('All modules stopped');
  }

  /** Stop modules up to (but not including) the given index, in reverse order. */
  private async stopStarted(upToIndex: number): Promise<void> {
    for (let i = upToIndex - 1; i >= 0; i--) {
      const mod = this.modules[i]!;
      this.logger.info({ module: mod.name }, 'Stopping module');
      try {
        await mod.stop();
      } catch (error) {
        this.logger.error({ module: mod.name, error }, 'Module failed to stop cleanly');
        // Continue stopping remaining modules
      }
    }
  }
}
