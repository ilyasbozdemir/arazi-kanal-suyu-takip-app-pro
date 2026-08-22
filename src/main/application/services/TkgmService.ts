import { Database } from 'better-sqlite3';
import { Logger } from '../../logger';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';

/**
 * 🛡️ TKGM SERVICE (KURUM CBS ENTEGRASYON KATMANI)
 * Bu servis, Tapu ve Kadastro Genel Müdürlüğü MEGSİS API'leri ile olan tüm iletişimi yönetir.
 * Bütün istekler sarsılmaz bir nizamla Referer kontrolü ve Proxy üzerinden geçirilmelidir.
 */

const MEGSIS_BASE_URL = 'https://cbsapi.tkgm.gov.tr/megsiswebapi.v3.1/api';

const tkgmHeaders = {
  'Referer': 'https://parselsorgu.tkgm.gov.tr/',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Origin': 'https://parselsorgu.tkgm.gov.tr',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-site'
};

export class TkgmService {
  constructor(private db: Database) {}

  /**
   * 🗺️ İlçe Listesini Çeker
   */
  async getDistricts(ilId: number) {
    try {
      const response = await fetch(`${MEGSIS_BASE_URL}/idariYapi/ilceListe/${ilId}`, { headers: tkgmHeaders });
      if (!response.ok) throw new Error(`TKGM İlçe Servis Hatası: ${response.status}`);
      return await response.json();
    } catch (e: any) {
      Logger.error('TKGM_SERVICE', `İlçe listesi alınamadı: ${e.message}`);
      throw e;
    }
  }

  /**
   * 🏡 Mahalle/Köy Listesini Çeker
   */
  async getNeighborhoods(ilceId: number) {
    try {
      const response = await fetch(`${MEGSIS_BASE_URL}/idariYapi/mahalleListe/${ilceId}`, { headers: tkgmHeaders });
      if (!response.ok) throw new Error(`TKGM Mahalle Servis Hatası: ${response.status}`);
      return await response.json();
    } catch (e: any) {
      Logger.error('TKGM_SERVICE', `Mahalle listesi alınamadı: ${e.message}`);
      throw e;
    }
  }

  /**
   * 🔍 Parsel Detayı ve Geometrisini Çeker
   */
  async getParcel(mahalleId: number, ada: string, parsel: string) {
    try {
      if (!mahalleId || !ada || !parsel) throw new Error("Gerekli teknik ID (Mahalle/Ada/Parsel) bilgisi eksik.");
      
      const url = `${MEGSIS_BASE_URL}/parsel/${mahalleId}/${ada}/${parsel}`;
      const response = await fetch(url, { headers: tkgmHeaders });
      
      if (!response.ok) {
        if (response.status === 404) throw new Error("TKGM Kayıtlarında Bulunamadı (404)");
        throw new Error(`TKGM Parsel Servis Hatası: ${response.status}`);
      }
      
      return await response.json();
    } catch (e: any) {
      Logger.error('TKGM_SERVICE', `Parsel sorgu hatası: ${e.message}`);
      throw e;
    }
  }

  /**
   * 📍 Koordinatla Parsel Sorgula (Identify)
   */
  async identifyParcel(lat: number, lng: number) {
    try {
      const url = `${MEGSIS_BASE_URL}/parsel/${lat}/${lng}/`;
      const response = await fetch(url, { headers: tkgmHeaders });
      if (!response.ok) throw new Error(`TKGM Identify Hatası: ${response.status}`);
      return await response.json();
    } catch (e: any) {
      Logger.error('TKGM_SERVICE', `Identify hatası: ${e.message}`);
      throw e;
    }
  }

  /**
   * 📄 PDF Belgesi İndirir ve Dosya Sistemine Kaydeder
   */
  async downloadParcelPdf(mahalleId: string | number, ada: string, parsel: string, tapuId: string) {
    try {
      if (!mahalleId || !ada || !parsel) throw new Error("İndirme için gerekli mahalle/ada/parsel teknik ID bilgisi eksik.");

      const url = `${MEGSIS_BASE_URL}/parsel/download/${mahalleId}/${ada}/${parsel}/pdf`;
      Logger.info('TKGM_PDF', `Belge indiriliyor: ${url}`);
      
      const response = await fetch(url, { headers: tkgmHeaders });
      if (!response.ok) throw new Error(`TKGM PDF Servis Hatası: ${response.status}`);
      
      const buffer = Buffer.from(await response.arrayBuffer());
      
      const pdfDir = path.join(app.getPath('userData'), 'data', 'attachments', 'pdfs');
      if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });
      
      const fileName = `TAPU_${ada}_${parsel}_${Date.now()}.pdf`;
      const filePath = path.join(pdfDir, fileName);
      
      fs.writeFileSync(filePath, buffer);
      
      // Veritabanındaki dosya yolunu güncelle
      this.db.prepare('UPDATE DATA_Tapu_Verisi SET Pdf_Dosya_Yolu = ? WHERE id = ?').run(filePath, tapuId);
      
      return filePath;
    } catch (e: any) {
      Logger.error('TKGM_SERVICE', `PDF indirme hatası: ${e.message}`);
      throw e;
    }
  }

  /**
   * 🛡️ TKGM İndirme URL'si Oluşturur
   */
  async getDownloadUrl(mahalleId: string | number, ada: string, parsel: string, format: string = 'pdf', tapuId?: string) {
    let technicalId = mahalleId;

    // 🛡️ Eğer mahalleId teknik bir kod değilse (veya eksikse) veritabanından bulmaya çalış
    if (tapuId && (!technicalId || isNaN(Number(technicalId)))) {
      const resolved = this.resolveMahalleTechnicalId(tapuId);
      if (resolved) {
        technicalId = resolved;
        Logger.info('TKGM_MAPPING', `ID Çözüldü: Tapu:${tapuId} -> TGKM_Kod:${technicalId}`);
      }
    }

    if (!technicalId || isNaN(Number(technicalId))) {
      throw new Error("Geçerli bir TKGM Mahalle Kodu (Teknik ID) bulunamadı. Lütfen Mevki/Konum ayarlarını kontrol edin.");
    }

    return `${MEGSIS_BASE_URL}/parsel/download/${technicalId}/${ada}/${parsel}/${format}`;
  }

  /**
   * 🛡️ Veritabanı Üzerinden Mahalle Teknik ID'sini Çözer
   */
  resolveMahalleTechnicalId(tapuId: string): number | null {
    try {
      // 🛡️ Sarsılmaz İlişkisel Sorgu: Tapu -> Mevki -> Konum (TGKM_Kod)
      const query = `
        SELECT k.TGKM_Kod 
        FROM DATA_Tapu_Verisi t
        JOIN DATA_Tasinmaz_Mevkileri m ON t.Mevki_id = m.id
        JOIN TANIM_Konumlar k ON m.Konum_id = k.id
        WHERE t.id = ?
      `;
      const row = this.db.prepare(query).get(tapuId) as any;
      
      if (!row || !row.TGKM_Kod) {
        // Fallback: Eğer tapu_id gelmediyse ama mahalle_id (konum_id) geldiyse onu dene
        const fallbackQuery = `SELECT TGKM_Kod FROM TANIM_Konumlar WHERE id = ?`;
        const fallbackRow = this.db.prepare(fallbackQuery).get(tapuId) as any;
        return fallbackRow ? Number(fallbackRow.TGKM_Kod) : null;
      }

      return Number(row.TGKM_Kod);
    } catch (e: any) {
      Logger.error('TKGM_MAPPING', `Mapping hatası [TapuID: ${tapuId}]: ${e.message}`);
      return null;
    }
  }
}
