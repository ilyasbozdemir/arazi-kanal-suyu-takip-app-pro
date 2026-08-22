import { defineTable } from '../BaseTable';

export const LOG_Activities = defineTable({
  name: 'LOG_Activities',
  hasAudit: false,
  columns: [
    { name: 'id', type: 'TEXT', constraints: ['PRIMARY KEY'] },
    { name: 'Table_Name', type: 'TEXT', constraints: ['NOT NULL'] },
    { name: 'Record_Id', type: 'TEXT', constraints: ['NOT NULL'] },
    { name: 'Action', type: 'TEXT', constraints: ['NOT NULL'] }, // CREATE, UPDATE, DELETE, RESTORE
    { name: 'Prev_State', type: 'TEXT' }, // JSON string
    { name: 'Next_State', type: 'TEXT' }, // JSON string
    { name: 'User_Id', type: 'TEXT' },
    { name: 'Prev_Log_Hash', type: 'TEXT' }, // 🛡️ Blockchain-like Link
    { name: 'Log_Hash', type: 'TEXT' },      // 🛡️ Content Integrity Hash
    { name: 'Timestamp', type: 'TEXT', constraints: ['DEFAULT CURRENT_TIMESTAMP'] },
    { name: 'IP_Address', type: 'TEXT' },
    { name: 'Device_Info', type: 'TEXT' }
  ]
});
