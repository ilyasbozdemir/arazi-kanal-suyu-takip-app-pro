import { Database } from 'better-sqlite3';
import { INITIAL_SEED_DATA } from '../../core/constants/SystemDomain';

import fs from 'fs';
import path from 'path';

export function runInitialSeeds(_db: Database) {
  const checkSettings = _db.prepare("SELECT COUNT(*) as count FROM TANIM_Ayarlar").get() as any;
  
  if (checkSettings.count === 0) {
    const insertSet = _db.prepare("INSERT INTO TANIM_Ayarlar (anahtar, deger) VALUES (?, ?)");
    
    _db.transaction(() => {
      INITIAL_SEED_DATA.forEach(item => {
        insertSet.run(item.anahtar, item.deger);
      });
    })();
    
    console.log(`[DB] ${INITIAL_SEED_DATA.length} adet temel sistem ayarı başarıyla yüklendi.`);
  }

  // 🛡️ KURUM LOGO BASE64 GÜNCELLEME (public/logo.png -> TANIM_Ayarlar)
  try {
    const logoPath = path.join(process.cwd(), 'public/logo.png');
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
      _db.prepare("INSERT OR REPLACE INTO TANIM_Ayarlar (anahtar, deger) VALUES ('kurum_logo', ?)").run(logoBase64);
      console.log('[DB] Kurumsal Logo Base64 veritabanına mühürlendi.');
    }
  } catch (e: any) {
    console.warn('[DB] Kurumsal logo Base64 güncelleme uyarısı:', e.message);
  }
}
