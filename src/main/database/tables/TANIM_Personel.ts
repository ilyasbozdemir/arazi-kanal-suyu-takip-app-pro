import { defineTable } from '../BaseTable';

export const TANIM_Personel = defineTable({
  name: 'TANIM_Personel',
  description: 'Personel zimmet ve uygulama giriş kütüğü',
  hasAudit: true,
  columns: [
    { name: 'id', type: 'TEXT', constraints: ['PRIMARY KEY'] },
    { name: 'Vatandas_Id', type: 'TEXT', constraints: ['NOT NULL', 'REFERENCES DATA_Vatandas(id)'] },
    { name: 'Unvan', type: 'TEXT' },
    { name: 'Eposta', type: 'TEXT', constraints: ['UNIQUE'] },
    { name: 'Telefon', type: 'TEXT' },
    { name: 'Sifre', type: 'TEXT' }, // Uygulama giriş şifresi
    { name: 'Durum', type: 'TEXT', constraints: ["DEFAULT 'Aktif'"] },
    { name: 'Aktif', type: 'INTEGER', constraints: ['DEFAULT 1'] }
  ]
});
