import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Clock,
  Layers,
  Map as MapIcon,
  Plus,
  RefreshCcw,
  Search,
  Settings,
  ShieldCheck,
  Users,
  WalletMinimal,
  Zap,
  BarChart3,
  FileSpreadsheet,
  Droplets,
  UserIcon,
  FileText,
  History,
} from "lucide-react";
import { MetricsGrid } from "../dashboard/MetricsGrid";
import { ActivityFeed } from "../dashboard/ActivityFeed";
import { DistributionGuideWidget } from "../dashboard/DistributionGuideWidget";
import { DailyTasksWidget } from "../dashboard/DailyTasksWidget";
import { WisdomWidget } from "../dashboard/WisdomWidget";
import { useAppStore } from "../../store/useAppStore";
import { APP_LOGO_BASE64 } from "../../assets/logo-base64";

interface DashboardProps {
  onNavigate: (table: string) => void;
  addTab: (tab: any) => void;
}

export const DashboardScreen: React.FC<DashboardProps> = ({ onNavigate, addTab }) => {
  const {
    stats,
    recentActivity: apiActivity,
    identity,
    refreshAll,
    isLoading,
  } = useAppStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sysStats, setSysStats] = useState({ cpu: 0, ram: 0 });

  useEffect(() => {
    refreshAll();
    
    (window as any).api?.getSystemStats?.().then((res: any) => {
      if (res?.success) setSysStats(res.data);
    });

    const interval = setInterval(async () => {
      const res = await (window as any).api?.getSystemStats?.();
      if (res?.success) setSysStats(res.data);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshAll();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full flex flex-col bg-slate-50 dark:bg-slate-950"
    >
      {/* 🛡️ Üst Otorite Çubuğu (Header) */}
      <header className="p-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-[24px] shadow-xl flex items-center justify-center border border-slate-100 dark:border-white/5">
            <img
              src={identity.logo || APP_LOGO_BASE64}
              className="w-full h-full object-contain"
              alt={identity.name || "ARAZİ VE SU YÖNETİM SİSTEMİ"}
            />
          </div>
          <div>
            <h1 className="text-4xl font-black  uppercase tracking-tighter text-slate-800 dark:text-white">
              {identity.name || "ARAZİ VE SU YÖNETİM SİSTEMİ"}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                Arazi & Su Takip Sistemi
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              addTab({
                type: "create",
                table: "DATA_Vatandas",
                title: "Yeni Kayıt",
              })}
            className="flex items-center gap-3 px-6 py-4 bg-primary-500 text-white rounded-[24px] font-black italic text-xs uppercase tracking-tighter shadow-xl shadow-primary-500/20 hover:scale-105 transition-all"
          >
            <Plus size={18} /> VATANDAŞ KAYIT
          </button>
          <button
            onClick={() =>
              addTab({
                type: "create",
                table: "DATA_Tapu_Verisi",
                title: "Yeni Tapu",
              })}
            className="flex items-center gap-3 px-6 py-4 bg-slate-800 text-white rounded-[24px] font-black italic text-xs uppercase tracking-tighter shadow-xl hover:scale-105 transition-all"
          >
            <BookOpen size={18} /> TAŞINMAZ ENVANTER KAYDI
          </button>

          <button
            onClick={() => addTab({ id: 'reports', title: 'Rapor Merkezi', type: 'reports' })}
            className="flex items-center gap-3 px-6 py-4 bg-emerald-500 text-white rounded-[24px] font-black italic text-xs uppercase tracking-tighter shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all"
          >
            <BarChart3 size={18} /> RESMİ RAPORLAMA MERKEZİ
          </button>
          <button
            title="Sistemi Yenile"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className={`w-14 h-14 flex items-center justify-center bg-white dark:bg-slate-900 rounded-[20px] shadow-lg text-slate-400 border border-slate-100 dark:border-white/5 transition-all ${isRefreshing
                ? "animate-spin"
                : "hover:text-primary-500 hover:rotate-180"
              }`}
          >
            <RefreshCcw size={24} />
          </button>
        </div>
      </header>

      {/* 🧩 Ana Operasyon Alanı */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-0">
        <div className="max-w-[1700px] mx-auto space-y-8">
          {/* 🛡️ Resmî İstatistik Paneli */}
          <MetricsGrid stats={stats} onNavigate={onNavigate} addTab={addTab} />

  

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            {/* 🛡️ SOL KOLON: Dağıtım ve Hareketler (Geniş Alan) */}
            <div className="xl:col-span-8 space-y-8">
              <DistributionGuideWidget addTab={addTab} />
              <ActivityFeed activity={apiActivity.slice(0, 10)} onSeeAll={() => onNavigate('audit')} />
            </div>

            {/* 🛡️ SAĞ KOLON: Bilgi ve Güvenlik (Dar Alan) */}
            <div className="xl:col-span-4 space-y-8">
              <WisdomWidget />
              
              {/* 🛡️ HIZLI İŞLEM MERKEZİ */}
              <div className="bg-slate-900 dark:bg-white rounded-[32px] p-8 text-white dark:text-slate-900 shadow-2xl shadow-slate-900/20 group overflow-hidden relative">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 dark:bg-slate-900/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                <h3 className="text-xl font-black italic uppercase tracking-tighter mb-6 relative z-10">HIZLI ERİŞİM</h3>
                <div className="grid grid-cols-2 gap-4 relative z-10">
                  <button onClick={() => onNavigate('su')} className="p-4 bg-white/10 dark:bg-slate-900/5 hover:bg-white/20 dark:hover:bg-slate-900/10 rounded-2xl border border-white/10 dark:border-slate-900/10 flex flex-col items-center gap-2 transition-all">
                    <Droplets size={20} />
                    <span className="text-[10px] font-black uppercase">SU FİŞİ</span>
                  </button>
                  <button onClick={() => onNavigate('audit')} className="p-4 bg-white/10 dark:bg-slate-900/5 hover:bg-white/20 dark:hover:bg-slate-900/10 rounded-2xl border border-white/10 dark:border-slate-900/10 flex flex-col items-center gap-2 transition-all">
                    <History size={20} />
                    <span className="text-[10px] font-black uppercase">TAHSİLAT</span>
                  </button>
                  <button onClick={() => onNavigate('vatandas')} className="p-4 bg-white/10 dark:bg-slate-900/5 hover:bg-white/20 dark:hover:bg-slate-900/10 rounded-2xl border border-white/10 dark:border-slate-900/10 flex flex-col items-center gap-2 transition-all">
                    <UserIcon size={20} />
                    <span className="text-[10px] font-black uppercase">VATANDAŞ</span>
                  </button>
                  <button onClick={() => onNavigate('tapu')} className="p-4 bg-white/10 dark:bg-slate-900/5 hover:bg-white/20 dark:hover:bg-slate-900/10 rounded-2xl border border-white/10 dark:border-slate-900/10 flex flex-col items-center gap-2 transition-all">
                    <FileText size={20} />
                    <span className="text-[10px] font-black uppercase">TAPU KAYDI</span>
                  </button>
                </div>
              </div>

              <div
                className="bg-emerald-500/10 border-2 border-emerald-500/20 rounded-[32px] p-8 flex items-start gap-6 cursor-pointer hover:bg-emerald-500/20 transition-all border-dashed group"
                onClick={() => onNavigate("map")}
              >
                <div className="p-4 bg-emerald-500 text-white rounded-2xl shadow-xl ring-8 ring-emerald-500/10 group-hover:scale-110 transition-transform">
                  <MapIcon size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-tighter flex items-center gap-3">
                    CBS ANALİZ
                    <span className="px-2 py-0.5 bg-emerald-500 text-white text-[8px] font-black rounded-lg animate-pulse">AKTİF</span>
                  </h3>
                  <p className="text-[10px] text-emerald-600/60 font-bold uppercase tracking-widest mt-1">
                    KADASTRO VE PARSEL VERİLERİ
                  </p>
                </div>
              </div>

              {/* 🛡️ SİSTEM SAĞLIĞI WIDGET */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[32px] p-8">
                <div className="flex items-center justify-between mb-6">
                   <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest italic">SİSTEM SAĞLIĞI</h4>
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <div className="space-y-6">
                   <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase">
                         <span className="text-slate-500">İŞLEMCİ YÜKÜ (CPU)</span>
                         <span className="text-slate-800 dark:text-white">% {sysStats.cpu}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-primary-500 transition-all duration-1000" style={{ width: `${sysStats.cpu}%` }} />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase">
                         <span className="text-slate-500">BELLEK KULLANIMI (RAM)</span>
                         <span className="text-slate-800 dark:text-white">% {sysStats.ram}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${sysStats.ram}%` }} />
                      </div>
                   </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[32px] p-8 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-700 dark:text-white uppercase tracking-tighter">
                      SİSTEM GÜVENLİĞİ
                    </h4>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">
                      YEDEKLEME AKTİF
                    </p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                  Tüm idari kayıtlar kurum sunucuları üzerinde hiyerarşik düzen içerisinde yedeklenmektedir.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </motion.div>
  );
};

