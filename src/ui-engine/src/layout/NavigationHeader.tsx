import React from 'react';
import { MapPin } from 'lucide-react';
import TopMenuDropdown from './components/TopMenuDropdown';

interface NavigationHeaderProps {
  navContainerRef: React.RefObject<HTMLDivElement>;
  identity: any;
  appLogo: string;
  windowWidth: number;
  menuMode: 'dagitim_oncesi' | 'dagitim_sonrasi';
  setMenuMode: (mode: 'dagitim_oncesi' | 'dagitim_sonrasi') => void;
  visibleItems: any[];
  overflowItems: any[];
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  navContainerRef, identity, appLogo, windowWidth, menuMode, setMenuMode, visibleItems, overflowItems
}) => {
  return (
    <div ref={navContainerRef} className="flex items-center gap-2 h-full mx-2 flex-1 min-w-0 no-drag">
      <div className="flex items-center gap-2 mr-8 shrink-0 no-drag cursor-pointer">
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden shrink-0">
            <img 
              src={identity?.logo || appLogo || "/logo.png"} 
              alt="app-icon" 
              className="w-full h-full object-contain p-0.5" 
            />
          </div>
        </div>
        <div className="flex flex-col leading-none ml-2 min-w-0">
          <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tighter truncate max-w-[180px]">
            {windowWidth > 1100 
              ? (identity?.name || "KURUM BAŞKANLIĞI") 
              : (identity?.name?.substring(0, 15) + "..." || "KURUM BLD.")}
          </span>
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 hidden xl:block truncate">
            Arazi & Su Takip Sistemi
          </span>
        </div>

        <div className="ml-4 flex items-center gap-2 shrink-0">
          <select
            value={menuMode}
            title="Dağıtım Sezonu Seçimi"
            onChange={(e) => setMenuMode(e.target.value as any)}
            className="bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 dark:border-blue-500/40 rounded-lg px-3 py-1 text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
          >
            <option value="dagitim_oncesi">DAĞITIM ÖNCESİ </option>
            <option value="dagitim_sonrasi">DAĞITIM SEZONU </option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-1 h-full min-w-0 flex-1 no-drag">
        {visibleItems.map(item => (
          <TopMenuDropdown key={item.id} label={item.label} items={item.items} />
        ))}

        {overflowItems.length > 0 && (
          <TopMenuDropdown
            label="..."
            items={overflowItems.flatMap(oi => [
              { label: `>> ${oi.label}`, type: 'separator' as const },
              ...oi.items
            ])}
          />
        )}
      </div>
    </div>
  );
};
