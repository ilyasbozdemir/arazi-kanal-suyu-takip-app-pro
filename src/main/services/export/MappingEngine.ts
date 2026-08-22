import ExcelJS from "exceljs";
import { StyleManager } from "./StyleManager";

export class MappingEngine {
  static resolveValue(template: string, dynamicValues: Record<string, string>): string {
    let value = template;
    Object.entries(dynamicValues).forEach(([key, val]) => {
      value = value.replace(new RegExp(`{${key}}`, 'g'), val);
    });
    return value;
  }

  static injectStaticCells(worksheet: ExcelJS.Worksheet, config: any, dynamicValues: Record<string, string>) {
    if (!config.staticCells) return;

    config.staticCells.forEach((cell: any) => {
      const target = worksheet.getCell(cell.at);
      target.value = this.resolveValue(cell.v, dynamicValues);
      if (cell.style) {
        StyleManager.applyStyles(target, cell.style);
      }
    });
  }

  static injectDataRows(worksheet: ExcelJS.Worksheet, data: any[], config: any) {
    if (!config.dataRows) return;

    let currentRow = config.dataRows.startRow;
    data.forEach((item, index) => {
      const row = worksheet.getRow(currentRow);
      row.height = config.rowHeights.data || 20;

      Object.entries(config.dataRows.mapping).forEach(
        ([col, map]: [string, any]) => {
          const cell = row.getCell(col);

          if (map === "row_index") {
            cell.value = index + 1;
          } else if (typeof map === "string") {
            if (map === "EMPTY") {
              cell.value = "";
            } else {
              cell.value = item[map] ?? "";
            }
          } else if (typeof map === "object") {
            if (map.field) cell.value = item[map.field] ?? "";
            if (map.formula) {
              cell.value = {
                formula: map.formula.replace(/{row}/g, currentRow.toString()),
              };
            }
            if (map.style) StyleManager.applyStyles(cell, map.style);
          }
        }
      );

      StyleManager.applyBorderToRow(row);
      currentRow++;
    });
  }
}
