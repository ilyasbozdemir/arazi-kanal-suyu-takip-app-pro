import { dialog, shell } from 'electron';
import fs from 'fs';
import path from 'path';
import { ExcelHandler } from './export/ExcelHandler';
import mappingConfig from '../config/export_mapping.json';

export class ExportService {
  private excelHandler: ExcelHandler;

  constructor() {
    this.excelHandler = new ExcelHandler();
  }

  async exportToExcel(
    data: any[],
    type: 'yayla' | 'mahalle',
    filename: string,
    dynamicValues: Record<string, string> = {}
  ): Promise<{ success: boolean; path?: string; error?: string }> {
    try {
      const { filePath } = await dialog.showSaveDialog({
        title: 'Excel Raporunu Kaydet',
        defaultPath: path.join(process.cwd(), `${filename}.xlsx`),
        filters: [{ name: 'Excel Files', extensions: ['xlsx'] }]
      });

      if (!filePath) return { success: false, error: 'İşlem iptal edildi.' };

      const workbook = await this.excelHandler.generateFromMapping(
        data,
        type,
        mappingConfig,
        dynamicValues
      );

      const buffer = await workbook.xlsx.writeBuffer();
      fs.writeFileSync(filePath, Buffer.from(buffer));

      // 🛡️ Sarsılmaz Otomatik Açılış: Kayıt sonrası kullanıcıyı yorma, dosyayı aç
      shell.openPath(filePath);

      return { success: true, path: filePath };
    } catch (err: any) {
      console.error('[EXPORT_SERVICE_ERROR]', err);
      return { success: false, error: err.message };
    }
  }
}
