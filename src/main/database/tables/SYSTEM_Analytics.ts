import { defineTable } from '../BaseTable';

export const SYSTEM_Analytics = defineTable({
  name: 'SYSTEM_Analytics',
  hasAudit: false,
  columns: [
    { name: 'id', type: 'TEXT', constraints: ['PRIMARY KEY'] },
    { name: 'type', type: 'TEXT' }, // NAV, ERROR, WARN, ACTION
    { name: 'screen', type: 'TEXT' }, // Hangi ekranda oldu
    { name: 'action', type: 'TEXT' }, // Ne yapıldı
    { name: 'details', type: 'TEXT' }, // Detaylar (JSON string olabilir)
    { name: 'user', type: 'TEXT' },
    { name: 'timestamp', type: 'TEXT' }
  ]
});
