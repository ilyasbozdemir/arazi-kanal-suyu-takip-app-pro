import { IUnitOfWork } from '@core/interfaces';
import crypto from 'crypto';
import { TableNames } from '@core/constants/TableNames';

/**
 * 🛡️ ACCOUNTING SERVICE (Command Handler Pattern)
 * Handles financial transactions, water bills, and accruals.
 */
export class AccountingService {
  constructor(private uow: IUnitOfWork) {}

  /**
   * 🪄 SAVE WATER BILL (Su Fişi)
   * Automatically creates an accrual (tahakkuk) record.
   */
  async saveWaterBill(data: any, table: string): Promise<{ success: boolean; id: string }> {
    return (this.uow as any).executeTransaction((uow: any) => {
      const id = data.id || crypto.randomUUID();
      const billData = { ...data, id };

      // 1. Save only core operational data to the centralized table
      const operationalFields = [
        'id', 'Donem_id', 'Bolge_id', 'Tasinmaz_id', 'Vatandas_Id', 'Merav_id', 
        'Tarih', 'Baslangic_Saati', 'Bitis_Saati', 'Kullanim_Saati', 
        'Sure_Saat', 'Tarife_Modu', 'Birim_Fiyat', 
        'Toplam_Tutar', 'Makbuz_Defter_id', 'Makbuz_No', 'Aciklama'
      ];
      
      const cleanBillData: any = {};
      operationalFields.forEach(field => {
        if (billData[field] !== undefined) cleanBillData[field] = billData[field];
      });

      uow.getRepository(table).save(cleanBillData);

      // 2. Auto-generate Accrual (Tahakkuk) - Explicit logic via TCKN
      const tahakkukId = crypto.randomUUID();
      // 🛡️ Resolve Vatandas_Id: If it's a TCKN, find the GUID id
      let vatandasGuid = data.Vatandas_Id;
      if (vatandasGuid && vatandasGuid.length === 11 && !vatandasGuid.includes('-')) {
        const row = uow.db.prepare('SELECT id FROM DATA_Vatandas WHERE TCKN = ?').get(vatandasGuid) as any;
        if (row) vatandasGuid = row.id;
      }

      uow.getRepository(TableNames.TAHAKKUK).save({
        id: tahakkukId,
        Fis_id: id,
        Donem_id: data.Donem_id, // 🛡️ SİCİL DEFTERİNE BAĞLANDI (Yeni Şema)
        Donem_Yili: data.Donem_Yili || new Date().getFullYear().toString(),
        Vatandas_Id: vatandasGuid,
        Tasinmaz_id: data.Tasinmaz_id,
        Miktar: data.Toplam_Tutar || 0,
        Tarih: data.Tarih || new Date().toISOString()
      });

      return { success: true, id };
    });
  }

