import { defineTable } from '../BaseTable';

export const MAP_Depolar = defineTable({
  name: 'MAP_Depolar',
  hasAudit: true,
  columns: [
    { name: 'id', type: 'TEXT', constraints: ['PRIMARY KEY'] },
    { name: 'Depo_id', type: 'TEXT' },
    { name: 'Lat', type: 'REAL' },
    { name: 'Lng', type: 'REAL' }
  ]
});
