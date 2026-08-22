import React from "react";
import { motion } from "framer-motion";
import { FileText, Calendar, ExternalLink, Layers } from "lucide-react";

interface MeravFislerTabProps {
  profileData: any;
  onOpenDetail?: (table: string, id: any) => void;
}

export const MeravFislerTab: React.FC<MeravFislerTabProps> = ({ profileData, onOpenDetail }) => {
  const fisler = profileData?.fisler || [];
  const kocanlar = profileData?.kocanlar || [];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-10"
    >
      {/* 🛡️ Zimmetli Koçanlar Bölümü */}
      <div className="bg-white dark:bg-slate-900 rounded-[56px] p-12 border border-slate-100 dark:border-white/5 shadow-2xl">
         <div className="flex items-center justify-between mb-12 border-b border-slate-50 dark:border-white/5 pb-8">
            <div className="flex items-center gap-6">
               <div className="p-4 bg-primary-500/10 text-primary-500 rounded-[24px]">
                  <Layers size={28} />
               </div>
               <div>
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-800 dark:text-white leading-none">Zimmetli Fiş Koçanları</h2>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 italic">SAHADA KULLANILMAK ÜZERE TESCİL EDİLEN KOÇANLAR</p>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {kocanlar.length > 0 ? (
               kocanlar.map((k: any) => (
                  <div key={k.id} className="relative group bg-slate-50 dark:bg-white/5 p-8 rounded-[40px] border border-transparent hover:border-primary-500/20 transition-all overflow-hidden">
                     <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-1000"><Layers size={100} /></div>
                     <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                        <div className="flex items-start justify-between">
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{k.Mahalle_Adi || 'BÖLGESEL'} - {k.Yil} SEZONU</p>
                              <h4 className="text-2xl font-black text-slate-800 dark:text-white italic tracking-tighter uppercase">{k.defter_adi || 'KAYITLI KOÇAN'}</h4>
                           </div>
                           <div className={`px-4 py-2 ${k.aktif ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-200 text-slate-500'} rounded-2xl font-black text-[10px] uppercase tracking-widest`}>
                              {k.aktif ? 'AKTİF' : 'PASİF'}
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-4 py-4">
                           <div className="flex-1">
                              <p className="text-[9px] font-black text-slate-400 uppercase">ARALIK</p>
                              <p className="text-sm font-black text-slate-700 dark:text-slate-300">#{k.baslangic_no} - {k.son_no || '∞'}</p>
                           </div>
                           <div className="flex-1 text-right">
                              <p className="text-[9px] font-black text-slate-400 uppercase">ZİMMET</p>
                              <p className="text-sm font-black text-slate-700 dark:text-slate-300">{new Date(k.Zimmet_Tarihi).toLocaleDateString('tr-TR')}</p>
                           </div>
                        </div>

                        <div className="pt-4 border-t border-slate-200 dark:border-white/5">
                           <button 
                             onClick={() => onOpenDetail?.('TANIM_Sulama_Fis_Kocanlari', k.id)}
                             className="w-full py-3 bg-white dark:bg-slate-800 text-slate-400 hover:text-primary-500 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
                           >
                              KOÇAN DETAYINI GÖR <ExternalLink size={14} />
                           </button>
                        </div>
                     </div>
                  </div>
               ))
            ) : (
               <div className="col-span-3 py-16 text-center border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[40px] space-y-4">
                  <Layers size={40} className="mx-auto text-slate-200" />
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Henüz zimmetli koçan bulunmuyor</p>
               </div>
            )}
         </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[56px] p-12 border border-slate-100 dark:border-white/5 shadow-2xl">
         <div className="flex items-center justify-between mb-12 border-b border-slate-50 dark:border-white/5 pb-8">
            <div className="flex items-center gap-6">
               <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-[24px]">
                  <FileText size={28} />
               </div>
               <div>
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-800 dark:text-white leading-none">Saha Tahsilat Arşivi</h2>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 italic">MERAV TARAFINDAN KESİLEN TÜM SULAMA FİŞLERİ</p>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {fisler.length > 0 ? (
               fisler.map((f: any) => (
                  <div key={f.id} className="relative group bg-slate-50 dark:bg-white/5 p-8 rounded-[40px] border border-transparent hover:border-emerald-500/20 transition-all overflow-hidden">
                     <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-1000"><FileText size={100} /></div>
                     <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
                        <div className="flex items-start justify-between">
                            <div>
                               <p className="text-[9px] font-black text-primary-500 uppercase tracking-[0.2em] mb-1 italic truncate max-w-[150px]">
                                  {f.Mahalle_Adi || '---'} {f.Mevki_Adi ? `/ ${f.Mevki_Adi}` : ''}
                               </p>
                               <h4 className="text-xl font-black text-slate-800 dark:text-white italic tracking-tighter uppercase leading-none">#{f.Fis_No}</h4>
                            </div>
                           <div className="p-4 bg-emerald-500 text-white rounded-[24px] shadow-lg shadow-emerald-500/20 font-black text-lg italic tracking-tighter">
                              {f.Toplam_Tutar}<span className="text-xs ml-1 opacity-60">TL</span>
                           </div>
                        </div>
                        <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-white/5">
                           <div className="flex items-center gap-2 text-slate-400">
                              <Calendar size={14} />
                              <span className="text-[10px] font-black uppercase">{f.Tarih}</span>
                           </div>
                           <button 
                             title="MUHASEBE KAYDINA GİT" 
                             onClick={() => {
                               window.dispatchEvent(new CustomEvent('KURUM_NAV_TAB', { 
                                 detail: { 
                                   id: 'accounting-fisler', 
                                   title: 'MUHASEBE', 
                                   type: 'accounting'
                                 } 
                               }));
                             }}
                             className="p-2 bg-white dark:bg-slate-800 text-slate-400 hover:text-emerald-500 rounded-xl transition-all shadow-sm group/btn"
                           >
                              <ExternalLink size={16} className="group-hover/btn:scale-110 transition-transform" />
                           </button>
                        </div>
                     </div>
                  </div>
               ))
            ) : (
               <div className="col-span-3 py-32 text-center space-y-6">
                  <div className="w-24 h-24 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-200">
                     <FileText size={48} />
                  </div>
                  <div className="space-y-2">
                     <p className="text-xl font-black text-slate-400 uppercase tracking-[0.2em] italic">HENÜZ KAYITLI FİŞ YOK</p>
                     <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">BU GÖREVLİ TARAFINDAN KESİLEN FİŞ BULUNAMADI.</p>
                  </div>
               </div>
            )}
         </div>
      </div>
    </motion.div>
  );
};
