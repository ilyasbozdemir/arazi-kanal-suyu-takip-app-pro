import { Database } from 'better-sqlite3';
import { INITIAL_SEED_DATA } from '../../core/constants/SystemDomain';

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
}
