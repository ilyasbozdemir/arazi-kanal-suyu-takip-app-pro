import { ElectronService } from "../ElectronService";

export abstract class BaseRepository<TEntity, TDto> {
  constructor(protected tableName: string) {}

  abstract toDto(entity: TEntity): TDto;
  abstract toEntity(dto: TDto): TEntity;

  async getAll(filter?: any): Promise<TEntity[]> {
    const res = await ElectronService.getRecords(this.tableName, filter);
    if (!res || !res.success) return [];
    
    const dtos = res.data || [];
    return dtos.map((dto: TDto) => this.toEntity(dto));
  }

  async getById(id: string): Promise<TEntity | null> {
    const res = await ElectronService.getRecords(this.tableName, { id });
    if (!res || !res.success) return null;
    
    const dtos = res.data || [];
    return dtos.length > 0 ? this.toEntity(dtos[0]) : null;
  }

  async save(entity: TEntity): Promise<any> {
    const dto = this.toDto(entity);
    return await ElectronService.saveRecord(this.tableName, dto);
  }

  async update(id: string, entity: Partial<TEntity>): Promise<any> {
    const dto = this.toDto(entity as TEntity);
    return await ElectronService.updateRecord(this.tableName, id, dto);
  }

  async delete(id: string): Promise<any> {
    return await ElectronService.deleteRecord(this.tableName, id);
  }
}

