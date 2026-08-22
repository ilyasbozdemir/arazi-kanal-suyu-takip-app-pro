import ExcelJS from "exceljs";
import { MappingEngine } from "./MappingEngine";

export class ExcelHandler {
  async generateFromMapping(
    data: any[],
    mappingKey: string,
    mappingConfig: any,
    dynamicValues: Record<string, string> = {}
  ): Promise<ExcelJS.Workbook> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Rapor");
    const config = mappingConfig[mappingKey];

    if (!config) {
      throw new Error(`Mapping configuration for '${mappingKey}' not found.`);
    }

    // 🛡️ 1. Sayfa Yapısı (Page Setup)
    worksheet.pageSetup = {
      orientation: config.pageSetup.orientation,
      paperSize: config.pageSetup.paperSize,
      margins: config.pageSetup.margins,
      horizontalCentered: config.pageSetup.horizontalCentered,
      printTitlesRow: `1:${config.headerRowsCount}`,
    };

    // 🛡️ 2. Sütun Genişlikleri
    worksheet.columns = config.columnWidths.map((width: number) => ({ width }));

    // 🛡️ 3. Satır Yükseklikleri
    Object.entries(config.rowHeights).forEach(([row, height]) => {
      if (row !== "data") {
        const r = worksheet.getRow(parseInt(row));
        if (r) r.height = height as number;
      }
    });

    // 🛡️ 4. Hücre Birleştirmeleri (Merges)
    config.merges.forEach((range: string) => {
      worksheet.mergeCells(range);
    });

    // 🛡️ 5. Statik Hücreler ve Başlıklar (Engine)
    MappingEngine.injectStaticCells(worksheet, config, dynamicValues);

    // 🛡️ 6. Veri Satırları (Engine)
    MappingEngine.injectDataRows(worksheet, data, config);

    // 🛡️ 7. Görünümü Sabitleme (Freeze Panes)
    worksheet.views = [
      {
        state: "frozen",
        xSplit: 0,
        ySplit: config.headerRowsCount,
        activeCell: "A" + (config.headerRowsCount + 1),
      },
    ];

    return workbook;
  }
}
