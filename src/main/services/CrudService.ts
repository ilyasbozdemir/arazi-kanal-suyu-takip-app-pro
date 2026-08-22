import { injectable, inject } from 'tsyringe';
import { SqliteUnitOfWork } from '../infrastructure/database/SqliteUnitOfWork';
import { ActivityLogger } from './ActivityLogger';
import { invalidateTableCache } from '../handlers/core/server';
import crypto from 'crypto';

@injectable()
export class CrudService {
  constructor(
    @inject('IUnitOfWork') private uow: SqliteUnitOfWork,
    @inject(ActivityLogger) private activityLogger: ActivityLogger
  ) {}

  private getTableColumns(table: string): string[] {
    try {
      const info = this.uow.db.prepare(`PRAGMA table_info("${table}")`).all() as any[];
      return info.map(c => c.name);
    } catch (e) {
      return [];
    }
  }

  public async find(table: string, options: {
    search?: string;
    filters?: Record<string, any>;
    page?: number;
    pageSize?: number;
    orderBy?: string;
    orderDir?: 'ASC' | 'DESC';
  } = {}) {
    try {
      const columns = this.getTableColumns(table);
      if (columns.length === 0) {
        throw new Error(`Tablo bulunamadı veya sütun bilgisi okunamadı: ${table}`);
      }

      const hasDeletedAt = columns.includes('deleted_at');
      let baseSql = `FROM "${table}" WHERE 1=1`;
      const params: any[] = [];

      if (hasDeletedAt) {
        baseSql += ` AND (deleted_at IS NULL OR deleted_at = '')`;
      }

      // 🔍 FİLTRELEME (Filtre Objeleri)
      if (options.filters && typeof options.filters === 'object') {
        for (const [key, val] of Object.entries(options.filters)) {
          if (columns.includes(key)) {
            if (val !== null && val !== undefined && val !== '') {
              if (typeof val === 'string' && val.includes('%')) {
                baseSql += ` AND "${key}" LIKE ?`;
                params.push(val);
              } else {
                baseSql += ` AND "${key}" = ?`;
                params.push(val);
              }
            }
          }
        }
      }

      // 🔍 ARAMA (Tüm metin sütunlarında LIKE araması)
      if (options.search && options.search.trim() !== '') {
        const searchVal = `%${options.search.trim()}%`;
        const textCols = columns.filter(c => !['id', 'created_at', 'updated_at', 'deleted_at'].includes(c.toLowerCase()));
        if (textCols.length > 0) {
          const searchClauses = textCols.map(c => `"${c}" LIKE ?`).join(' OR ');
          baseSql += ` AND (${searchClauses})`;
          for (let i = 0; i < textCols.length; i++) {
            params.push(searchVal);
          }
        }
      }

      // 📊 TOPLAM KAYIT SAYISI (Pagination için)
      const countSql = `SELECT COUNT(*) as count ${baseSql}`;
      const countRes = this.uow.db.prepare(countSql).get(...params) as { count: number };
      const totalCount = countRes?.count || 0;

      // 📶 SIRALAMA (ORDER BY)
      let orderClause = '';
      if (options.orderBy && columns.includes(options.orderBy)) {
        const dir = options.orderDir === 'DESC' ? 'DESC' : 'ASC';
        orderClause = ` ORDER BY "${options.orderBy}" ${dir}`;
      } else if (columns.includes('created_at')) {
        orderClause = ` ORDER BY created_at DESC`;
      } else if (columns.includes('id')) {
        orderClause = ` ORDER BY id DESC`;
      }

      // 📄 SAYFALAMA (LIMIT & OFFSET)
      const page = options.page && options.page > 0 ? options.page : 1;
      const pageSize = options.pageSize && options.pageSize > 0 ? options.pageSize : 50;
      const offset = (page - 1) * pageSize;
      const limitClause = ` LIMIT ? OFFSET ?`;
      
      const queryParams = [...params, pageSize, offset];
      const dataSql = `SELECT * ${baseSql} ${orderClause} ${limitClause}`;

      const data = this.uow.db.prepare(dataSql).all(...queryParams);
      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        success: true,
        data,
        pagination: {
          totalCount,
          page,
          pageSize,
          totalPages
        }
      };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  public async findOne(table: string, id: string) {
    try {
      const data = this.uow.getRepository(table).getById(id);
      if (!data) return { success: false, error: 'Kayıt bulunamadı.' };
      return { success: true, data };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  public async create(table: string, data: any) {
    try {
      return this.uow.executeTransaction((tx) => {
        const id = data.id || crypto.randomUUID();
        const payload = { ...data, id };
        
        tx.getRepository(table).save(payload);
        this.activityLogger.log(tx, table, id, 'CREATE', null, payload);
        invalidateTableCache(table);

        return { success: true, id, data: payload };
      });
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  public async update(table: string, id: string, data: any) {
    try {
      return this.uow.executeTransaction((tx) => {
        const prevState = tx.getRepository(table).getById(id);
        if (!prevState) throw new Error('Güncellenecek kayıt bulunamadı.');

        const payload = { ...data, id };
        tx.getRepository(table).save(payload);
        this.activityLogger.log(tx, table, id, 'UPDATE', prevState, payload);
        invalidateTableCache(table);

        return { success: true, id, data: payload };
      });
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  public async delete(table: string, id: string, note?: string) {
    try {
      return this.uow.executeTransaction((tx) => {
        const prevState = tx.getRepository(table).getById(id);
        if (!prevState) throw new Error('Silinecek kayıt bulunamadı.');

        const success = tx.getRepository(table).delete(id, note);
        if (success) {
          this.activityLogger.log(tx, table, id, 'DELETE', prevState, { deleted: true, note });
          invalidateTableCache(table);
        }

        return { success };
      });
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  public async restore(table: string, id: string) {
    try {
      return this.uow.executeTransaction((tx) => {
        const success = tx.getRepository(table).restore(id);
        if (success) {
          const nextState = tx.getRepository(table).getById(id);
          this.activityLogger.log(tx, table, id, 'RESTORE', { deleted: true }, nextState);
          invalidateTableCache(table);
        }

        return { success };
      });
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  public async hardDelete(table: string, id: string) {
    try {
      return this.uow.executeTransaction((tx) => {
        const success = tx.getRepository(table).hardDelete(id);
        if (success) {
          invalidateTableCache(table);
        }
        return { success };
      });
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  public async exportData(table: string, format: 'json' | 'csv' = 'json') {
    try {
      const records = this.uow.getRepository(table).getAll();
      if (format === 'csv') {
        if (records.length === 0) return { success: true, data: '', format: 'csv' };
        const headers = Object.keys(records[0]).join(',');
        const rows = records.map(record => 
          Object.values(record).map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(',')
        ).join('\n');
        return { success: true, data: `${headers}\n${rows}`, format: 'csv' };
      }
      return { success: true, data: records, format: 'json' };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  public async importData(table: string, records: any[], options: { overwrite?: boolean } = {}) {
    try {
      if (!Array.isArray(records)) throw new Error('İçe aktarılacak veriler dizi (array) formatında olmalıdır.');

      return this.uow.executeTransaction((tx) => {
        let importedCount = 0;
        for (const record of records) {
          if (!record) continue;
          const id = record.id || crypto.randomUUID();
          tx.getRepository(table).save({ ...record, id });
          importedCount++;
        }
        invalidateTableCache(table);

        return { success: true, importedCount };
      });
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
}
