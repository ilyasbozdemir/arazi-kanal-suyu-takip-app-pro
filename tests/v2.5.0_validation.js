import fs from 'fs';
import path from 'path';

const results = {
  version: "2.5.0",
  timestamp: new Date().toISOString(),
  checks: []
};

function addCheck(name, status, message) {
  results.checks.push({ name, status, message });
}

// 1. Package.json Check
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (pkg.version === "2.5.0") {
    addCheck("Package Version", "PASSED", "Version is correctly set to 2.5.0");
  } else {
    addCheck("Package Version", "FAILED", `Expected 2.5.0 but found ${pkg.version}`);
  }
} catch (e) {
  addCheck("Package Version", "ERROR", e.message);
}

// 2. SQL History Check
try {
  const historyPath = 'sql_history/v2.5.0.json';
  if (fs.existsSync(historyPath)) {
    const history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
    if (history.schemaSnapshot && history.schemaSnapshot.length > 0) {
      addCheck("SQL History Integrity", "PASSED", "v2.5.0.json exists and contains schema snapshot");
    } else {
      addCheck("SQL History Integrity", "WARNING", "v2.5.0.json exists but snapshot is empty");
    }
  } else {
    addCheck("SQL History Integrity", "FAILED", "v2.5.0.json missing in sql_history/");
  }
} catch (e) {
  addCheck("SQL History Integrity", "ERROR", e.message);
}

// 3. Mevki Automation Logic Check (Static Analysis)
try {
  const landService = fs.readFileSync('src/ui-engine/src/services/LandService.ts', 'utf8');
  if (landService.includes('handleMevkiAutomation') && landService.includes('TABLES.MEVKI')) {
    addCheck("Mevki Automation Code", "PASSED", "LandService.ts contains required automation logic");
  } else {
    addCheck("Mevki Automation Code", "FAILED", "Automation logic missing in LandService.ts");
  }
} catch (e) {
  addCheck("Mevki Automation Code", "ERROR", e.message);
}

// 4. Schema Proposal Check
try {
  const schema = JSON.parse(fs.readFileSync('sql_table_schema_proposal.json', 'utf8'));
  const hasMevki = schema.tables.some(t => t.name === "DATA_Mevki_Bilgisi");
  if (hasMevki) {
    addCheck("Schema Definition", "PASSED", "DATA_Mevki_Bilgisi table is defined in proposal");
  } else {
    addCheck("Schema Definition", "FAILED", "DATA_Mevki_Bilgisi missing from schema proposal");
  }
} catch (e) {
  addCheck("Schema Definition", "ERROR", e.message);
}

// Output Results
const outputPath = 'tests/v2.5.0_result.json';
if (!fs.existsSync('tests')) fs.mkdirSync('tests');
fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

console.log("--- SARSILMAZ TEST SONUÇLARI ---");
results.checks.forEach(c => {
  console.log(`[${c.status}] ${c.name}: ${c.message}`);
});
console.log(`\nDetaylı rapor kaydedildi: ${outputPath}`);
