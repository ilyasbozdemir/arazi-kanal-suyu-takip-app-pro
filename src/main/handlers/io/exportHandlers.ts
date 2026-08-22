import { ipcMain, dialog, app } from 'electron';
import { Logger } from '../../logger';
import * as fs from 'fs';
import * as path from 'path';
import { ExportService } from '../../services/ExportService';

const exportService = new ExportService();

export const setupExportHandlers = (db: any) => {
  // 🛡️ GELİŞMİŞ MAPPING TABANLI EXPORT (Sarsılmaz Raporlama)
  ipcMain.handle('export-advanced-excel', async (_, { data, type, filename, dynamicValues }) => {
    return await exportService.exportToExcel(data, type, filename, dynamicValues);
  });

  ipcMain.handle('export-excel', async (_, { table, data, fileName }) => {
    try {
      const ExcelJS = await import('exceljs');
      const workbook = new ExcelJS.default.Workbook();
      
      let worksheetName = table || 'Rapor';
      const worksheet = workbook.addWorksheet(worksheetName);

      if (data && data.length > 0) {
        const headers = Object.keys(data[0]);
        worksheet.columns = headers.map(h => ({ header: h, key: h, width: 25 }));
        worksheet.addRows(data);
        
        // Header Stilini Güzelleştir
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        worksheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0F172A' }
        };
      }

      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Excel Raporunu Kaydet',
        defaultPath: fileName || `${worksheetName}.xlsx`,
        filters: [{ name: 'Excel Dosyası', extensions: ['xlsx'] }]
      });

      if (canceled || !filePath) return { success: false };
      await workbook.xlsx.writeFile(filePath);
      return { success: true, filePath };
    } catch (e: any) {
      Logger.error('EXPORT_EXCEL_ERROR', e.message);
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('get-dirty-data-report', async () => {
    try {
      const report: any[] = [];
      
      // 1. 👤 VATANDAŞ DENETİMİ
      const vatandaslar = db.prepare('SELECT * FROM DATA_Vatandas WHERE (deleted_at IS NULL OR deleted_at = \'\')').all() as any[];
      const tcknMap: Record<string, number> = {};

      vatandaslar.forEach(v => {
        // TCKN Uzunluk Kontrolü
        if (!v.TCKN || v.TCKN.length !== 11) {
          report.push({ id: v.id, name: `${v.Ad} ${v.Soyad}`, table: 'DATA_Vatandas', reason: 'Eksik/Geçersiz TCKN', value: v.TCKN || 'BOŞ' });
        } else {
          // Mükerrer TCKN Kontrolü
          tcknMap[v.TCKN] = (tcknMap[v.TCKN] || 0) + 1;
        }

        // İsimde Noktalama İşareti/Özel Karakter Kontrolü (Arama sistemini bozar)
        const nameClean = (v.Ad + v.Soyad).replace(/\s/g, '');
        if (/[.,;:*?+=&%!@#]/.test(nameClean)) {
          report.push({ id: v.id, name: `${v.Ad} ${v.Soyad}`, table: 'DATA_Vatandas', reason: 'İsimde Geçersiz Karakter (.)', value: `${v.Ad} ${v.Soyad}` });
        }
      });

      // Mükerrer TCKN'leri rapora ekle
      Object.entries(tcknMap).forEach(([tckn, count]) => {
        if (count > 1) {
          const duplicates = vatandaslar.filter(v => v.TCKN === tckn);
          duplicates.forEach(d => {
            report.push({ id: d.id, name: `${d.Ad} ${d.Soyad}`, table: 'DATA_Vatandas', reason: 'Kritik: Mükerrer TCKN Kaydı', value: tckn });
          });
        }
      });

      // 2. 📜 TAPU & TAŞINMAZ DENETİMİ
      const tapular = db.prepare(`
        SELECT t.*, m.Mevki_Adi,
        (SELECT COUNT(*) FROM REL_TASINMAZ_VATANDAS s WHERE s.Tasinmaz_id = t.id AND (s.deleted_at IS NULL OR s.deleted_at = '')) as Sahip_Sayisi
        FROM DATA_Tapu_Verisi t
        LEFT JOIN DATA_Tasinmaz_Mevkileri m ON t.Mevki_id = m.id
        WHERE (t.deleted_at IS NULL OR t.deleted_at = '')
      `).all() as any[];

      tapular.forEach(t => {
        // Sahipsiz Tapu Kontrolü
        if (t.Sahip_Sayisi === 0) {
          report.push({ id: t.id, name: `${t.Ada}/${t.Parsel}`, table: 'DATA_Tapu_Verisi', reason: 'Kritik: Sahipsiz Taşınmaz', value: 'Malik Atanmamış' });
        }
        // Sıfır Alan Kontrolü
        if (!t.Alan_m2 || Number(t.Alan_m2) <= 0) {
          report.push({ id: t.id, name: `${t.Ada}/${t.Parsel}`, table: 'DATA_Tapu_Verisi', reason: 'Hatalı Alan (0 m²)', value: t.Alan_m2 || '0' });
        }
        // Mevki Atanmamış Kontrolü
        if (!t.Mevki_id) {
          report.push({ id: t.id, name: `${t.Ada}/${t.Parsel}`, table: 'DATA_Tapu_Verisi', reason: 'Mevki Atanmamış', value: 'BOŞ' });
        }
      });

      return { success: true, report };
    } catch (e: any) {
      console.error("[AUDIT_REPORT_ERROR]", e);
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('export-locations-json', async () => {
    try {
      const locations = db.prepare('SELECT * FROM TANIM_Konumlar').all() as any[];
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Konum Şablonu İndir',
        defaultPath: 'Bolge_Ve_Konum_Sablonu.json',
        filters: [{ name: 'JSON Dosyası', extensions: ['json'] }]
      });
      if (canceled || !filePath) return { success: false };
      fs.writeFileSync(filePath, JSON.stringify(locations, null, 2), 'utf-8');
      return { success: true, filePath };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });
};