  /**
   * 🪄 SAVE COLLECTION (Tahsilat)
   * Automatically updates Accrual status, Bill status, and Cash balance.
   * Enforces 1:1 Reconciliation (Mutabakat) logic.
   */
  async saveCollection(data: any): Promise<{ success: boolean; id: string }> {
    return (this.uow as any).executeTransaction((uow: any) => {
      const collectionId = data.id || crypto.randomUUID();
      const miktar = parseFloat(data.Miktar || 0);
      const fisId = crypto.randomUUID(); // Ana muhasebe fiş ID'si
      
      let finalData = { ...data, id: collectionId, Fis_id: fisId };
      
      // 🛡️ Resolve Vatandas_Id
      if (finalData.Vatandas_Id && finalData.Vatandas_Id.length === 11 && !finalData.Vatandas_Id.includes('-')) {
        const row = uow.db.prepare('SELECT id FROM DATA_Vatandas WHERE TCKN = ?').get(finalData.Vatandas_Id) as any;
        if (row) finalData.Vatandas_Id = row.id;
      }

      // 🛡️ 1:1 MUTABAKAT ZORUNLULUĞU
      let tahakkukId = finalData.Tahakkuk_id;
      if (tahakkukId) {
        const exists = uow.db.prepare(`SELECT id FROM ${TableNames.TAHAKKUK} WHERE id = ?`).get(tahakkukId);
        if (!exists) tahakkukId = null;
      }

      // Eğer tahakkuk yoksa, anında bir tahakkuk oluştur (Peşin Tahsilat)
      if (!tahakkukId) {
        tahakkukId = crypto.randomUUID();
        uow.getRepository(TableNames.TAHAKKUK).save({
          id: tahakkukId,
          Vatandas_Id: finalData.Vatandas_Id,
          Miktar: miktar,
          Tarih: data.Tarih || new Date().toISOString(),
          Tur: 'ANA_BORC',
          Durum: 'Ödendi',
          Donem_Yili: new Date().getFullYear().toString(),
          Aciklama: 'PEŞİN TAHSİLAT TAHAKKUKU'
        });
        finalData.Tahakkuk_id = tahakkukId;
      }

      // 1. Ana Tahsilatı Kaydet
      uow.getRepository('MUHASEBE_Tahsilat').save(finalData);

      let toplamIslemTutari = miktar;
      let faizMiktari = 0;

      // 🛡️ FAİZ HESAPLAMA (Ayrı Kalem)
      let tahakkuk = uow.getRepository(TableNames.TAHAKKUK).getById(tahakkukId) as any;
      if (tahakkuk && tahakkuk.Tur === 'ANA_BORC') {
        const vadesi = new Date(tahakkuk.Tarih);
        const bugun = new Date();
        const gecikenGun = Math.floor((bugun.getTime() - vadesi.getTime()) / (1000 * 60 * 60 * 24));

        if (gecikenGun > 0) {
          const faizRow = uow.db.prepare("SELECT faiz_orani, periyot FROM TANIM_Faiz_Oranlari WHERE is_active = 1 ORDER BY yururluluk_tarihi DESC LIMIT 1").get() as any;
          if (faizRow && faizRow.faiz_orani > 0) {
            if (faizRow.periyot === 'GUNLUK') {
              faizMiktari = miktar * (faizRow.faiz_orani / 100) * gecikenGun;
            } else if (faizRow.periyot === 'AYLIK') {
              faizMiktari = miktar * (faizRow.faiz_orani / 100) * Math.ceil(gecikenGun / 30);
            }

            if (faizMiktari > 0) {
              toplamIslemTutari += faizMiktari;
              const faizTahakkukId = crypto.randomUUID();
              
              uow.getRepository(TableNames.TAHAKKUK).save({
                id: faizTahakkukId,
                Vatandas_Id: tahakkuk.Vatandas_Id,
                Miktar: faizMiktari,
                Tarih: new Date().toISOString(),
                Tur: 'FAIZ',
                Ust_Tahakkuk_id: tahakkuk.id,
                Durum: 'Ödendi'
              });

              uow.getRepository('MUHASEBE_Tahsilat').save({
                id: crypto.randomUUID(),
                Fis_id: fisId,
                Vatandas_Id: finalData.Vatandas_Id,
                Miktar: faizMiktari,
                Tahakkuk_id: faizTahakkukId,
                Kasa_id: finalData.Kasa_id,
                Odeme_Yontemi: finalData.Odeme_Yontemi,
                Tarih: new Date().toISOString(),
                Aciklama: `Gecikme Zammı (Faiz)`
              });
            }
          }
        }

        // Ana Tahakkuk Durumunu Güncelle
        const totalPaidRes = uow.db.prepare(`SELECT SUM(Miktar) as toplam FROM MUHASEBE_Tahsilat WHERE Tahakkuk_id = ? AND deleted_at IS NULL`).get(tahakkukId) as any;
        const toplamOdenen = totalPaidRes?.toplam || 0;
        let durum = 'Bekliyor';
        if (toplamOdenen >= tahakkuk.Miktar) durum = 'Ödendi';
        else if (toplamOdenen > 0) durum = 'Kısmi';
        uow.getRepository(TableNames.TAHAKKUK).save({ ...tahakkuk, Durum: durum });
      }

      // 5. Kasa Hareketlerini Güncelle
      const kasaId = data.Kasa_id || 'kasa-kurum-ana';
      uow.getRepository(TableNames.KASA_HAREKET).save({
        id: crypto.randomUUID(),
        Kasa_id: kasaId,
        Islem_Turu: 'GİRİŞ',
        Miktar: toplamIslemTutari,
        Aciklama: `Tahsilat (Ana + Faiz) - Makbuz: ${data.Makbuz_No || 'BELİRSİZ'}`,
        Tarih: data.Tarih || new Date().toISOString()
      });

      const kasa = uow.getRepository(TableNames.KASA).getById(kasaId) as any;
      if (kasa) {
        if (data.Odeme_Yontemi === 'KREDİ KARTI') {
          uow.getRepository(TableNames.KASA).save({ 
            ...kasa, 
            Pos_Bakiye: (parseFloat(kasa.Pos_Bakiye || 0) + toplamIslemTutari) 
          });
        } else {
          uow.getRepository(TableNames.KASA).save({ 
            ...kasa, 
            Bakiye: (parseFloat(kasa.Bakiye || 0) + toplamIslemTutari) 
          });
        }
      }

      // 7. MUHASEBE FİŞİ (RESMİ KAYIT)
      let makbuzNo = data.Makbuz_No || ('THS-' + crypto.randomUUID().substring(0, 8).toUpperCase());
      const existingFis = uow.db.prepare(`SELECT id FROM MUHASEBE_Fisler WHERE Fis_No = ?`).get(makbuzNo);
      if (existingFis) makbuzNo = `${makbuzNo}-${crypto.randomUUID().substring(0, 4).toUpperCase()}`;

      uow.getRepository('MUHASEBE_Fisler').save({
        id: fisId,
        Fis_No: makbuzNo,
        Tarih: data.Tarih || new Date().toISOString(),
        Aciklama: data.Aciklama || `TAHSİLAT: ${makbuzNo} (Ana Borç + Faiz)`,
        Tutar: toplamIslemTutari, // TOPLAM TUTAR
        Tur: 'GELİR',
        Kategori: 'SULAMA',
        Durum: 'TESCİL EDİLDİ',
        Odeme_Yontemi: data.Odeme_Yontemi || 'NAKİT',
        Kasa_id: kasaId
      });

      return { success: true, id: collectionId };
    });
  }
}
