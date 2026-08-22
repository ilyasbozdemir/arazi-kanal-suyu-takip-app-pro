import { defineTable } from '../BaseTable';

export const TANIM_Sulama_Fis_Kocanlari = defineTable({
  name: 'TANIM_Sulama_Fis_Kocanlari',
  hasAudit: true,
  columns: [
    { name: 'id', type: 'TEXT', constraints: ['PRIMARY KEY'] },
    { name: 'defter_adi', type: 'TEXT' }, // Seri No veya Defter Adı
    { name: 'Donem_id', type: 'TEXT', constraints: ['REFERENCES DATA_Dagitim_Donemleri(id)'] },
    { name: 'baslangic_no', type: 'INTEGER' },
    { name: 'son_no', type: 'INTEGER' },
    { name: 'Sorumlu_Merav_id', type: 'TEXT', constraints: ['REFERENCES TANIM_Meravlar(id)'] },
    { name: 'Zimmet_Tarihi', type: 'TEXT' },
    { name: 'aktif', type: 'INTEGER', constraints: ['DEFAULT 1'] }
  ]
});
