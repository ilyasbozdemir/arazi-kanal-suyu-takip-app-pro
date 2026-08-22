import { defineTable } from '../BaseTable';

export const DATA_Dagitim_Bolgeleri = defineTable({
  name: 'DATA_Dagitim_Bolgeleri',
  hasAudit: true,
  columns: [
    { name: 'id', type: 'TEXT', constraints: ['PRIMARY KEY'] },
    { name: 'Mahalle_id', type: 'TEXT', constraints: ['REFERENCES TANIM_Konumlar(id)'] },
    { name: 'Sorumlu_Merav_id', type: 'TEXT', constraints: ['REFERENCES TANIM_Meravlar(id)'] },
    { name: 'Tip', type: 'TEXT' }, // BELDE, KÖY, MAHALLE, BOLGE
    { name: 'Durum', type: 'TEXT', constraints: ["DEFAULT 'Aktif'"] }
  ]
});
