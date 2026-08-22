import { Database } from 'better-sqlite3';
import { runFailsafe } from './seeds/failsafe';
import { runInitialSeeds } from './seeds/initialSeeds';
import { runLocationSeeds } from './seeds/locationSeeds';
import { runPersonnelAndKasaSeeds } from './seeds/personnelAndKasaSeeds';
import { runMapLayerSeeds } from './seeds/mapLayerSeeds';

/**
 * 🛡️ GENESIS SEED ORCHESTRATOR
 * This function coordinates all database seeding and failsafe operations.
 * It is called once during app initialization if the database is empty or requires schema verification.
 */
export function seedGenesis(_db: Database) {
  console.log('[DB] Genesis Orchestration Started...');

  // 1. Ensure critical tables exist (Failsafe)
  runFailsafe(_db);

  // 2. Populate basic settings and neighborhoods
  runInitialSeeds(_db);

  // 3. Populate administrative boundaries (Il, Ilce, Mahalle)
  runLocationSeeds(_db);

  // 4. Populate map layers from GeoJSON files
  runMapLayerSeeds(_db);

  // 5. Populate personnel and financial assets (Kasalar)
  runPersonnelAndKasaSeeds(_db);

  console.log('[DB] Genesis Orchestration Completed Successfully.');
}
