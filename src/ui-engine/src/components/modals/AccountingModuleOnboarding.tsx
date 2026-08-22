import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Droplets, ShieldCheck, ArrowRight, X } from 'lucide-react';

interface AccountingModuleOnboardingProps {
  isOpen: boolean;
  onChoice: (enabled: boolean) => void;
}

export const AccountingModuleOnboarding: React.FC<AccountingModuleOnboardingProps> = ({ isOpen, onChoice }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[48px] shadow-2xl overflow-hidden border border-slate-200 dark:border-white/5"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Left Side: Illustration & Branding */}
              <div className="bg-primary-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
                <div className="relative z-10 space-y-6">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <Droplets size={32} />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">MODÜLER KURULUM SİHİRBAZI</h2>
                    <p className="text-xs font-bold text-white/60 uppercase tracking-widest">KURUM BAŞKANLIĞI ARAZİ & SU TAKİP</p>
                  </div>
                  <div className="pt-8 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black italic">01</div>
                      <p className="text-xs font-bold uppercase tracking-widest">İhtiyacınızı Belirleyin</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black italic">02</div>
                      <p className="text-xs font-bold uppercase tracking-widest">Arayüzü Özelleştirin</p>
                    </div>
                    <div className="flex items-center gap-4 opacity-40">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black italic">03</div>
                      <p className="text-xs font-bold uppercase tracking-widest">Kullanıma Başlayın</p>
                    </div>
                  </div>
                </div>
                
                <ShieldCheck size={300} className="absolute -bottom-20 -right-20 text-white/5 rotate-12" />
              </div>

              {/* Right Side: Options */}
              <div className="p-12 flex flex-col justify-center space-y-10">
                <div className="space-y-4 text-center lg:text-left">
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-800 dark:text-white">MUHASEBE MODÜLÜ AKTİF EDİLSİN Mİ?</h3>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                    Sistemde ücretlendirme, borç takibi, tahsilat ve mali raporlama özelliklerini kullanmak istiyor musunuz?
                  </p>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={() => onChoice(true)}
                    className="w-full group p-6 bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/5 rounded-[32px] hover:border-primary-500 transition-all flex items-center gap-6 text-left"
                  >
                    <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <DollarSign size={28} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black uppercase italic tracking-tighter text-slate-800 dark:text-white">EVET, MUHASEBE GEREKLİ</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ÜCRET, FAİZ VE TAHSİLAT TAKİBİ DAHİL</p>
                    </div>
                    <ArrowRight className="text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                  </button>

                  <button 
                    onClick={() => onChoice(false)}
                    className="w-full group p-6 bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/5 rounded-[32px] hover:border-slate-800 dark:hover:border-white/20 transition-all flex items-center gap-6 text-left"
                  >
                    <div className="w-14 h-14 bg-slate-200 dark:bg-white/10 text-slate-400 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <X size={28} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black uppercase italic tracking-tighter text-slate-800 dark:text-white">HAYIR, SADECE TAKİP</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">SADECE ARAZİ VE SULAMA DURUMU TAKİBİ</p>
                    </div>
                    <ArrowRight className="text-slate-300 group-hover:text-slate-800 dark:group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </button>
                </div>

                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center italic">
                  * BU TERCİHİ DAHA SONRA AYARLAR MENÜSÜNDEN DEĞİŞTİREBİLİRSİNİZ.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
