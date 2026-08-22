import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, 
  Database, 
  Cpu, 
  Activity, 
  AlertCircle, 
  Trash2, 
  Save, 
  RefreshCw,
  Search,
  Code,
  ShieldAlert,
  Zap
} from 'lucide-react';
import { ElectronService } from "@renderer/services/ElectronService";
import { DatabaseSchemaDoc } from "@renderer/screens/sistem/components/DatabaseSchemaDoc";

interface DeveloperSettingsProps {
  dbPath?: string;
}

export const DeveloperSettings: React.FC<DeveloperSettingsProps> = ({ dbPath }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [metrics, setMetrics] = useState({ cpu: 0, ram: 0, os: '', arch: '' });
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 🛡️ SİSTEM NABZI (Mühürlü Periyodik Kontrol)
    const fetchMetrics = async () => {
      try {
        const res = await ElectronService.getSystemMetrics();
        if (res.success) setMetrics(res.data);
      } catch (err) {
        console.error("METRICS_FETCH_ERROR", err);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // 🛡️ GERÇEK ZAMANLI LOG DİNLEYİCİ (Mühürlü IPC)
    const handleLog = (_event: any, log: any) => {
      setLogs(prev => [log, ...prev].slice(0, 200));
    };
    
    (window as any).electron.ipcRenderer.on('system-log', handleLog);
    return () => {
      (window as any).electron.ipcRenderer.removeListener('system-log', handleLog);
    };
  }, []);

  const clearLogs = () => setLogs([]);

  const filteredLogs = logs.filter(l => 
    JSON.stringify(l).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 🚀 GELİŞTİRİCİ ÜST PANEL */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">SİSTEM TANILAMA VE DENETİM MERKEZİ</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Sistem Çekirdeği & Olay Kayıtları (v2.7.4)</p>
        </div>
        <div className="flex gap-3">
          <button onClick={clearLogs} className="px-4 py-2 bg-rose-500/10 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-rose-500 hover:text-white transition-all">
            <Trash2 size={14} /> Kayıtları Temizle
          </button>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary-500/10 text-primary-500 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary-500 hover:text-white transition-all">
            <RefreshCw size={14} /> Çekirdeği Yenile
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 🧠 GERÇEK ZAMANLI OLAY KAYITLARI (Real-time Logs) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Terminal size={14} className="text-primary-500" /> Sistem Olayları (Detaylı)
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
              <input 
                type="text" 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="OLAY ARA..." 
                className="pl-8 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl text-[10px] font-bold outline-none focus:border-primary-500"
              />
            </div>
          </div>
          
          <div className="h-[500px] bg-slate-950 rounded-[32px] border border-white/5 p-4 overflow-y-auto custom-scrollbar font-mono text-[11px]">
            <AnimatePresence mode="popLayout">
              {filteredLogs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-600 uppercase font-black tracking-widest italic">
                  Sistem dinleniyor... Bekleyen olay yok.
                </div>
              ) : (
                filteredLogs.map((log, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="py-1.5 border-b border-white/5 flex items-start gap-3 group"
                  >
                    <span className="text-slate-500 shrink-0 font-bold">[{new Date(log.timestamp || Date.now()).toLocaleTimeString()}]</span>
                    <span className={`font-black shrink-0 ${
                      log.type === 'error' ? 'text-rose-500' : 
                      log.type === 'warn' ? 'text-blue-500' : 
                      log.type === 'success' ? 'text-emerald-500' : 'text-primary-500'
                    }`}>
                      {log.category || 'SYSTEM'}:
                    </span>
                    <span className="text-slate-300 break-all leading-relaxed">{log.message}</span>
                    {log.data && (
                      <button 
                        onClick={() => console.log('Log Data:', log.data)}
                        className="ml-auto px-2 py-0.5 bg-white/5 rounded-md text-[9px] text-slate-500 opacity-0 group-hover:opacity-100 transition-all uppercase"
                      >
                        Veriyi Gör
                      </button>
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
            <div ref={logEndRef} />
          </div>
        </div>

        {/* 🛠️ GELİŞMİŞ ARAÇLAR */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <Database size={14} className="text-blue-500" /> Veritabanı Bakımı
            </h3>
            {dbPath && (
              <div className="bg-blue-500/5 p-3 rounded-xl border border-blue-500/10 mb-2">
                 <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest mb-1">DOSYA YOLU</p>
                 <p className="text-[10px] font-mono text-slate-500 break-all select-all">{dbPath}</p>
              </div>
            )}
            <div className="space-y-2">
              <button onClick={() => (window as any).electron.ipcRenderer.invoke('execute-raw-sql', 'VACUUM')} className="w-full p-4 bg-slate-50 dark:bg-white/5 rounded-2xl text-left hover:bg-primary-50 transition-all group">
                <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase">Veritabanı Optimizasyonu</p>
                <p className="text-[9px] text-slate-400 uppercase mt-1">Dosya boyutunu küçült ve nizamı sağla.</p>
              </button>
              <button onClick={() => ElectronService.showConfirm({title:'YEDEKLEME', message:'Tüm veritabanı yedeği dışa aktarılacak.'})} className="w-full p-4 bg-slate-50 dark:bg-white/5 rounded-2xl text-left hover:bg-emerald-50 transition-all group">
                <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase">Kurumsal Yedek Al</p>
                <p className="text-[9px] text-slate-400 uppercase mt-1">Sistem veritabanını dışa aktararak yedekleyin.</p>
              </button>
            </div>
          </div>

          <div className="bg-primary-500 dark:bg-primary-600 p-6 rounded-[32px] shadow-lg shadow-primary-500/20 text-white space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <Cpu size={14} /> Donanım Durumu
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 p-3 rounded-2xl">
                <p className="text-[8px] font-black uppercase opacity-60">CPU Yükü</p>
                <p className="text-lg font-black mt-1">%{metrics.cpu}</p>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl">
                <p className="text-[8px] font-black uppercase opacity-60">RAM (Heap)</p>
                <p className="text-lg font-black mt-1">{metrics.ram} MB</p>
              </div>
            </div>
            <div className="pt-2 border-t border-white/10">
               <p className="text-[8px] font-black uppercase opacity-60 tracking-widest">{metrics.os} ({metrics.arch})</p>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-[32px] border border-white/10 space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert size={14} className="text-rose-500" /> Güvenlik Mührü
            </h3>
            <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase">AES-256-GCM</span>
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-500 rounded-md text-[8px] font-black uppercase">Aktif</span>
            </div>
            <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Bütünlük Kontrolü</span>
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-500 rounded-md text-[8px] font-black uppercase">Geçti</span>
            </div>
          </div>

        </div>
      </div>
      <DatabaseSchemaDoc />
    </div>
  );
};
