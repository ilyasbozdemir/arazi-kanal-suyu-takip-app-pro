import 'reflect-metadata';
import { container } from 'tsyringe';
import { getDb } from '../../db';
import { SqliteUnitOfWork } from '../../infrastructure/database/SqliteUnitOfWork';
import { Mediator } from './Mediator';
import { TapuIpcHandler } from '../../ipc/TapuIpcHandler';
import { WindowIpcHandler } from '../../ipc/WindowIpcHandler';
import { CitizenIpcHandler } from '../../ipc/CitizenIpcHandler';
import { CrudIpcHandler } from '../../ipc/CrudIpcHandler';
import { WindowService } from '../../services/WindowService';

/**
 * 🛡️ BOOTSTRAP FUNCTION
 * Resolves and initializes all IPC handlers.
 * This is called AFTER initDb(), ensuring the database is ready.
 */
export function bootstrapDI() {
  // 1. Get DB Instance (Must be initialized by now)
  const db = getDb();
  if (!db) {
    throw new Error('[DI] Database is not initialized! Call initDb() before bootstrapDI().');
  }

  // 2. Register DB and UnitOfWork
  container.registerInstance('Database', db);
  container.registerInstance('IUnitOfWork', new SqliteUnitOfWork(db));

  // 3. Core Services
  container.registerSingleton(Mediator);
  container.registerSingleton(WindowService);

  // 4. Resolve and register IPC handlers
  const mediator = container.resolve(Mediator);
  container.resolve(TapuIpcHandler).register();
  container.resolve(WindowIpcHandler).register();
  container.resolve(CitizenIpcHandler).register();
  container.resolve(CrudIpcHandler).register();

  return { mediator, container };
}

