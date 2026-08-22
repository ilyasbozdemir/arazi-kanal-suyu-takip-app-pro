import React, { useState, useEffect } from 'react';
import { User, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const MeravAvatar = ({ path }: { path: string }) => {
   const [img, setImg] = useState<string | null>(null);

   useEffect(() => {
      if (path) {
         (window as any).electron.ipcRenderer.invoke('get-citizen-profile-image', path).then((res: string) => setImg(res));
      }
   }, [path]);

   if (img) return <img src={img} alt="PP" className="w-full h-full object-cover" />;
   return <User size={32} />;
};


export const NavButton = ({ active, onClick, icon: Icon, label, collapsed }: any) => (
   <button onClick={onClick} className={`w-full flex items-center gap-3 ${collapsed ? 'justify-center px-0' : 'px-4'} py-3 rounded-2xl text-[11px] font-black uppercase transition-all group ${active ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`}>
      <Icon size={18} className={active ? '' : 'text-slate-400 group-hover:text-primary-500 transition-colors'} />
      {!collapsed && <span>{label}</span>}
      {(active && !collapsed) && <ChevronRight size={14} className="ml-auto opacity-50" />}
   </button>
);

export const StatCard = ({ icon: Icon, color, label, value, sub }: any) => {
   const colors: any = { blue: "text-blue-600 bg-blue-500/10", emerald: "text-emerald-600 bg-emerald-500/10", rose: "text-rose-600 bg-rose-500/10" };
   return (
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
         <div className={`w-12 h-12 ${colors[color]} rounded-2xl flex items-center justify-center`}><Icon size={24} /></div>
         <div className="space-y-0.5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">{value}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">{sub}</p>
         </div>
      </div>
   );
};

export const ActionButton = ({ onClick, icon: Icon, label, desc, color }: any) => (
   <button onClick={onClick} className={`p-6 rounded-3xl border text-left space-y-2 transition-all hover:scale-[1.02] active:scale-95 ${color === 'primary' ? 'bg-primary-500 border-primary-600 text-white shadow-xl shadow-primary-500/20' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:bg-white dark:hover:bg-slate-800 shadow-sm'}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color === 'primary' ? 'bg-white/20' : 'bg-primary-500/10 text-primary-500'}`}><Icon size={20} /></div>
      <div><p className="text-xs font-black uppercase tracking-tight">{label}</p><p className={`text-[10px] font-medium opacity-60 uppercase tracking-widest`}>{desc}</p></div>
   </button>
);

export const ProgressItem = ({ label, value, total, color }: any) => {
   const percent = total > 0 ? (value / total) * 100 : 0;
   return (
      <div className="space-y-2">
         <div className="flex justify-between items-end">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{label}</span>
            <span className="text-xs font-black tabular-nums">{value} / {total}</span>
         </div>
         <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} className={`h-full ${color}`} />
         </div>
      </div>
   );
};
