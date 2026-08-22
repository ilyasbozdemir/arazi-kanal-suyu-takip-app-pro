import React from 'react';
import { 
  DollarSign, 
  Wallet, 
  Users, 
  ArrowRightLeft, 
  History, 
  FileText, 
  CheckCircle2,
  Activity 
} from 'lucide-react';

interface SidebarProps {
  activeSubTab: string;
  setActiveSubTab: (tab: any) => void;
  kasalar: any[];
  fisler: any[];
  loadData: () => void;
  refreshAll: () => void;
}

export const AccountingSidebar: React.FC<SidebarProps> = ({ 
  activeSubTab, 
  setActiveSubTab, 
  kasalar, 
  fisler,
  loadData, 
  refreshAll 
}) => {
  const totalBalance = kasalar.reduce((s, k) => s + (k.Bakiye || 0) + (k.Pos_Bakiye || 0), 0);
  
  const todayString = new Date().toISOString().split('T')[0];
  const dailyTotal = (fisler || [])
    .filter(f => f.Tarih && f.Tarih.startsWith(todayString) && f.Tur === 'GELİR')
    .reduce((s, f) => s + (f.Tutar || 0), 0);

  return (
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/5 flex flex-col shadow-sm">
      <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20">
            <DollarSign size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-widest leading-none">Muhasebe</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Yönetim</p>
          </div>
        </div>
        <button 
          title="Verileri Yenile ve Senkronize Et"
          onClick={() => { loadData(); refreshAll(); }} 
          className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all"
        >
          <History size={16} className="text-slate-400" />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {[
          { id: 'kasa', label: 'Hesaplar & Kasalar', icon: Wallet },
          { id: 'personel', label: 'Personel', icon: Users },
          { id: 'transfer', label: 'Virman & POS', icon: ArrowRightLeft },
          { id: 'tahakkuklar', label: 'Tahakkuklar', icon: FileText },
          { id: 'fisler', label: 'Fişler', icon: History },
          { id: 'hareketler', label: 'Hareketler', icon: Activity },
          { id: 'zraporu', label: 'Z Raporları', icon: FileText },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveSubTab(item.id as any)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all ${
              activeSubTab === item.id
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
            }`}
          >
            <item.icon size={16} />
            <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
        <div className="my-2 border-t border-slate-100 dark:border-white/5" />
        <button
          onClick={() => setActiveSubTab('gunsonu')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all ${
            activeSubTab === 'gunsonu' ? 'bg-rose-500 text-white shadow-lg' : 'text-rose-500 hover:bg-rose-50'
          }`}
        >
          <CheckCircle2 size={16} />
          <span className="text-[11px] font-black uppercase tracking-widest">Gün Sonu</span>
        </button>
      </nav>

      <div className="p-4 border-t border-slate-100 dark:border-white/5">
         <div className="p-4 bg-slate-900 rounded-2xl">
           <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Bugünkü Tahsilat</p>
           <p className="text-xl font-black text-emerald-500 tabular-nums mb-3">
             {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', notation: 'compact', compactDisplay: 'short' }).format(dailyTotal)}
           </p>
           
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 border-t border-white/10 pt-2">Tüm Nakit (Kasalar)</p>
           <p className="text-sm font-black text-white tabular-nums mt-1 opacity-80">
             {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', notation: 'compact', compactDisplay: 'short' }).format(totalBalance)}
           </p>
         </div>
      </div>
    </aside>
  );
};
