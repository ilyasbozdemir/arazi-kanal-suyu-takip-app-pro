import { useState, useEffect, FC, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { History, Search, Filter, Download, ShieldCheck, User, Clock, Info, ChevronLeft, ChevronRight, FileText, ArrowDown } from 'lucide-react'
import { useVirtualizer } from '@tanstack/react-virtual';

export const SystemLogsScreen: FC = () => {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [limit, setLimit] = useState(50);
  const parentRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async () => {
    setLoading(true)
    if ((window as any).api) {
      // ORDER BY date DESC ensures newest first
      const res = await (window as any).api.getDbData('logs', '', 'date DESC')
      if (res.success) {
        setLogs(res.data || [])
      }
    }
    setLoading(false)
  }

  useEffect(() => { fetchLogs() }, [])

  const filteredLogs = useMemo(() => {
    return logs.filter(log => 
        (log.action || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.details || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.user || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [logs, searchTerm]);

  // 🛡️ Virtualization Logic
  const rowVirtualizer = useVirtualizer({
    count: Math.min(limit, filteredLogs.length),
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Ortalama satır yüksekliği
    overscan: 10,
  });

  // 🛡️ Infinite Scroll Logic
  useEffect(() => {
    const el = parentRef.current;
    if (!el) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      if (scrollHeight - scrollTop <= clientHeight + 200) {
        if (limit < filteredLogs.length) {
          setLimit(prev => prev + 50);
        }
      }
    };

    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [limit, filteredLogs.length]);

  useEffect(() => {
    setLimit(50); // Reset limit on search
  }, [searchTerm]);

  const formatDate = (dateValue: any) => {
    if (!dateValue || dateValue === "" || dateValue === 0) return "TARİH BİLGİSİ YOK";
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return dateValue; // Raw string if parse fails
    return d.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionColor = (action: string = "") => {
    const act = action.toUpperCase();
    if (act.includes('DELETE')) return 'bg-rose-500/10 text-rose-600 border-rose-200'
    if (act.includes('INSERT') || act.includes('SAVE') || act.includes('SUCCESS')) return 'bg-emerald-500/10 text-emerald-600 border-emerald-200'
    if (act.includes('UPDATE')) return 'bg-blue-500/10 text-blue-600 border-blue-200'
    if (act.includes('PAYMENT')) return 'bg-sky-500/10 text-sky-600 border-sky-200'
    if (act.includes('ERROR')) return 'bg-rose-600 text-white border-rose-600'
    return 'bg-slate-500/10 text-slate-600 border-slate-200'
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-1000 p-8 max-w-[1700px] mx-auto pb-24">
      {/* 🛡️ Refined Glass Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-10 py-8 rounded-[32px] border border-slate-200/50 dark:border-white/5 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px] pointer-events-none"></div>
        <div className="flex items-center gap-6 text-center md:text-left relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20">
            <History size={32} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
               <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none">DENETİM GÜNLÜĞÜ</h2>
               <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">SİSTEM AKTİF</span>
               </div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] opacity-80">
              MÜSİAD & KURUM BAŞKANLIĞI GÜVENLİK PROTOKOLÜ
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 relative z-10">
            <div className="relative group">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={18} />
               <input 
                 type="text"
                 placeholder="Kayıtlar içinde ara..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="pl-12 pr-6 py-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-primary-500 focus:bg-white dark:focus:bg-slate-800 rounded-2xl text-[11px] font-bold uppercase tracking-wider outline-none w-72 transition-all"
               />
            </div>
            <button 
              onClick={() => (window as any).api.exportExcel({ table: 'logs', data: filteredLogs, fileName: 'Sistem_Loglari.xlsx' })}
              className="px-6 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2"
            >
                <Download size={16} /> DIŞA AKTAR
            </button>
        </div>
      </div>

      {/* 🛡️ Slim Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'TOPLAM KAYIT', val: logs.length, color: 'primary', icon: History },
            { label: 'VERİ GİRİŞİ', val: logs.filter(l => { const a = (l.action||'').toUpperCase(); return a.includes('INSERT') || a.includes('SAVE') || a.includes('CREATE'); }).length, color: 'emerald', icon: ShieldCheck },
            { label: 'GÜNCELLEME', val: logs.filter(l => (l.action||'').toUpperCase().includes('UPDATE')).length, color: 'blue', icon: Clock },
            { label: 'SİLME / İPTAL', val: logs.filter(l => (l.action||'').toUpperCase().includes('DELETE')).length, color: 'rose', icon: Info }
          ].map((s, i) => (
            <div key={i} className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-6 rounded-3xl border border-slate-200/50 dark:border-white/5 shadow-sm flex items-center justify-between group hover:border-primary-500/20 transition-all">
                <div className="space-y-1">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{s.label}</p>
                   <div className="text-2xl font-black text-slate-800 dark:text-white tabular-nums tracking-tighter">{s.val.toLocaleString('tr-TR')}</div>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-${s.color}-500/5 text-${s.color}-500 flex items-center justify-center group-hover:scale-110 transition-transform border border-${s.color}-500/10`}>
                   <s.icon size={22} />
                </div>
            </div>
          ))}
      </div>

      {/* 🛡️ Main Log View Area */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200/60 dark:border-white/5 overflow-hidden shadow-2xl relative flex flex-col h-[750px]">
        {/* Table Header Row */}
        <div className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/5 flex items-center shrink-0">
          <div className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-64">ZAMAN VE TARİH</div>
          <div className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-48 text-center">İŞLEM TİPİ</div>
          <div className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest flex-1">İŞLEM DETAYLARI VE VERİ İZİ</div>
          <div className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-64 text-right">SORUMLU PERSONEL</div>
        </div>

        {/* Scrollable Area */}
        <div ref={parentRef} className="flex-1 overflow-y-auto custom-scrollbar relative bg-white dark:bg-slate-900">
          <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const log = filteredLogs[virtualRow.index];
              return (
                <div
                  key={virtualRow.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className="flex items-center border-b border-slate-100 dark:border-white/[0.03] group hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-all"
                >
                  {/* Timestamp */}
                  <div className="px-8 py-3 w-64 flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 shrink-0">
                        <Clock size={14} />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[11px] font-black text-slate-700 dark:text-slate-200 tabular-nums leading-tight">
                           {formatDate(log.date)}
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">SİSTEM SAATİ</span>
                     </div>
                  </div>
                  
                  {/* Action Code */}
                  <div className="px-8 py-3 w-48 flex justify-center">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black border uppercase tracking-tighter shadow-sm ${getActionColor(log.action)} inline-flex items-center justify-center text-center min-w-[100px]`}>
                      {log.action}
                    </span>
                  </div>

                  {/* Details Trace */}
                  <div className="px-8 py-3 flex-1 min-w-0">
                    <div className="space-y-1.5">
                       <p className="text-[12px] font-medium text-slate-600 dark:text-slate-300 leading-relaxed group-hover:text-primary-500 transition-colors line-clamp-1">{log.details}</p>
                       <div className="flex items-center gap-3">
                          <div className="px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded text-[8px] font-mono text-slate-400 border border-slate-200/50 dark:border-white/5">
                            ID: {log.id?.substring(0,12)}
                          </div>
                          <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-white/20"></div>
                          <span className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em] opacity-70">GÜVENLİ İŞLEM ✓</span>
                       </div>
                    </div>
                  </div>

                  {/* Responsible Personnel */}
                  <div className="px-8 py-3 w-64 flex justify-end">
                    <div className="flex items-center gap-3 text-right bg-slate-50 dark:bg-white/[0.03] px-4 py-2 rounded-2xl border border-slate-100 dark:border-white/5 group-hover:border-primary-500/20 transition-all">
                      <div className="flex flex-col min-w-0">
                         <span className="text-[10px] font-black uppercase tracking-tight text-slate-700 dark:text-slate-200 truncate">{log.user}</span>
                         <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">SİSTEM YETKİLİSİ</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-slate-100 dark:border-white/10 shrink-0 text-slate-400"><User size={14} /></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredLogs.length === 0 && !loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 opacity-20">
               <FileText size={64} />
               <span className="text-[10px] font-black uppercase tracking-[0.4em]">ARANAN KRİTERDE KAYIT BULUNAMADI</span>
            </div>
          )}
        </div>

        {/* 🛡️ Refined Footer */}
        <div className="bg-slate-50/50 dark:bg-white/[0.02] p-8 flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 dark:border-white/5 gap-6 shrink-0">
           <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              GÜNCEL ARŞİVDE <span className="text-slate-800 dark:text-white">{logs.length.toLocaleString('tr-TR')}</span> KAYIT MEVCUT • <span className="text-primary-500">{filteredLogs.length.toLocaleString('tr-TR')}</span> SONUÇ GÖSTERİLİYOR
           </div>
           
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">VERİ AKIŞI SENKRONİZE</span>
              </div>
              <button 
                onClick={() => parentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-5 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-primary-500 transition-all flex items-center gap-2"
              >
                <ArrowDown size={12} className="rotate-180" /> BAŞA DÖN
              </button>
           </div>
        </div>
      </div>
    </div>
  )
}

