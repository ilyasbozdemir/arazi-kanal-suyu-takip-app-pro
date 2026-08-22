import { Database } from 'better-sqlite3';

export function syncSchema(_db: Database, schema: any) {
  console.log(`[DB] Schema Synchronization Started. Total Tables: ${schema.tables.length}`);
  schema.tables.forEach((table: any) => {
    console.log(`[DB] Syncing Table: ${table.name}`);
    const pkCol = table.columns.find((c: any) => c.constraints && c.constraints.includes('PRIMARY KEY'));
    const pkName = pkCol ? pkCol.name : 'id';
    const pkType = pkCol ? pkCol.type : 'TEXT';
    _db.exec(`CREATE TABLE IF NOT EXISTS "${table.name}" ("${pkName}" ${pkType} PRIMARY KEY)`);

    table.columns.forEach((col: any) => {
      if (col.name === pkName) return;
      const colInfo = _db.prepare(`PRAGMA table_info("${table.name}")`).all() as any[];
      const existingColNames = colInfo.map(c => c.name.toLowerCase());
      
      if (!existingColNames.includes(col.name.toLowerCase())) {
        console.log(`[DB] EKSİK KOLON TESPİT EDİLDİ: ${table.name}.${col.name}`);
        // 🛡️ SQLite ALTER TABLE Kısıtlaması: UNIQUE ve INDEXED kısıtlamalarını ayırıyoruz
        const isUnique = col.constraints?.includes('UNIQUE');
        const isIndexed = col.constraints?.includes('INDEXED');

        const filteredConstraints = (col.constraints || [])
          .filter((c: string) => c !== 'UNIQUE' && c !== 'INDEXED')
          .join(' ');

        const colType = col.type === 'Select' ? 'TEXT' : col.type;
        const defaultClause = col.defaultValue !== undefined ? `DEFAULT ${col.defaultValue}` : '';
        const sql = `ALTER TABLE "${table.name}" ADD COLUMN "${col.name}" ${colType} ${filteredConstraints} ${defaultClause}`;

        try {
          console.log(`[DB] Kolon ekleniyor: ${table.name}.${col.name} (SQL: ${sql})`);
          _db.exec(sql);

          // 🛡️ Kısıtlamaları harici olarak uygula
          if (isUnique) {
            console.log(`[DB] Benzersizlik indeksi oluşturuluyor: ${table.name}.${col.name}`);
            _db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS "uidx_${table.name}_${col.name}" ON "${table.name}" ("${col.name}")`);
          }
          if (isIndexed && !isUnique) { // UNIQUE zaten bir indekstir
            console.log(`[DB] Arama indeksi oluşturuluyor: ${table.name}.${col.name}`);
            _db.exec(`CREATE INDEX IF NOT EXISTS "idx_${table.name}_${col.name}" ON "${table.name}" ("${col.name}")`);
          }
        } catch (e: any) {
          console.error(`[DB] Kolon ekleme hatası (${table.name}.${col.name}):`, e.message);
        }
      }
    });
    
    // 🛡️ ÇOKLU KOLON INDEXLERİ (Indexes Desteği)
    if (table.indexes && table.indexes.length > 0) {
      table.indexes.forEach((idx: any) => {
        const indexName = `${idx.unique ? 'uidx' : 'idx'}_${table.name}_${idx.columns.join('_')}`;
        const columnList = idx.columns.map((c: string) => `"${c}"`).join(', ');
        const uniqueStr = idx.unique ? 'UNIQUE' : '';
        const sql = `CREATE ${uniqueStr} INDEX IF NOT EXISTS "${indexName}" ON "${table.name}" (${columnList})`;
        
        try {
          // console.log(`[DB] Index oluşturuluyor: ${indexName}`);
          _db.exec(sql);
        } catch (e: any) {
          console.error(`[DB] Index oluşturma hatası (${indexName}):`, e.message);
        }
      });
    }
  });
}
