const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join('c:/Users/ilyas/Desktop/g-belediyesi-arazi-takip/data', 'KANAL_ARAZI_SUYU_TAKIPDB.db');
const db = new Database(dbPath);

console.log('--- TANIM_Kasalar ---');
const kasalar = db.prepare('SELECT id, Kasa_Adi FROM TANIM_Kasalar').all();
console.log(JSON.stringify(kasalar, null, 2));

console.log('--- MUHASEBE_Tahakkuk ---');
const tahakkuklar = db.prepare('SELECT id, Vatandas_Id FROM MUHASEBE_Tahakkuk LIMIT 5').all();
console.log(JSON.stringify(tahakkuklar, null, 2));

console.log('--- DATA_Vatandas ---');
const vatandas = db.prepare('SELECT id, Ad, Soyad FROM DATA_Vatandas LIMIT 5').all();
console.log(JSON.stringify(vatandas, null, 2));

db.close();
