import { useState, useEffect, useMemo, FC } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  History, 
  ChevronRight, 
  Database, 
  Navigation,
  LucideIcon
} from 'lucide-react'

interface LinesViewProps {
  title: string
  description: string
  tableName: string
  icon: LucideIcon
  onRowClick: (table: string, id: any) => void
  onCreateClick?: (table: string) => void
  initialData?: any[]
  onCacheUpdate?: (table: string, data: any[]) => void
  searchTerm: string
}

export const LinesView: FC<LinesViewProps> = ({ 
  title, 
  description, 
  tableName, 
  icon: Icon, 
  onRowClick, 
  onCreateClick, 
  initialData, 
  onCacheUpdate, 
  searchTerm 
}) => {
  const [data, setData] = useState<any[]>(initialData || [])
  const [loading, setLoading] = useState(!initialData || initialData.length === 0)

  const loadData = async (force: boolean = false) => {
    if (!tableName || !(window as any).api) return;
    if (!data.length || force) setLoading(true);
    const res = await (window as any).api.getDbData(tableName);
    if (res.success) {
      setData(res.data || []);
      if (onCacheUpdate) onCacheUpdate(tableName, res.data || []);
    }
    setLoading(false);
  }

  useEffect(() => { if (data.length === 0) loadData(); }, [tableName])
  useEffect(() => { if (initialData && initialData.length > 0) setData(initialData); }, [initialData])

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const lowerSearch = searchTerm.toLowerCase();
    return data.filter((row: any) =>
      Object.values(row).some(val => String(val || '').toLowerCase().includes(lowerSearch))
    )
  }, [data, searchTerm]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm gap-6">
        <div className="flex items-center gap-6">
          <div className="p-5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-3xl shadow-inner transition-colors">
            <Icon size={36} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tighter leading-tight">{title}</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">{description}</p>
          </div>
        </div>
        <button onClick={() => onCreateClick && onCreateClick(tableName)} className="group flex items-center gap-3 px-8 py-4 bg-blue-600 text-white font-black rounded-3xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 text-sm uppercase tracking-widest">
          <Plus size={20} className="group-hover:rotate-90 transition-transform" /> Yeni Hat Planla
        </button>
      </div>

      {loading ? (
        <div className="py-40 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Yükleniyor...</p>
        </div>
      ) : filteredData.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8">
          {filteredData.map((line: any) => (
            <motion.div
              key={line.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-2xl hover:shadow-blue-500/10 transition-all group relative cursor-pointer overflow-hidden"
              onClick={() => onRowClick(tableName, line.id)}
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full -translate-y-20 translate-x-20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-10 bg-blue-500 rounded-full"></div>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none">{line.hat_adi || 'Bilinmeyen Hat'}</h3>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 group-hover:text-blue-500 transition-colors">
                  <ChevronRight size={24} />
                </div>
              </div>
              <div className="flex items-center gap-2 py-6 relative">
                <div className="flex-1 text-center">
                  <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-slate-100 dark:border-slate-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-500 transition-colors"><Database size={24} /></div>
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Kaynak</p>
                  <p className="text-sm font-black text-slate-700 dark:text-slate-200 line-clamp-1">{line.kaynak_depo || '---'}</p>
                </div>
                <div className="flex-[0.5] flex items-center justify-center relative">
                  <div className="h-[3px] w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="w-full h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                    ></motion.div>
                  </div>
                </div>
                <div className="flex-1 text-center">
                  <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-slate-100 dark:border-slate-800 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 group-hover:text-emerald-500 transition-colors"><Navigation size={24} /></div>
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Menzil</p>
                  <p className="text-sm font-black text-slate-700 dark:text-slate-200 line-clamp-1">{line.baslangic_mevki} → {line.bitis_mevki}</p>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-slate-50 dark:border-slate-800 grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-3xl">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Takvim</p>
                  <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 line-clamp-1">{line.sulama_gunleri || 'Her Gün'}</p>
                </div>
                <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-3xl text-right">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Periyot</p>
                  <p className="text-[11px] font-black text-slate-800 dark:text-slate-200">{line.periyot_gun || 15} GÜN</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-40 text-center opacity-20 flex flex-col items-center">
          <History size={80} className="mb-6" />
          <p className="text-3xl font-black uppercase tracking-tighter">Henüz Planlama Yok</p>
          <p className="text-sm font-medium mt-2">Yeni bir sulama hattı tanımlayarak başlayın.</p>
        </div>
      )}
    </div>
  )
}

