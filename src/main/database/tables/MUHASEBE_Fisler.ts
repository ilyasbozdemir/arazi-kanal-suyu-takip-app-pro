import { defineTable } from '../BaseTable';

export const MUHASEBE_Fisler = defineTable({
  name: 'MUHASEBE_Fisler',
  hasAudit: true,
  columns: [
    { name: 'id', type: 'TEXT', constraints: ['PRIMARY KEY'] },
    { name: 'Fis_No', type: 'TEXT', constraints: ['UNIQUE'] },
    { name: 'Tarih', type: 'TEXT' },
    { name: 'Tur', type: 'TEXT' }, // GELİR / GİDER
    { name: 'Kategori', type: 'TEXT' },
    { name: 'Miktar', type: 'REAL' },
    { name: 'Tutar', type: 'REAL' }, // Bazı yerlerde Miktar, bazı yerlerde Tutar kullanılmış olabilir
    { name: 'Odeme_Yontemi', type: 'TEXT' }, // NAKİT / KREDİ KARTI
    { name: 'Aciklama', type: 'TEXT' },
    { name: 'Kasa_id', type: 'TEXT', constraints: ['REFERENCES TANIM_Kasalar(id)'] },
    { name: 'Personel_id', type: 'TEXT', constraints: ['REFERENCES TANIM_Personel(id)'] },
    { name: 'Durum', type: 'TEXT', constraints: ["DEFAULT 'Ödendi'"] }
  ]
});
