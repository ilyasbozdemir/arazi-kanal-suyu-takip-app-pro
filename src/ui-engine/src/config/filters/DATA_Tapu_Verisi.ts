import { TableFilterConfig } from "./DATA_Vatandas";

export const DATA_Tapu_Verisi_Filters: TableFilterConfig = {
  tableName: 'DATA_Tapu_Verisi',
  searchFields: ['Ada', 'Parsel', 'Alan_m2', 'Mevki_id', 'Pafta', 'Aciklama'],
  advancedFilters: [
    {
        id: 'ada',
        label: 'Ada',
        type: 'text',
        field: 'Ada'
    },
    {
        id: 'parsel',
        label: 'Parsel',
        type: 'text',
        field: 'Parsel'
    }
  ]
};
