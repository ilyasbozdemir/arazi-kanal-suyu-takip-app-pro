import { useState, useEffect, FC } from 'react'
import { motion } from 'framer-motion'
import { ShieldAlert, AlertCircle, CheckCircle, RefreshCw, User, HelpCircle, Map } from 'lucide-react'

export const AuditScreen: FC<{ onOpenDetail: (table: string, id: any) => void }> = ({ onOpenDetail }) => {
  const [report, setReport] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchReport = async () => {
    setLoading(true)
    if ((window as any).api) {
      // Slight delay to show the "Scanning" effect to the user for better UX
      await new Promise(r => setTimeout(r, 800))
      const res = await (window as any).api.getDirtyDataReport()
      if (res.success) setReport(res.report)
    }
    setLoading(false)
  }

  useEffect(() => { fetchReport() }, [])

  return (
    <div className="h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar pr-2 -mr-2">
      <div className="space-y-8 animate-in fade-in duration-1000 p-2">
        {/* 🛡️ Refined Header */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-10 py-8 rounded-[32px] border border-slate-200/50 dark:border-white/5 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px] pointer-events-none"></div>
          <div className="flex items-center gap-6 text-center md:text-left relative z-10">
            <div className="w-16 h-16 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20">
              <ShieldAlert size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none mb-1">VERİ DENETİM MERKEZİ</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-70">HATALI, EKSİK VEYA STANDARTA UYMAYAN KAYITLARIN TESPİTİ.</p>
            </div>
          </div>
          <button 
            onClick={fetchReport} 
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all text-[10px] uppercase tracking-widest shadow-lg disabled:opacity-50"
          >
            {loading ? <RefreshCw className="animate-spin" size={16} /> : <RefreshCw size={16} />} 
            SİSTEMİ YENİDEN TARA
          </button>
        </div>

        {/* 🛡️ Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-6 rounded-3xl border border-slate-200/50 dark:border-white/5 shadow-sm">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">SORUNLU KAYIT</p>
             <div className="text-3xl font-black text-rose-500 tabular-nums">{report.length}</div>
             <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Acil Müdahale Gerekebilir</p>
          </div>
          <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-6 rounded-3xl border border-slate-200/50 dark:border-white/5 shadow-sm">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">KRİTİK HATALAR</p>
             <div className="text-3xl font-black text-blue-500 tabular-nums">{report.filter(r => r.reason.includes('Kritik')).length}</div>
             <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Yüksek Öncelikli Veri Kaybı Riski</p>
          </div>
          <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-6 rounded-3xl border border-slate-200/50 dark:border-white/5 shadow-sm">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">VERİ SAĞLIK PUANI</p>
             <div className="text-3xl font-black text-emerald-500 tabular-nums">%{Math.max(0, 100 - report.length)}</div>
             <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Genel Veritabanı Bütünlüğü</p>
          </div>
        </div>

        {/* 🛡️ Report List Area */}
        <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200/60 dark:border-white/5 overflow-hidden shadow-2xl relative">
          <div className="p-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-3">
                 <AlertCircle size={18} className="text-rose-500" />
                 TESPİT EDİLEN HATALI KAYITLAR LİSTESİ
              </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 dark:bg-slate-800/30">
                <tr>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">KAYIT / TABLO</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">HATA SEBEBİ</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">MEVCUT DEĞER</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">İŞLEMLER</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {report.map((item, idx) => (
                  <tr key={idx} className="group hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-all">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${item.table === 'DATA_Tapu_Verisi' ? 'bg-emerald-50 text-emerald-500 border-emerald-100 dark:bg-emerald-500/5 dark:border-emerald-500/10' : 'bg-slate-50 dark:bg-white/5 text-slate-400 border-slate-200/50 dark:border-white/5'}`}>
                          {item.table === 'DATA_Tapu_Verisi' ? <Map size={18} /> : <User size={18} />}
                        </div>
                        <div>
                          <p className="text-[12px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight leading-none mb-1 group-hover:text-primary-500 transition-colors">{item.name}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">{item.table}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight border ${item.reason.includes('Nokta') || item.reason.includes('Virgül') ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/5 dark:border-blue-500/10' : 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/5 dark:border-rose-500/10'}`}>
                        {item.reason}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 italic bg-slate-100/50 dark:bg-white/5 px-3 py-1.5 rounded-lg inline-block border border-slate-200/30 dark:border-white/5">
                        "{item.value}"
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => onOpenDetail(item.table, item.id)}
                        className="px-5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all active:scale-95 shadow-sm"
                      >
                        KAYDI DÜZELT
                      </button>
                    </td>
                  </tr>
                ))}
                {report.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="px-8 py-32 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-40">
                         <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center"><CheckCircle size={32} /></div>
                         <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Tebrikler! Hiçbir veri tutarsızlığı bulunamadı.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 🛡️ Help Section */}
        <div className="bg-primary-500/[0.03] border border-primary-500/10 rounded-3xl p-6 flex items-start gap-5">
            <div className="w-10 h-10 bg-primary-500/10 text-primary-500 rounded-xl flex items-center justify-center shrink-0">
               <HelpCircle size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest mb-1.5">VERİ DÜZENLEME STANDARTLARI</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-3xl">
                İsim, soyisim ve adres alanlarında yer alan hatalı karakterler (nokta, virgül, çift boşluk vb.) akıllı filtreleme sistemlerini olumsuz etkileyebilir. 
                Sistemin %100 doğrulukla çalışması için yukarıdaki kayıtları standart yazım kurallarına (Büyük Harf, Noktalama İşaretsiz) göre düzeltmeniz önerilir.
              </p>
            </div>
        </div>
      </div>
    </div>
  )
}
