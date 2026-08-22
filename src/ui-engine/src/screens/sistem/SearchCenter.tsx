import { FC } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Map, 
  Navigation, 
  Droplet, 
  Database,
  Search,
  Star,
  ChevronRight
} from 'lucide-react'

interface SearchCenterProps {
  searchQuery: string
  searchResults: any[]
  searchCategory: string
  setSearchCategory: (cat: any) => void
  handleSearch: (text: string) => void
  handleOpenDetail: (table: string, id: any) => void
}

export const SearchCenter: FC<SearchCenterProps> = ({
  searchQuery,
  searchResults,
  searchCategory,
  setSearchCategory,
  handleSearch,
  handleOpenDetail
}) => {
  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Search Bar & Categories */}
      <div className="bg-white dark:bg-slate-900 p-12 rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden transition-all">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter leading-none mb-3 uppercase">Akıllı Sorgu Merkezi</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-lg tracking-tight italic opacity-70">TCKN, Ad Soyad, Ada/Parsel veya Mevki bazlı arama yapın.</p>
            </div>
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 w-full md:w-auto">
              {['all', 'Kişi', 'Tapu Kaydı', 'Mevki', 'Su Dağıtım'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSearchCategory(cat as any)}
                  className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border ${searchCategory === cat
                    ? 'bg-primary-600 text-white border-primary-500 shadow-xl shadow-primary-500/20'
                    : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border-slate-100 dark:border-slate-700'
                    }`}
                >
                  {cat === 'all' ? 'HEPSİ' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="relative group">
            <div className="absolute left-8 top-1/2 -translate-y-1/2 p-3 bg-primary-500/10 text-primary-500 rounded-2xl group-hover:scale-110 transition-transform duration-500 shadow-inner"><Search size={32} /></div>
            <input
              type="text"
              placeholder="Aramaya başlayın... (Örn: 12345678901 veya Ada:101)"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-24 pr-10 py-10 bg-slate-50 dark:bg-slate-800/50 border-4 border-slate-100 dark:border-slate-700/50 rounded-[40px] text-2xl font-black text-slate-800 dark:text-white outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-inner placeholder:text-slate-300 dark:placeholder:text-slate-700"
            />
            {searchQuery && (
              <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <span className="text-[10px] font-black text-primary-600 bg-primary-100 dark:bg-primary-900/30 px-3 py-1.5 rounded-full uppercase tracking-widest">{searchResults.length} SONUÇ</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Center */}
      <AnimatePresence mode="wait">
        {searchResults.length > 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8 pb-32">
            {searchResults.filter(r => searchCategory === 'all' || r.type === searchCategory).map((res, idx) => {
              const typeMap: Record<string, { table: string, icon: any, color: string }> = {
                'Kişi': { table: 'DATA_Vatandas', icon: Users, color: 'primary' },
                'Tapu Kaydı': { table: 'DATA_Tapu_Verisi', icon: Map, color: 'emerald' },
                'Mevki': { table: 'DATA_Tasinmaz_Mevkileri', icon: Navigation, color: 'blue' },
                'Su Dağıtım': { table: 'ISLEM_Su_Dagitim', icon: Droplet, color: 'cyan' },
                'Depo': { table: 'TANIM_Depolar', icon: Database, color: 'blue' }
              }
              const config = typeMap[res.type] || { table: 'DATA_Vatandas', icon: Search, color: 'slate' }
              const Icon = config.icon

              const colors: Record<string, string> = {
                primary: 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-primary-100 dark:border-primary-900/40',
                emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40',
                blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/40',
                cyan: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-900/40',
                blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/40',
                slate: 'bg-slate-50 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-900/40'
              }

              return (
                <motion.div
                  key={idx}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-white dark:bg-slate-900 p-8 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-primary-500/5 transition-all group cursor-pointer relative overflow-hidden"
                  onClick={() => handleOpenDetail(config.table, res.id)}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 ${colors[config.color].split(' ')[0]}/5 rounded-full -translate-y-16 translate-x-16 blur-2xl group-hover:scale-150 transition-transform`}></div>
                  <div className="flex items-start justify-between mb-8 relative z-10">
                    <div className={`p-5 rounded-[24px] ${colors[config.color]} shadow-inner group-hover:scale-110 transition-transform`}>
                      <Icon size={28} />
                    </div>
                    {res.is_exact === 1 && (
                      <div className="flex items-center gap-1.5 bg-blue-500 text-white px-3 py-1.5 rounded-xl animate-bounce shadow-lg shadow-blue-500/20">
                        <Star size={12} fill="currentColor" />
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">TAM EŞLEŞME</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center gap-2">
                       <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${colors[config.color]}`}>{res.type}</span>
                       <span className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest opacity-50">SORGULAMA SONUCU</span>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter line-clamp-1 group-hover:text-primary-500 transition-colors">{res.title || 'İSİMSİZ KAYIT'}</h3>
                      <p className="text-sm font-bold text-slate-400 dark:text-slate-500 italic line-clamp-1">{res.subtitle || 'Detay bilgisi bulunamadı...'}</p>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center relative z-10">
                     <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">ID: {String(res.id).slice(0, 8)}...</span>
                     <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all"><ChevronRight size={20} /></div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        ) : searchQuery.length > 1 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-40 text-center space-y-8 bg-white/50 dark:bg-slate-900/50 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[56px]">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto animate-pulse"><Search size={48} className="text-slate-300" /></div>
            <div className="space-y-3">
              <h3 className="text-3xl font-black text-slate-700 dark:text-slate-200 uppercase tracking-tighter leading-none italic opacity-50">" {searchQuery} "</h3>
              <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs">Aradığınız kriterlere uygun kayıt bulunamadı.</p>
            </div>
            <button onClick={() => handleSearch('')} className="px-10 py-4 bg-slate-800 dark:bg-primary-600 text-white font-black rounded-3xl hover:bg-slate-700 transition-all text-xs uppercase tracking-widest shadow-xl">TEMİZLE VE YENİDEN ARA</button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-32 text-center opacity-30 flex flex-col items-center gap-6 saturate-0 grayscale contrast-125">
             <div className="flex gap-4">
                <Users size={120} strokeWidth={0.5} />
                <Map size={120} strokeWidth={0.5} />
                <Navigation size={120} strokeWidth={0.5} />
             </div>
             <div className="space-y-2">
                <p className="text-4xl font-black uppercase tracking-tighter leading-none italic">Sorgulamaya Hazır</p>
                <p className="text-sm font-bold uppercase tracking-widest">Veritabanındaki milyonlarca veri arasından akıllı arama yapın.</p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

