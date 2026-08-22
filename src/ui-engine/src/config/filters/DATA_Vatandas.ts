export interface TableFilterConfig {
  tableName: string;
  searchFields: string[]; // Global aramaya dahil edilecek alanlar
  advancedFilters?: {
    id: string;
    label: string;
    type: 'select' | 'text' | 'date' | 'boolean';
    field: string;
    options?: { label: string; value: any }[];
  }[];
}

export const DATA_Vatandas_Filters: TableFilterConfig = {
  tableName: 'DATA_Vatandas',
  searchFields: ['Ad', 'Soyad', 'TCKN', 'Sicil_No', 'Baba_Adi', 'Ana_Adi', 'Telefon', 'Cep_Telefonu', 'Adres', 'Meslek'],
  advancedFilters: [
    {
      id: 'durum',
      label: 'Yaşam Durumu',
      type: 'select',
      field: 'Durum',
      options: [
        { label: 'Hepsi', value: null },
        { label: 'Sağ / Aktif', value: 'Aktif' },
        { label: 'Vefat', value: 'Ölü' }
      ]
    },
    {
      id: 'cinsiyet',
      label: 'Cinsiyet',
      type: 'select',
      field: 'Cinsiyet',
      options: [
        { label: 'Hepsi', value: null },
        { label: 'Erkek', value: 'Erkek' },
        { label: 'Kadın', value: 'Kadın' }
      ]
    }
  ]
};
