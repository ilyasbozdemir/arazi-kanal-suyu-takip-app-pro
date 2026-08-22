import React, { useEffect, useState } from "react";
import { Copy, Minus, Square, X, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
const logoUrl = "/logo.png";
import { useAppStore } from "../../store/useAppStore";

interface TitleBarProps {
  children?: React.ReactNode;
  addTab: (tab: any) => void;
}

const TitleBar: React.FC<TitleBarProps> = ({ children, addTab }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { identity, profile } = useAppStore();

  useEffect(() => {
    const checkMaximized = async () => {
      const maximized = await window.api.windowControls.isMaximized();
      setIsMaximized(maximized);
    };

    checkMaximized();
    window.addEventListener("resize", checkMaximized);
    return () => window.removeEventListener("resize", checkMaximized);
  }, []);

  const handleMinimize = () => { window.api.windowControls.minimize(); };
  const handleMaximize = async () => {
    window.api.windowControls.maximize();
    setTimeout(async () => {
      const maximized = await window.api.windowControls.isMaximized();
      setIsMaximized(maximized);
    }, 100);
  };
  const handleClose = () => { window.api.windowControls.close(); };

  return (
    <div className="h-10 bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 flex items-center justify-between select-none drag-region border-b border-slate-200 dark:border-primary-500/20 shadow-sm relative z-[9999]">
      <div className="flex items-center h-full flex-1 min-w-0 no-drag">
        {children}
      </div>

      <div className="min-w-[20px] drag-region flex-shrink-0 flex-grow-[0.1]" />

      {/* 👤 Kullanıcı Profil Alanı (Sağ Üst) */}
      <div className="relative h-full no-drag">
        <div 
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            setIsProfileMenuOpen(!isProfileMenuOpen);
          }}
          className="flex items-center gap-3 px-4 h-full border-l border-slate-200 dark:border-white/5 hover:bg-slate-200/50 dark:hover:bg-white/5 transition-all outline-none group cursor-pointer"
        >
            <div className="flex flex-col items-end">
                 <span className="text-[10px] font-black text-slate-900 dark:text-white leading-none uppercase">{profile?.name || 'Misafir'}</span>
                 <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{profile?.title || 'Personel'}</span>
            </div>
            <div className="relative">
              <div className="w-8 h-8 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-500 shadow-sm group-hover:scale-110 transition-transform">
                  <User size={16} />
              </div>
              {profile?.name === 'SİSTEM OPERATÖRÜ' && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsProfileMenuOpen(false);
                    addTab({ id: "profile", title: "Kullanıcı Profili", type: "profile" });
                  }}
                  title="Profil Detayları"
                  className="absolute -bottom-1 -right-1 flex h-3 w-3 cursor-pointer"
                >
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
                </button>
              )}
            </div>
        </div>

        <AnimatePresence>
          {isProfileMenuOpen && (
            <>
              {/* Overlay for clicking outside */}
              <div 
                className="fixed inset-0 z-[99]" 
                onClick={() => setIsProfileMenuOpen(false)} 
              />
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-2 top-[calc(100%+8px)] w-64 bg-white dark:bg-slate-900 rounded-[24px] shadow-2xl border border-slate-200 dark:border-white/10 p-2 z-[10000] overflow-hidden"
              >
                <div className="p-4 border-b border-slate-100 dark:border-white/5 mb-2">
                   <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white text-lg font-black italic shadow-lg shadow-primary-500/30">
                          {profile?.name?.charAt(0).toUpperCase() || 'P'}
                        </div>
                        {profile?.name === 'SİSTEM OPERATÖRÜ' && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsProfileMenuOpen(false);
                              addTab({ id: "profile", title: "Kullanıcı Profili", type: "profile" });
                            }}
                            title="Profil Detayları"
                            className="absolute -bottom-0.5 right-0 flex h-3.5 w-3.5 cursor-pointer"
                          >
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-slate-800"></span>
                          </button>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-800 dark:text-white uppercase truncate w-32">{profile?.name || 'Sistem Yetkilisi'}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{profile?.title || 'Kurum Personeli'}</span>
                      </div>
                   </div>
                </div>

                <div className="space-y-1">
                  <button 
                    onClick={() => { addTab({ id: "profile", title: "Kullanıcı Profili", type: "profile" }); setIsProfileMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest transition-all"
                  >
                    <User size={14} className="text-primary-500" /> Profil Detayları
                  </button>
                  <button 
                    onClick={() => { useAppStore.getState().refreshAll(); setIsProfileMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest transition-all"
                  >
                    <Copy size={14} className="text-emerald-500" /> Sistemi Yenile
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest transition-all">
                    <X size={14} className="text-rose-500" /> Güvenli Çıkış
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center h-full no-drag">
        <button onClick={handleMinimize} className="w-12 h-10 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 transition-all text-slate-500 hover:text-slate-900 dark:hover:text-white" title="Küçült"><Minus className="w-4 h-4" /></button>
        <button onClick={handleMaximize} className="w-12 h-10 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 transition-all text-slate-500 hover:text-slate-900 dark:hover:text-white" title={isMaximized ? "Geri Yükle" : "Ekranı Kapla"}>{isMaximized ? <Copy className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}</button>
        <button onClick={handleClose} className="w-12 h-10 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all text-slate-500" title="Kapat"><X className="w-4 h-4" /></button>
      </div>
    </div>
  );
};

export default TitleBar;

