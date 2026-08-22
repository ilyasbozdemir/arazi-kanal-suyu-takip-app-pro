import { injectable, container, InjectionToken } from 'tsyringe';

/**
 * 🛡️ MEDIATOR PATTERN
 * Decouples the IPC handlers from the actual business logic (Command/Query Handlers).
 */
@injectable()
export class Mediator {
  private handlers = new Map<string, any>();

  /**
   * Registers a handler for a specific command or query type.
   */
  register(type: string, handler: any) {
    this.handlers.set(type, handler);
  }

  /**
   * Sends a command or query to its registered handler.
   */
  async send(type: string, data: any): Promise<any> {
    const handler = this.handlers.get(type);
    if (!handler) {
      throw new Error(`Handler for ${type} not found!`);
    }
    // Every handler must have a 'handle' method
    return await handler.handle(data);
  }
}

// 🛡️ RE-EXPORT container for global use
export { container };
