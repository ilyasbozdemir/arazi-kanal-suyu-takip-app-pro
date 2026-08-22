import React from 'react';
import { Database, ArrowRight } from 'lucide-react';

interface MigrationMappingSidebarProps {
  columns: any[];
  mapping: Record<string, string>;
  setMapping: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  targetCols: string[];
}

export const MigrationMappingSidebar: React.FC<MigrationMappingSidebarProps> = ({
  columns,
  mapping,
  setMapping,
  targetCols,
}) => {
  return (
    <div className="w-80 border-r border-slate-800/50 bg-[#0d1016] overflow-y-auto hidden lg:flex flex-col">
      <div className="p-6 border-b border-slate-800/50">
        <h3 className="text-sm font-black text-slate-400 flex items-center gap-2 uppercase tracking-widest">
          <Database size={16} className="text-blue-500" />
          SÜTUN EŞLEŞTİRME
        </h3>
        <p className="text-[10px] text-slate-600 mt-1 font-medium">ESKİ VERİLERİ HEDEF ALANLARA BAĞLAYIN</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {columns.map(col => (
          <div key={col.name} className="flex flex-col p-4 bg-slate-900/40 border border-slate-800/60 rounded-2xl hover:bg-slate-800/50 transition-all group shadow-sm">
            <div className="flex justify-between items-center mb-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">ESKİ TABLO SÜTUNU</span>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            </div>
            <span className="text-sm font-bold text-white truncate mb-4" title={col.name}>{col.name}</span>

            <div className="flex flex-col gap-1.5 mt-auto">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-[1px] flex-1 bg-slate-800" />
                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-tight">HEDEF ALAN</span>
                <div className="h-[1px] flex-1 bg-slate-800" />
              </div>

              <div className="relative group/select">
                <select
                  className="w-full bg-[#0d1016] border border-slate-700/50 text-xs rounded-xl px-4 py-2.5 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all text-slate-300 appearance-none cursor-pointer hover:bg-black/40"
                  value={mapping[col.name]}
                  onChange={(e) => setMapping(prev => ({ ...prev, [col.name]: e.target.value }))}
                >
                  {targetCols.map(t => (
                    <option key={t} value={t} className="bg-slate-900">{t === 'SKIP' ? '--- PAS GEÇ ---' : t}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 group-hover/select:text-blue-500 transition-colors">
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

