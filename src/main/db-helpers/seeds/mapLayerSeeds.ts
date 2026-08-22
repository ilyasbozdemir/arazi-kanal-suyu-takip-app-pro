import { Database } from "better-sqlite3";
import * as fs from "fs";
import * as path from "path";
import { app } from "electron";
import * as turf from '@turf/turf';

const isDev = !app.isPackaged;

function getResourcePath(fileName: string) {
  if (isDev) {
    return path.join(process.cwd(), fileName);
  }
  return path.join(process.resourcesPath, fileName);
}

export function runMapLayerSeeds(_db: Database) {
  const checkLayer = _db.prepare("SELECT COUNT(*) as count FROM MAP_Katmanlar WHERE Kategori = 'SINIR'").get() as any;
  
  if (checkLayer.count > 0) {
    console.log("[DB] Harita katmanları zaten mevcut, seed atlanıyor...");
    return;
  }

  console.log("[DB] Harita katmanları (GeoJSON) mühürleniyor...");

  const insertLayer = _db.prepare(`
    INSERT INTO MAP_Katmanlar (id, Ad, Tip, Icerik_JSON, Ikon, Renk, Kategori, Gorunur)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const processGeoFile = (filePath: string, kategori: string, typeName: string, icon: string, defaultColor: string) => {
    const fullPath = getResourcePath(filePath);
    if (!fs.existsSync(fullPath)) {
      console.warn(`[DB] GeoJSON dosyası bulunamadı: ${fullPath}`);
      return;
    }

    try {
      const content = JSON.parse(fs.readFileSync(fullPath, "utf8"));
      
      if (content.type === "FeatureCollection") {
        content.features.forEach((feature: any) => {
          const name = feature.properties?.text || feature.properties?.Ad || "İsimsiz Katman";
          const id = feature.properties?.id?.toString() || feature.properties?.Kod || Math.random().toString(36).substr(2, 9);
          
          insertLayer.run(
            id,
            name,
            typeName,
            JSON.stringify(feature),
            icon,
            defaultColor,
            kategori,
            1
          );
        });
      } else if (content.type === "Feature") {
        const name = content.properties?.text || content.properties?.Ad || "İsimsiz Katman";
        const id = content.properties?.id?.toString() || Math.random().toString(36).substr(2, 9);
        
        insertLayer.run(
          id,
          name,
          typeName,
          JSON.stringify(content),
          icon,
          defaultColor,
          kategori,
          1
        );
      }
    } catch (err) {
      console.error(`[DB] GeoJSON işleme hatası (${filePath}):`, err);
    }
  };

  _db.transaction(() => {
    // 1. İl Sınırı
    processGeoFile("resources/tkgm/geo-files/merkez-il-il-geo.json", "SINIR", "İL", "Globe", "#3b82f6");

    // 2. İlçe Sınırları
    processGeoFile("resources/tkgm/geo-files/merkez-il-ilçeler-geo.json", "SINIR", "İLÇE", "Map", "#10b981");

    // 3. Mahalle Sınırları (Merkez İlçe Genel)
    processGeoFile("resources/tkgm/geo-files/merkez-il-merkez-ilce-geo.json", "SINIR", "MAHALLE", "Navigation", "#f59e0b");

    // 4. Mahalleleri Dosya Yollarıyla Eşleştir (TANIM_Konumlar Güncelleme)
    const mahalleDosyaEslesmeleri = [
      { ad: "ARALIK MAHALLESİ", dosya: "resources/tkgm/geo-files/Kurum_Aralık.json" },
      { ad: "CAMİ MAHALLESİ", dosya: "resources/tkgm/geo-files/Kurum_Cami.json" },
      { ad: "HABİB MAHALLESİ", dosya: "resources/tkgm/geo-files/Kurum_Habib.json" },
      { ad: "KIŞLACIK MAHALLESİ", dosya: "resources/tkgm/geo-files/Kurum_Kışlacık.json" },
      { ad: "ODA MAHALLESİ", dosya: "resources/tkgm/geo-files/Kurum_Oda.json" },
      { ad: "ORTA MAHALLESİ", dosya: "resources/tkgm/geo-files/Orta_Kurum.json" },
      { ad: "PINARGÖZÜ MAHALLESİ", dosya: "resources/tkgm/geo-files/Kurum_Pınargözü.json" },
      { ad: "YENİMAHALLE MAHALLESİ", dosya: "resources/tkgm/geo-files/Kurum_Yenimahalle.json" }
    ];

    const updateKonum = _db.prepare("UPDATE TANIM_Konumlar SET Sinir_Dosya_Yolu = ? WHERE Ad = ?");
    
    // 🛡️ BELDE SINIRI OLUŞTURMA (Mahallelerin Toplamı)
    let beldePolygon: any = null;

    mahalleDosyaEslesmeleri.forEach(item => {
      updateKonum.run(item.dosya, item.ad);

      // Kurum özel dosyalarını birleştir
      if (item.dosya.includes("Kurum") || item.dosya.includes("Orta")) {
        const fullPath = getResourcePath(item.dosya);
        if (fs.existsSync(fullPath)) {
          try {
             const geo = JSON.parse(fs.readFileSync(fullPath, "utf8"));
             const feature = geo.type === "FeatureCollection" ? geo.features[0] : geo;
             
             if (!beldePolygon) {
               beldePolygon = feature;
             } else {
               // @ts-ignore (Turf.js union)
               const unioned = turf.union(turf.featureCollection([beldePolygon, feature]));
               if (unioned) beldePolygon = unioned;
             }
          } catch (e) {
            console.error(`[DB] Union hatası (${item.ad}):`, e);
          }
        }
      }
    });

    // Belde Sınırını Kaydet
    if (beldePolygon) {
      const beldePath = "resources/tkgm/geo-files/kurum-belde-genel.json";
      const fullBeldePath = getResourcePath(beldePath);
      
      // Ensure properties are set correctly for the combined belde
      beldePolygon.properties = {
        text: "MERKEZ BELDESİ",
        id: "8edbe5a4-cc1f-4e68-8210-d609b6c959cb"
      };

      fs.writeFileSync(fullBeldePath, JSON.stringify({ type: "FeatureCollection", features: [beldePolygon] }), "utf8");
      
      // Update the Belde in TANIM_Konumlar
      updateKonum.run(beldePath, "MERKEZ BELDESİ");
      
      // Add to map layers as BELDE category
      insertLayer.run(
        "8edbe5a4-cc1f-4e68-8210-d609b6c959cb",
        "MERKEZ BELDESİ",
        "BELDE",
        JSON.stringify(beldePolygon),
        "Flag",
        "#ec4899",
        "SINIR",
        1
      );
    }
  })();

  console.log("[DB] Mahalle sınırları işlendi ve Belde Sınırı (Union) başarıyla sentezlendi.");
}
