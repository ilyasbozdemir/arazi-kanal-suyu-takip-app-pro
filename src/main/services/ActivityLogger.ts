import { injectable, inject } from 'tsyringe';
import crypto from 'crypto';
import type { Database } from 'better-sqlite3';
import { TableNames } from '@core/constants/TableNames';

@injectable()
export class ActivityLogger {
  constructor(@inject('Database') private db: Database) {}

  log(tx: any, table: string, recordId: string, action: string, prevState: any, nextState: any) {
    try {
      const personnelRow = tx.db.prepare('SELECT id FROM TANIM_Personel WHERE Aktif = 1 LIMIT 1').get() as any;
      const userId = personnelRow ? personnelRow.id : 'SYSTEM';

      console.log("[ACTIVITY_LOGGER] Table: " + table + " | Record_Id: " + recordId + " | Action: " + action);

      tx.db.prepare(`
        INSERT INTO ${TableNames.ACTIVITIES} (id, Table_Name, Record_Id, Action, Prev_State, Next_State, User_Id, Timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(
        crypto.randomUUID(),
        table,
        recordId,
        action,
        prevState ? JSON.stringify(prevState) : null,
        nextState ? JSON.stringify(nextState) : null,
        userId
      );
    } catch (e) {
      console.error("[ACTIVITY_LOGGER_ERR]", e);
    }
  }
}
