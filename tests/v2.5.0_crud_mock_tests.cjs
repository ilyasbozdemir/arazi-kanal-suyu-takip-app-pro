const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = 'tests/mock_test.db';
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

const db = new Database(dbPath);
const schema = JSON.parse(fs.readFileSync('sql_table_schema_proposal.json', 'utf8'));

const results = {
  version: "2.5.0",
  type: "CRUD Mock Tests",
  timestamp: new Date().toISOString(),
  tests: []
};

function logTest(name, status, message) {
  results.tests.push({ name, status, message });
  console.log(`[${status}] ${name}: ${message}`);
}

// 1. Schema Initialization
try {
  schema.tables.forEach(table => {
    const cols = table.columns.map(c => `${c.name} ${c.type} ${c.constraints ? c.constraints.join(' ') : ''}`).join(', ');
    db.prepare(`CREATE TABLE IF NOT EXISTS ${table.name} (${cols})`).run();
  });
  logTest("Schema Init", "PASSED", "All tables created successfully");
} catch (e) {
  logTest("Schema Init", "FAILED", e.message);
  process.exit(1);
}

// 2. DATA_Vatandas CRUD
try {
  const citizenId = 'test-citizen-1';
  // CREATE
  db.prepare("INSERT INTO DATA_Vatandas (id, TCKN, Ad, Soyad) VALUES (?, ?, ?, ?)").run(citizenId, '11122233344', 'İlyas', 'Bozdemir');
  // READ
  const c = db.prepare("SELECT * FROM DATA_Vatandas WHERE id = ?").get(citizenId);
  if (c.Ad === 'İlyas') {
    // UPDATE
    db.prepare("UPDATE DATA_Vatandas SET Ad = ? WHERE id = ?").run('İlyas (GÜNCEL)', citizenId);
    const c2 = db.prepare("SELECT * FROM DATA_Vatandas WHERE id = ?").get(citizenId);
    if (c2.Ad === 'İlyas (GÜNCEL)') {
       logTest("Citizen CRUD", "PASSED", "Insert, Read and Update successful");
    } else {
       logTest("Citizen CRUD", "FAILED", "Update failed");
    }
  } else {
    logTest("Citizen CRUD", "FAILED", "Insert/Read failed");
  }
} catch (e) {
  logTest("Citizen CRUD", "ERROR", e.message);
}

// 3. DATA_Mevki_Bilgisi CRUD
try {
  const mevkiId = 'test-mevki-1';
  db.prepare("INSERT INTO DATA_Mevki_Bilgisi (id, Mevki_Adi, Tarim_Sinifi) VALUES (?, ?, ?)").run(mevkiId, 'KELEKLER', 'Sulu Tarım');
  const m = db.prepare("SELECT * FROM DATA_Mevki_Bilgisi WHERE id = ?").get(mevkiId);
  if (m.Mevki_Adi === 'KELEKLER') {
    logTest("Mevki CRUD", "PASSED", "Mevki creation and retrieval successful");
  } else {
    logTest("Mevki CRUD", "FAILED", "Mevki name mismatch");
  }
} catch (e) {
  logTest("Mevki CRUD", "ERROR", e.message);
}

// 4. TANIM_Personel CRUD (Relationship Check)
try {
  const pId = 'test-personel-1';
  db.prepare("INSERT INTO TANIM_Personel (id, Vatandas_TCKN, Ad_Soyad, Unvan) VALUES (?, ?, ?, ?)").run(pId, 'test-citizen-1', 'İlyas Bozdemir', 'Merav');
  const p = db.prepare("SELECT * FROM TANIM_Personel WHERE id = ?").get(pId);
  if (p.Vatandas_TCKN === 'test-citizen-1') {
    logTest("Personnel CRUD", "PASSED", "Personnel created and linked to Citizen ID successfully");
  } else {
    logTest("Personnel CRUD", "FAILED", "Personnel ID linking failed");
  }
} catch (e) {
  logTest("Personnel CRUD", "ERROR", e.message);
}

// 5. DATA_Tapu_Verisi (Automation Emulation)
try {
  const tapuId = 'test-tapu-1';
  db.prepare("INSERT INTO DATA_Tapu_Verisi (id, Mevki, Mevki_id, Ada, Parsel) VALUES (?, ?, ?, ?, ?)").run(tapuId, 'KELEKLER', 'test-mevki-1', '101', '5');
  const t = db.prepare("SELECT * FROM DATA_Tapu_Verisi WHERE id = ?").get(tapuId);
  if (t.Mevki_id === 'test-mevki-1') {
    logTest("Land Record CRUD", "PASSED", "Land record created with correct Mevki ID link");
  } else {
    logTest("Land Record CRUD", "FAILED", "Land record Mevki link mismatch");
  }
} catch (e) {
  logTest("Land Record CRUD", "ERROR", e.message);
}

// 6. DELETE Tests
try {
  db.prepare("DELETE FROM DATA_Vatandas WHERE id = ?").run('test-citizen-1');
  const delCheck = db.prepare("SELECT * FROM DATA_Vatandas WHERE id = ?").get('test-citizen-1');
  if (!delCheck) {
    logTest("Delete Integrity", "PASSED", "Record deletion verified");
  } else {
    logTest("Delete Integrity", "FAILED", "Record still exists after delete");
  }
} catch (e) {
  logTest("Delete Integrity", "ERROR", e.message);
}

// Output JSON
fs.writeFileSync('tests/v2.5.0_crud_result.json', JSON.stringify(results, null, 2));
console.log("\nFull CRUD mock test completed. Result saved to tests/v2.5.0_crud_result.json");
db.close();
