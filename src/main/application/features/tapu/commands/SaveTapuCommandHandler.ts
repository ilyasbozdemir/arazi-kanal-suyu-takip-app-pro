import { injectable, inject } from 'tsyringe';
import type { IUnitOfWork } from '@core/interfaces';
import crypto from 'crypto';
import { Logger } from '../../../../logger';

/**
 * 🛡️ SAVE TAPU COMMAND HANDLER (DI & Mediator ready)
 */
@injectable()
export class SaveTapuCommandHandler {
  constructor(
    @inject('IUnitOfWork') private uow: IUnitOfWork
  ) {}

  async handle(data: any): Promise<{ success: boolean; id: string }> {
    Logger.info('SaveTapuCommandHandler', `İşlem başlatıldı. Veri: ${JSON.stringify(data.tapuData || data)}`);
    
    try {
      return this.uow.executeTransaction((uow) => {
        // 🛡️ AKILLI PAKET ÇÖZÜCÜ (Unpack nested tapuData)
        const mainData = data.tapuData || data;
        const id = mainData.id || mainData.ID || mainData.Id || crypto.randomUUID();
        Logger.info('SaveTapuCommandHandler', `Tapu ID: ${id}`);
        
        const tapuWithId = { ...mainData, id };
        const owners = data.owners || [];
        const zilyetler = data.zilyetler || (data.zilyet ? [data.zilyet] : []);

        // 🛡️ İlişkileri de pakete dahil et (Eğer yoksa)
        const fullPackage = {
           ...tapuWithId,
           owners: owners,
           zilyetler: zilyetler
        };

        Logger.info('SaveTapuCommandHandler', `İlişkili kayıt (saveWithRelations) başlatılıyor`);
        uow.tapu.saveWithRelations(fullPackage);
        
        Logger.info('SaveTapuCommandHandler', `İşlem başarıyla tamamlandı. ID: ${id}`);
        return { success: true, id };
      });
    } catch (error: any) {
      Logger.error('SaveTapuCommandHandler', `İşlem sırasında HATA: ${error.message}`);
      throw error;
    }
  }
}
