import { ipcMain } from 'electron';
import { injectable, container, inject } from 'tsyringe';
import { Mediator } from '@core/di/Mediator';
import { SaveTapuCommandHandler } from '../application/features/tapu/commands/SaveTapuCommandHandler';
import { GetTapuDetailQueryHandler } from '../application/features/tapu/queries/GetTapuDetailQueryHandler';
import { SaveTasinmazCommandHandler } from '../application/features/tapu/commands/SaveTasinmazCommandHandler';
import { SqliteTapuRepository } from '../infrastructure/database/SqliteTapuRepository';

@injectable()
export class TapuIpcHandler {
  constructor(@inject(Mediator) private mediator: Mediator) {}

  register() {
    // 🛡️ Register Handlers into Mediator
    this.mediator.register('tapu:save', container.resolve(SaveTapuCommandHandler));
    this.mediator.register('tapu:getDetails', container.resolve(GetTapuDetailQueryHandler));
    this.mediator.register('tapu:saveFull', container.resolve(SaveTasinmazCommandHandler));

    // 🛡️ IPC Bridge
    ipcMain.handle('get-tapu-details', async (_, id: string) => {
      return await this.mediator.send('tapu:getDetails', id);
    });

    ipcMain.handle('get-tapu-owners', async (_, id: string) => {
      const uow = container.resolve<any>('IUnitOfWork');
      const detail = uow.tapu.getDetailed(id);
      return { success: true, data: detail?.owners || [] };
    });

    ipcMain.handle('get-tapu-zilyetler', async (_, id: string) => {
      const uow = container.resolve<any>('IUnitOfWork');
      const detail = uow.tapu.getDetailed(id);
      return { success: true, data: detail?.zilyetler || [] };
    });

    ipcMain.handle('tasinmaz:save', async (_, command: any) => {
       return await this.mediator.send('tapu:saveFull', command);
    });

    ipcMain.handle('save-tapu', async (_, data: any) => {
       // Note: we can keep 'save-record' for generic, or use specialized IPC channels
       return await this.mediator.send('tapu:save', data);
    });
  }
}
