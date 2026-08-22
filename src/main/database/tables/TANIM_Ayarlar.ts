import { defineTable } from '../BaseTable';

export const TANIM_Ayarlar = defineTable({
  name: 'TANIM_Ayarlar',
  hasAudit: false,
  columns: [
    { name: 'anahtar', type: 'TEXT', constraints: ['PRIMARY KEY'] },
    { name: 'deger', type: 'TEXT' }
  ]
});
