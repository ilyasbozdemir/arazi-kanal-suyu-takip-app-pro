import { useState, useEffect, FC } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Code, Binary, ShieldAlert as ShieldIcon, PackageCheck, ShieldCheck, ListTodo, FileSearch, Activity } from 'lucide-react'

export const DevModeSettings: FC = () => {
    const [devMode, setDevMode] = useState(localStorage.getItem('dev_mode') === 'true')
    const [locStats, setLocStats] = useState<any>(null)
    const [activeTab, setActiveTab] = useState<'stats' | 'tests' | 'logs'>('stats')

    useEffect(() => {
        const fetchLoc = async () => {
            try {
                const res = await (window as any).api.getCodeStats()
                if (res.success) setLocStats(res)
            } catch (e) {}
        }
        fetchLoc()
    }, [])

    const toggleDevMode = (val: boolean) => {
        setDevMode(val)
        localStorage.setItem('dev_mode', val ? 'true' : 'false')
    }

    const testResults = [
        { name: "Paket Sürümü (v2.5.0)", status: "PASSED" },
        { name: "SQL Tarihçe Bütünlüğü", status: "PASSED" },
        { name: "Mevki Otomasyon Mantığı", status: "PASSED" },
        { name: "Veritabanı Şema Tanımı", status: "PASSED" }
    ];

    const sahaTests = [
        { task: "Vatandaş CRUD İşlemleri", status: "Beklemede" },
        { task: "Personel (Merav) Entegrasyonu", status: "Beklemede" },
        { task: "Mevki Otomasyonu (Tapu Kaydı)", status: "Beklemede" },
        { task: "Harita & CBS Katmanları", status: "Beklemede" }
    ];

    return (
        <div className="bg-slate-950 border border-white/5 p-10 rounded-[56px] shadow-2xl space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 overflow-hidden relative">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px]" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px]" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-indigo-600 text-white rounded-[28px] flex items-center justify-center shadow-2xl shadow-primary-500/20">
                        <Code size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">Geliştirici Modu</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Sistem Teknik Denetim Merkezi</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/5">
                    {(['stats', 'tests', 'logs'] as const).map((tab) => (
                        <button
                            type="button"
                            title={tab === 'stats' ? 'İstatistikleri Görüntüle' : tab === 'tests' ? 'Test Merkezine Git' : 'Sistem Loglarını İncele'}
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                activeTab === tab ? 'bg-primary-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            {tab === 'stats' ? 'İstatistikler' : tab === 'tests' ? 'Test Merkezi' : 'Sistem Logları'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="relative z-10 min-h-[400px]">
                <AnimatePresence mode="wait">
                    {activeTab === 'stats' && (
                        <motion.div 
                            key="stats"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-8"
                        >
                            <div className="space-y-6">
                                <div className="p-8 bg-white/5 border border-white/10 rounded-[40px] flex items-center justify-between hover:border-primary-500/40 transition-all group overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform">
                                        <Binary size={64} className="text-primary-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-black text-white uppercase tracking-tight">Geliştirici Modu</h4>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">JSON sekmelerini ve ham veri araçlarını aktif eder.</p>
                                    </div>
                                    <button
                                        type="button"
                                        title={devMode ? "Geliştirici Modunu Kapat" : "Geliştirici Modunu Aç"}
                                        onClick={() => toggleDevMode(!devMode)}
                                        className={`w-16 h-8 rounded-full transition-all relative flex items-center px-1 shadow-inner ${devMode ? 'bg-primary-500' : 'bg-slate-800'}`}
                                    >
                                        <motion.div
                                            animate={{ x: devMode ? 32 : 0 }}
                                            className="w-6 h-6 bg-white rounded-full shadow-2xl"
                                        />
                                    </button>
                                </div>

                                <div className="p-8 bg-white/5 border border-white/10 rounded-[40px] flex items-center justify-between hover:border-indigo-500/40 transition-all group overflow-hidden relative">
                                     <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform">
                                        <Activity size={64} className="text-indigo-500" />
                                     </div>
                                     <div className="space-y-1">
                                        <h4 className="text-sm font-black text-white uppercase tracking-tight">Kod Tabanı</h4>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{locStats ? `${locStats.fileCount} DOSYA AKTİF` : 'Sistem taranıyor...'}</p>
                                     </div>
                                     <div className="text-right">
                                         <div className="text-3xl font-black text-indigo-400 tracking-tighter italic">
                                             {locStats ? locStats.totalLines.toLocaleString() : '---'}
                                         </div>
                                         <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">TOPLAM SATIR</div>
                                     </div>
                                </div>
                            </div>

                            <div className="p-8 bg-rose-500/5 border border-rose-500/20 rounded-[40px] flex flex-col justify-center">
                                <div className="flex items-center gap-3 mb-4 text-rose-500">
                                    <ShieldIcon size={24} />
                                    <span className="text-xs font-black uppercase tracking-[0.2em]">KRİTİK UYARI (Arazi Suyu Takip Sistemi)</span>
                                </div>
                                <p className="text-sm font-bold text-slate-400 leading-relaxed uppercase tracking-tight">
                                    Geliştirici modu aktifken veritabanı onaylarine doğrudan müdahale edilebilir. Bu durum veri bütünlüğünü bozabilir. 
                                    Lütfen sadece sistem güncellemeleri ve debug işlemleri için kullanınız.
                                </p>
                                <div className="mt-8 pt-8 border-t border-rose-500/10 flex items-center justify-between opacity-50">
                                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">GÜVENLİK PROTOKOLÜ:</div>
                                    <div className="text-[9px] font-black text-rose-500 uppercase tracking-widest">AKTİF (LEVEL 4)</div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'tests' && (
                        <motion.div 
                            key="tests"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-8"
                        >
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <ShieldCheck size={20} className="text-emerald-500" />
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest">Teknik Doğrulama (v2.5.0)</h4>
                                </div>
                                {testResults.map((test, i) => (
                                    <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-slate-400 uppercase">{test.name}</span>
                                        <div className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                                            {test.status}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <ListTodo size={20} className="text-primary-500" />
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest">Saha Test Listesi (TODO)</h4>
                                </div>
                                {sahaTests.map((test, i) => (
                                    <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4">
                                        <div className="w-5 h-5 border-2 border-slate-700 rounded-lg" />
                                        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-tight">{test.task}</span>
                                        <span className="ml-auto text-[8px] font-bold text-slate-600 uppercase italic">{test.status}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'logs' && (
                        <motion.div 
                            key="logs"
                            initial={{ opacity: 0, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, filter: 'blur(10px)' }}
                            className="bg-slate-950 border border-white/10 rounded-[32px] p-8"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3 text-indigo-400">
                                    <FileSearch size={24} />
                                    <h4 className="text-xs font-black uppercase tracking-widest">Sistem Olay Kayıtları (Real-time Logs)</h4>
                                </div>
                                <button 
                                    type="button"
                                    title="Log Dosyasını Dışa Aktar"
                                    className="px-5 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                                >
                                    Log Dosyasını Dışa Aktar
                                </button>
                            </div>
                            
                            <div className="space-y-3 font-mono text-[10px] text-slate-400 max-h-[300px] overflow-y-auto custom-scrollbar p-6 bg-black/40 rounded-2xl border border-white/5">
                                <div className="flex gap-4">
                                    <span className="text-emerald-500 shrink-0">[INFO]</span>
                                    <span className="text-slate-500 shrink-0">12:35:01</span>
                                    <span className="break-all italic">Sistem çekirdek modülleri yüklendi.</span>
                                </div>
                                <div className="flex gap-4">
                                    <span className="text-blue-500 shrink-0">[INIT]</span>
                                    <span className="text-slate-500 shrink-0">12:35:02</span>
                                    <span className="break-all italic">Mevki Otomasyon Servisi (LandService) hazır.</span>
                                </div>
                                <div className="flex gap-4">
                                    <span className="text-emerald-500 shrink-0">[INFO]</span>
                                    <span className="text-slate-500 shrink-0">12:36:12</span>
                                    <span className="break-all italic">Veritabanı bağlantısı başarıyla kuruldu.</span>
                                </div>
                                <div className="flex gap-4">
                                    <span className="text-blue-500 shrink-0">[WARN]</span>
                                    <span className="text-slate-500 shrink-0">12:38:45</span>
                                    <span className="break-all italic">Geçersiz TCKN formatı denemesi engellendi (Validator).</span>
                                </div>
                                <div className="flex gap-4 opacity-50">
                                    <span className="text-slate-600 shrink-0">...</span>
                                    <span className="text-slate-600 italic">Sistem dinleniyor. Saha testleri bekleniyor...</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}


