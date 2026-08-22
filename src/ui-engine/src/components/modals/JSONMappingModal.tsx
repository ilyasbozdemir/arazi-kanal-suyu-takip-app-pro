import { useState, FC } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileSpreadsheet, CheckCircle2, AlertCircle, UploadCloud, Loader2, ArrowRight, Download } from 'lucide-react'
import { useAppStore } from "@renderer/store/useAppStore"

interface JSONMappingModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export const JSONMappingModal: FC<JSONMappingModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [filePath, setFilePath] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ 
    success: boolean; 
    count?: number; 
    errorCount?: number;
    errors?: any[];
    error?: string 
  } | null>(null)
  
  const { profile } = useAppStore()

  const handleClose = () => {
    setFilePath('')
    setResult(null)
    setIsProcessing(false)
    onClose()
  }

  const handleSelectFile = async () => {
    try {
      const file = await (window as any).api.openExcelDialog()
      if (file) setFilePath(file)
    } catch (e: any) {
      alert('Seçim Hatası: ' + e.message);
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const res = await (window as any).api.downloadExcelTemplate()
      if (res.success) {
        alert('Örnek şablon başarıyla kaydedildi.');
      }
    } catch (e: any) {
      alert('İndirme Hatası: ' + e.message);
    }
  }

  const handleStartImport = async () => {
    if (!filePath) return
    setIsProcessing(true)
    setResult(null)

    try {
      // 🛡️ KURUM MÜHÜR: Sorumlu ID'yi PROFİLDEN otomatik çekiyoruz
      const responsibleId = profile.citizenId || null;
      const res = await (window as any).api.importExcelWithJson(filePath, responsibleId)
      setResult(res)
      // 🛡️ Eğer hata yoksa otomatik kapat, varsa kullanıcı incelesin
      if (res.success && (!res.errors || res.errors.length === 0)) {
        setTimeout(() => {
          handleClose()
          onComplete()
        }, 3000)
      }
    } catch (e: any) {
      setResult({ success: false, error: e.message })
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-8">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={handleClose} 
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl z-[99998]" 
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 30 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.9, y: 30 }} 
          className="relative z-[99999] bg-white dark:bg-[#0d1117] w-full max-w-2xl rounded-[40px] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-600 text-white rounded-2xl shadow-lg shadow-primary-500/20">
                <FileSpreadsheet size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tighter uppercase leading-none">Kişi VERİ AKTARIM SİSTEMİ</h2>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-2">KURUM BAŞKANLIĞI ERP TERMİNALİ</p>
              </div>
            </div>
            <button 
              title="Pencereyi Kapat"
              onClick={handleClose} 
              className="p-3 bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-rose-500 rounded-2xl transition-all active:scale-95"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar">
            {!result ? (
              <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-6 rounded-[32px] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">ADIM 1: STANDART ŞABLON</p>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-1">Önce kabul edilen formatda ki örnek dosyayı indirin.</p>
                    </div>
                    <button 
                      title="Şablonu İndir"
                      onClick={(e) => { e.stopPropagation(); handleDownloadTemplate(); }}
                      className="px-6 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center gap-2"
                    >
                      <Download size={14} /> ŞABLONU İNDİR
                    </button>
                  </div>
                </div>

                <div 
                  onClick={(e) => { e.stopPropagation(); handleSelectFile(); }}
                  className={`relative p-12 border-4 border-dashed rounded-[44px] transition-all cursor-pointer flex flex-col items-center gap-6 group ${filePath ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/2 hover:border-primary-500/50 hover:bg-white'}`}
                >
                  <div className={`w-24 h-24 rounded-[36px] flex items-center justify-center transition-all ${filePath ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20' : 'bg-white dark:bg-white/5 text-slate-200 group-hover:scale-110 shadow-sm'}`}>
                    {filePath ? <CheckCircle2 size={48} /> : <UploadCloud size={48} />}
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-base font-black text-slate-800 dark:text-white uppercase tracking-tight">
                      {filePath ? 'VERİ DOSYASI HAZIR' : 'ADIM 2: EXCEL DOSYASINI SEÇİN'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] truncate max-w-xs mx-auto">
                      {filePath ? filePath.split(/[\\/]/).pop() : 'LÜTFEN DOLDUĞUNUZ ŞABLONU BU ALANA YÜKLEYİN'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 rounded-3xl bg-blue-500/5 border border-blue-500/10">
                  <AlertCircle className="text-blue-600 shrink-0" size={18} />
                  <p className="text-[10px] font-bold text-blue-700 dark:text-blue-500 leading-normal uppercase tracking-wider">
                    ÖNEMLİ: Sorumlu bilgisi profilinizdeki vatandaş kaydından otomatik olarak alınacaktır.
                  </p>
                </div>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-10 rounded-[44px] text-center space-y-8 ${result.success ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}
              >
                <div className={`w-24 h-24 rounded-[36px] mx-auto flex items-center justify-center shadow-2xl ${result.success && result.errorCount === 0 ? 'bg-emerald-500 text-white shadow-emerald-500/40' : result.success && result.errorCount ? 'bg-amber-500 text-white shadow-amber-500/40' : 'bg-rose-500 text-white shadow-rose-500/40'}`}>
                  {result.success && result.errorCount === 0 ? <CheckCircle2 size={48} /> : (result.success && result.errorCount ? <AlertCircle size={48} /> : <AlertCircle size={48} />)}
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">
                    {result.success ? 'AKTARIM TAMAMLANDI' : 'HATA OLUŞTU'}
                  </h3>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed uppercase">
                    {result.success 
                      ? `${result.count} Kişi KAYDI BAŞARIYLA İŞLENDİ.` 
                      : result.error || 'VERİ UYUMSUZLUĞU TESPİT EDİLDİ.'}
                  </p>
                  
                  {result.errors && result.errors.length > 0 && (
                    <div className="mt-8 text-left space-y-4">
                      <div className="flex items-center justify-between">
                         <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em]">Hatalı Kayıtlar ({result.errorCount})</p>
                         <p className="text-[10px] font-bold text-slate-400 italic">* Lütfen bu satırları kontrol edin.</p>
                      </div>
                      <div className="bg-white dark:bg-black/20 border border-slate-100 dark:border-white/5 rounded-[32px] overflow-hidden">
                        <div className="max-h-64 overflow-y-auto custom-scrollbar p-2">
                          {result.errors.map((err, i) => (
                            <div key={i} className="p-4 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-slate-50 dark:border-white/2 last:border-none">
                              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center text-[10px] font-black shrink-0">
                                {err.row}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase truncate">{err.data || 'Bilinmeyen'}</p>
                                <p className="text-[10px] font-bold text-rose-500 uppercase mt-0.5">{err.error}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-slate-100 dark:border-white/5 flex justify-end gap-4 bg-slate-50/50 dark:bg-white/5">
            <button 
              title="Vazgeç"
              onClick={handleClose}
              className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl transition-all"
            >
              İPTAL
            </button>
            {!result && (
              <button 
                title="Aktarımı Başlat"
                disabled={!filePath || isProcessing}
                onClick={(e) => { e.stopPropagation(); handleStartImport(); }}
                className="px-12 py-5 bg-primary-600 hover:bg-primary-700 disabled:opacity-20 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-primary-500/40 transition-all flex items-center gap-3 active:scale-95 active:shadow-none"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
                VERİLERİ SİSTEME AKTAR
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
