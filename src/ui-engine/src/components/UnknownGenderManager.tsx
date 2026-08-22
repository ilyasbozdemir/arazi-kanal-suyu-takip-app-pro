import React, { useState, useEffect } from 'react';
import { Users, RefreshCw, Star, ArrowRight, CheckCircle2 } from 'lucide-react';

interface UnknownGenderManagerProps {
  onRefresh?: () => void;
}

interface NameRecord {
  name: string;
  count: number;
}

export const UnknownGenderManager: React.FC<UnknownGenderManagerProps> = ({ onRefresh }) => {
  const [names, setNames] = useState<NameRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [processedNames, setProcessedNames] = useState<string[]>([])

  const fetchUnknown = async () => {
    setLoading(true)
    const res = await (window as any).api.getUnknownGenders()
    if (res?.success && res.names) {
      setNames(res.names)
    } else {
      setNames([])
    }
    setLoading(false)
  }

  useEffect(() => { fetchUnknown() }, [])

  const handleBulkAssign = async (name: string, gender: string) => {
    if (!window.confirm(`${name} isminin cinsiyetini '${gender}' olarak kaydetmek istiyor musunuz?`)) return;
    const res = await (window as any).api.bulkUpdateGender(name, gender)
    if (res.success) {
      setProcessedNames([...processedNames, name])
      setTimeout(() => {
        setNames(names.filter(n => n.name !== name))
      }, 500)
      if (onRefresh) onRefresh();
    }
  }

  return (
    <div className="mt-12 space-y-8 p-10 bg-white dark:bg-slate-900 rounded-[48px] border border-slate-200 dark:border-white/5 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 blur-[100px] rounded-full -mr-48 -mt-48 pointer-events-none" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4 relative z-10">
        <div>
          <h3 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none mb-3 italic">İSİM ANALİZ MERKEZİ</h3>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">Sistemde Cinsiyeti Tanımlanmamış {(names || []).reduce((acc: any, n: any) => acc + (n.count || 0), 0)} Kişi Tespit Edildi</p>
          </div>
        </div>
        <button
          onClick={fetchUnknown}
          className="group flex items-center gap-3 px-8 py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white rounded-3xl border border-transparent hover:border-primary-500/30 transition-all active:scale-95 font-black text-[10px] uppercase tracking-widest shadow-lg"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'} /> ANALİZİ TAZELE
        </button>
      </div>

      {loading ? (
        <div className="py-32 text-center">
          <div className="w-20 h-20 bg-primary-500/10 text-primary-500 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-spin shadow-2xl shadow-primary-500/20"><RefreshCw size={32} /></div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">VERİ TABANI TARANIYOR...</p>
        </div>
      ) : (names && names.length > 0) ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-h-[700px] overflow-y-auto pr-4 custom-scrollbar p-1">
          {names.map(record => {
            const isProcessed = processedNames.includes(record.name);
            return (
              <div 
                key={record.name} 
                className={`p-6 rounded-[36px] bg-slate-50 dark:bg-white/2 border transition-all duration-500 relative overflow-hidden flex flex-col gap-6 ${isProcessed ? 'border-emerald-500 bg-emerald-500/5 scale-95 opacity-50' : 'border-slate-100 dark:border-white/5 hover:border-primary-500/20 hover:shadow-2xl hover:-translate-y-1'}`}
              >
                {isProcessed && (
                  <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/10 backdrop-blur-sm z-20">
                     <CheckCircle2 size={48} className="text-emerald-500 animate-in zoom-in duration-300" />
                  </div>
                )}
                
                <div className="flex justify-between items-start">
                  <div className="px-5 py-2.5 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                    <span className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">{record.name}</span>
                  </div>
                  <div className="px-3 py-1.5 bg-primary-500 text-white rounded-xl text-[10px] font-black shadow-lg shadow-primary-500/20">
                    {record.count} KİŞİ
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-auto">
                  <button
                    onClick={() => handleBulkAssign(record.name, 'Erkek')}
                    disabled={isProcessed}
                    className="flex flex-col items-center justify-center p-5 bg-blue-500/5 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-3xl hover:bg-blue-500 hover:text-white transition-all transform active:scale-90 border border-blue-500/10 group/btn"
                  >
                    <span className="text-xl mb-1 group-hover/btn:scale-125 transition-transform">♂</span>
                    <span className="text-[9px] font-black uppercase tracking-widest">ERKEK</span>
                  </button>
                  <button
                    onClick={() => handleBulkAssign(record.name, 'Kadın')}
                    disabled={isProcessed}
                    className="flex flex-col items-center justify-center p-5 bg-pink-500/5 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 rounded-3xl hover:bg-pink-500 hover:text-white transition-all transform active:scale-90 border border-pink-500/10 group/btn"
                  >
                    <span className="text-xl mb-1 group-hover/btn:scale-125 transition-transform">♀</span>
                    <span className="text-[9px] font-black uppercase tracking-widest">KADIN</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-32 bg-emerald-500/5 rounded-[60px] text-center border-4 border-dashed border-emerald-500/10">
          <div className="w-24 h-24 bg-emerald-500 text-white rounded-[40px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/30 transform -rotate-12"><Star size={48} fill="currentColor" /></div>
          <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter mb-4 italic">TERTEMİZ LİSTE!</h4>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">SİSTEMDE TANIMSIZ İSİM KALMADI, HERKES KAYIT ALTINA ALINDI.</p>
        </div>
      )}
    </div>
  )
}

