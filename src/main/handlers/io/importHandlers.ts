import { ipcMain, dialog, app } from 'electron';
import { Logger } from '../../logger';
import { getDb } from '../../db';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

// 🛡️ SARSILMAZ MAPPING: JSON tabanlı gelişmiş eşleştirme motoru
const getExcelMapping = () => {
  try {
    const appPath = app.getAppPath();
    const mappingPath = path.join(appPath, 'resources', 'excel', 'excel_advanced_mapping.json');
    if (fs.existsSync(mappingPath)) {
      return JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
    }
  } catch (e) {
    console.error('[MAPPING_READ_ERROR]', e);
  }
  return null;
};

export const setupImportHandlers = () => {
  // 📁 EXCEL/CSV DOSYASI SEÇME
  ipcMain.handle('openExcelDialog', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Veri Dosyasını Seçin',
      filters: [
        { name: 'Excel & CSV Dosyaları', extensions: ['xlsx', 'xls', 'csv'] },
        { name: 'Tüm Dosyalar', extensions: ['*'] }
      ],
      properties: ['openFile']
    });
    if (canceled || filePaths.length === 0) return null;
    return filePaths[0];
  });

  // 📥 ŞABLON İNDİRME (Advanced Mapping Uyumlu)
  ipcMain.handle('downloadExcelTemplate', async () => {
    try {
      const mapping = getExcelMapping();
      if (!mapping) throw new Error('Excel eşleştirme dosyası bulunamadı.');

      const ExcelJS = await import('exceljs');
      const workbook = new ExcelJS.default.Workbook();
      const worksheet = workbook.addWorksheet(mapping.sheetName || 'Aktarim');

      const columns = Object.entries(mapping.mappingLabels).map(([cell, label]) => ({
        header: label as string,
        key: mapping.mappingCells[cell],
        width: 20
      }));
      
      worksheet.columns = columns;

      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0F172A' }
      };

      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Vatandaş Aktarım Şablonunu Kaydet',
        defaultPath: 'G_Kurum_Vatandas_Aktarim_Sablonu.xlsx',
        filters: [{ name: 'Excel Dosyası', extensions: ['xlsx'] }]
      });

      if (canceled || !filePath) return { success: false };
      await workbook.xlsx.writeFile(filePath);
      return { success: true, filePath };
    } catch (e: any) {
      Logger.error('DOWNLOAD_TEMPLATE_ERROR', e.message);
      return { success: false, error: e.message };
    }
  });

  // 🚀 GELİŞMİŞ AKTARIM MOTORU (.XLSX, .XLS, .CSV DESTEKLİ)
  ipcMain.handle('importExcelWithJson', async (_, filePath: string, responsibleId: string) => {
    try {
      if (!fs.existsSync(filePath)) throw new Error('Seçilen dosya sistemde bulunamadı.');

      const stats = fs.statSync(filePath);
      if (stats.size === 0) throw new Error('Seçilen dosya boş (0 bayt) görünüyor.');

      const ext = path.extname(filePath).toLowerCase();
      if (!['.xlsx', '.xls', '.csv'].includes(ext)) {
        throw new Error('Sistem sadece .xlsx, .xls ve .csv dosyalarını destekler.');
      }
      
      const mapping = getExcelMapping();
      if (!mapping) throw new Error('Excel eşleştirme dosyası bulunamadı.');

      // 🛡️ SHEETJS (XLSX) İLE HER FORMATI OKU
      const XLSX = await import('xlsx');
      // ESM/CJS Uyumluluğu için sarsılmaz kontrol
      const xLib = (XLSX as any).readFile ? XLSX : (XLSX as any).default;
      
      const workbook = xLib.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      if (!worksheet) throw new Error('Dosya içeriği okunamadı (Sayfa bulunamadı).');

      // Veriyi JSON formatına çevir (A-B-C kolon isimleriyle)
      const rawData: any[] = xLib.utils.sheet_to_json(worksheet, { header: 'A', defval: null });

      const db = getDb();
      
      let validResponsibleId: string | null = null;
      
      // 🛡️ PERSONEL DOĞRULAMA (Sarsılmaz Denetim)
      if (responsibleId) {
        const person = db.prepare('SELECT id FROM TANIM_Personel WHERE id = ? OR Vatandas_Id = ?').get(responsibleId, responsibleId) as any;
        if (person) {
          validResponsibleId = person.id;
        }
      }

      // Fallback: Eğer sorumlu bulunamadıysa ilk aktif personeli al
      if (!validResponsibleId) {
        const fallbackPerson = db.prepare('SELECT id FROM TANIM_Personel WHERE Aktif = 1 LIMIT 1').get() as any;
        validResponsibleId = fallbackPerson ? fallbackPerson.id : null;
      }

      const records: any[] = [];
      const importErrors: any[] = [];
      const cellMap = mapping.mappingCells;
      const skipRows = mapping.options.skipHeaderRows || 1;
      
      rawData.forEach((row: any, index: number) => {
        if (index < skipRows) return;

        // 🛡️ MÜKERRER KAYIT VE İLİŞKİ KORUMA (Sarsılmaz Nizam)
        let existingId = null;
        
        // cellMap içinden 'TCKN' değerine sahip olan kolon anahtarını (A, B, C...) bul
        const tcknKey = Object.keys(cellMap).find(key => cellMap[key] === 'TCKN');
        const tckn = tcknKey ? row[tcknKey] : null;
        
        if (tckn) {
          const existing = db.prepare('SELECT id FROM DATA_Vatandas WHERE TCKN = ?').get(tckn) as any;
          if (existing) existingId = existing.id;
        }

        const record: any = {
          id: existingId || crypto.randomUUID(),
          Excel_Aktarimi: 1,
          created_by: validResponsibleId,
          updated_by: validResponsibleId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        Object.entries(cellMap).forEach(([col, dbField]) => {
          let val = row[col];
          if (mapping.options.trimData && typeof val === 'string') val = val.trim();
          record[dbField as string] = val === undefined ? null : val;
        });

        if (!record.Ad || record.Ad === '') {
          importErrors.push({ row: index + 1, error: 'Ad Sütunu Boş (Zorunlu Alan)', data: record.TCKN || 'Bilinmeyen' });
          return;
        }

        records.push(record);
      });

      if (records.length === 0 && importErrors.length === 0) {
        return { success: false, error: 'Dosyada işlenecek veri bulunamadı.' };
      }

      let count = 0;
      const fields = Object.values(cellMap);
      const allFields = ['id', ...fields, 'Excel_Aktarimi', 'created_by', 'updated_by', 'created_at', 'updated_at'];
      const placeholders = allFields.map(f => `@${f}`).join(', ');
      const sql = `INSERT OR REPLACE INTO DATA_Vatandas (${allFields.join(', ')}) VALUES (${placeholders})`;

      const insert = db.prepare(sql);

      db.transaction(() => {
        for (const r of records) {
          try {
            insert.run(r);
            count++;
          } catch (err: any) {
            importErrors.push({ 
              row: 'VERİTABANI', 
              error: `Sistem Hatası: ${err.message}`, 
              data: `${r.Ad} ${r.Soyad}` 
            });
          }
        }
      })();

      Logger.info('IMPORT_COMPLETE', `${count} başarılı, ${importErrors.length} hatalı kayıt.`);
      
      return { 
        success: true, 
        count, 
        errorCount: importErrors.length,
        errors: importErrors 
      };
    } catch (e: any) {
      Logger.error('IMPORT_ERROR', e.message);
      return { success: false, error: 'Hata: ' + e.message };
    }
  });
};
