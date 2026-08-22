import { defineTable } from '../BaseTable';

export const TANIM_Kasalar = defineTable({
  name: 'TANIM_Kasalar',
  hasAudit: true,
  columns: [
    { name: 'id', type: 'TEXT', constraints: ['PRIMARY KEY'] },
    { name: 'Kasa_Adi', type: 'TEXT' },
    { name: 'Kod', type: 'TEXT' },
    { name: 'Bakiye', type: 'REAL', constraints: ['DEFAULT 0'] },
    { name: 'Kasa_Tipi', type: 'TEXT', constraints: ["DEFAULT 'NAKİT'"] }, // 🛡️ NAKİT veya POS
    { name: 'Konum', type: 'TEXT' },
    { name: 'Zimmet_id', type: 'TEXT', constraints: ['REFERENCES TANIM_Personel(id)'] },
    { name: 'Durum', type: 'TEXT', constraints: ["DEFAULT 'AKTİF'"] },
    { name: 'Aciklama', type: 'TEXT' },
    { name: 'Sistem_Verisi', type: 'INTEGER', constraints: ['DEFAULT 0'] }
  ]
});
