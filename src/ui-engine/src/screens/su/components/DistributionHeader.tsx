import React from 'react';
import { Search, Plus, RefreshCw, Activity, FileText, Gavel } from 'lucide-react';

interface DistributionHeaderProps {
  mahalleName: string;
  yil: string | number;
  isArchived: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  pricing: any;
  onRefresh: () => void;
  onAddNew: () => void;
  onPrint?: () => void;
}

export const DistributionHeader: React.FC<DistributionHeaderProps> = ({
  mahalleName,
  yil,
  isArchived,
  searchTerm,
  setSearchTerm,
  pricing,
  onRefresh,
  onAddNew,
  onPrint
}) => {
  return (
    <div className="p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 flex items-center justify-between shadow-sm relative z-10">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-300">
          <FileText size={24} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight leading-none">
            {mahalleName} - {yil} DÖNEMİ {isArchived && <span className="text-rose-500 text-[10px] ml-2">(ARŞİV)</span>}
          </h1>
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mt-1.5">Sulama Hizmetleri Kayıt Defteri</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Kayıtlarda ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            title="Kayıtlarda ara"
            className="pl-12 pr-6 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-slate-400 rounded-xl text-[13px] font-medium outline-none transition-all w-72"
          />
        </div>

        <button
          disabled={isArchived}
          onClick={onAddNew}
          className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl shadow-md flex items-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all font-bold disabled:opacity-50"
        >
          <Plus size={18} />
          <span className="text-[13px] uppercase tracking-wide">{isArchived ? "ARŞİVDE" : "Yeni Kayıt"}</span>
        </button>

        <button
          disabled={true}
          className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-400 rounded-xl transition-all shadow-sm flex items-center gap-2 opacity-50 cursor-not-allowed"
          title="Defteri Yazdır (Şu anlık devre dışı)"
        >
          <Activity size={18} />
          <span className="text-[12px] font-bold uppercase tracking-tight">Yazdır / PDF</span>
        </button>

        <button title="Verileri Yenile" aria-label="Verileri Yenile" onClick={onRefresh} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all shadow-sm">
          <RefreshCw size={18} />
        </button>
      </div>
    </div>
  );
};
