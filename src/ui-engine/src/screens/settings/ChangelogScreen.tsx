import React, { useState, useEffect } from 'react';
import { History, ChevronRight, PackageCheck, AlertCircle, Calendar, ArrowUpCircle, Zap, ShieldCheck, Code } from 'lucide-react';

export const ChangelogScreen: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSnapshot, setSelectedSnapshot] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await (window as any).api.getSchemaHistory();
        
        if (res.success && res.history) {
          const items = res.history;
          
          // Sort by version descending (basic string sort, assumes standard semver)
          items.sort((a: any, b: any) => {
            const vA = a.migratedTo || a.version || "0.0.0";
            const vB = b.migratedTo || b.version || "0.0.0";
            return vB.localeCompare(vA, undefined, { numeric: true, sensitivity: 'base' });
          });
          setHistory(items);
        } else {
           setError(res.error || 'Bilinmeyen bir hata oluştu.');
           console.warn('[CHANGELOG] Directory or files not found via API:', res.error);
        }
      } catch (err: any) {
        setError(err.message);
        console.error('Sürüm notları okunamadı:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  return (
    <div className="h-full w-full overflow-y-auto p-12 bg-slate-50 dark:bg-slate-950 custom-scrollbar">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="relative mb-20">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute top-0 right-0 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl" />
          
          <div className="relative flex flex-col md:flex-row items-center gap-8 p-10 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[40px] shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <History size={160} />
            </div>
            
            <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-emerald-500/30 shrink-0">
              <History size={40} strokeWidth={2.5} />
            </div>
            
            <div className="text-center md:text-left">
              <h1 className="text-5xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic leading-none">Sürüm Tarihçesi</h1>
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mt-4">
                 <span className="px-4 py-1.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck size={14} /> Arazi Suyu Takip Sistemi GÜVENLİK
                 </span>
                 <span className="px-4 py-1.5 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <Zap size={14} /> RDBMS MİMARİSİ
                 </span>
                 <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-2 hidden md:block" />
                 <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest italic">
                    Kurum Başkanlığı Arazi & Su Takip Sistemi Gelişim Süreci
                 </p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Veritabanı Geçmişi Sorgulanıyor...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-32 bg-white dark:bg-white/5 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-white/10 p-12">
            <AlertCircle size={64} className="mx-auto text-rose-500 mb-6 animate-bounce" />
            <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-widest mb-4">Tarihçe Kaydı Bulunamadı</h3>
            <div className="max-w-2xl mx-auto p-6 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-3xl">
               <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest leading-loose">
                  {error || 'sql_history klasörü ve içindeki JSON verileri saptanamadı.'}
               </p>
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase mt-8 tracking-[0.2em]">
               LÜTFEN SİSTEM YÖNETİCİSİ İLE İLETİŞİME GEÇİN VEYA DOSYA YOLUNU KONTROL EDİN.
            </p>
          </div>
        ) : (
          <div className="relative space-y-16 pb-20">
            {/* Main Timeline Line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 via-blue-500 to-transparent opacity-20 hidden md:block" />

            {history.map((item, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div key={idx} className={`relative flex flex-col md:flex-row items-center gap-12 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  
                  {/* Timeline Node (Center) */}
                  <div className="absolute left-8 md:left-1/2 -ml-[18px] w-9 h-9 rounded-full bg-white dark:bg-slate-900 border-4 border-emerald-500 shadow-2xl z-10 flex items-center justify-center group">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 group-hover:scale-150 transition-transform" />
                     {idx === 0 && <div className="absolute inset-0 rounded-full border-4 border-emerald-500 animate-ping opacity-30" />}
                  </div>

                  {/* Date Label (Floating) */}
                  <div className={`hidden md:flex w-full ${isEven ? 'justify-end text-right' : 'justify-start text-left'}`}>
                     <div className="px-6 py-2 bg-slate-100 dark:bg-white/5 rounded-2xl inline-flex items-center gap-3">
                        <Calendar size={14} className="text-slate-400" />
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest italic">
                           {new Date(item.migrationDate).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                     </div>
                  </div>

                  {/* Content Card */}
                  <div className="w-full pl-20 md:pl-0">
                    <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[32px] p-8 shadow-xl shadow-slate-200/20 dark:shadow-none hover:border-emerald-500/40 hover:-translate-y-1 transition-all group overflow-hidden relative">
                      {/* Decorative elements */}
                      <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/5 rounded-full" />
                      
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center font-black text-sm">
                              v{item.migratedTo}
                           </div>
                           {item.version && (
                              <div className="flex items-center gap-2 text-slate-300">
                                 <ChevronRight size={14} />
                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Base v{item.version}</span>
                              </div>
                           )}
                        </div>
                        <div className="md:hidden flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                           <Calendar size={12} />
                           {new Date(item.migrationDate).toLocaleDateString('tr-TR', { year: 'numeric', month: 'short' })}
                        </div>
                      </div>

                      <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-4 group-hover:text-emerald-500 transition-colors">
                        {item.description}
                      </h3>

                      <div className="space-y-4">
                        <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                           <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed italic">
                              "{item.notes}"
                           </p>
                        </div>

                        {/* Test Results Section (kurum Validation) */}
                        {item.testResults && (
                           <div className="mt-8 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-[32px] overflow-hidden relative group/tests">
                              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/tests:scale-110 transition-transform">
                                 <ShieldCheck size={48} className="text-emerald-500" />
                              </div>
                              <div className="flex items-center gap-3 mb-4">
                                 <div className="w-8 h-8 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                    <PackageCheck size={16} />
                                 </div>
                                 <h4 className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{item.testResults.summary}</h4>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                 {item.testResults.checks.map((check: any, cidx: number) => (
                                   <div key={cidx} className="flex items-center justify-between p-3 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{check.name}</span>
                                      <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                                         check.status === 'PASSED' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                                      }`}>
                                         {check.status === 'PASSED' ? 'GEÇTİ' : 'HATA'}
                                      </div>
                                   </div>
                                 ))}
                              </div>
                           </div>
                         )}

                        <div className="flex flex-wrap gap-3 mt-4">
                           {item.schemaSnapshot && (
                              <button 
                                onClick={() => setSelectedSnapshot(selectedSnapshot === item.migratedTo ? null : item.migratedTo)}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20"
                              >
                                 <PackageCheck size={14} /> 
                                 {selectedSnapshot === item.migratedTo ? 'SNAPSHOTI KAPAT' : 'ŞEMA SNAPSHOTINI GÖR'}
                              </button>
                           )}
                           <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/10 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest">
                              <Code size={14} /> JSON VERİSİ HAZIR
                           </div>
                        </div>

                        {/* Snapshot Preview Area */}
                        {selectedSnapshot === item.migratedTo && (
                           <div className="mt-6 animate-in slide-in-from-top-4 duration-300 overflow-hidden rounded-2xl border border-emerald-500/20 bg-slate-900 p-6 shadow-inner">
                              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
                                 <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                    <PackageCheck size={14} /> Şema Yapısı Dökümü (Tables)
                                 </div>
                                 <div className="text-[10px] font-mono text-slate-500">v{item.migratedTo}.json</div>
                              </div>
                              <pre className="text-[10px] font-mono text-emerald-500/80 overflow-x-auto custom-scrollbar max-h-60 leading-relaxed">
                                 {JSON.stringify(item.schemaSnapshot, null, 2)}
                              </pre>
                           </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* End of Line Indicator */}
            <div className="flex justify-center pt-10">
               <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-400">
                     <ArrowUpCircle size={20} />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">YOLUN BAŞI (V1.0.0)</span>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

