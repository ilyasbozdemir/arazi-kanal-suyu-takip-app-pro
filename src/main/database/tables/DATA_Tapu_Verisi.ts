import { defineTable } from '../BaseTable';

export const DATA_Tapu_Verisi = defineTable({
  name: 'DATA_Tapu_Verisi',
  description: 'Arazi ve tapu bilgilerinin tutulduğu tablo (Sadece taşınmaz fiziksel verisi)',
  hasAudit: true,
  columns: [
    { name: 'id', type: 'TEXT', constraints: ['PRIMARY KEY'] },
    { name: 'Tasinmaz_No', type: 'TEXT', constraints: ['UNIQUE'] },
    { name: 'Ada', type: 'TEXT' },
    { name: 'Parsel', type: 'TEXT' },
    { name: 'Alan_m2', type: 'REAL' },
    { name: 'Nitelik', type: 'TEXT' },
    { name: 'Pafta', type: 'TEXT' },
    { name: 'Cilt_Sayfa', type: 'TEXT' },
    { name: 'Mevki_id', type: 'TEXT', constraints: ['INDEXED', 'REFERENCES DATA_Tasinmaz_Mevkileri(id)'] },
    { name: 'Aylik_Su_Hakki', type: 'REAL' },
    { name: 'Kanal_Seviyesi_Altinda', type: 'INTEGER', defaultValue: '1' },
    { name: 'Kanal_Suyu_Ile_Sulanan', type: 'INTEGER', defaultValue: '1' },
    { name: 'Pdf_Dosya_Yolu', type: 'TEXT' }, // 🛡️ OTOMATİK İNDİRİLEN TKGM BELGESİ
    { name: 'Notlar', type: 'TEXT' }
  ]
});
