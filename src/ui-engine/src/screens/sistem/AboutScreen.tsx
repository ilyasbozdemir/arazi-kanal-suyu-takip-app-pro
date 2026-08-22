import React from 'react';
import { motion } from 'framer-motion';
import { Info, ShieldCheck, Cpu, Database, Mail, Globe, Github } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const AboutScreen: React.FC = () => {
  const { identity } = useAppStore();
  const [stats, setStats] = React.useState<{ totalLines: number, fileCount: number } | null>(null);

  React.useEffect(() => {
    const fetchStats = async () => {
      const res = await (window as any).api.getCodeStats();
      if (res.success) setStats({ totalLines: res.totalLines, fileCount: res.fileCount });
    };
    fetchStats();
  }, []);

  return (
    <div className="p-8 md:p-12 space-y-12 animate-in fade-in duration-700 max-w-5xl mx-auto pb-24">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-white dark:bg-slate-800 rounded-[32px] mx-auto flex items-center justify-center shadow-2xl border border-slate-100 dark:border-white/5 mb-6"
        >
          {identity.logo ? (
            <img src={identity.logo} className="w-20 h-20 object-contain p-2" alt="Logo" />
          ) : (
            <Cpu className="text-primary-500" size={40} />
          )}
        </motion.div>
        <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter uppercase">{identity.name}</h1>
        <p className="text-xs font-black text-primary-500 uppercase tracking-[0.3em]">VERSION 2.7.5 - TCKN MIGRATION</p>
      </div>

      {/* Code Stats Badge */}
      {stats && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <div className="bg-primary-500/10 border border-primary-500/20 px-6 py-2 rounded-2xl flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TOPLAM SATIR:</span>
              <span className="text-sm font-black text-primary-500 font-mono">{stats.totalLines.toLocaleString()}</span>
            </div>
            <div className="w-px h-3 bg-primary-500/20" />
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DOSYA SAYISI:</span>
              <span className="text-sm font-black text-primary-500 font-mono">{stats.fileCount}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Project Purpose */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-sm space-y-6">
          <div className="flex items-center gap-4 text-primary-500">
            <ShieldCheck size={24} />
            <h3 className="text-xl font-black uppercase tracking-tight">PROJE AMACI</h3>
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed uppercase tracking-wide">
            BU YAZILIM, {identity.name} BÜNYESİNDEKİ TARIMSAL ARAZİLERİN, TAPU KAYITLARININ VE SU DAĞITIM (SALMA) SÜREÇLERİNİN DİJİTAL ORTAMDA, HATA PAYI SIFIRA İNDİRİLEREK TAKİP EDİLMESİ AMACIYLA GELİŞTİRİLMİŞTİR.
          </p>
        </div>

        {/* Tech Stack */}
        <div className="bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-primary-500/10 blur-[60px] -mb-24 -mr-24 rounded-full" />
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4 text-primary-400">
              <Cpu size={24} />
              <h3 className="text-xl font-black uppercase tracking-tight">TEKNOLOJİ</h3>
            </div>
            <div className="space-y-4">
              {[
                { t: 'ELECTRON ENGINE', d: 'Native Masaüstü Deneyimi', icon: Cpu },
                { t: 'SQLITE STORAGE', d: 'Yerel ve Hızlı Veri Depolama', icon: Database },
                { t: 'PROJE HACMİ', d: `${stats?.totalLines.toLocaleString() || '...'} SATIR KOD`, icon: Info }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="p-2 bg-white/5 rounded-xl border border-white/10 h-fit"><item.icon size={16} /></div>
                  <div>
                    <p className="text-[11px] font-black uppercase">{item.t}</p>
                    <p className="text-[9px] text-slate-500 uppercase font-bold">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-sm text-center space-y-8">
        <div className="space-y-2">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">KURUMSAL KİMLİK</h4>
          <p className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-tight">{identity.name}</p>
        </div>

        <div className="pt-8 border-t border-slate-100 dark:border-white/5">
          <p className="text-[9px] font-bold text-slate-400 leading-relaxed uppercase">
            BU YAZILIMIN TÜM HAKLARI {identity.name}'A AİTTİR.<br />
            © {new Date().getFullYear()} - TÜM HAKLARI SAKLIDIR.
          </p>
        </div>
      </div>
    </div>
  );
};

