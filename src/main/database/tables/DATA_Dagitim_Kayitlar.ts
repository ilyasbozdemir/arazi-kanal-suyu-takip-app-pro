import { defineTable } from "../BaseTable";

export const DATA_Dagitim_Kayitlar = defineTable({
  name: 'DATA_Dagitim_Kayitlar',
  description: "Tüm mahalle ve dönemlerin su kullanım kayıtları",
  hasAudit: true,
  indexes: [
    { columns: ['Donem_id'] },
    { columns: ['Mahalle_id'] },
    { columns: ['Donem_id', 'Mahalle_id'] },
  ],
  columns: [
    { name: 'id',              type: 'TEXT',    constraints: ['PRIMARY KEY'] },
    { name: 'Donem_id',        type: 'TEXT',    constraints: ['REFERENCES DATA_Dagitim_Donemleri(id)'] },
    { name: 'Bolge_id',        type: 'TEXT',    constraints: ['REFERENCES DATA_Dagitim_Bolgeleri(id)'] },
    { name: 'Tasinmaz_id',     type: 'TEXT' },
    { name: 'Vatandas_Id',   type: 'TEXT' },
    { name: 'Merav_id',        type: 'TEXT' },
    { name: 'Tarih',           type: 'TEXT' },
    { name: 'Baslangic_Saati', type: 'TEXT' },
    { name: 'Bitis_Saati',     type: 'TEXT' },
    { name: 'Kullanim_Saati',  type: 'REAL' },
    { name: 'Sure_Saat',      type: 'REAL' },
    { name: 'Tarife_Modu',     type: 'TEXT' },
    { name: 'Birim_Fiyat',     type: 'REAL' },
    { name: 'Toplam_Tutar',    type: 'REAL' },
    { name: 'Makbuz_Defter_id',type: 'TEXT',    constraints: ['REFERENCES TANIM_Sulama_Fis_Kocanlari(id)'] },
    { name: 'Makbuz_No',       type: 'TEXT' },
    { name: 'Son_Odeme_Tarihi', type: 'TEXT' }, // Vade Tarihi
    { name: 'Aciklama',        type: 'TEXT' },
  ]
});
