import { DATA_Vatandas_Filters } from './DATA_Vatandas';
import { DATA_Tapu_Verisi_Filters } from './DATA_Tapu_Verisi';

export const TABLE_FILTERS: Record<string, any> = {
  DATA_Vatandas: DATA_Vatandas_Filters,
  DATA_Tapu_Verisi: DATA_Tapu_Verisi_Filters,
};

export const getTableFilters = (tableName: string) => {
  return TABLE_FILTERS[tableName] || {
    tableName,
    searchFields: ['id'], // Fallback
    advancedFilters: []
  };
};
