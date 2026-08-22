import { Database } from 'better-sqlite3';

export function runFailsafe(_db: Database) {
  // 🛡️ SİSTEM KRİTİK TABLO MUHAFIZI (Failsafe)
  try {
    _db.exec(`
      CREATE TABLE IF NOT EXISTS "MUHASEBE_Z_Raporu" (
        "id" TEXT PRIMARY KEY,
        "Rapor_No" TEXT UNIQUE,
        "Tarih" TEXT,
        "Kasa_id" TEXT,
        "Veznedar_id" TEXT,
        "Sistem_Nakit" REAL,
        "Sistem_Pos" REAL,
        "Fiziki_Nakit" REAL,
        "Fiziki_Pos" REAL,
        "Fark_Nakit" REAL,
        "Fark_Pos" REAL,
        "Toplam_Ciro" REAL,
        "Durum" TEXT DEFAULT 'KAPANDI',
        "Aciklama" TEXT,
        "created_at" TEXT,
        "updated_at" TEXT,
        "created_by" TEXT,
        "updated_by" TEXT,
        "deleted_at" TEXT,
        "deleted_by" TEXT
      );
    `);
    _db.exec(`
      CREATE TABLE IF NOT EXISTS "TANIM_Konumlar" (
        "id" TEXT PRIMARY KEY,
        "Parent_id" TEXT,
        "Tip" TEXT,
        "Ad" TEXT,
        "Kod" TEXT
      );
    `);
    console.log("[DB] Genesis: Kritik tablolar sarsılmaz bir nizamla doğrulandı.");
  } catch (e: any) {
    console.error("[DB] Genesis Tablo Hatası:", e.message);
  }
}
