import { defineTable } from '../BaseTable';

export const TANIM_Meravlar = defineTable({
  name: 'TANIM_Meravlar',
  description: 'Saha sulama görevlileri (Merav) kütüğü',
  hasAudit: true,
  columns: [
    { name: 'id', type: 'TEXT', constraints: ['PRIMARY KEY'] },
    { name: 'Vatandas_Id', type: 'TEXT', constraints: ['NOT NULL', 'REFERENCES DATA_Vatandas(id)'] },
    { name: 'Telefon', type: 'TEXT' },
    { name: 'Aktif', type: 'INTEGER', constraints: ['DEFAULT 1'] }
  ]
});
