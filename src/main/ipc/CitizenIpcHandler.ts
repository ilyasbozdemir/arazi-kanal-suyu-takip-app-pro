import { ipcMain, dialog } from 'electron';
import { injectable, inject, container } from 'tsyringe';
import path from 'path';
import fs from 'fs';
import { dbPath } from '../db';
import { Mediator } from '@core/di/Mediator';
import { SaveVatandasCommandHandler } from '../application/features/vatandas/commands/SaveVatandasCommandHandler';
import type { SqliteUnitOfWork } from '../infrastructure/database/SqliteUnitOfWork';

/**
 * 🛡️ CITIZEN IPC HANDLER
 */
@injectable()
export class CitizenIpcHandler {
  constructor(
    @inject(Mediator) private mediator: Mediator,
    @inject('IUnitOfWork') private uow: SqliteUnitOfWork
  ) {}

  register() {
    // 🛡️ Mediator Registration
    this.mediator.register('citizen:save', container.resolve(SaveVatandasCommandHandler));

    // 🛡️ IPC Bridge
    ipcMain.handle('save-citizen', async (_, data: any) => {
      return await this.mediator.send('citizen:save', data);
    });

    // 🛡️ GET CITIZEN LANDS (Hibrit İlişki Motoru)
    ipcMain.handle('get-citizen-lands', async (_, identifier: string) => {
      try {
        // 🛡️ Hem Sahiplik hem Zilyetlik kayıtlarını birleştiriyoruz
        const lands = this.uow.db.prepare(`
          SELECT 
            t.*, 
            m.Mevki_Adi, 
            COALESCE(ts.Rol, 'ZİLYET') as Rol, 
            COALESCE(ts.Hisse_Pay, 0) as Hisse_Pay, 
            COALESCE(ts.Hisse_Payda, 0) as Hisse_Payda,
            'SAHİP' as Iliski_Tipi
          FROM REL_TASINMAZ_VATANDAS ts
          JOIN DATA_Tapu_Verisi t ON t.id = ts.Tasinmaz_id
          LEFT JOIN DATA_Tasinmaz_Mevkileri m ON m.id = t.Mevki_id
          LEFT JOIN DATA_Vatandas v ON ts.Vatandas_Id = v.id
          WHERE (ts.Vatandas_Id = ? OR v.TCKN = ? OR ts.Vatandas_Id = ?)
          AND (ts.deleted_at IS NULL OR ts.deleted_at = '')
          
          UNION ALL
          
          SELECT 
            t.*, 
            m.Mevki_Adi, 
            'ZİLYET/BAKICI' as Rol, 
            0 as Hisse_Pay, 
            0 as Hisse_Payda,
            'ZİLYET' as Iliski_Tipi
          FROM REL_TASINMAZ_ZILYET tz
          JOIN DATA_Tapu_Verisi t ON t.id = tz.Tasinmaz_id
          LEFT JOIN DATA_Tasinmaz_Mevkileri m ON m.id = t.Mevki_id
          LEFT JOIN DATA_Vatandas v ON tz.Vatandas_Id = v.id
          WHERE (tz.Vatandas_Id = ? OR v.TCKN = ? OR tz.Vatandas_Id = ?)
          AND (tz.deleted_at IS NULL OR tz.deleted_at = '')
        `).all(identifier, identifier, identifier, identifier, identifier, identifier);
        
        return { success: true, data: lands };
      } catch (e: any) {
        console.error("[GET_CITIZEN_LANDS_ERR]", e);
        return { success: false, error: e.message };
      }
    });

    // 🛡️ CITIZEN PROFILE IMAGE
    ipcMain.handle('pick-citizen-profile-picture', async (_, id: string) => {
      try {
        const { canceled, filePaths } = await dialog.showOpenDialog({
          title: 'Mükellef Fotoğrafı Seçin',
          filters: [{ name: 'Resimler', extensions: ['jpg', 'png', 'jpeg', 'webp'] }],
          properties: ['openFile']
        });

        if (canceled || filePaths.length === 0) return { success: false };

        const profilesDir = path.join(path.dirname(dbPath), 'pps');
        if (!fs.existsSync(profilesDir)) fs.mkdirSync(profilesDir, { recursive: true });

        const sourcePath = filePaths[0];
        const extension = path.extname(sourcePath);
        // 🛡️ Benzersiz isim için timestamp ekle (Cache ve re-render sorunu için kritik)
        const fileName = `${id || 'temp'}_${Date.now()}${extension}`;
        const targetPath = path.join(profilesDir, fileName);

        fs.copyFileSync(sourcePath, targetPath);
        return { success: true, path: path.join('pps', fileName) };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    });
  }
}
