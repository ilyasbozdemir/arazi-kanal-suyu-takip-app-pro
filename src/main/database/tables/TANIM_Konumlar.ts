import { defineTable } from '../BaseTable';

export const TANIM_Konumlar = defineTable({
  name: 'TANIM_Konumlar',
  hasAudit: false,
  columns: [
    { name: 'id', type: 'TEXT', constraints: ['PRIMARY KEY'] },
    { name: 'Parent_id', type: 'TEXT', constraints: ['REFERENCES TANIM_Konumlar(id)'] },
    { name: 'Tip', type: 'TEXT' }, // İL, İLÇE, BELDE, KÖY, MAHALLE
    { name: 'Ad', type: 'TEXT' },
    { name: 'Kod', type: 'TEXT' },
    { name: 'TGKM_Kod', type: 'TEXT' }, // 🗺️ TKGM Resmi Kod Karşılığı
    { name: 'TGKM_Mahalle_Ad', type: 'TEXT' }, // 🛡️ YENİ NESİL KONTROL ALANLARI
    { name: 'Sinir_Dosya_Yolu', type: 'TEXT' }, // 🛡️ SORUMLULUK ALANI / SINIR GEOJSON (Dosya Yolu)
  ]
});
