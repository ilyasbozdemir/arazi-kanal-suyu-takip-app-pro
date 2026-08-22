import { defineTable } from '../BaseTable';

export const MUHASEBE_Tahakkuk = defineTable({
  name: 'MUHASEBE_Tahakkuk',
  hasAudit: true,
  columns: [
    { name: 'id', type: 'TEXT', constraints: ['PRIMARY KEY'] },
    { name: 'Donem_id', type: 'TEXT', constraints: ['REFERENCES DATA_Dagitim_Donemleri(id)'] },
    { name: 'Fis_id', type: 'TEXT', constraints: ['NOT NULL'] }, 
    { name: 'Donem_Yili', type: 'TEXT' },
    { name: 'Vatandas_Id', type: 'TEXT', constraints: ['REFERENCES DATA_Vatandas(id)'] },
    { name: 'Tasinmaz_id', type: 'TEXT', constraints: ['REFERENCES DATA_Tapu_Verisi(id)'] },
    { name: 'Miktar', type: 'REAL' },
    { name: 'Tarih', type: 'TEXT' },
    { name: 'Tur', type: 'TEXT', constraints: ["DEFAULT 'ANA_BORC'"] }, // ANA_BORC, FAIZ
    { name: 'Ust_Tahakkuk_id', type: 'TEXT', constraints: ['REFERENCES MUHASEBE_Tahakkuk(id)'] },
    { name: 'Durum', type: 'TEXT', constraints: ["DEFAULT 'Bekliyor'"] }
  ]
});
