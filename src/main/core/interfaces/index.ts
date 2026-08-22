export interface IRepository<T> {
  getAll(): T[];
  getById(id: string): T | undefined;
  delete(id: string, note?: string): boolean;
  hardDelete(id: string): boolean;
  restore(id: string): boolean;
  getDeleted(): T[];
  save(data: any): any;
}
export interface IVatandasRepository extends IRepository<any> {
  checkDuplicate(field: string, value: string, excludeId?: string): boolean;
  getByTckn(tckn: string): any;
  getBySicil(sicil: string): any;
}
export interface ITapuRepository extends IRepository<any> {
  getDetailed(id: string): any;
  saveWithRelations(data: any): void;
}
export interface IUnitOfWork {
  vatandas: IVatandasRepository;
  tapu: ITapuRepository;
  getRepository(tableName: string): IRepository<any>;
  executeTransaction<T>(fn: (uow: IUnitOfWork) => T): T;
  executeRaw(sql: string, params?: any[]): any;
}
