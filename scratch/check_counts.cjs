const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');

const dbPath = path.join(os.homedir(), 'AppData', 'Roaming', 'g-belediyesi-arazi-takip', 'db.sqlite');
console.log('Checking DB at:', dbPath);

try {
    const db = new Database(dbPath);

    const check = (sql, label) => {
        const rows = db.prepare(sql).all();
        console.log(`\n--- ${label} ---`);
        console.table(rows);
    };

    check(`SELECT id, Mahalle_id FROM DATA_Dagitim_Bolgeleri`, 'Dağıtım Bölgeleri');
    check(`SELECT id, Mevki_Adi, Konum_id FROM DATA_Tasinmaz_Mevkileri`, 'Mevkiler');
    check(`SELECT id, Ada, Parsel, Mevki_id FROM DATA_Tapu_Verisi LIMIT 5`, 'Tapu Verisi (Sample)');
    check(`SELECT COUNT(*) as cnt FROM TASINMAZ_SAHIP`, 'Sahiplik Sayısı');

    // 🛡️ Test the specific query used in stats.ts
    check(`
        SELECT 
          b.Mahalle_id as id,
          (SELECT COUNT(DISTINCT s.Vatandas_Id) 
           FROM TASINMAZ_SAHIP s 
           JOIN DATA_Tapu_Verisi t ON s.Tasinmaz_id = t.id 
           JOIN DATA_Tasinmaz_Mevkileri m ON t.Mevki_id = m.id
           WHERE m.Konum_id = b.Mahalle_id 
           AND (t.deleted_at IS NULL OR t.deleted_at = '')) as vatandasCount,
          (SELECT COUNT(*) FROM DATA_Tapu_Verisi t 
           JOIN DATA_Tasinmaz_Mevkileri m ON t.Mevki_id = m.id
           WHERE m.Konum_id = b.Mahalle_id AND (t.deleted_at IS NULL OR t.deleted_at = '')) as tapuCount
        FROM DATA_Dagitim_Bolgeleri b
    `, 'Test Query Results');

} catch (err) {
    console.error('Error:', err.message);
}
