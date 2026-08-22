/**
 * 🛡️ KURUM DOMAIN CONSTANTS
 */
export enum TableNames {
  VATANDAS = 'DATA_Vatandas',
  TAPU = 'DATA_Tapu_Verisi',
  MEVKI = 'DATA_Tasinmaz_Mevkileri',
  BOLGE = 'DATA_Dagitim_Bolgeleri',
  PERSONEL = 'TANIM_Personel',
  MERAV = 'TANIM_Meravlar',
  TAHSILAT = 'MUHASEBE_Tahsilat',
  TAHAKKUK = 'MUHASEBE_Tahakkuk',
  LEDGERS = 'DATA_Dagitim_Donemleri',
  VERGI = 'TANIM_Vergi_Oranlari',
  FAIZ = 'TANIM_Faiz_Oranlari'
}

/**
 * 🛡️ CONFIGURATION INTERFACES
 */
export interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
}

export interface RecordConfig {
  validate: (values: any, context?: any) => ValidationResult;
  prepare?: (values: any) => any;
  loadProfile?: (id: string, api: any, values?: any) => Promise<any>;
  initialValues?: (table: string) => any;
  enrichData?: (records: any[], api: any) => Promise<any[]>;
}

/**
 * 🛡️ TABLE-SPECIFIC CONFIGURATIONS (Separation of Concerns)
 */
