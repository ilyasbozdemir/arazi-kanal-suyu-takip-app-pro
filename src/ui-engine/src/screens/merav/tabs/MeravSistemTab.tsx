import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Activity, Layers, FileText, Calendar } from "lucide-react";

interface MeravSistemTabProps {
  values: any;
  table: string;
  data: any;
}

export const MeravSistemTab: React.FC<MeravSistemTabProps> = ({ values, table, data }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-8"
    >
      <div className="bg-white dark:bg-slate-900 rounded-[56px] border border-slate-100 dark:border-white/5 overflow-hidden shadow-2xl">
         <div className="px-12 py-8 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-6">
              <div className="p-4 bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
                 <ShieldCheck size={28} />
              </div>
              <div>
                 <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-800 dark:text-white leading-none">Sistem ve Denetim Kayıtları</h2>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic">DİJİTAL İZ VE KAYIT DOĞRULAMA PANELİ</p>
              </div>
           </div>
           <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-6 py-2 rounded-full border border-emerald-500/20 shadow-sm uppercase tracking-widest">GÜVENLİ OTURUM</span>
         </div>
         
         <div className="p-12 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-6">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                     <Activity size={14} className="text-primary-500" /> SİSTEM PARAMETRELERİ
                  </h4>
                  <div className="space-y-4">
                     {[
                       { label: "UNIQUE RECORD ID", value: values.id || "TANIMSIZ", icon: Layers, color: "text-indigo-500" },
                       { label: "VERİ KAYNAĞI", value: table, icon: FileText, color: "text-primary-500" },
                       { label: "YETKİ SEVİYESİ", value: "TAM YETKİLİ OPERATÖR", icon: ShieldCheck, color: "text-emerald-500" }
                     ].map((item, i) => (
                       <div key={i} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 group hover:border-primary-500/30 transition-all">
                          <div className="flex items-center gap-4">
                             <div className={`w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center ${item.color}`}>
                                <item.icon size={18} />
                             </div>
                             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                          </div>
                          <span className="text-sm font-black text-slate-800 dark:text-white tabular-nums tracking-tighter truncate max-w-[200px]">{item.value}</span>
                       </div>
                     ))}
                  </div>
               </div>

               <div className="space-y-6 text-slate-300">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                     <Calendar size={14} className="text-violet-500" /> ZAMAN DAMGALARI
                  </h4>
                  <div className="space-y-4">
                     {[
                       { label: "KAYIT OLUŞTURMA", value: values.created_at ? new Date(values.created_at).toLocaleString('tr-TR') : "BELİRTİLMEMİŞ" },
                       { label: "SON GÜNCELLEME", value: values.updated_at ? new Date(values.updated_at).toLocaleString('tr-TR') : "KAYIT ORİJİNAL" },
                       { label: "ARŞİV DURUMU", value: values.Aktif === 0 ? "PASİF / ARŞİV" : "AKTİF / GÖREVDE" }
                     ].map((item, i) => (
                       <div key={i} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                          <span className="text-sm font-black text-slate-800 dark:text-white italic">{item.value}</span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>

            <div className="space-y-6">
               <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                     <FileText size={14} className="text-amber-500" /> HAM VERİ LOG KAYDI (JSON)
                  </h4>
                  <button 
                    onClick={() => {
                       navigator.clipboard.writeText(JSON.stringify(data, null, 2));
                       (window as any).api.showAlert({ message: "JSON verisi panoya kopyalandı.", type: 'info' });
                    }} 
                    className="px-6 py-2 bg-primary-500/10 text-primary-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary-500 hover:text-white transition-all shadow-sm border border-primary-500/20"
                  > 
                     VERİYİ KOPYALA 
                  </button>
               </div>
               <div className="bg-slate-900 rounded-[40px] p-10 border border-white/5 relative group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
                  <pre className="relative z-10 whitespace-pre-wrap break-all text-xs text-blue-300/80 leading-relaxed custom-scrollbar max-h-[400px] overflow-y-auto italic font-mono">
                     {JSON.stringify(data, null, 4)}
                  </pre>
               </div>
            </div>
         </div>
      </div>
    </motion.div>
  );
};
