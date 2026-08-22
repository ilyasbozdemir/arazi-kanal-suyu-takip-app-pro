import { Database } from 'better-sqlite3';
import * as crypto from 'node:crypto';
import { SYSTEM_CONFIG } from '../../config/systemConfig';

export function runPersonnelAndKasaSeeds(_db: Database) {
  // 🛡️ KURUMSAL KASA NİZAMI VE ŞEMA ONARIMI
  try {
    const tableInfo = _db.prepare("PRAGMA table_info(TANIM_Kasalar)").all() as any[];
    const hasDurum = tableInfo.some(c => c.name === 'Durum');
    const hasAciklama = tableInfo.some(c => c.name === 'Aciklama');
    const hasSistemVerisi = tableInfo.some(c => c.name === 'Sistem_Verisi');
    const hasHesapKodu = tableInfo.some(c => c.name === 'Hesap_Kodu');

    if (!hasDurum) _db.prepare("ALTER TABLE TANIM_Kasalar ADD COLUMN Durum TEXT DEFAULT 'AKTİF'").run();
    if (!hasAciklama) _db.prepare("ALTER TABLE TANIM_Kasalar ADD COLUMN Aciklama TEXT").run();
    if (!hasSistemVerisi) _db.prepare("ALTER TABLE TANIM_Kasalar ADD COLUMN Sistem_Verisi INTEGER DEFAULT 0").run();
    if (!hasHesapKodu) _db.prepare("ALTER TABLE TANIM_Kasalar ADD COLUMN Hesap_Kodu TEXT").run();

    const OPERATOR_TCKN = SYSTEM_CONFIG.OPERATOR_TCKN;
    
    // 1. Vatandaş Kontrolü (Sistem Operatörü)
    const vExists = _db.prepare("SELECT id FROM DATA_Vatandas WHERE TCKN = ?").get(OPERATOR_TCKN) as any;
    let citizenId = vExists?.id;
    if (!vExists) {
      citizenId = crypto.randomUUID();
      _db.prepare(`
        INSERT INTO DATA_Vatandas (id, TCKN, Ad, Soyad, Durum, created_at) 
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(citizenId, OPERATOR_TCKN, 'SİSTEM', 'OPERATÖRÜ', 'Aktif', new Date().toISOString());
    }

    // 2. Personel Kontrolü ve ID Sabitleme (Zimmet için kritik)
    const pExists = _db.prepare("SELECT id FROM TANIM_Personel WHERE Vatandas_Id = ?").get(citizenId) as any;
    let personelId = '';
    
    if (pExists) {
      personelId = pExists.id;
    } else {
      personelId = crypto.randomUUID();
      console.log(`[DB] Genesis: Sistem Operatörü (${personelId}) mühürleniyor...`);
      _db.prepare(`
        INSERT INTO TANIM_Personel (id, Vatandas_Id, Unvan, Sifre, Aktif, created_at) 
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(personelId, citizenId, 'Tahsildar', '123456', 1, new Date().toISOString());
    }

    // 3. Kasaları Senkronize Et (Config'den Çekerek)
    for (const kasa of SYSTEM_CONFIG.DEFAULT_KASALAR) {
      const exists = _db.prepare("SELECT id FROM TANIM_Kasalar WHERE id = ?").get(kasa.id);
      // Zimmet sadece nakit/kasiyer kasasına verilir
      const zimmetId = (kasa.id.includes('nakit') || kasa.id.includes('zimmet')) ? personelId : null;

      if (!exists) {
        _db.prepare(`
          INSERT INTO TANIM_Kasalar (id, Hesap_Kodu, Kasa_Adi, Durum, Zimmet_id, Aciklama, Sistem_Verisi, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(kasa.id, (kasa as any).Hesap_Kodu || '', kasa.Kasa_Adi, kasa.Durum, zimmetId, kasa.Aciklama, kasa.Sistem_Verisi, new Date().toISOString(), new Date().toISOString());
        console.log(`[KASA_SEED] ${kasa.Kasa_Adi} sarsılmaz bir nizamla ${zimmetId ? 'operatöre zimmetlenerek ' : ''}mühürlendi.`);
      } else {
        // 🛡️ Mevcut kayıtları TDHP hesap kodu, zimmet ve sistem flag'i ile güncelle
        _db.prepare("UPDATE TANIM_Kasalar SET Kasa_Adi = ?, Hesap_Kodu = ?, Sistem_Verisi = 1, Zimmet_id = COALESCE(?, Zimmet_id) WHERE id = ?")
          .run(kasa.Kasa_Adi, (kasa as any).Hesap_Kodu || '100', zimmetId, kasa.id);
      }
    }
  } catch (e: any) {
    console.warn('[DB] Kasa onarımı başarısız:', e.message);
  }
}
