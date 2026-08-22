import { Database } from 'better-sqlite3';
import * as crypto from 'node:crypto';

export function runMigrations(_db: Database) {
  // 🛡️ MEVKI TABLO ADI GÖÇÜ (Sarsılmaz Arşiv)
  try {
    const oldTableCheck = _db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='DATA_Mevki_Bilgisi'").get();
    const midTableCheck = _db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='DATA_Tasinmaz_Mevkileri'").get();
    const newTableCheck = _db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='DATA_Tasinmaz_Mevkileri'").get();
    
    if (oldTableCheck && !midTableCheck && !newTableCheck) {
      console.log('[DB] Mevki tablosu adı güncelleniyor: DATA_Mevki_Bilgisi -> DATA_Tasinmaz_Mevkileri');
      _db.exec('ALTER TABLE DATA_Mevki_Bilgisi RENAME TO DATA_Tasinmaz_Mevkileri');
    } else if (midTableCheck && !newTableCheck) {
      console.log('[DB] Mevki tablosu adı güncelleniyor: DATA_Tasinmaz_Mevkileri -> DATA_Tasinmaz_Mevkileri');
      _db.exec('ALTER TABLE DATA_Tasinmaz_Mevkileri RENAME TO DATA_Tasinmaz_Mevkileri');
    }
  } catch (e: any) {
    console.warn('[DB] Mevki göçü hatası:', e.message);
  }

  // 🛡️ TAHAKKUK VE TAHSİLAT TABLO ADI GÖÇÜ (DATA -> MUHASEBE)
  try {
    const oldTahakkuk = _db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='DATA_Tahakkuk'").get();
    const newTahakkuk = _db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='MUHASEBE_Tahakkuk'").get();
    if (oldTahakkuk && !newTahakkuk) {
      console.log('[DB] Tahakkuk tablosu adı güncelleniyor: DATA_Tahakkuk -> MUHASEBE_Tahakkuk');
      _db.exec('ALTER TABLE DATA_Tahakkuk RENAME TO MUHASEBE_Tahakkuk');
    }
    
    const oldTahsilat = _db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='DATA_Tahsilat'").get();
    const newTahsilat = _db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='MUHASEBE_Tahsilat'").get();
    if (oldTahsilat && !newTahsilat) {
      console.log('[DB] Tahsilat tablosu adı güncelleniyor: DATA_Tahsilat -> MUHASEBE_Tahsilat');
      _db.exec('ALTER TABLE DATA_Tahsilat RENAME TO MUHASEBE_Tahsilat');
    }
  } catch (e: any) {
    console.warn('[DB] Tahakkuk/Tahsilat göçü hatası:', e.message);
  }

  // 🛡️ DİNAMİK TABLO MİGRASYONU (Sarsılmaz Birleşik Mimari Göçü)
  try {
    console.log('[DB] Dinamik tablo göçü (Migration) denetleniyor...');
    const ledgerCols = _db.prepare("PRAGMA table_info(DATA_Dagitim_Donemleri)").all() as any[];
    
    // Eğer tablo_adi_dagitim kolonu varsa, eski (v1) yapıdan geliniyordur.
    if (ledgerCols.some((c: any) => c.name === 'tablo_adi_dagitim')) {
      const oldLedgers = _db.prepare("SELECT * FROM DATA_Dagitim_Donemleri WHERE tablo_adi_dagitim IS NOT NULL AND tablo_adi_dagitim != ''").all() as any[];
      
      if (oldLedgers.length > 0) {
        console.log(`[DB] Bulunan dinamik defter sayısı: ${oldLedgers.length}. Sarsılmaz birleşik göç başlatılıyor...`);

        const migrate = _db.transaction(() => {
          for (const ledger of oldLedgers) {
            // 1. Defter Verisini Doğrudan Güncelle (Dönem tablosu atlanıyor)
            const year = ledger.Baslangic_Yili || new Date().getFullYear();
            try {
              _db.prepare(`
                UPDATE DATA_Dagitim_Donemleri 
                SET Defter_Adi = ?, 
                    Donem_Adi = ?, 
                    Baslangic_Tarihi = ?, 
                    Bitis_Tarihi = ?, 
                    Baslangic_Yili = ? 
                WHERE id = ?
              `).run(
                `${year} Defteri`, 
                `${year} Sezonu`, 
                `${year}-01-01`, 
                `${year}-12-31`, 
                year, 
                ledger.id
              );
            } catch (e) {
               console.warn(`[DB] Defter ${ledger.id} güncellenirken hata oluştu:`, e);
            }
          }
        });

        try {
          migrate();
          console.log('[DB] Migration işlemi sarsılmaz bir hızla tamamlandı.');

          // 2. ESKİ TABLOLARI TEMİZLE (DROP)
          for (const ledger of oldLedgers) {
            if (ledger.tablo_adi_defter) _db.prepare(`DROP TABLE IF EXISTS "${ledger.tablo_adi_defter}"`).run();
            if (ledger.tablo_adi_dagitim) _db.prepare(`DROP TABLE IF EXISTS "${ledger.tablo_adi_dagitim}"`).run();
          }

          // 3. Eski kolonları null yap (Şema değişimi bir sonraki safe-run'da halledilecek)
          _db.prepare("UPDATE DATA_Dagitim_Donemleri SET tablo_adi_dagitim = NULL, tablo_adi_defter = NULL").run();

        } catch (e: any) {
          console.error('[DB] Migration sırasında KRİTİK HATA:', e.message);
        }
      }
    }
  } catch (e: any) {
    console.warn('[DB] Dinamik tablo denetimi başarısız (Muhtemelen kolonlar çoktan silindi):', e.message);
  }

  // 🛡️ DEFTER VE MERAV İLİŞKİSİ ONARIMI (Sarsılmaz Yeni Şema Geçişi)
  try {
    const oldMainTable = _db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='DATA_Dagitim_Mahalleleri_Donem'").get();
    if (oldMainTable) {
       console.log('[DB] Defter tablosu adı güncelleniyor: DATA_Dagitim_Mahalleleri_Donem -> DATA_Dagitim_Donemleri');
       _db.exec('ALTER TABLE DATA_Dagitim_Mahalleleri_Donem RENAME TO DATA_Dagitim_Donemleri');
    }

    const relInfo = _db.prepare("PRAGMA foreign_key_list(REL_Defter_Merav)").all() as any[];
    const hasLegacyFK = relInfo.some(fk => fk.table === 'DATA_Dagitim_Mahalleleri_Donem');

    if (hasLegacyFK) {
      console.log('[DB] REL_Defter_Merav tablosu onarılıyor (Legacy FK Detected)...');
      _db.transaction(() => {
        // 1. Verileri yedekle
        const data = _db.prepare("SELECT * FROM REL_Defter_Merav").all() as any[];
        
        // 2. Tabloyu sil ve yeniden oluştur (Yeni şema zaten syncSchema ile gelecek ama burada manuel garanti altına alıyoruz)
        _db.exec('DROP TABLE REL_Defter_Merav');
        _db.exec(`
          CREATE TABLE "REL_Defter_Merav" (
            "id" TEXT PRIMARY KEY,
            "Defter_id" TEXT NOT NULL REFERENCES DATA_Dagitim_Donemleri(id),
            "Merav_id" TEXT NOT NULL REFERENCES TANIM_Meravlar(id),
            "Baslangic_Tarihi" TEXT,
            "Bitis_Tarihi" TEXT,
            "Aktif" INTEGER DEFAULT 1,
            "created_at" TEXT,
            "updated_at" TEXT,
            "deleted_at" TEXT,
            "created_by" TEXT,
            "updated_by" TEXT
          )
        `);

        // 3. Verileri geri yükle
        if (data.length > 0) {
          const insert = _db.prepare(`
            INSERT INTO REL_Defter_Merav (id, Defter_id, Merav_id, Baslangic_Tarihi, Bitis_Tarihi, Aktif, created_at, updated_at, deleted_at, created_by, updated_by)
            VALUES (@id, @Defter_id, @Merav_id, @Baslangic_Tarihi, @Bitis_Tarihi, @Aktif, @created_at, @updated_at, @deleted_at, @created_by, @updated_by)
          `);
          for (const row of data) insert.run(row);
        }
      })();
      console.log('[DB] REL_Defter_Merav sarsılmaz bir nizamla onarıldı.');
    }

    // 🛡️ DAĞITIM KAYITLARI ONARIMI (Sarsılmaz Kayıt Güvenliği)
    const recordsInfo = _db.prepare("PRAGMA foreign_key_list(DATA_Dagitim_Kayitlar)").all() as any[];
    const hasLegacyFKInRecords = recordsInfo.some(fk => fk.table === 'DATA_Dagitim_Mahalleleri_Donem');

    if (hasLegacyFKInRecords) {
      console.log('[DB] DATA_Dagitim_Kayitlar tablosu onarılıyor (Legacy FK Detected)...');
      _db.transaction(() => {
        const data = _db.prepare("SELECT * FROM DATA_Dagitim_Kayitlar").all() as any[];
        _db.exec('DROP TABLE DATA_Dagitim_Kayitlar');
        _db.exec(`
          CREATE TABLE "DATA_Dagitim_Kayitlar" (
            "id" TEXT PRIMARY KEY,
            "Donem_id" TEXT REFERENCES DATA_Dagitim_Donemleri(id),
            "Mahalle_id" TEXT REFERENCES DATA_Dagitim_Mahalleleri(id),
            "Tasinmaz_id" TEXT,
            "Vatandas_Id" TEXT,
            "Merav_id" TEXT,
            "Tarih" TEXT,
            "Baslangic_Saati" TEXT,
            "Bitis_Saati" TEXT,
            "Kullanim_Saati" REAL,
            "Sure_Saat" REAL,
            "Tarife_Modu" TEXT,
            "Birim_Fiyat" REAL,
            "Toplam_Tutar" REAL,
            "Aciklama" TEXT,
            "created_at" TEXT,
            "updated_at" TEXT,
            "deleted_at" TEXT,
            "created_by" TEXT,
            "updated_by" TEXT
          )
        `);
        if (data.length > 0) {
          const insert = _db.prepare(`
            INSERT INTO DATA_Dagitim_Kayitlar (id, Donem_id, Bolge_id, Tasinmaz_id, Vatandas_Id, Merav_id, Tarih, Baslangic_Saati, Bitis_Saati, Kullanim_Saati, Sure_Saat, Tarife_Modu, Birim_Fiyat, Toplam_Tutar, Aciklama, created_at, updated_at, deleted_at, created_by, updated_by)
            VALUES (@id, @Donem_id, @Bolge_id, @Tasinmaz_id, @Vatandas_Id, @Merav_id, @Tarih, @Baslangic_Saati, @Bitis_Saati, @Kullanim_Saati, @Sure_Saat, @Tarife_Modu, @Birim_Fiyat, @Toplam_Tutar, @Aciklama, @created_at, @updated_at, @deleted_at, @created_by, @updated_by)
          `);
          for (const row of data) insert.run(row);
        }
      })();
      console.log('[DB] DATA_Dagitim_Kayitlar sarsılmaz bir nizamla onarıldı.');
    }
  } catch (e: any) {
    console.warn('[DB] Defter/Kayıt onarımı hatası:', e.message);
  }

  // 🛡️ TAHAKKUK VE MUHASEBE ŞEMA ONARIMI
  try {
    const tahakkukInfo = _db.prepare("PRAGMA table_info(MUHASEBE_Tahakkuk)").all() as any[];
    if (tahakkukInfo.length > 0 && !tahakkukInfo.some(c => c.name === 'deleted_at')) {
      _db.prepare("ALTER TABLE MUHASEBE_Tahakkuk ADD COLUMN deleted_at TEXT").run();
      console.log('[DB] MUHASEBE_Tahakkuk.deleted_at kolonu tescil edildi.');
    }

    const fislerInfo = _db.prepare("PRAGMA table_info(MUHASEBE_Fisler)").all() as any[];
    if (fislerInfo.length > 0 && !fislerInfo.some(c => c.name === 'deleted_at')) {
       _db.prepare("ALTER TABLE MUHASEBE_Fisler ADD COLUMN deleted_at TEXT").run();
       console.log('[DB] MUHASEBE_Fisler.deleted_at kolonu tescil edildi.');
    }
    const meravInfo = _db.prepare("PRAGMA table_info(TANIM_Meravlar)").all() as any[];
    if (meravInfo.length > 0 && !meravInfo.some(c => c.name === 'Mahalle_id')) {
      _db.prepare("ALTER TABLE TANIM_Meravlar ADD COLUMN Mahalle_id TEXT").run();
      console.log('[DB] TANIM_Meravlar.Mahalle_id kolonu tescil edildi.');
    }
  } catch (e: any) {
    console.warn('[DB] Tahakkuk/Muhasebe onarımı atlandı:', e.message);
  }

  // 🛡️ DAĞITIM BÖLGESİ VE DÖNEM İLİŞKİ ONARIMI (V4 -> V5 Sarsılmaz Nizam)
  try {
    const bolgeCols = _db.prepare("PRAGMA table_info(DATA_Dagitim_Bolgeleri)").all() as any[];
    
    // 1. DATA_Dagitim_Bolgeleri tablosuna 'id' ekle (Eğer yoksa)
    if (!bolgeCols.some(c => c.name === 'id')) {
      console.log('[DB] DATA_Dagitim_Bolgeleri tablosuna sarsılmaz ID nizamı getiriliyor...');
      _db.transaction(() => {
        // Tabloyu yeniden oluştur (PK değişimi için en güvenli yol)
        const oldData = _db.prepare("SELECT * FROM DATA_Dagitim_Bolgeleri").all() as any[];
        _db.exec('DROP TABLE DATA_Dagitim_Bolgeleri');
        _db.exec(`
          CREATE TABLE "DATA_Dagitim_Bolgeleri" (
            "id" TEXT PRIMARY KEY,
            "Mahalle_id" TEXT REFERENCES TANIM_Konumlar(id),
            "Sorumlu_Merav_id" TEXT REFERENCES TANIM_Meravlar(id),
            "Tip" TEXT,
            "Durum" TEXT DEFAULT 'Aktif',
            "created_at" TEXT, "updated_at" TEXT, "deleted_at" TEXT, "created_by" TEXT, "updated_by" TEXT
          )
        `);
        for (const row of oldData) {
          // Eğer Mahalle_id varsa, onu id olarak kullan (Eski veriler için)
          const finalId = row.id || row.Mahalle_id || crypto.randomUUID();
          _db.prepare(`INSERT INTO DATA_Dagitim_Bolgeleri (id, Mahalle_id, Sorumlu_Merav_id, Tip, Durum, created_at, updated_at, deleted_at, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
            finalId, row.Mahalle_id, row.Sorumlu_Merav_id, row.Tip, row.Durum, row.created_at, row.updated_at, row.deleted_at, row.created_by, row.updated_by
          );
        }
      })();
    }

    // 2. DATA_Dagitim_Donemleri - Mahalle_id -> Bolge_id
    const donemCols = _db.prepare("PRAGMA table_info(DATA_Dagitim_Donemleri)").all() as any[];
    if (donemCols.some(c => c.name === 'Mahalle_id') && !donemCols.some(c => c.name === 'Bolge_id')) {
      console.log('[DB] DATA_Dagitim_Donemleri: Mahalle_id -> Bolge_id göçü başlatıldı.');
      _db.exec('ALTER TABLE DATA_Dagitim_Donemleri RENAME COLUMN Mahalle_id TO Bolge_id');
    }

    // 3. DATA_Dagitim_Kayitlar - Mahalle_id -> Bolge_id
    const kayitCols = _db.prepare("PRAGMA table_info(DATA_Dagitim_Kayitlar)").all() as any[];
    if (kayitCols.some(c => c.name === 'Mahalle_id') && !kayitCols.some(c => c.name === 'Bolge_id')) {
      console.log('[DB] DATA_Dagitim_Kayitlar: Mahalle_id -> Bolge_id göçü başlatıldı.');
      _db.exec('ALTER TABLE DATA_Dagitim_Kayitlar RENAME COLUMN Mahalle_id TO Bolge_id');
    }

  } catch (e: any) {
    console.warn('[DB] Bölge ilişki onarımı hatası:', e.message);
  }

  // 🛡️ VATANDAŞ ID MİGRASYONU (TCKN -> ID Sarsılmaz Nizamı)
  try {
    const tablesToMigrate = [
      'REL_TASINMAZ_VATANDAS', 
      'REL_TASINMAZ_ZILYET', 
      'TANIM_Personel', 
      'TANIM_Meravlar', 
      'MUHASEBE_Tahsilat', 
      'MUHASEBE_Tahakkuk', 
      'DATA_Dagitim_Kayitlar'
    ];

    for (const table of tablesToMigrate) {
      const tableCheck = _db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(table);
      if (!tableCheck) continue;

      const cols = _db.prepare(`PRAGMA table_info(${table})`).all() as any[];
      const hasOldCol = cols.some(c => c.name === 'Vatandas_TCKN');
      const hasNewCol = cols.some(c => c.name === 'Vatandas_Id');

      if (hasOldCol && !hasNewCol) {
        console.log(`[DB] ${table}: Vatandas_TCKN -> Vatandas_Id (Rename)`);
        _db.exec(`ALTER TABLE "${table}" RENAME COLUMN "Vatandas_TCKN" TO "Vatandas_Id"`);
      } else if (hasOldCol && hasNewCol) {
        console.log(`[DB] ${table}: Vatandas_TCKN verileri Vatandas_Id kolonuna taşınıyor...`);
        // Veriyi taşı ve eski kolonu temizlemeyi dene (SQLite drop column desteği kısıtlıdır, o yüzden sadece null yapıyoruz veya bırakıyoruz)
        _db.transaction(() => {
          // Bu işlem için DATA_Vatandas ile join yapıp id'yi almamız lazım
          _db.exec(`
            UPDATE "${table}" 
            SET "Vatandas_Id" = (SELECT id FROM DATA_Vatandas WHERE TCKN = "${table}"."Vatandas_TCKN")
            WHERE "Vatandas_Id" IS NULL AND "Vatandas_TCKN" IS NOT NULL
          `);
        })();
      }
    }
  } catch (e: any) {
    console.warn('[DB] Vatandaş ID migrasyon hatası:', e.message);
  }

  // 🛡️ COĞRAFİ KONUM YOLU GÜNCELLEMESİ (MERKEZ İL İL & İLÇELER)
  try {
    // 1. İL GÜNCELLEME
    _db.prepare(`
      INSERT OR IGNORE INTO TANIM_Konumlar (id, Tip, Ad, Sinir_Dosya_Yolu) 
      VALUES ('70', 'İL', 'MERKEZ İL', 'resources/tkgm/geo-files/merkez-il-il-geo.json')
    `).run();
    
    _db.prepare(`
      UPDATE TANIM_Konumlar 
      SET Ad = 'MERKEZ İL', Sinir_Dosya_Yolu = 'resources/tkgm/geo-files/merkez-il-il-geo.json' 
      WHERE Tip = 'İL' AND (Ad = 'MERKEZ İL' OR id = '70')
    `).run();

    // 2. İLÇE SEED/GÜNCELLEME
    const ilceler = [
      { ad: 'MERKEZ İLÇE', kod: '956' },
    ];

    for (const ilce of ilceler) {
      _db.prepare(`
        INSERT OR IGNORE INTO TANIM_Konumlar (id, Parent_id, Tip, Ad, Sinir_Dosya_Yolu)
        VALUES ('${ilce.kod}', '70', 'İLÇE', '${ilce.ad}', 'resources/tkgm/geo-files/merkez-il-ilçeler.geo.json')
      `).run();

      _db.prepare(`
        UPDATE TANIM_Konumlar 
        SET Ad = '${ilce.ad}', Sinir_Dosya_Yolu = 'resources/tkgm/geo-files/merkez-il-ilçeler.geo.json' 
        WHERE Tip = 'İLÇE' AND (Ad = '${ilce.ad}' OR id = '${ilce.kod}')
      `).run();
    }

    console.log('[DB] Merkez İl İl ve İlçe sınırları dosya yolları sarsılmaz bir nizamla ayrıldı.');
  } catch (e: any) {
    console.warn('[DB] Merkez İl konum yolu güncelleme hatası:', e.message);
  }
}
