import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, Search, RefreshCw, MapPin, Calendar, ArrowRight, Activity, Users, FileText, Loader2, Droplets, DollarSign, Clock, AlertTriangle, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { ElectronService } from '../../services/ElectronService';
import { AbbreviatedNumber } from '../../components/AbbreviatedNumber';

interface ActiveLedgersScreenProps {
  addTab?: (tab: any) => void;
}

export const ActiveLedgersScreen: React.FC<ActiveLedgersScreenProps> = ({ addTab }) => {
  const [ledgers, setLedgers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadLedgers = async () => {
    setIsLoading(true);
    try {
      const res = await (window as any).electron.ipcRenderer.invoke('get-active-ledgers-hub');
      if (res.success) {
        setLedgers(res.data || []);
      } else {
        console.error("[ACTIVE_LEDGERS_HUB_ERROR]", res.error);
      }
    } catch (err) {
      console.error("[ACTIVE_LEDGERS_LOAD_ERROR]", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLedgers();
    
    // 🛡️ SARSILMAZ SENKRONİZASYON: Dışarıdan gelen yenileme sinyallerini dinle
    const handleGlobalRefresh = () => loadLedgers();
    window.addEventListener('KURUM_REFRESH_LEDGERS', handleGlobalRefresh);
    
    return () => {
      window.removeEventListener('KURUM_REFRESH_LEDGERS', handleGlobalRefresh);
    };
  }, []);

  const handleCreateLedger = async (ledger: any) => {
    const res = await (window as any).electron.ipcRenderer.invoke('create-dynamic-ledger', ledger.Mahalle_id, ledger.Baslangic_Yili.toString());
    if (res.success) {
      ElectronService.showAlert({ message: "Defter başarıyla oluşturuldu.", type: 'success' });
      loadLedgers();
    } else {
      ElectronService.showAlert({ message: res.error, type: 'error' });
    }
  };

  const processedLedgers = useMemo(() => {
    if (!ledgers) return [];
    
    // 🛡️ SARSILMAZ DEDÜPLİKASYON: Aynı mahalle ve yıl için hem aktif hem pasif varsa aktifi koru
    const uniqueMap = new Map();
    
    ledgers.forEach(l => {
      const key = `${l.Mahalle_id}-${l.Baslangic_Yili}`;
      const existing = uniqueMap.get(key);
      
      // Eğer mevcut değilse veya mevcut olanın id'si yoksa (placeholder) ama yeninin id'si varsa (aktif), mühürle
      if (!existing || (!existing.id && l.id)) {
        uniqueMap.set(key, l);
      }
    });

    return Array.from(uniqueMap.values());
  }, [ledgers]);

  const filteredLedgers = processedLedgers.filter((l: any) => 
    l.Mahalle_Adi?.toLocaleUpperCase('tr-TR').includes(searchTerm.toLocaleUpperCase('tr-TR')) ||
    l.Baslangic_Yili?.toString().includes(searchTerm)
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden">
      {/* Header */}
      <div className="p-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 shrink-0">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-primary-500/10 rounded-[24px] flex items-center justify-center text-primary-500 ring-8 ring-primary-500/5">
              <BookOpen size={32} />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white leading-none">
                AKTİF DAĞITIM DEFTERLERİ
              </h1>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em]">MEVCUT SEZON SULAMA VE TAHAKKUK MERKEZİ</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Mahalle veya yıl ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[13px] font-bold outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all w-80"
              />
            </div>
            <button 
              onClick={loadLedgers}
              className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-500 hover:text-primary-500 rounded-2xl transition-all shadow-sm"
              title="Yenile"
            >
              <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-[1400px] mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Sistem Defterleri Taranıyor...</p>
            </div>
          ) : filteredLedgers.length === 0 ? (
            <div className="text-center py-32 bg-white dark:bg-slate-900 rounded-[48px] border-2 border-dashed border-slate-200 dark:border-white/10">
              <BookOpen size={48} className="mx-auto text-slate-200 mb-6" />
              <h3 className="text-xl font-black text-slate-400 uppercase tracking-tighter">Henüz Bir Dağıtım Defteri Bulunmuyor</h3>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">MAHALLE YÖNETİMİNDEN YENİ SEZON BAŞLATABİLİRSİNİZ</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredLedgers.map((ledger: any, i: number) => {
                const isReady = !!ledger.id;
                
                return (
                  <motion.div
                    key={`${ledger.Mahalle_id}-${ledger.Baslangic_Yili}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={isReady ? { y: -6, scale: 1.01 } : {}}
                    onClick={() => {
                      if (!isReady) return;
                      const tabData = {
                        id: `ledger-${ledger.id}`,
                        type: 'ledger-detail',
                        title: `${ledger.Mahalle_Adi} ${ledger.Baslangic_Yili}`,
                        data: { 
                          ledger, 
                          mahalle: { id: ledger.Mahalle_id, Mahalle_Adi: ledger.Mahalle_Adi, Tip: ledger.Mahalle_Tip },
                          activeTab: 'defter' // 🛡️ Sarsılmaz Nizam: Doğrudan defter işlem alanına odaklan
                        }
                      };
                      if (addTab) addTab(tabData);
                      else window.dispatchEvent(new CustomEvent('KURUM_NAV_TAB', { detail: tabData }));
                    }}
                    className={`bg-white dark:bg-slate-900 p-8 rounded-[48px] border ${isReady ? 'border-slate-200 dark:border-white/5 cursor-pointer shadow-sm hover:shadow-2xl' : 'border-blue-500/20 bg-blue-500/5'} transition-all group relative overflow-hidden flex flex-col`}
                  >
                    <div className="flex items-start justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 ${isReady ? 'bg-primary-500/10 text-primary-500' : 'bg-blue-500/10 text-blue-600'} rounded-[28px] flex items-center justify-center ring-4 ${isReady ? 'ring-primary-500/5' : 'ring-blue-500/5'} group-hover:scale-110 transition-transform shadow-lg`}>
                          <Droplets size={32} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white leading-none mb-1">
                            {ledger.Mahalle_Adi}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-black px-2 py-0.5 ${isReady ? 'bg-emerald-500/10 text-emerald-600' : 'bg-blue-500/10 text-blue-600'} rounded-full uppercase tracking-widest italic`}>
                              {isReady ? 'AKTİF DAĞITIM' : 'KURULUM BEKLİYOR'}
                            </span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{ledger.Baslangic_Yili} SEZONU</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {!isReady ? (
                      <div className="flex-1 flex flex-col justify-center items-center py-8 text-center space-y-4">
                         <AlertTriangle className="text-blue-500 animate-bounce" size={40} />
                         <div className="space-y-1">
                            <p className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-tight">Veritabanı Yapılandırması Eksik</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">BU MAHALLE İÇİN HENÜZ BİR DAĞITIM TABLOSU OLUŞTURULMAMIŞ.</p>
                         </div>
                         <button 
                            onClick={(e) => { e.stopPropagation(); handleCreateLedger(ledger); }}
                            className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                         >
                            <Plus size={16} /> DEFTERİ ŞİMDİ OLUŞTUR
                         </button>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-4 mb-8">
                          <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 space-y-1">
                            <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase">
                              <FileText size={12} />
                              Kayıt Sayısı
                            </div>
                            <div className="text-xl font-black text-slate-800 dark:text-slate-100 tabular-nums">{ledger.stats?.total_records || 0}</div>
                          </div>
                          <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 space-y-1">
                            <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase">
                              <Clock size={12} />
                              Toplam Saat
                            </div>
                            <div className="text-xl font-black text-slate-800 dark:text-slate-100 tabular-nums">{Math.round(ledger.stats?.total_hours || 0)}s</div>
                          </div>
                        </div>

                        <div className="mt-auto pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-4">
                          <div 
                            className="flex flex-col flex-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 p-2 rounded-xl transition-colors"
                            onClick={(e) => {
                               e.stopPropagation();
                               const tabData = {
                                  id: `collection-report`,
                                  type: 'collection-report',
                                  title: `Mali Tahsilat İcmali`,
                                  data: { initialYear: ledger.Baslangic_Yili }
                               };
                               if (addTab) addTab(tabData);
                               else window.dispatchEvent(new CustomEvent('KURUM_NAV_TAB', { detail: tabData }));
                            }}
                          >
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TOPLAM TAHAKKUK</span>
                             <div className="text-base font-black text-slate-700 dark:text-slate-200 tabular-nums">
                                <AbbreviatedNumber 
                                   value={ledger.stats?.total_amount || 0} 
                                   suffix="₺" 
                                   label="TOPLAM TAHAKKUK BEDELİ" 
                                />
                             </div>
                          </div>
                          
                          <div 
                            className="flex flex-col flex-1 text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 p-2 rounded-xl transition-colors"
                            onClick={(e) => {
                               e.stopPropagation();
                               const tabData = {
                                  id: `collection-report`,
                                  type: 'collection-report',
                                  title: `Mali Tahsilat İcmali`,
                                  data: { initialYear: ledger.Baslangic_Yili }
                               };
                               if (addTab) addTab(tabData);
                               else window.dispatchEvent(new CustomEvent('KURUM_NAV_TAB', { detail: tabData }));
                            }}
                          >
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TOPLAM TAHSİLAT</span>
                             <div className="text-base font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                                <AbbreviatedNumber 
                                   value={ledger.stats?.total_collected || 0} 
                                   suffix="₺" 
                                   label="TOPLAM TAHSİLAT TUTARI" 
                                />
                             </div>
                          </div>

                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-primary-500 group-hover:text-white transition-all group-hover:translate-x-1 shrink-0">
                             <ArrowRight size={20} />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Watermark */}
                    <div className="absolute -top-10 -right-10 opacity-[0.02] group-hover:opacity-[0.05] group-hover:rotate-45 transition-all duration-1000 pointer-events-none">
                      <BookOpen size={200} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
