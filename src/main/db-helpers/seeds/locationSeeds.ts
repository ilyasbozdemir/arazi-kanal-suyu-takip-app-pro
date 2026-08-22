import { Database } from "better-sqlite3";
import * as crypto from "crypto";

export function runLocationSeeds(_db: Database) {
  // 🌍 KONUM VE COĞRAFİ SİCİL GENESİSİ
  const checkKonum = _db
    .prepare("SELECT COUNT(*) as count FROM TANIM_Konumlar")
    .get() as any;
  if (checkKonum.count === 0) {
    console.log(
      "[DB] Genesis: Coğrafi hiyerarşi ve konum kodları mühürleniyor...",
    );
    const insertKonum = _db.prepare(
      "INSERT INTO TANIM_Konumlar (id, Parent_id, Tip, Ad, Kod, TGKM_Kod, TGKM_Mahalle_Ad, Sinir_Dosya_Yolu) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    );

    _db.transaction(() => {
      // 🛡️ 1. Mükerrerleri Temizle
      _db.prepare("DELETE FROM TANIM_Konumlar WHERE id IN ('70', '956') OR Kod IS NULL").run();

      const insertStmt = _db.prepare(`
        INSERT OR REPLACE INTO TANIM_Konumlar (id, Parent_id, Tip, Ad, Kod, TGKM_Kod, TGKM_Mahalle_Ad, Sinir_Dosya_Yolu)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      // 🛡️ 2. İl & İlçe & Belde
      const ilId = "142d249d-11fc-4233-a6aa-ceb003e74978";
      const ilceId = "d1733961-8909-45a5-a41f-d06b2f6e2820";
      const beldeId = "8edbe5a4-cc1f-4e68-8210-d609b6c959cb";

      insertStmt.run(ilId, null, "İL", "MERKEZ İL", "70", "92", null, "resources/tkgm/geo-files/merkez-il-il-geo.json");
      insertStmt.run(ilceId, ilId, "İLÇE", "MERKEZ İLÇE", "70400", "956", null, "resources/tkgm/geo-files/merkez-il-ilçeler.geo.json");
      insertStmt.run(beldeId, ilceId, "BELDE", "MERKEZ BELDESİ", "70450", "", null, "resources/tkgm/geo-files/kurum-belde-genel.json");

      // 🛡️ 3. Mahalleler (Tek Satırda Tüm Veri)
      const mahalles = [
        { id: "f6034823-ed5a-440e-b8a6-905c3c4a3d4a", ad: "ARALIK MAHALLESİ", code: "150064", tkgm: "Kurum/Aralık", path: "resources/tkgm/geo-files/Kurum_Aralık.json" },
        { id: "1aa94dfb-3dc5-42e7-8c24-11a2e3100bba", ad: "CAMİ MAHALLESİ", code: "151446", tkgm: "Kurum/Cami", path: "resources/tkgm/geo-files/Kurum_Cami.json" },
        { id: "80313247-038d-4f35-9f57-6da6e6e74254", ad: "HABİB MAHALLESİ", code: "152157", tkgm: "Kurum/Habib", path: "resources/tkgm/geo-files/Kurum_Habib.json" },
        { id: "2adc251e-aeb8-451b-ac97-3c5759127f76", ad: "KIŞLACIK MAHALLESİ", code: "149562", tkgm: "Kurum/Kışlacık", path: "resources/tkgm/geo-files/Kurum_Kışlacık.json" },
        { id: "a242f5c8-810b-4dac-8caa-5b2b29a7db98", ad: "ODA MAHALLESİ", code: "150842", tkgm: "Kurum/Oda", path: "resources/tkgm/geo-files/Kurum_Oda.json" },
        { id: "16c9816d-7036-4a19-ac63-4d62c6aeca71", ad: "ORTA MAHALLESİ", code: "154001", tkgm: "Orta/Kurum", path: "resources/tkgm/geo-files/Orta_Kurum.json" },
        { id: "dd04d0dd-8855-48fa-8828-2a6528143f8a", ad: "PINARGÖZÜ MAHALLESİ", code: "180837", tkgm: "Kurum/Pınargözü", path: "resources/tkgm/geo-files/Kurum_Pınargözü.json" },
        { id: "c6fdf53a-4195-410d-8f76-afb88b25ffbb", ad: "YENİMAHALLE MAHALLESİ", code: "149900", tkgm: "Kurum/Yenimahalle", path: "resources/tkgm/geo-files/Kurum_Yenimahalle.json" },
      ];

      mahalles.forEach((m) => {
        insertStmt.run(m.id, beldeId, "MAHALLE", m.ad, "70450", m.code, m.tkgm, m.path);
      });
    })();
    console.log(
      "[DB] Genesis: Coğrafi hiyerarşi sarsılmaz bir nizamla mühürlendi.",
    );
  }
}
