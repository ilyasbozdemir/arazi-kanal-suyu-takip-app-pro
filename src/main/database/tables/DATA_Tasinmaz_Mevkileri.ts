import { defineTable } from '../BaseTable';

export const DATA_Tasinmaz_Mevkileri = defineTable({
  name: 'DATA_Tasinmaz_Mevkileri',
  hasAudit: true,
  columns: [
    { name: 'id', type: 'TEXT', constraints: ['PRIMARY KEY'] },
    { name: 'Mevki_Adi', type: 'TEXT', constraints: ['INDEXED'] },
    { name: 'Konum_id', type: 'TEXT', constraints: ['REFERENCES TANIM_Konumlar(id)'] },
    { name: 'Bolge_Tipi', type: 'TEXT' },
    { name: 'Altyapi_Durumu', type: 'TEXT' },
    { name: 'Aciklama', type: 'TEXT' }
  ],
});
