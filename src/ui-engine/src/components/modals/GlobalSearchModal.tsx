import { FC, useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Users, Map, Command, ArrowRight, CornerDownLeft, Sparkles, Filter, Info, MapPin } from 'lucide-react'

interface GlobalSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onItemClick: (type: string, id: any) => void
}

export const GlobalSearchModal: FC<GlobalSearchModalProps> = ({ isOpen, onClose, onItemClick }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSearch = useCallback(async (text: string) => {
    if (!text.trim()) {
      setResults([])
      return
    }
    setLoading(true)
    const res = await (window as any).api.globalSearch(text)
    if (res.success) {
      setResults(res.data || [])
      setSelectedIndex(0)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => handleSearch(query), 300)
    return () => clearTimeout(timer)
  }, [query, handleSearch])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
      setQuery('')
      setResults([])
    }
  }, [isOpen])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev))
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      const item = results[selectedIndex]
      onItemClick(item.type, item.id)
      onClose()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-[10vh] px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-100 dark:border-white/5 overflow-hidden flex flex-col max-h-[70vh]"
          >
            {/* Search Header */}
            <div className="relative border-b border-slate-100 dark:border-white/5 p-6 bg-slate-50/50 dark:bg-slate-800/20">
              <div className="absolute left-10 top-1/2 -translate-y-1/2 text-primary-500 animate-pulse">
                <Search size={24} strokeWidth={2.5} />
              </div>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Kişi, Tapu veya Akılı Filtre (ada/parsel, isim:baba)..."
                className="w-full pl-14 pr-12 py-4 bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-white/5 rounded-2xl outline-none focus:border-primary-500/30 transition-all font-bold text-lg text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 shadow-inner"
              />
              <button
                aria-label="Kapat"
                onClick={onClose}
                className="absolute right-10 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-rose-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 min-h-[300px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SİSTEM TARANIYOR...</p>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-2">
                  <div className="px-4 py-2 flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Arama Sonuçları ({results.length})</p>
                    <p className="text-[8px] font-bold text-primary-500 uppercase tracking-widest bg-primary-500/10 px-2 py-1 rounded-md">Smart-Rank™ Sıralaması</p>
                  </div>
                  {results.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => { onItemClick(item.type, item.id); onClose(); }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`
                        flex items-center gap-5 p-5 rounded-2xl cursor-pointer transition-all border-2
                        ${idx === selectedIndex
                          ? 'bg-primary-500/5 border-primary-500/20 translate-x-1 shadow-lg'
                          : 'bg-white dark:bg-slate-900 border-transparent hover:border-slate-100 dark:hover:border-white/5'}
                      `}
                    >
                      <div className={`
                        w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm
                        ${item.type === 'Kişi' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500' :
                          item.type === 'Tapu' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500' :
                            'bg-blue-50 dark:bg-blue-900/20 text-blue-500'}
                      `}>
                        {item.type === 'Kişi' ? <Users size={24} /> : item.type === 'Tapu' ? <Map size={24} /> : <MapPin size={24} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${item.type === 'Kişi' ? 'bg-indigo-500 text-white' :
                              item.type === 'Tapu' ? 'bg-emerald-500 text-white' :
                                'bg-blue-500 text-white'
                            }`}>{item.type}</span>
                          {item.is_exact === 1 && <span className="flex items-center gap-1 text-[8px] font-black text-blue-500 uppercase bg-blue-500/10 px-2 py-0.5 rounded-md"><Sparkles size={8} /> Tam Eşleşme</span>}
                        </div>
                        <h4 className="text-md font-black text-slate-800 dark:text-white uppercase truncate tracking-tight">{item.title}</h4>
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 truncate mt-0.5">{item.subtitle}</p>
                      </div>
                      <div className={`transition-all ${idx === selectedIndex ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
                        <div className="p-3 bg-primary-500 text-white rounded-xl shadow-lg shadow-primary-500/30">
                          <ArrowRight size={18} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : query ? (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-40 grayscale">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6"><Search size={40} className="text-slate-400" /></div>
                  <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] mb-2">Sonuç Bulunamadı</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Lütfen farklı anahtar kelimeler ile tekrar deneyin.</p>
                </div>
              ) : (
                <div className="p-10 space-y-10 animate-in fade-in zoom-in duration-500">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] border border-slate-100 dark:border-white/5 space-y-4 shadow-sm group hover:border-primary-500/20 transition-all">
                      <div className="flex items-center gap-3 mb-2">
                        <Filter size={18} className="text-primary-500" />
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Akıllı Arama Rehberi</h5>
                      </div>
                      <div className="space-y-4">
                        <div className="flex flex-col gap-1">
                          <p className="text-[9px] font-black text-primary-600 dark:text-primary-400">AİLE BAĞI ARAMA (:)</p>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">isim:baba_veya_ana_adı</p>
                          <p className="text-[8px] text-slate-400 italic">Örn: ahmet:mehmet</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400">ADA/PARSEL ARAMA (/)</p>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">ada_no/parsel_no</p>
                          <p className="text-[8px] text-slate-400 italic">Örn: 101/45</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-8 bg-indigo-500/5 rounded-[32px] border border-indigo-500/10 flex flex-col justify-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-500 text-white rounded-2xl shadow-lg"><Info size={18} /></div>
                        <h5 className="text-[10px] font-black text-indigo-900 dark:text-indigo-400 uppercase tracking-widest">Hızlı İpucu</h5>
                      </div>
                      <p className="text-xs font-bold text-indigo-700 dark:text-indigo-400 leading-relaxed uppercase tracking-tight">
                        Herhangi bir yerden <span className="bg-indigo-500 text-white px-2 py-0.5 rounded-md">CTRL + K</span> tuşlarına basarak bu pencereyi açabilirsiniz.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-12 pt-4 opacity-50">
                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase">
                      <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-white/10 flex items-center gap-1"><CornerDownLeft size={10} /> ENTER</kbd> Seç
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase">
                      <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-white/10">↑↓</kbd> Gezin
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase">
                      <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-white/10">ESC</kbd> Kapat
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-5 px-10 flex items-center justify-between border-t border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <Command size={14} className="text-slate-400" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">KURUM BAŞKANLIĞI YBS GLOBAL SEARCH</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-bold text-primary-500 bg-primary-500/10 px-3 py-1 rounded-full uppercase tracking-widest italic animate-pulse">Sistem Tüm Kayıtları Tarıyor</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

