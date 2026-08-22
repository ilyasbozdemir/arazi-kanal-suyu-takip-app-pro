import React, { useState } from 'react';
import { Filter, X, ChevronDown, Check } from 'lucide-react';
import { getTableFilters } from '@renderer/config/filters';

interface TableFiltersProps {
  tableName: string;
  columnFilters: any[];
  setColumnFilters: (filters: any) => void;
}

export const TableFilterBar: React.FC<TableFiltersProps> = ({
  tableName,
  columnFilters,
  setColumnFilters,
}) => {
  const config = getTableFilters(tableName);
  const [isOpen, setIsOpen] = useState(false);

  if (!config.advancedFilters || config.advancedFilters.length === 0) return null;

  const handleFilterChange = (field: string, value: any) => {
    const filters = columnFilters || [];
    const existing = filters.find(f => f.id === field);
    if (value === null || value === '') {
      setColumnFilters(filters.filter(f => f.id !== field));
    } else {
      if (existing) {
        setColumnFilters(filters.map(f => f.id === field ? { id: field, value } : f));
      } else {
        setColumnFilters([...filters, { id: field, value }]);
      }
    }
  };

  const activeCount = (columnFilters || []).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-3 rounded-2xl border-2 transition-all font-black text-[11px] uppercase tracking-widest ${
          activeCount > 0 
            ? 'bg-primary-500/10 border-primary-500/20 text-primary-600 shadow-sm' 
            : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
        }`}
      >
        <Filter size={16} />
        GELİŞMİŞ FİLTRE {activeCount > 0 && `(${activeCount})`}
        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[100]" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-800 p-6 z-[101] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">FİLTRE AYARLARI</h4>
               {activeCount > 0 && (
                 <button 
                   onClick={() => { setColumnFilters([]); setIsOpen(false); }}
                   className="text-[9px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest flex items-center gap-1"
                 >
                   <X size={12} /> TEMİZLE
                 </button>
               )}
            </div>

            <div className="space-y-6">
              {config.advancedFilters.map((filter: any) => {
                const currentVal = (columnFilters || []).find(f => f.id === filter.field)?.value;

                return (
                  <div key={filter.id} className="space-y-2.5">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
                      {filter.label}
                    </label>
                    
                    {filter.type === 'select' ? (
                      <div className="grid grid-cols-1 gap-2">
                        {filter.options?.map((opt: any) => (
                          <button
                            key={String(opt.value)}
                            onClick={() => handleFilterChange(filter.field, opt.value)}
                            className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-[10px] font-black transition-all border ${
                              currentVal === opt.value
                                ? 'bg-primary-500/10 border-primary-500/20 text-primary-600 shadow-sm'
                                : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            {opt.label}
                            {currentVal === opt.value && <Check size={12} />}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <input
                        type={filter.type}
                        value={currentVal || ''}
                        onChange={(e) => handleFilterChange(filter.field, e.target.value)}
                        placeholder={`${filter.label} ile ara...`}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500/10 rounded-xl outline-none text-[11px] font-black transition-all"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
