import { defineTable } from '../BaseTable';

export const SYSTEM_Logs = defineTable({
  name: 'SYSTEM_Logs',
  hasAudit: false,
  columns: [
    { name: 'id', type: 'TEXT', constraints: ['PRIMARY KEY'] },
    { name: 'level', type: 'TEXT' },
    { name: 'action', type: 'TEXT' },
    { name: 'details', type: 'TEXT' },
    { name: 'user', type: 'TEXT' },
    { name: 'timestamp', type: 'TEXT' }
  ]
});
