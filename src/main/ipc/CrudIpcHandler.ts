import { ipcMain } from 'electron';
import { injectable, inject } from 'tsyringe';
import { CrudService } from '../services/CrudService';

/**
 * 🛡️ CRUD IPC HANDLER
 * Evrensel Service CRUD katmanını Electron IPC arayüzüne açar.
 */
@injectable()
export class CrudIpcHandler {
  constructor(@inject(CrudService) private crudService: CrudService) {}

  register() {
    ipcMain.handle('crud:find', async (_, table: string, options?: any) => {
      return await this.crudService.find(table, options);
    });

    ipcMain.handle('crud:findOne', async (_, table: string, id: string) => {
      return await this.crudService.findOne(table, id);
    });

    ipcMain.handle('crud:create', async (_, table: string, data: any) => {
      return await this.crudService.create(table, data);
    });

    ipcMain.handle('crud:update', async (_, table: string, id: string, data: any) => {
      return await this.crudService.update(table, id, data);
    });

    ipcMain.handle('crud:delete', async (_, table: string, id: string, note?: string) => {
      return await this.crudService.delete(table, id, note);
    });

    ipcMain.handle('crud:restore', async (_, table: string, id: string) => {
      return await this.crudService.restore(table, id);
    });

    ipcMain.handle('crud:hardDelete', async (_, table: string, id: string) => {
      return await this.crudService.hardDelete(table, id);
    });

    ipcMain.handle('crud:export', async (_, table: string, format?: 'json' | 'csv') => {
      return await this.crudService.exportData(table, format);
    });

    ipcMain.handle('crud:import', async (_, table: string, records: any[], options?: any) => {
      return await this.crudService.importData(table, records, options);
    });
  }
}
