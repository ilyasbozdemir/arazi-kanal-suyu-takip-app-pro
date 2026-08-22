import { defineTable } from '../BaseTable';

export const DATA_Dagitim_Donemleri = defineTable({
  name: 'DATA_Dagitim_Donemleri',
  description: "Dağıtım defterleri ve dönem bilgileri",
  hasAudit: true,
  columns: [
    { name: 'id', type: 'TEXT', constraints: ['PRIMARY KEY'] },
    { name: 'Bolge_id', type: 'TEXT', constraints: ['REFERENCES DATA_Dagitim_Bolgeleri(id)'] },
    { name: 'Defter_Adi', type: 'TEXT' },
    { name: 'Donem_Adi', type: 'TEXT' },
    { name: 'Baslangic_Tarihi', type: 'TEXT' },
    { name: 'Bitis_Tarihi', type: 'TEXT' },
    { name: 'Baslangic_Yili', type: 'INTEGER' },
    { name: 'Durum', type: 'TEXT', constraints: ["DEFAULT 'Aktif'"] },
    { name: 'Aktif', type: 'INTEGER', constraints: ['DEFAULT 1'] }
  ]
});
