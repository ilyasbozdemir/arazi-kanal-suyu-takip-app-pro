import { injectable, inject } from 'tsyringe';
import type { IUnitOfWork } from '@core/interfaces';
import crypto from 'crypto';
import { SaveVatandasCommand } from '../VatandasModels';

@injectable()
export class SaveVatandasCommandHandler {
  constructor(
    @inject('IUnitOfWork') private uow: IUnitOfWork
  ) {}

  async handle(data: SaveVatandasCommand): Promise<{ success: boolean; id: string; result?: any }> {
    return this.uow.executeTransaction((uow) => {
      const id = data.id || crypto.randomUUID();
      const citizenWithId = { ...data, id };
      const result = uow.vatandas.save(citizenWithId);
      return { success: !!result, id, result };
    });
  }
}
