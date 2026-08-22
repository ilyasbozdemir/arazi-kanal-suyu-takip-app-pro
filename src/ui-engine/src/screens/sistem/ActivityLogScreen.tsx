import { useState, useEffect, FC, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  History, 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  Filter, 
  ArrowRight, 
  User, 
  Calendar,
  Database,
  Lock,
  Unlock,
  Eye
} from 'lucide-react'

export const ActivityLogScreen: FC = () => {
  const [logs, setLogs] = useState<any[]>([])
  const [isChainValid, setIsChainValid] = useState(true)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAction, setFilterAction] = useState('ALL')
  const [selectedLog, setSelectedLog] = useState<any>(null)

  const fetchLogs = async () => {
    setLoading(true)
    if ((window as any).api) {
      const res = await (window as any).api.getActivityLogs()
      if (res.success) {
        setLogs(res.logs)
        setIsChainValid(res.isChainValid)
      }
    }
    setLoading(false)
  }

  useEffect(() => { fetchLogs() }, [])

  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      const matchesSearch = 
        l.Table_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.Ad_Soyad || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.Action.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesAction = filterAction === 'ALL' || l.Action === filterAction;
      
      return matchesSearch && matchesAction;
    })
  }, [logs, searchTerm, filterAction])

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'text-emerald-500 bg-emerald-500/10'
      case 'UPDATE': return 'text-amber-500 bg-amber-500/10'
      case 'DELETE': return 'text-rose-500 bg-rose-500/10'
      case 'RESTORE': return 'text-blue-500 bg-blue-500/10'
      default: return 'text-slate-500 bg-slate-500/10'
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Integrity Status */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center border ${isChainValid ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
            {isChainValid ? <ShieldCheck size={32} /> : <ShieldAlert size={32} />}
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none mb-1">PERSONEL DENETİM PANELİ</h2>
            <div className="flex items-center gap-2">
               <div className={`w-2 h-2 rounded-full ${isChainValid ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                 {isChainValid ? 'ZİNCİR BÜTÜNLÜĞÜ KORUNUYOR (GÜVENLİ)' : 'ZİNCİRDE KIRILMA TESPİT EDİLDİ (KRİTİK)'}
               </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-2xl flex gap-1">
              {['ALL', 'CREATE', 'UPDATE', 'DELETE'].map(a => (
                <button 
                  key={a}
                  onClick={() => setFilterAction(a)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterAction === a ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {a === 'ALL' ? 'HEPSİ' : a}
                </button>
              ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Log List */}
        <div className="lg:col-span-8 space-y-4">
           <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="TABLO, PERSONEL VEYA İŞLEM ARA..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-3xl py-5 pl-16 pr-8 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>

           <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm h-[600px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-white dark:bg-slate-900 z-10 border-b border-slate-50 dark:border-white/5">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ZAMAN / PERSONEL</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">İŞLEM / TABLO</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">DURUM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                  {filteredLogs.map((log) => (
                    <tr 
                      key={log.id} 
                      onClick={() => setSelectedLog(log)}
                      className={`group hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer ${selectedLog?.id === log.id ? 'bg-primary-500/5' : ''}`}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary-500 group-hover:text-white transition-all">
                             <User size={18} />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tighter">{log.Ad_Soyad || 'SİSTEM'}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(log.Timestamp).toLocaleString('tr-TR')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${getActionColor(log.Action)}`}>
                               {log.Action}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{log.Table_Name}</span>
                         </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <div className={`inline-flex items-center gap-2 ${log.integrity_error || log.chain_error ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {log.integrity_error || log.chain_error ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />}
                            <span className="text-[9px] font-black uppercase tracking-widest">
                               {log.integrity_error || log.chain_error ? 'İHLAL' : 'MÜHÜRLÜ'}
                            </span>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>

        {/* Details Panel */}
        <div className="lg:col-span-4">
           <AnimatePresence mode="wait">
             {selectedLog ? (
               <motion.div 
                 key={selectedLog.id}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 20 }}
                 className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-xl p-8 sticky top-8 space-y-8"
               >
                 <div className="flex justify-between items-start">
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">İşlem Kimliği (UUID)</p>
                       <p className="text-[10px] font-mono text-slate-500 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg break-all">
                          {selectedLog.id}
                       </p>
                    </div>
                    <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-rose-500 transition-all">✕</button>
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-white/5">
                       <Database className="text-primary-500" size={20} />
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hedef Tablo & Kayıt</p>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">{selectedLog.Table_Name} / {selectedLog.Record_Id.substring(0, 8)}...</p>
                       </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-white/5">
                       <Lock className="text-amber-500" size={20} />
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Önceki Kayıt Hash (Link)</p>
                          <p className="text-[9px] font-mono text-slate-500 truncate w-48">{selectedLog.Prev_Log_Hash || 'N/A'}</p>
                       </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-white/5">
                       <Unlock className="text-emerald-500" size={20} />
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mevcut Kayıt Hash (Seal)</p>
                          <p className="text-[9px] font-mono text-slate-500 truncate w-48">{selectedLog.Log_Hash || 'N/A'}</p>
                       </div>
                    </div>
                 </div>

                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <ArrowRight size={12} /> VERİ DEĞİŞİM ANALİZİ
                    </p>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                       {selectedLog.Action === 'UPDATE' ? (
                          <>
                            <div className="p-4 bg-rose-50 dark:bg-rose-500/5 rounded-2xl border border-rose-100 dark:border-rose-500/10">
                               <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-2">Eski Durum</p>
                               <pre className="text-[9px] font-mono text-rose-700 dark:text-rose-400 whitespace-pre-wrap">{selectedLog.Prev_State}</pre>
                            </div>
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-500/5 rounded-2xl border border-emerald-100 dark:border-emerald-500/10">
                               <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-2">Yeni Durum</p>
                               <pre className="text-[9px] font-mono text-emerald-700 dark:text-emerald-400 whitespace-pre-wrap">{selectedLog.Next_State}</pre>
                            </div>
                          </>
                       ) : (
                          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-white/5">
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Kayıt Detayı</p>
                             <pre className="text-[9px] font-mono text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                                {selectedLog.Next_State || selectedLog.Prev_State}
                             </pre>
                          </div>
                       )}
                    </div>
                 </div>
               </motion.div>
             ) : (
               <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-40">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                     <History size={40} className="text-slate-400" />
                  </div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">İŞLEM DETAYLARINI GÖRMEK İÇİN BİR KAYIT SEÇİN</p>
               </div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
