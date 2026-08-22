import { defineTable } from '../BaseTable';

export const MAP_Altyapi = defineTable({
  name: 'MAP_Altyapi',
  hasAudit: true,
  columns: [
    { name: 'id', type: 'TEXT', constraints: ['PRIMARY KEY'] },
    { name: 'Mevki_id', type: 'TEXT', constraints: ['INDEXED', 'REFERENCES DATA_Tasinmaz_Mevkileri(id)'] },
    { name: 'Ad', type: 'TEXT' },
    { name: 'Tip', type: 'TEXT' }, // Sulama Hattı, Kanal, Depo vb.
    { name: 'Durum', type: 'TEXT' }, // Aktif, Yok, Planlanan
    { name: 'Dosya_Yolu', type: 'TEXT' },
    { name: 'Detay_JSON', type: 'TEXT' }
  ]
});
