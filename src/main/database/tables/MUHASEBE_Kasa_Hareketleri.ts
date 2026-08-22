import { defineTable } from '../BaseTable';

export const MUHASEBE_Kasa_Hareketleri = defineTable({
  name: 'MUHASEBE_Kasa_Hareketleri',
  hasAudit: false,
  columns: [
    { name: 'id', type: 'TEXT', constraints: ['PRIMARY KEY'] },
    { name: 'Tarih', type: 'TEXT' },
    { name: 'Tür', type: 'TEXT' },
    { name: 'Miktar', type: 'REAL' },
    { name: 'Kasa_id', type: 'TEXT', constraints: ['REFERENCES TANIM_Kasalar(id)'] },
    { name: 'Aciklama', type: 'TEXT' },
    { name: 'Islem_Hash', type: 'TEXT' }
  ]
});
