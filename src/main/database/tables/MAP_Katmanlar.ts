import { defineTable } from '../BaseTable';

export const MAP_Katmanlar = defineTable({
  name: 'MAP_Katmanlar',
  description: 'Genel harita katmanları',
  hasAudit: true,
  columns: [
    { name: 'id', type: 'TEXT', constraints: ['PRIMARY KEY'] },
    { name: 'Ad', type: 'TEXT' },
    { name: 'Dosya_Yolu', type: 'TEXT' },
    { name: 'Icerik_JSON', type: 'TEXT' }, // GeoJSON içeriği burada saklanabilir
    { name: 'Ikon', type: 'TEXT' }, // Lucide ikon adı (Droplets, MapPin vb.)
    { name: 'Tip', type: 'TEXT' },
    { name: 'Renk', type: 'TEXT' },
    { name: 'Kategori', type: 'TEXT' }, // KANAL, SINIR, GENEL, PARSEL_EK
    { name: 'Tasinmaz_id', type: 'TEXT' },
    { name: 'Aciklama', type: 'TEXT' },
    { name: 'Gorunur', type: 'INTEGER', constraints: ['DEFAULT 1'] }
  ]
});
