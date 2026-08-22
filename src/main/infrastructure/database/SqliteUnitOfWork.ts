import { Database } from 'better-sqlite3';
import { IUnitOfWork, IVatandasRepository, ITapuRepository, IRepository } from '@core/interfaces';
import { SqliteVatandasRepository } from './SqliteVatandasRepository';
import { SqliteTapuRepository } from './SqliteTapuRepository';
import { SqliteBaseRepository } from './SqliteBaseRepository';

export class SqliteUnitOfWork implements IUnitOfWork {
  public vatandas: IVatandasRepository;
  public tapu: ITapuRepository;
  private repositories: Record<string, IRepository<any>> = {};
  constructor(public db: Database) {
    this.vatandas = new SqliteVatandasRepository(db);
    this.tapu = new SqliteTapuRepository(db);
  }
  getRepository(tableName: string): IRepository<any> {
    if (tableName === 'DATA_Vatandas') return this.vatandas;
    if (tableName === 'DATA_Tapu_Verisi') return this.tapu;
    if (!this.repositories[tableName]) this.repositories[tableName] = new SqliteBaseRepository<any>(this.db, tableName);
    return this.repositories[tableName];
  }
  executeTransaction<T>(fn: (uow: IUnitOfWork) => T): T {
    let res: T;
    this.db.transaction(() => { res = fn(this); })();
    return res!;
  }
  executeRaw(sql: string, params: any[] = []): any {
    return this.db.prepare(sql).run(...params);
  }
}
