import { Search, Plus, RefreshCw, X, Trash2, LayoutList, Grid, Table } from 'lucide-react';
import { TableFilterBar } from './TableFilterBar';

interface TableHeaderProps {
  title: string;
  description: string;
  icon: any;
  searchInput: string;
  setSearchInput: (val: string) => void;
  tableName: string;
  onCreateClick?: (table: string) => void;
  onBulkAddClick?: (table: string) => void;
  onExport: () => void;
  onRefresh: () => void;
  showDeleted?: boolean;
  onToggleDeleted?: () => void;
  viewMode?: 'table' | 'list' | 'grid';
  setViewMode?: (mode: 'table' | 'list' | 'grid') => void;
  columnFilters: any[];
  setColumnFilters: (filters: any) => void;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  title,
  description,
  icon: Icon,
  searchInput,
  setSearchInput,
  tableName,
  onCreateClick,
  onBulkAddClick,
  onExport,
  onRefresh,
  showDeleted,
  onToggleDeleted,
  viewMode,
  setViewMode,
  columnFilters,
  setColumnFilters,
}) => {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white dark:bg-slate-900 px-8 py-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm transition-all gap-6">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center border border-primary-500/10">
          <Icon size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tighter uppercase leading-none mb-1">
            {title}
          </h2>
          <p className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase opacity-70 italic tracking-widest">
            {description}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto relative z-[50]">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80 group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-all">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Hızlı ara"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-11 pr-20 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500/10 focus:bg-white dark:focus:bg-slate-800 rounded-2xl outline-none font-bold text-sm transition-all shadow-inner placeholder:text-slate-300"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {searchInput && (
                <button
                  onClick={() => setSearchInput("")}
                  title="Aramayı Temizle"
                  className="text-slate-300 hover:text-rose-500 p-1"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* 🛡️ Advanced Filter Component */}
          <TableFilterBar 
            tableName={tableName} 
            columnFilters={columnFilters} 
            setColumnFilters={setColumnFilters} 
          />
        </div>

        {onCreateClick && !['DATA_Dagitim_Donemleri', 'MUHASEBE_Fisler', 'SU_TAHAKKUK_RAPORU'].includes(tableName.toUpperCase()) && (
          <>
            {['DATA_TAPU_VERISI', 'DATA_TASINMAZ_MEVKILERI', 'DATA_VATANDAS'].includes(tableName.toUpperCase()) && (
              <button
                onClick={() => onBulkAddClick && onBulkAddClick(tableName)}
                title="Excel formatında çoklu veri girişi yapın"
                className="flex-shrink-0 flex items-center justify-center p-3 sm:px-4 sm:py-3 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 font-black rounded-2xl hover:bg-emerald-500 hover:text-white transition-all text-[11px] uppercase tracking-widest shadow-sm"
              >
                <LayoutList size={16} className="sm:mr-2" /> <span className="hidden sm:inline">ÇOKLU EKLE</span>
              </button>
            )}
            <button
              onClick={() => onCreateClick && onCreateClick(tableName)}
              className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-primary-600 text-white font-black rounded-2xl hover:bg-slate-800 transition-all text-[11px] uppercase tracking-widest shadow-lg"
            >
              <Plus size={16} /> YENİ EKLE
            </button>
          </>
        )}
        <button
          onClick={onToggleDeleted}
          className={`p-3 border rounded-2xl transition-all shadow-sm active:scale-95 group ${showDeleted ? 'bg-rose-500 text-white border-rose-600' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:text-rose-500'}`}
          title={showDeleted ? "Normal Kayıtları Göster" : "Silinen Kayıtları (Çöp Kutusu) Göster"}
        >
          <Trash2 size={18} />
        </button>
        <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-700">
          <button
            onClick={() => setViewMode?.('table')}
            className={`p-2 rounded-xl transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-primary-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            title="Tablo Görünümü"
          >
            <Table size={16} />
          </button>
          <button
            onClick={() => setViewMode?.('list')}
            className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-primary-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            title="Liste Görünümü"
          >
            <LayoutList size={16} />
          </button>
          <button
            onClick={() => setViewMode?.('grid')}
            className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-primary-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            title="Kart Görünümü"
          >
            <Grid size={16} />
          </button>
        </div>

        <button
          onClick={onRefresh}
          title="Verileri Yenile"
          className="p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-primary-500 rounded-2xl transition-all active:rotate-90 duration-500"
        >
          <RefreshCw size={18} />
        </button>
      </div>
    </div>
  );
};
