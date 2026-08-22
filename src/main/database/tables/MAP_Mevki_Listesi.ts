import { defineTable } from '../BaseTable';

export const MAP_Mevki_Listesi = defineTable({
  name: 'MAP_Mevki_Listesi',
  description: 'Mevkilerin CBS ve koordinat verileri',
  hasAudit: true,
  columns: [
    { name: 'id', type: 'TEXT', constraints: ['PRIMARY KEY'] },
    { name: 'Mevki_id', type: 'TEXT', constraints: ['INDEXED', 'REFERENCES DATA_Tasinmaz_Mevkileri(id)'] },
    { name: 'Tasinmaz_id', type: 'TEXT', constraints: ['INDEXED', 'REFERENCES DATA_Tapu_Verisi(id)'] },
    { name: 'Lat', type: 'REAL' },
    { name: 'Lng', type: 'REAL' },
    { name: 'GeoJSON', type: 'TEXT' },
    { name: 'Dosya_Yolu', type: 'TEXT' },
    { name: 'Metadata_JSON', type: 'TEXT' }
  ]
});
