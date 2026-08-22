/**
 * 🛡️ KURUM GIS - IPC HANDLER REGISTRY
 * Bu dosya tüm sistem handler'larını mantıksal gruplar halinde birleştirir.
 */

// CORE: Sistem yönetimi, istatistikler ve temel veri akışı
export * from './core/system';
export * from './core/data';
export * from './core/stats';
export * from './core/server';

// GIS: Harita katmanları ve TKGM entegrasyonu
export * from './gis/map_layers';
export * from './gis/tkgm';

// IO: Veri aktarımı (Excel Import/Export)
export * from './io/importHandlers';
export * from './io/exportHandlers';

// RECORDS: CRUD ve Gelişmiş Sorgu motorları
export * from './records/recordHandlers';
export * from './records/queryHandlers';

// MODULES: İş mantığı modülleri (Sulama Defteri, Mail vb.)
export * from './modules/ledgerHandlers';
export * from './modules/mail';
