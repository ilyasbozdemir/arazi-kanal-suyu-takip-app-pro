/**
 * tables.ts: Veritabanındaki tablo isimlerini merkezi olarak yönetir.
 */
export const TABLES = {
  VATANDAS: "DATA_Vatandas",
  TAPU: "DATA_Tapu_Verisi",
  MEVKI: "DATA_Tasinmaz_Mevkileri",
  SU_Dagitim: "DATA_Su_Dagitim",
  TAHAKKUK: "MUHASEBE_Tahakkuk",
  TAHSILAT: "MUHASEBE_Tahsilat",
  LOGS: "logs"
} as const;

export type TableName = typeof TABLES[keyof typeof TABLES];

