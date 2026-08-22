import { defineTable } from '../BaseTable';

export const TANIM_Faiz_Oranlari = defineTable({
  name: 'TANIM_Faiz_Oranlari',
  hasAudit: true,
  columns: [
    { name: 'id', type: 'TEXT', constraints: ['PRIMARY KEY'] },
    { name: 'faiz_adi', type: 'TEXT' }, // Gecikme Zammı, Yasal Faiz vb.
    { name: 'faiz_orani', type: 'REAL' }, // Aylık/Günlük oran
    { name: 'periyot', type: 'TEXT' }, // GUNLUK, AYLIK, YILLIK
    { name: 'dayanak_mevzuat', type: 'TEXT' }, // 6183 Sayılı Kanun vb.
    { name: 'yururluluk_tarihi', type: 'TEXT' },
    { name: 'is_active', type: 'INTEGER', constraints: ['DEFAULT 1'] }
  ]
});
