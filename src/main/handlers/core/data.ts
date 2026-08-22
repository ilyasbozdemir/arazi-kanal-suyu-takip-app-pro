import { ipcMain } from 'electron';
import { getDb } from '../../db';
import { SqliteUnitOfWork } from '@infrastructure/database/SqliteUnitOfWork';

// 🛡️ Explicit Domain Services
import { SaveTapuCommandHandler } from '@application/features/tapu/commands/SaveTapuCommandHandler';
import { GetTapuDetailQueryHandler } from '@application/features/tapu/queries/GetTapuDetailQueryHandler';
import { SaveVatandasCommandHandler } from '@application/features/vatandas/commands/SaveVatandasCommandHandler';
import { AccountingService } from '@application/features/accounting/AccountingService';
import { GetActiveLedgersHubQueryHandler } from '@application/features/ledger/queries/GetActiveLedgersHubQueryHandler';
import { runPersonnelAndKasaSeeds } from '../../db-helpers/seeds/personnelAndKasaSeeds';

// 🛡️ Sub-Handlers (Parçalanmış Dosyalar)
import { setupSystemHandlers } from './systemHandlers';
import { setupRecordHandlers } from '../records/recordHandlers';
import { setupQueryHandlers } from '../records/queryHandlers';
import { setupLedgerHandlers } from '../modules/ledgerHandlers';
import { setupExportHandlers } from '../io/exportHandlers';
import { setupImportHandlers } from '../io/importHandlers';
import { setupGenderHandlers } from '../modules/genderHandlers';

export const setupDataHandlers = () => {
  const db = getDb();
  if (!db) return;

  const uow = new SqliteUnitOfWork(db);

  // --- Service Initialization ---
  const services = {
    saveTapu: new SaveTapuCommandHandler(uow),
    getTapu: new GetTapuDetailQueryHandler(uow),
    saveVatandas: new SaveVatandasCommandHandler(uow),
    accounting: new AccountingService(uow),
    getActiveLedgers: new GetActiveLedgersHubQueryHandler(uow)
  };

  // 🛡️ GENERIC SQL EXECUTION (Alt handler'lar için yardımcı)
  const executeRawSql = async (sql: string, params: any[] = []) => {
    try {
      const stmt = db.prepare(sql);
      const data = (sql.trim().toUpperCase().startsWith('SELECT') || sql.trim().toUpperCase().startsWith('PRAGMA'))
        ? stmt.all(...params) : stmt.run(...params);
      return { success: true, data };
    } catch (e: any) {
      console.error("[DB] ExecuteRaw Hatası:", e.message, sql);
      return { success: false, error: e.message };
    }
  };

  // 🛡️ SETUP ALL SUB-HANDLERS
  setupSystemHandlers();
  setupRecordHandlers(db, uow, services);
  setupQueryHandlers(db, uow, services, executeRawSql);
  setupLedgerHandlers(db, uow, services);
  setupExportHandlers(db);
  setupImportHandlers();
  setupGenderHandlers();

  // 🛡️ Raw SQL Passthrough (Geriye dönük uyumluluk için)
  ipcMain.handle('execute-raw', async (_, sql, params) => await executeRawSql(sql, params));
  ipcMain.handle('execute-raw-sql', async (_, sql, params) => await executeRawSql(sql, params));

  ipcMain.handle('repair-financial-seeds', async () => {
    try {
      runPersonnelAndKasaSeeds(db);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('update-setting', async (_, key: string, value: string) => {
    try {
      return uow.executeTransaction((tx: any) => {
        const existing = tx.db.prepare('SELECT anahtar FROM TANIM_Ayarlar WHERE anahtar = ?').get(key) as any;
        if (existing) {
          tx.db.prepare('UPDATE TANIM_Ayarlar SET deger = ? WHERE anahtar = ?').run(value, key);
        } else {
          tx.db.prepare('INSERT INTO TANIM_Ayarlar (anahtar, deger) VALUES (?, ?)').run(key, value);
        }
        return { success: true };
      });
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });
};
