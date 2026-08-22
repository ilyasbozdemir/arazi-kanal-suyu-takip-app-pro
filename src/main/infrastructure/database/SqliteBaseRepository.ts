import { Database } from 'better-sqlite3';
import { IRepository } from '../../core/interfaces';

export class SqliteBaseRepository<T> implements IRepository<T> {
  constructor(protected db: Database, protected tableName: string) {}

  private getActivePersonnelId(): string | null {
    try {
      const row = this.db.prepare('SELECT id FROM TANIM_Personel WHERE Aktif = 1 LIMIT 1').get() as any;
      return row ? row.id : null;
    } catch (e) {
      return null;
    }
  }

  getAll(): T[] {
    const tableInfo = this.db.prepare(`PRAGMA table_info("${this.tableName}")`).all() as any[];
    const hasDeletedAt = tableInfo.some(c => c.name === 'deleted_at');

    let sql = `SELECT * FROM "${this.tableName}"`;
    if (hasDeletedAt) {
      sql += ` WHERE deleted_at IS NULL`;
    }

    return this.db.prepare(sql).all() as T[];
  }

  getById(id: string): T | undefined {
    const tableInfo = this.db.prepare(`PRAGMA table_info("${this.tableName}")`).all() as any[];
    const hasDeletedAt = tableInfo.some(c => c.name === 'deleted_at');
    const sql = hasDeletedAt 
      ? `SELECT * FROM "${this.tableName}" WHERE id = ? AND (deleted_at IS NULL OR deleted_at = '')`
      : `SELECT * FROM "${this.tableName}" WHERE id = ?`;
    return this.db.prepare(sql).get(id) as T;
  }

  delete(id: string, note?: string): boolean {
    const tableInfo = this.db.prepare(`PRAGMA table_info("${this.tableName}")`).all() as any[];
    const hasDeletedAt = tableInfo.some(c => c.name === 'deleted_at');
    const hasDeletedBy = tableInfo.some(c => c.name === 'deleted_by');
    const hasAuditNote = tableInfo.some(c => c.name === 'islem_notu');

    if (!hasDeletedAt) return false;

    const personnelId = this.getActivePersonnelId();
    let sql = `UPDATE "${this.tableName}" SET deleted_at = datetime('now')`;
    const params: any[] = [];

    if (hasDeletedBy && personnelId) {
      sql += `, deleted_by = ?`;
      params.push(personnelId);
    }
    if (hasAuditNote && note) {
      sql += `, islem_notu = ?`;
      params.push(note);
    }
    sql += ` WHERE id = ?`;
    params.push(id);

    const result = this.db.prepare(sql).run(...params);
    return result.changes > 0;
  }

  restore(id: string): boolean {
    const tableInfo = this.db.prepare(`PRAGMA table_info("${this.tableName}")`).all() as any[];
    const hasDeletedAt = tableInfo.some(c => c.name === 'deleted_at');
    if (!hasDeletedAt) return false;

    const result = this.db.prepare(`UPDATE "${this.tableName}" SET deleted_at = NULL WHERE id = ?`).run(id);
    return result.changes > 0;
  }

  getDeleted(): T[] {
    const tableInfo = this.db.prepare(`PRAGMA table_info("${this.tableName}")`).all() as any[];
    const hasDeletedAt = tableInfo.some(c => c.name === 'deleted_at');
    if (!hasDeletedAt) return [];

    return this.db.prepare(`SELECT * FROM "${this.tableName}" WHERE deleted_at IS NOT NULL`).all() as T[];
  }

  hardDelete(id: string): boolean {
    const result = this.db.prepare(`DELETE FROM "${this.tableName}" WHERE id = ?`).run(id);
    return result.changes > 0;
  }

  save(data: any): any {
    const tableInfo = this.db.prepare(`PRAGMA table_info("${this.tableName}")`).all() as any[];
    const validColumns = tableInfo.map(c => c.name);
    
    // 🛡️ Audit Skip for Settings
    if (this.tableName === 'TANIM_Ayarlar') {
      const filteredData: any = {};
      Object.keys(data).forEach(key => {
        if (validColumns.includes(key)) filteredData[key] = data[key];
      });
      const columns = Object.keys(filteredData);
      if (columns.length === 0) return null;
      const placeholders = columns.map(() => '?').join(', ');
      const sql = `INSERT OR REPLACE INTO "${this.tableName}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${placeholders})`;
      return this.db.prepare(sql).run(...Object.values(filteredData));
    }

    const personnelId = this.getActivePersonnelId();
    const idKey = validColumns.find(c => c.toLowerCase() === 'id') || 'id';
    const recordId = data[idKey] || data.id || data.ID || data.Id;
    
    // 🛡️ Sarsılmaz Mevcut Kayıt Denetimi
    const existing = recordId ? this.db.prepare(`SELECT "${idKey}" FROM "${this.tableName}" WHERE "${idKey}" = ?`).get(recordId) : null;
    const now = new Date().toISOString();

    const auditData: any = { ...data };
    if (recordId) auditData[idKey] = recordId;

    if (!existing) {
      if (validColumns.includes('created_by')) auditData.created_by = personnelId;
      if (validColumns.includes('created_at')) auditData.created_at = now;
    }

    if (validColumns.includes('updated_by')) auditData.updated_by = personnelId;
    if (validColumns.includes('updated_at')) auditData.updated_at = now;

    const filteredData: any = {};
    Object.keys(auditData).forEach(key => {
      if (validColumns.includes(key)) {
        let val = auditData[key];
        // 🛡️ GÜVENLİK ZIRHI: SQLite tiplerini zorla (Normalize)
        if (typeof val === 'boolean') {
          val = val ? 1 : 0;
        } else if (val !== null && typeof val === 'object') {
           // Diziler veya iç içe objeler gelirse string'e çevir (Güvenlik ağı)
           val = JSON.stringify(val);
        } else if (val === undefined || (typeof val === 'string' && val.trim() === '')) {
           val = null;
        }
        filteredData[key] = val;
      }
    });

    const columns = Object.keys(filteredData);
    
    if (existing && recordId) {
       // 🛡️ GÜNCELLEME (UPDATE)
       const setClause = columns.filter(c => c !== idKey).map(c => `"${c}" = ?`).join(', ');
       const params = columns.filter(c => c !== idKey).map(c => filteredData[c]);
       params.push(recordId);
       const sql = `UPDATE "${this.tableName}" SET ${setClause} WHERE "${idKey}" = ?`;
       return this.db.prepare(sql).run(...params);
    } else {
       // 🛡️ YENİ KAYIT (INSERT)
       if (recordId && !columns.includes(idKey)) {
          filteredData[idKey] = recordId;
          columns.push(idKey);
       }
       const placeholders = columns.map(() => '?').join(', ');
       const sql = `INSERT INTO "${this.tableName}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${placeholders})`;
       return this.db.prepare(sql).run(...Object.values(filteredData));
    }
  }
}
