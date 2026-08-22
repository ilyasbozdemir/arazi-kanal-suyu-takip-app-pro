import { defineTable } from '../BaseTable';

export const TANIM_Vergi_Oranlari = defineTable({
  name: 'TANIM_Vergi_Oranlari',
  hasAudit: true,
  columns: [
    { name: 'id', type: 'TEXT', constraints: ['PRIMARY KEY'] },
    { name: 'vergi_adi', type: 'TEXT' }, // KDV, ÖİV vb.
    { name: 'vergi_orani', type: 'REAL' }, // 0.20, 0.10 vb.
    { name: 'kod', type: 'TEXT' }, // KDV20, KDV10 vb.
    { name: 'aciklama', type: 'TEXT' },
    { name: 'is_active', type: 'INTEGER', constraints: ['DEFAULT 1'] }
  ]
});
