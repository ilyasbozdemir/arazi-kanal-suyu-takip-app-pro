import { defineTable } from '../BaseTable';

export const REL_TASINMAZ_ZILYET = defineTable({
  name: 'REL_TASINMAZ_ZILYET',
  hasAudit: true,
  columns: [
    { name: 'id', type: 'TEXT', constraints: ['PRIMARY KEY'] },
    { name: 'Tasinmaz_id', type: 'TEXT', constraints: ['REFERENCES DATA_Tapu_Verisi(id)'] },
    { name: 'Vatandas_Id', type: 'TEXT', constraints: ['REFERENCES DATA_Vatandas(id)'] },
    { name: 'Beyan_Tarihi', type: 'TEXT' },
    { name: 'Aktif', type: 'INTEGER', constraints: ['DEFAULT 1'] }
  ]
});
