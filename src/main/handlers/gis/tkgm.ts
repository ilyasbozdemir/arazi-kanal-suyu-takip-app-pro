import { ipcMain } from 'electron'
import { Logger } from '../../logger'
import { getDb } from '../../db'
import path from 'path'
import fs from 'fs'
import { TkgmService } from '../../application/services/TkgmService'

/* 
  TKGM & MEGSIS API HANDLERS (Arazi Suyu Takip Sistemi ENTEGRASYON)
  Bu modül artık TkgmService üzerinden sarsılmaz bir nizamla çalışmaktadır.
*/

export const setupTkgmHandlers = () => {
  const tkgmService = new TkgmService(getDb());

  // 1. İlçe Listesi Sorgulama
  ipcMain.handle('tkgm-get-districts', async (_, ilId: number) => {
    try {
      const data = await tkgmService.getDistricts(ilId);
      return { success: true, data };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

  // 2. Mahalle / Köy Listesi Sorgulama
  ipcMain.handle('tkgm-get-neighborhoods', async (_, ilceId: number) => {
    try {
      const data = await tkgmService.getNeighborhoods(ilceId);
      return { success: true, data };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

  // 3. Parsel Detay ve Geometri Sorgulama
  ipcMain.handle('tkgm-get-parcel', async (_, { mahalleId, ada, parsel }: { mahalleId: number, ada: string, parsel: string }) => {
    try {
      const data = await tkgmService.getParcel(mahalleId, ada, parsel);
      return { success: true, data };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

  // 4. Koordinatla Parsel Sorgulama (Identify)
  ipcMain.handle('tkgm-identify-parcel', async (_, { lat, lng }: { lat: number, lng: number }) => {
    try {
      const data = await tkgmService.identifyParcel(lat, lng);
      return { success: true, data };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

  // 5. Belge İndirme URL'sini Aç (Proxy/Referer Gerekebilir ama Browser Linki de Çalışır)
  ipcMain.handle('tkgm-open-download', async (_, { mahalleId, ada, parsel, tapuId, format = 'pdf' }: any) => {
    try {
      const { shell } = require('electron');
      const url = await tkgmService.getDownloadUrl(mahalleId, ada, parsel, format, tapuId);
      Logger.info('TKGM_DOWNLOAD', `İndirme URL'si açılıyor: ${url}`);
      await shell.openExternal(url);
      return { success: true };
    } catch (e: any) {
      Logger.error('TKGM_DOWNLOAD_ERROR', e.message);
      return { success: false, error: e.message };
    }
  });

  // 🛡️ 6. PDF / Belge İndirme (Dahili Kayıt)
  ipcMain.handle('tkgm-download-pdf', async (_, { mahalleId, ada, parsel, tapuId }: any) => {
    try {
      const filePath = await tkgmService.downloadParcelPdf(mahalleId, ada, parsel, tapuId);
      return { success: true, filePath }; 
    } catch (e: any) {
      Logger.error('TKGM_DOWNLOAD_ERROR', e.message);
      return { success: false, error: e.message };
    }
  });

  // 🛡️ 7. Mahalle ID Çözücü
  ipcMain.handle('tkgm-resolve-mahalle-id', async (_, tapuId: string) => {
    try {
      const mahalleId = tkgmService.resolveMahalleTechnicalId(tapuId);
      return { success: true, mahalleId };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

  // 7. Sınır / Sorumluluk Alanı GeoJSON Okuyucu
  ipcMain.handle('tkgm-get-boundary-geojson', async (_, pathArg: string) => {
    try {
      const fullPath = path.isAbsolute(pathArg) ? pathArg : path.join(process.cwd(), pathArg);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        return { success: true, data: JSON.parse(content) };
      }
      return { success: false, error: 'Dosya bulunamadı: ' + fullPath };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });
}
