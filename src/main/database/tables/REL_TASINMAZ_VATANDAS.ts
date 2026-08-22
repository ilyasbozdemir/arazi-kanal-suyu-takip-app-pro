import { defineTable } from '../BaseTable';

export const REL_TASINMAZ_VATANDAS = defineTable({
  name: 'REL_TASINMAZ_VATANDAS',
  hasAudit: true,
  columns: [
    { name: 'id', type: 'TEXT', constraints: ['PRIMARY KEY'] },
    { name: 'Tasinmaz_id', type: 'TEXT', constraints: ['REFERENCES DATA_Tapu_Verisi(id)', 'NOT NULL'] },
    { name: 'Vatandas_Id', type: 'TEXT', constraints: ['REFERENCES DATA_Vatandas(id)', 'NOT NULL'] },
    { name: 'Rol', type: 'TEXT' },
    { name: 'Hisse_Pay', type: 'INTEGER', constraints: ['CHECK (Hisse_Pay > 0)', 'NOT NULL', 'DEFAULT 1'] },
    { name: 'Hisse_Payda', type: 'INTEGER', constraints: ['CHECK (Hisse_Payda >= Hisse_Pay)', 'NOT NULL', 'DEFAULT 1'] }
  ]
});
