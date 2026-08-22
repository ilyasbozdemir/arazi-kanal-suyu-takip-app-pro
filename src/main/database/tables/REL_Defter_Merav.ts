import { defineTable } from "../BaseTable";

export const REL_Defter_Merav = defineTable({
  name: 'REL_Defter_Merav',
  description: 'Defter (Dönem) ve Merav arasındaki görevlendirme ilişkisi',
  hasAudit: true,
  columns: [
    { name: 'id', type: 'TEXT', constraints: ['PRIMARY KEY'] },
    { name: 'Defter_id', type: 'TEXT', constraints: ['NOT NULL', 'REFERENCES DATA_Dagitim_Donemleri(id)'] },
    { name: 'Merav_id', type: 'TEXT', constraints: ['NOT NULL', 'REFERENCES TANIM_Meravlar(id)'] },
    { name: 'Baslangic_Tarihi', type: 'TEXT' }, // ← göreve başladığı tarih
    { name: 'Bitis_Tarihi', type: 'TEXT' },     // ← ayrıldığı tarih (null = hala aktif)
    { name: 'Aktif', type: 'INTEGER', constraints: ['DEFAULT 1'] }
  ]
});
