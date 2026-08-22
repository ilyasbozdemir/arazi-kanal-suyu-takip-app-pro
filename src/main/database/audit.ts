import { TableColumn } from './types';

export const auditColumns: TableColumn[] = [
  { name: 'created_at', type: 'TEXT', constraints: ['DEFAULT CURRENT_TIMESTAMP'] },
  { name: 'created_by', type: 'TEXT', constraints: ['REFERENCES TANIM_Personel(id)'] },
  { name: 'updated_at', type: 'TEXT' },
  { name: 'updated_by', type: 'TEXT', constraints: ['REFERENCES TANIM_Personel(id)'] },
  { name: 'deleted_at', type: 'TEXT', constraints: ['DEFAULT NULL'] },
  { name: 'deleted_by', type: 'TEXT', constraints: ['REFERENCES TANIM_Personel(id)'] },
  { name: 'islem_notu', type: 'TEXT' } // 🛡️ Resmi mevzuat gereği değişiklik nedeni
];

export const auditColumnsNoRef: TableColumn[] = [
  { name: 'created_at', type: 'TEXT', constraints: ['DEFAULT CURRENT_TIMESTAMP'] },
  { name: 'created_by', type: 'TEXT' },
  { name: 'updated_at', type: 'TEXT' },
  { name: 'updated_by', type: 'TEXT' },
  { name: 'deleted_at', type: 'TEXT', constraints: ['DEFAULT NULL'] },
  { name: 'deleted_by', type: 'TEXT' },
  { name: 'islem_notu', type: 'TEXT' }
];
