import ExcelJS from "exceljs";

export class StyleManager {
  static applyStyles(cell: ExcelJS.Cell, style: any) {
    if (!style) return;

    // 🛡️ Font Ayarları
    cell.font = {
      bold: style.bold || false,
      size: style.size || 11,
      color: style.color ? { argb: style.color } : undefined,
      name: style.fontName || 'Calibri',
      italic: style.italic || false
    };

    // 🛡️ Hizalama
    cell.alignment = {
      horizontal: (style.align as any) || "left",
      vertical: "middle",
      wrapText: style.wrapText || false,
      textRotation: style.textRotation || 0
    };

    // 🛡️ Kenarlıklar (Default: İnce)
    if (style.border !== false) {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    }

    // 🛡️ Dolgu Rengi (Background)
    if (style.bg) {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: style.bg }
      };
    }
  }

  static applyBorderToRow(row: ExcelJS.Row) {
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  }
}
