import { defineTable } from '../BaseTable';

export const MUHASEBE_Z_Raporu = defineTable({
  name: 'MUHASEBE_Z_Raporu',
  hasAudit: true,
  columns: [
    { name: 'id', type: 'TEXT', constraints: ['PRIMARY KEY'] },
    { name: 'Rapor_No', type: 'TEXT', constraints: ['UNIQUE'] },
    { name: 'Tarih', type: 'TEXT' },
    { name: 'Kasa_id', type: 'TEXT', constraints: ['REFERENCES TANIM_Kasalar(id)'] },
    { name: 'Veznedar_id', type: 'TEXT', constraints: ['REFERENCES TANIM_Personel(id)'] },
    { name: 'Sistem_Nakit', type: 'REAL' },
    { name: 'Sistem_Pos', type: 'REAL' },
    { name: 'Fiziki_Nakit', type: 'REAL' },
    { name: 'Fiziki_Pos', type: 'REAL' },
    { name: 'Fark_Nakit', type: 'REAL' },
    { name: 'Fark_Pos', type: 'REAL' },
    { name: 'Toplam_Ciro', type: 'REAL' },
    { name: 'Durum', type: 'TEXT', constraints: ["DEFAULT 'KAPANDI'"] },
    { name: 'Aciklama', type: 'TEXT' }
  ]
});
