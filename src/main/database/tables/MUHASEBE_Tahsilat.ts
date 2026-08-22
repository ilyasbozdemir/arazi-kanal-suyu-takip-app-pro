import { defineTable } from '../BaseTable';

export const MUHASEBE_Tahsilat = defineTable({
  name: 'MUHASEBE_Tahsilat',
  hasAudit: true,
  columns: [
    { name: 'id', type: 'TEXT', constraints: ['PRIMARY KEY'] },
    { name: 'Donem_id', type: 'TEXT', constraints: ['REFERENCES DATA_Dagitim_Donemleri(id)'] },
    { name: 'Vatandas_Id', type: 'TEXT', constraints: ['REFERENCES DATA_Vatandas(id)'] },
    { name: 'Tahakkuk_id', type: 'TEXT', constraints: ['REFERENCES MUHASEBE_Tahakkuk(id)'] },
    { name: 'Kasa_id', type: 'TEXT', constraints: ['REFERENCES TANIM_Kasalar(id)'] },
    { name: 'Dagitim_Fis_id', type: 'TEXT' }, // 🛡️ ESKİ SİSTEM REFERANSI
    { name: 'Fis_id', type: 'TEXT' }, // 🛡️ YENİ SİSTEM REFERANSI (MUHASEBE FİŞİ)
    { name: 'Odeme_Yontemi', type: 'TEXT' }, // 🛡️ NAKİT / KREDİ KARTI
    { name: 'Miktar', type: 'REAL' },
    { name: 'Tarih', type: 'TEXT' },
    { name: 'Makbuz_No', type: 'TEXT' }, // bu ise kullanıcı odediği yerden tahilsat biriminden gelen resmi makbuz numarası yazdırabilir.
    { name: 'Onay_Kodu', type: 'TEXT' }, // 🛡️ Banka Onay Kodu (Kredi Kartı İşlemleri İçin)
    { name: 'Aciklama', type: 'TEXT' }
  ]
});
