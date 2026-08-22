import { defineTable } from '../BaseTable';

export const TANIM_Su_Ucretleri = defineTable({
  name: 'TANIM_Su_Ucretleri',
  hasAudit: true,
  columns: [
    { name: 'id', type: 'TEXT', constraints: ['PRIMARY KEY'] },
    { name: 'dayanak_tipi', type: 'TEXT' }, // MECLIS_KARARI, ENCUMEN_KARARI, KANUN, GENELGE vb.
    { name: 'dayanak_no', type: 'TEXT' },
    { name: 'dayanak_tarihi', type: 'TEXT' },
    { name: 'gunduz_fiyat', type: 'REAL' },
    { name: 'gece_fiyat', type: 'REAL' },
    { name: 'vergi_id', type: 'TEXT', constraints: ['REFERENCES TANIM_Vergi_Oranlari(id)'] }, // KDV Oranı
    { name: 'kdv_dahil', type: 'INTEGER', constraints: ['DEFAULT 1'] }, // 1: Dahil, 0: Hariç
    { name: 'gunduz_baslangic', type: 'TEXT' },
    { name: 'gece_baslangic', type: 'TEXT' },
    { name: 'aciklama', type: 'TEXT' }, // Karar metni, madde/fıkra detayları vb.
    { name: 'is_active', type: 'INTEGER', constraints: ['DEFAULT 1'] }
  ]
});
