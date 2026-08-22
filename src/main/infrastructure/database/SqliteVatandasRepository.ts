import { Database } from 'better-sqlite3';
import { SqliteBaseRepository } from './SqliteBaseRepository';
import { IVatandasRepository } from '@core/interfaces';

export class SqliteVatandasRepository extends SqliteBaseRepository<any> implements IVatandasRepository {
  constructor(db: Database) {
    super(db, 'DATA_Vatandas');
  }
  checkDuplicate(field: string, value: string, excludeId?: string): boolean {
    const sql = excludeId ? `SELECT COUNT(*) as count FROM "DATA_Vatandas" WHERE "${field}" = ? AND id != ?` : `SELECT COUNT(*) as count FROM "DATA_Vatandas" WHERE "${field}" = ?`;
    const res = this.db.prepare(sql).get(...(excludeId ? [value, excludeId] : [value])) as any;
    return res.count > 0;
  }

  getByTckn(tckn: string): any {
    return this.db.prepare('SELECT * FROM "DATA_Vatandas" WHERE TCKN = ?').get(tckn);
  }

  getBySicil(sicil: string): any {
    return this.db.prepare('SELECT * FROM "DATA_Vatandas" WHERE Sicil_No = ?').get(sicil);
  }
}
