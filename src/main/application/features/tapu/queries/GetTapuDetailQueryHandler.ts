import { injectable, inject } from 'tsyringe';
import type { IUnitOfWork } from '@core/interfaces';

@injectable()
export class GetTapuDetailQueryHandler {
  constructor(
    @inject('IUnitOfWork') private uow: IUnitOfWork
  ) {}

  async handle(id: string): Promise<{ success: boolean; data?: any; error?: string }> {
    const detailed = this.uow.tapu.getDetailed(id);
    if (!detailed) return { success: false, error: 'Taşınmaz kaydı bulunamadı.' };
    return { success: true, data: detailed };
  }
}
