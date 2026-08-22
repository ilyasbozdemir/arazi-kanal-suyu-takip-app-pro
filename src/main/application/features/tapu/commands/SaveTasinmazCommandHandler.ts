import { injectable, inject } from 'tsyringe';
import type { IUnitOfWork } from '@core/interfaces';
import crypto from 'crypto';
import { Logger } from '../../../../logger';

/**
 * 📄 TASINMAZ KAYIT DTO (Command)
 */
export interface SaveTasinmazCommand {
  tapuData: any; // DATA_Tapu_Verisi alanları
  owners: {
    Vatandas_Id: string;
    Rol: string;
    Hisse_Pay: number;
    Hisse_Payda: number;
  }[];
  zilyet?: {
    Vatandas_Id: string;
    Beyan_Tarihi?: string;
  };
}

/**
 * 🛡️ SAVE TASINMAZ COMMAND HANDLER
 * Atomic transaction for land, owners and occupant via TCKN.
 */
@injectable()
export class SaveTasinmazCommandHandler {
  constructor(
    @inject('IUnitOfWork') private uow: IUnitOfWork
  ) {}

  async handle(command: SaveTasinmazCommand): Promise<{ success: boolean; id: string }> {
    Logger.info('SaveTasinmazCommandHandler', `Kayıt işlemi başlatıldı. Veri: ${JSON.stringify(command.tapuData)}`);
    
    try {
      return this.uow.executeTransaction((uow) => {
        const tapuId = command.tapuData.id || command.tapuData.ID || command.tapuData.Id || crypto.randomUUID();
        Logger.info('SaveTasinmazCommandHandler', `Tapu ID belirlendi: ${tapuId}`);
        
        let mevkiId = command.tapuData.Mevki_id;

        // 🛡️ KURUM MEVKİ GÜVENCESİ: Eğer geçici bir mevki ismi gelmişse ve Mevki_id yoksa
        if (!mevkiId && command.tapuData._Mevki_Temp_Name) {
          const tempName = command.tapuData._Mevki_Temp_Name.toLocaleUpperCase('tr-TR');
          Logger.info('SaveTasinmazCommandHandler', `Mevki kontrolü yapılıyor: ${tempName}`);
          
          const existingMevki = uow.executeRaw('SELECT id FROM DATA_Tasinmaz_Mevkileri WHERE Mevki_Adi = ? AND deleted_at IS NULL', [tempName]);
          
          if (existingMevki.success && existingMevki.data?.length > 0) {
            mevkiId = existingMevki.data[0].id;
            Logger.info('SaveTasinmazCommandHandler', `Mevcut mevki bulundu: ${mevkiId}`);
          } else {
            // Yeni Mevki oluştur (Sarsılmaz bir zaferle!)
            mevkiId = crypto.randomUUID();
            Logger.info('SaveTasinmazCommandHandler', `Yeni mevki oluşturuluyor ID: ${mevkiId}`);
            uow.getRepository('DATA_Tasinmaz_Mevkileri').save({
              id: mevkiId,
              Mevki_Adi: tempName,
              Kon_id: command.tapuData._Mevki_Konum_id || null, // Varsa konum bilgisiyle mühürle
              Aciklama: 'Otomatik taşınmaz kaydı sırasında oluşturuldu.'
            });
          }
        }

        // 🛡️ KURUM OTOMATİK SINIFLANDIRMA: Hissedar sayısına göre türü mühürle
        const ownerCount = command.owners?.length || 0;
        const { _Mevki_Temp_Name, _Mevki_Konum_id, ...cleanTapuData } = command.tapuData;

        const tapuRecord = { 
          ...cleanTapuData, 
          id: tapuId,
          Mevki_id: mevkiId,
          Sahip_Turu: ownerCount > 1 ? 'Hisseli' : 'Tam'
        };

        Logger.info('SaveTasinmazCommandHandler', `Ana tapu kaydı yapılıyor (DATA_Tapu_Verisi)`);
        // 🛡️ KURUM UPDATE GÜVENCESİ: Önce ana kaydı UPSERT yap (save metodu id varsa update yapar)
        uow.getRepository('DATA_Tapu_Verisi').save(tapuRecord);

        // 🛡️ İLİŞKİSEL TEMİZLİK: Güncelleme ise eski sahipleri ve zilyetleri siliyoruz
        Logger.info('SaveTasinmazCommandHandler', `Eski sahiplik ve zilyetlik kayıtları temizleniyor`);
        uow.executeRaw('DELETE FROM REL_TASINMAZ_VATANDAS WHERE Tasinmaz_id = ?', [tapuId]);
        uow.executeRaw('DELETE FROM REL_TASINMAZ_ZILYET WHERE Tasinmaz_id = ?', [tapuId]);

        // 1. REL_TASINMAZ_VATANDAS Kayıtları (Yeni/Güncel Liste - TCKN Odaklı)
        if (command.owners && command.owners.length > 0) {
          Logger.info('SaveTasinmazCommandHandler', `${command.owners.length} adet sahip kaydı ekleniyor`);
          const ownerRepo = uow.getRepository('REL_TASINMAZ_VATANDAS');
          for (const owner of command.owners) {
            ownerRepo.save({
              id: crypto.randomUUID(),
              Tasinmaz_id: tapuId,
              Vatandas_Id: owner.Vatandas_Id,
              Rol: owner.Rol || 'MALİK',
              Hisse_Pay: owner.Hisse_Pay,
              Hisse_Payda: owner.Hisse_Payda
            });
          }
        }

        // 2. REL_TASINMAZ_ZILYET Kaydı (Opsiyonel - TCKN Odaklı)
        if (command.zilyet && command.zilyet.Vatandas_Id) {
          Logger.info('SaveTasinmazCommandHandler', `Zilyet kaydı ekleniyor: ${command.zilyet.Vatandas_Id}`);
          uow.getRepository('REL_TASINMAZ_ZILYET').save({
            id: crypto.randomUUID(),
            Tasinmaz_id: tapuId,
            Vatandas_Id: command.zilyet.Vatandas_Id,
            Beyan_Tarihi: command.zilyet.Beyan_Tarihi || new Date().toISOString(),
            Aktif: 1
          });
        }

        Logger.info('SaveTasinmazCommandHandler', `Kayıt işlemi başarıyla tamamlandı. ID: ${tapuId}`);
        return { success: true, id: tapuId };
      });
    } catch (error: any) {
      Logger.error('SaveTasinmazCommandHandler', `Kayıt sırasında KRİTİK HATA: ${error.message}`);
      throw error;
    }
  }
}