export const RECORD_CONFIGS: Record<string, RecordConfig> = {
  [TableNames.VATANDAS]: {
    validate: (v, ctx) => {
      const missing = [];
      if (!v) return { isValid: false, missingFields: [] };

      // Sadece veritabanı düzeyindeki mükerrer çakışmaları engelle
      if (ctx?.tcknError && ctx?.tcknErrorMessage?.includes("MEVCUT")) {
        missing.push("TCKN ÇAKIŞMASI");
      }
      if (ctx?.sicilError && ctx?.sicilErrorMessage?.includes("MEVCUT")) {
        missing.push("SİCİL NO ÇAKIŞMASI");
      }

      return { isValid: missing.length === 0, missingFields: missing };
    },
    loadProfile: async (id, api, values) => {
      let tckn = values?.TCKN;
      
      if (!tckn) {
        const citizenRes = await api.executeRaw(`SELECT TCKN FROM DATA_Vatandas WHERE id = ?`, [id]);
        if (citizenRes.success && citizenRes.data?.length > 0) {
          tckn = citizenRes.data[0].TCKN;
        } else {
          tckn = id;
        }
      }

      const [lands, sulama, tahakkuk, tahsilat] = await Promise.all([
        api.getCitizenLands(tckn),
        api.executeRaw(`
          SELECT 
            k.*, 
            d.Donem_Adi, 
            d.Baslangic_Yili as Yil, 
            loc.Ad as Mahalle_Adi,
            mv.Mevki_Adi,
            t.Ada,
            t.Parsel,
            (
              SELECT 
                CASE 
                  WHEN (th.Miktar - COALESCE((SELECT SUM(ts.Miktar) FROM MUHASEBE_Tahsilat ts WHERE ts.Tahakkuk_id = th.id AND ts.deleted_at IS NULL), 0)) <= 0 THEN 'Ödendi'
                  WHEN COALESCE((SELECT SUM(ts.Miktar) FROM MUHASEBE_Tahsilat ts WHERE ts.Tahakkuk_id = th.id AND ts.deleted_at IS NULL), 0) > 0 THEN 'Kısmi'
                  ELSE 'Bekliyor'
                END
              FROM MUHASEBE_Tahakkuk th WHERE th.Fis_id = k.id AND th.deleted_at IS NULL LIMIT 1
            ) as Odeme_Durumu
          FROM DATA_Dagitim_Kayitlar k 
          LEFT JOIN DATA_Dagitim_Donemleri d ON k.Donem_id = d.id 
          LEFT JOIN DATA_Dagitim_Bolgeleri b ON COALESCE(k.Bolge_id, d.Bolge_id) = b.id 
          LEFT JOIN TANIM_Konumlar loc ON b.Mahalle_id = loc.id
          LEFT JOIN DATA_Tapu_Verisi t ON k.Tasinmaz_id = t.id
          LEFT JOIN DATA_Tasinmaz_Mevkileri mv ON t.Mevki_id = mv.id
          WHERE k.Vatandas_Id IN (?, ?) AND k.deleted_at IS NULL 
          ORDER BY k.Tarih DESC`, [id, tckn]),
        api.executeRaw(`
          SELECT 
            t.*, 
            t.Miktar as Toplam_Tutar,
            d.Donem_Adi, 
            d.Baslangic_Yili as Yil,
            mv.Mevki_Adi,
            tapu.Ada,
            tapu.Parsel,
            v.Ad as Vatandas_Ad,
            v.Soyad as Vatandas_Soyad,
            v.TCKN as Vatandas_TCKN,
            CASE
              WHEN t.Durum = 'Ödendi' THEN 0
              ELSE (t.Miktar - COALESCE((SELECT SUM(ts.Miktar) FROM MUHASEBE_Tahsilat ts WHERE ts.Tahakkuk_id = t.id AND ts.deleted_at IS NULL), 0))
            END as Kalan_Borc,
            CASE 
              WHEN t.Durum = 'Ödendi' THEN 'Ödendi'
              WHEN (t.Miktar - COALESCE((SELECT SUM(ts.Miktar) FROM MUHASEBE_Tahsilat ts WHERE ts.Tahakkuk_id = t.id AND ts.deleted_at IS NULL), 0)) <= 0 THEN 'Ödendi'
              WHEN COALESCE((SELECT SUM(ts.Miktar) FROM MUHASEBE_Tahsilat ts WHERE ts.Tahakkuk_id = t.id AND ts.deleted_at IS NULL), 0) > 0 THEN 'Kısmi'
              ELSE 'Bekliyor'
            END as Durum
          FROM MUHASEBE_Tahakkuk t 
          LEFT JOIN DATA_Dagitim_Donemleri d ON t.Donem_id = d.id 
          LEFT JOIN DATA_Tapu_Verisi tapu ON t.Tasinmaz_id = tapu.id
          LEFT JOIN DATA_Tasinmaz_Mevkileri mv ON tapu.Mevki_id = mv.id
          LEFT JOIN DATA_Vatandas v ON t.Vatandas_Id = v.id
          WHERE t.Vatandas_Id IN (?, ?) AND t.deleted_at IS NULL
          ORDER BY t.created_at DESC`, [id, tckn]),
        api.executeRaw(`
          SELECT 
            ts.*, 
            d.Donem_Adi, 
            d.Baslangic_Yili as Yil,
            th.Miktar as Tahakkuk_Miktari
          FROM MUHASEBE_Tahsilat ts 
          LEFT JOIN DATA_Dagitim_Donemleri d ON ts.Donem_id = d.id 
          LEFT JOIN MUHASEBE_Tahakkuk th ON ts.Tahakkuk_id = th.id
          WHERE ts.Vatandas_Id IN (?, ?) AND ts.deleted_at IS NULL 
          ORDER BY ts.Tarih DESC`, [id, tckn])
      ]);

      return { 
        lands: lands.success ? lands.data : [],
        sulama: sulama.success ? sulama.data : [],
        tahakkuk: tahakkuk.success ? tahakkuk.data : [],
        tahsilat: tahsilat.success ? tahsilat.data : []
      };
    }
  },
  [TableNames.TAPU]: {
    validate: (v) => {
      if (!v) return { isValid: false, missingFields: ["VERİ YÜKLENİYOR..."] };
      return { isValid: true, missingFields: [] };
    },
    prepare: (v) => {
      const { TCKN_Confirmed, Sicil_Confirmed, _Mevki_Temp_Name, Hissedarlar_JSON, Ilgili_Kisiler_JSON, ...rawTapuData } = v;
      const shareholders = typeof Hissedarlar_JSON === 'string' ? JSON.parse(Hissedarlar_JSON || '[]') : (Hissedarlar_JSON || []);
      const caretakers = typeof Ilgili_Kisiler_JSON === 'string' ? JSON.parse(Ilgili_Kisiler_JSON || '[]') : (Ilgili_Kisiler_JSON || []);

      // 🛡️ Sarsılmaz Boolean Normalizasyonu (1/0)
      rawTapuData.Kanal_Seviyesi_Altinda = !!rawTapuData.Kanal_Seviyesi_Altinda ? 1 : 0;
      rawTapuData.Kanal_Suyu_Ile_Sulanan = !!rawTapuData.Kanal_Suyu_Ile_Sulanan ? 1 : 0;

      return {
        tapuData: rawTapuData,
        owners: shareholders.map((h: any) => ({
          Vatandas_Id: h.Vatandas_Id || h.TCKN || h.id || h.value,
          Rol: h.Rol || 'HİSSEDAR',
          Hisse_Pay: h.Hisse_Pay || 1,
          Hisse_Payda: h.Hisse_Payda || 1,
          Mulk_Tipi: h.Mulk_Tipi || 'PAYLI MÜLKİYET'
        })).filter((o: any) => o.Vatandas_Id),
        zilyet: caretakers.length > 0 ? {
          Vatandas_Id: caretakers[0].Vatandas_Id || caretakers[0].TCKN || caretakers[0].id || caretakers[0].value,
          Rol: caretakers[0].Rol || 'BAKICI',
          Beyan_Tarihi: caretakers[0].Beyan_Tarihi,
          Aciklama: caretakers[0].Aciklama
        } : undefined
      };
    },
    loadProfile: async (id, api) => {
      const [o, z, sulama, tahakkuk, tahsilat] = await Promise.all([
        api.getTapuOwners(id), 
        api.getTapuZilyetler(id),
        api.executeRaw(`
          SELECT 
            k.*, 
            d.Donem_Adi, 
            d.Baslangic_Yili as Yil, 
            loc.Ad as Mahalle_Adi,
            mv.Mevki_Adi,
            t.Ada,
            t.Parsel,
            (
              SELECT 
                CASE 
                  WHEN (th.Miktar - COALESCE((SELECT SUM(ts.Miktar) FROM MUHASEBE_Tahsilat ts WHERE ts.Tahakkuk_id = th.id AND ts.deleted_at IS NULL), 0)) <= 0 THEN 'Ödendi'
                  WHEN COALESCE((SELECT SUM(ts.Miktar) FROM MUHASEBE_Tahsilat ts WHERE ts.Tahakkuk_id = th.id AND ts.deleted_at IS NULL), 0) > 0 THEN 'Kısmi'
                  ELSE 'Bekliyor'
                END
              FROM MUHASEBE_Tahakkuk th WHERE th.Fis_id = k.id AND th.deleted_at IS NULL LIMIT 1
            ) as Odeme_Durumu
          FROM DATA_Dagitim_Kayitlar k 
          LEFT JOIN DATA_Dagitim_Donemleri d ON k.Donem_id = d.id 
          LEFT JOIN DATA_Dagitim_Bolgeleri b ON COALESCE(k.Bolge_id, d.Bolge_id) = b.id 
          LEFT JOIN TANIM_Konumlar loc ON b.Mahalle_id = loc.id
          LEFT JOIN DATA_Tapu_Verisi t ON k.Tasinmaz_id = t.id
          LEFT JOIN DATA_Tasinmaz_Mevkileri mv ON t.Mevki_id = mv.id
          WHERE k.Tasinmaz_id = ? AND k.deleted_at IS NULL 
          ORDER BY k.Tarih DESC`, [id]),
        api.executeRaw(`
          SELECT 
            t.*, 
            t.Miktar as Toplam_Tutar,
            d.Donem_Adi, 
            d.Baslangic_Yili as Yil,
            mv.Mevki_Adi,
            COALESCE(tapu.Ada, src_tapu.Ada) as Ada,
            COALESCE(tapu.Parsel, src_tapu.Parsel) as Parsel,
            v.Ad as Vatandas_Ad,
            v.Soyad as Vatandas_Soyad,
            v.TCKN as Vatandas_TCKN,
            CASE
              WHEN t.Durum = 'Ödendi' THEN 0
              ELSE (t.Miktar - COALESCE((SELECT SUM(ts.Miktar) FROM MUHASEBE_Tahsilat ts WHERE ts.Tahakkuk_id = t.id AND ts.deleted_at IS NULL), 0))
            END as Kalan_Borc,
            CASE 
              WHEN t.Durum = 'Ödendi' THEN 'Ödendi'
              WHEN (t.Miktar - COALESCE((SELECT SUM(ts.Miktar) FROM MUHASEBE_Tahsilat ts WHERE ts.Tahakkuk_id = t.id AND ts.deleted_at IS NULL), 0)) <= 0 THEN 'Ödendi'
              WHEN COALESCE((SELECT SUM(ts.Miktar) FROM MUHASEBE_Tahsilat ts WHERE ts.Tahakkuk_id = t.id AND ts.deleted_at IS NULL), 0) > 0 THEN 'Kısmi'
              ELSE 'Bekliyor'
            END as Durum
          FROM MUHASEBE_Tahakkuk t 
          LEFT JOIN DATA_Dagitim_Donemleri d ON t.Donem_id = d.id 
          LEFT JOIN DATA_Tapu_Verisi tapu ON t.Tasinmaz_id = tapu.id
          LEFT JOIN DATA_Tapu_Verisi src_tapu ON src_tapu.id = ?
          LEFT JOIN DATA_Tasinmaz_Mevkileri mv ON COALESCE(tapu.Mevki_id, src_tapu.Mevki_id) = mv.id
          LEFT JOIN DATA_Vatandas v ON t.Vatandas_Id = v.id
          WHERE (
            t.Tasinmaz_id = ? 
            OR t.Vatandas_Id IN (
              SELECT Vatandas_Id FROM REL_TASINMAZ_VATANDAS 
              WHERE Tasinmaz_id = ? AND (deleted_at IS NULL OR deleted_at = '')
            )
          ) AND t.deleted_at IS NULL
          ORDER BY t.created_at DESC`, [id, id, id]),
        api.executeRaw(`
          SELECT ts.*, d.Donem_Adi, d.Baslangic_Yili as Yil 
          FROM MUHASEBE_Tahsilat ts 
          LEFT JOIN DATA_Dagitim_Donemleri d ON ts.Donem_id = d.id 
          LEFT JOIN MUHASEBE_Tahakkuk t ON ts.Tahakkuk_id = t.id 
          WHERE (
            ts.Tasinmaz_id = ? 
            OR ts.Vatandas_Id IN (
              SELECT Vatandas_Id FROM REL_TASINMAZ_VATANDAS 
              WHERE Tasinmaz_id = ? AND (deleted_at IS NULL OR deleted_at = '')
            )
          ) AND ts.deleted_at IS NULL 
          ORDER BY ts.Tarih DESC`, [id, id])
      ]);

      return { 
        owners: o.success ? o.data : [], 
        zilyetler: z.success ? z.data : [],
        sulama: sulama.success ? sulama.data : [],
        tahakkuk: tahakkuk.success ? tahakkuk.data : [],
        tahsilat: tahsilat.success ? tahsilat.data : []
      };
    },
    initialValues: () => ({ 
      Sahip_Turu: 'Tam', 
      Hisse_Pay: 1, 
      Hisse_Payda: 1,
      Kanal_Seviyesi_Altinda: true,
      Kanal_Suyu_Ile_Sulanan: true
    }),
    enrichData: async (records: any[], api: any) => {
      if (records.length === 0) return records;
      const ids = records.map(r => `'${r.id}'`).join(',');
      
      const statsRes = await api.executeRaw(`
        SELECT 
          t.id,
          (SELECT COUNT(*) FROM REL_Tapu_Vatandas WHERE Tapu_id = t.id AND Rol = 'HİSSEDAR' AND deleted_at IS NULL) as Hissedar_Sayisi,
          (SELECT (v.Ad || ' ' || v.Soyad) FROM REL_Tapu_Vatandas r JOIN DATA_Vatandas v ON r.Vatandas_Id = v.id WHERE r.Tapu_id = t.id AND r.Rol = 'BAKICI' AND r.deleted_at IS NULL LIMIT 1) as Bakici_Ad_Soyad,
          (SELECT SUM(Sure_Saat) FROM DATA_Dagitim_Kayitlar WHERE Tasinmaz_id = t.id AND deleted_at IS NULL) as Toplam_Sulama_Saat,
          (SELECT SUM(Miktar) FROM MUHASEBE_Tahakkuk WHERE Tasinmaz_id = t.id AND deleted_at IS NULL) as Toplam_Tahakkuk,
          (SELECT SUM(ts.Miktar) FROM MUHASEBE_Tahsilat ts JOIN MUHASEBE_Tahakkuk th ON ts.Tahakkuk_id = th.id WHERE th.Tasinmaz_id = t.id AND ts.deleted_at IS NULL AND th.deleted_at IS NULL) as Toplam_Tahsilat
        FROM DATA_Tapu_Verisi t
        WHERE t.id IN (${ids})
      `);

      if (statsRes.success) {
        const lookup = statsRes.data.reduce((acc: any, curr: any) => {
          acc[curr.id] = curr;
          return acc;
        }, {});
        
        return records.map(r => ({
          ...r,
          ...(lookup[r.id] || {})
        }));
      }
      return records;
    }
  },
  [TableNames.MEVKI]: {
    validate: (v) => {
      if (!v) return { isValid: false, missingFields: [] };
      return {
        isValid: true,
        missingFields: []
      };
    },
    prepare: (v) => ({
       id: v.id,
       Mevki_Adi: v.Mevki_Adi?.toLocaleUpperCase('tr-TR'),
       Konum_id: v.Konum_id,
       Il: v.Il,
       Ilce: v.Ilce,
       Belde: v.Belde,
       Mahalle_Koy: v.Mahalle_Koy,
       Bolge_Tipi: v.Bolge_Tipi,
       Altyapi_Durumu: v.Altyapi_Durumu,
       Aciklama: v.Aciklama
    }),
    loadProfile: async (id, api) => {
       const tapuRes = await api.executeRaw(`
         SELECT 
           t.*, 
           (v.Ad || ' ' || v.Soyad) as Tapu_Sahibi_Ad_Soyad
         FROM DATA_Tapu_Verisi t
         LEFT JOIN DATA_Vatandas v ON t.Vatandas_Id = v.id
         WHERE t.Mevki_id = ? AND (t.deleted_at IS NULL OR t.deleted_at = '')
         ORDER BY t.Ada, t.Parsel
       `, [id]);
       
       return {
         lands: tapuRes.success ? tapuRes.data : []
       };
    }
  },
  [TableNames.PERSONEL]: {
    validate: (v) => {
      if (!v) return { isValid: false, missingFields: [] };
      return {
        isValid: true,
        missingFields: []
      };
    },
    initialValues: () => ({
      Unvan: 'Tahsildar',
      Aktif: 1
    }),
    prepare: (v) => {
      const { Ad_Soyad, ...clean } = v;
      return clean;
    }
  },
  [TableNames.MERAV]: {
    validate: (v) => {
      if (!v) return { isValid: false, missingFields: [] };
      return { isValid: true, missingFields: [] };
    },
    initialValues: () => ({
      Aktif: 1
    }),
    prepare: (v) => {
      const { Ad_Soyad, ...clean } = v;
      return clean;
    },
    loadProfile: async (id: string, api: any) => {
      const meravRes = await api.executeRaw(`
        SELECT m.id, 
               m.Vatandas_Id as Vatandas_Id,
               m.Telefon as Telefon,
               m.Aktif as Aktif,
               COALESCE(v.Ad, '') || ' ' || COALESCE(v.Soyad, '') as Ad_Soyad, 
               v.Adres as Vatandas_Adres,
               m.created_at
        FROM TANIM_Meravlar m
        LEFT JOIN DATA_Vatandas v ON m.Vatandas_Id = v.id
        WHERE m.id = ? OR m.Vatandas_Id = ?
      `, [id, id]);

      const record = meravRes.success && meravRes.data?.length > 0 ? meravRes.data[0] : null;

      const assignRes = await api.executeRaw(`
        SELECT r.*, 
               k.Ad as Mahalle_Adi, 
               k.id as Mahalle_id,
               k.Tip as Mahalle_Tip,
               d.Defter_Adi,
               d.Baslangic_Yili
        FROM REL_Defter_Merav r
        LEFT JOIN DATA_Dagitim_Donemleri d ON r.Defter_id = d.id
        LEFT JOIN DATA_Dagitim_Bolgeleri b ON d.Bolge_id = b.id
        LEFT JOIN TANIM_Konumlar k ON b.Mahalle_id = k.id
        WHERE r.Merav_id = ? OR r.Merav_id = (SELECT id FROM TANIM_Meravlar WHERE Vatandas_Id = ?)
      `, [id, id]);

      const statsSummaryRes = await api.executeRaw(`
        SELECT 
          COUNT(DISTINCT k.Vatandas_Id) as toplamVatandas,
          COUNT(DISTINCT k.Tasinmaz_id) as toplamParsel,
          SUM(k.Toplam_Tutar) as toplamTahakkuk
        FROM DATA_Dagitim_Kayitlar k
        WHERE (k.Merav_id = ? OR k.Merav_id = (SELECT id FROM TANIM_Meravlar WHERE Vatandas_Id = ?))
        AND k.deleted_at IS NULL
      `, [id, id]);

      const fisRes = await api.executeRaw(`
        SELECT k.*, d.Baslangic_Yili as Yil, loc.Ad as Mahalle_Adi, mv.Mevki_Adi
        FROM DATA_Dagitim_Kayitlar k
        LEFT JOIN DATA_Dagitim_Donemleri d ON k.Donem_id = d.id
        LEFT JOIN DATA_Dagitim_Bolgeleri b ON d.Bolge_id = b.id
        LEFT JOIN TANIM_Konumlar loc ON b.Mahalle_id = loc.id
        LEFT JOIN DATA_Tapu_Verisi t ON k.Tasinmaz_id = t.id
        LEFT JOIN DATA_Tasinmaz_Mevkileri mv ON t.Mevki_id = mv.id
        WHERE (k.Merav_id = ? OR k.Merav_id = (SELECT id FROM TANIM_Meravlar WHERE Vatandas_Id = ?))
        AND k.deleted_at IS NULL
        ORDER BY k.Tarih DESC LIMIT 100
      `, [id, id]);

      const kocanRes = await api.executeRaw(`
        SELECT k.*, d.Baslangic_Yili as Yil, loc.Ad as Mahalle_Adi
        FROM TANIM_Sulama_Fis_Kocanlari k
        LEFT JOIN DATA_Dagitim_Donemleri d ON k.Donem_id = d.id
        LEFT JOIN DATA_Dagitim_Bolgeleri b ON d.Bolge_id = b.id
        LEFT JOIN TANIM_Konumlar loc ON b.Mahalle_id = loc.id
        WHERE k.Sorumlu_Merav_id = ? OR k.Sorumlu_Merav_id = (SELECT id FROM TANIM_Meravlar WHERE Vatandas_Id = ?)
        ORDER BY k.created_at DESC
      `, [id, id]);

      const neighborhood = assignRes.success && assignRes.data?.length > 0 ? assignRes.data[0] : null;
      const statsSummary = statsSummaryRes.success ? statsSummaryRes.data[0] : { toplamVatandas: 0, toplamParsel: 0, toplamTahakkuk: 0 };

      return {
        ...record,
        _mainRecord: { 
          ...record, 
          Mahalle_id: neighborhood?.Mahalle_id || null 
        },
        assignments: assignRes.data || [],
        fisler: fisRes.success ? fisRes.data : [],
        kocanlar: kocanRes.success ? kocanRes.data : [],
        statsSummary
      };
    },
    enrichData: async (records: any[], api: any) => {
      const enriched = await Promise.all(records.map(async (r) => {
          const relRes = await api.executeRaw(`
            SELECT DISTINCT k.Ad 
            FROM REL_Defter_Merav rel
            JOIN DATA_Dagitim_Donemleri d ON rel.Defter_id = d.id
            JOIN DATA_Dagitim_Bolgeleri b ON d.Bolge_id = b.id
            JOIN TANIM_Konumlar k ON b.Mahalle_id = k.id
            WHERE rel.Merav_id = ? AND rel.deleted_at IS NULL
          `, [r.id]);

         const mahalleler = relRes.success ? relRes.data.map((m: any) => m.Ad).join(", ") : "";
         
         return {
            ...r,
            Sorumlu_Mahalleler: mahalleler || null
         };
      }));
      return enriched;
    }
  },
  [TableNames.BOLGE]: {
    validate: (v) => ({
      isValid: true,
      missingFields: []
    }),
    prepare: (v) => ({
       id: v.id,
       Mahalle_id: v.Mahalle_id,
       Durum: v.Durum || 'AKTİF',
       Tip: v.Tip || 'SULAMA'
    })
  },
  "DATA_Dagitim_Kayitlar": {
    validate: (v) => ({ isValid: true, missingFields: [] }),
    enrichData: async (records: any[], api: any) => {
      if (records.length === 0) return records;
      const ids = records.map(r => `'${r.id}'`).join(',');
      const res = await api.executeRaw(`
        SELECT 
          k.id,
          (v.Ad || ' ' || v.Soyad) as Ad_Soyad,
          loc.Ad as Mahalle_Adi,
          loc.id as Real_Mahalle_id,
          d.Donem_Adi,
          d.Baslangic_Yili
        FROM DATA_Dagitim_Kayitlar k
        LEFT JOIN DATA_Vatandas v ON (k.Vatandas_Id = v.id OR k.Vatandas_Id = v.TCKN)
        LEFT JOIN DATA_Dagitim_Donemleri d ON k.Donem_id = d.id
        LEFT JOIN DATA_Dagitim_Bolgeleri b ON COALESCE(k.Bolge_id, d.Bolge_id) = b.id
        LEFT JOIN TANIM_Konumlar loc ON b.Mahalle_id = loc.id
        WHERE k.id IN (${ids})
      `);

      if (res.success) {
        const lookup = res.data.reduce((acc: any, curr: any) => {
          acc[curr.id] = curr;
          return acc;
        }, {});
        return records.map(r => ({
          ...r,
          ...(lookup[r.id] || {})
        }));
      }
      return records;
    }
  },
  [TableNames.VERGI]: {
    validate: (v) => ({
      isValid: true,
      missingFields: []
    }),
    initialValues: () => ({ is_active: 1, vergi_orani: 0.20 })
  },
  [TableNames.FAIZ]: {
    validate: (v) => ({
      isValid: true,
      missingFields: []
    }),
    initialValues: () => ({ is_active: 1, faiz_orani: 0.05, periyot: 'AYLIK' })
  }
};
