import { MapIcon, Droplets, Activity } from "lucide-react";

export const TapuBadgeCard = (
  { mevkii, ada, parsel, alan, hisse, kanalAltinda, kanalSuyu }: any,
) => (
  <div className="p-6 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
    <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform">
      <MapIcon size={80} />
    </div>
    <div className="relative z-10 space-y-4">
      <div className="flex justify-between items-start">
        <div className="text-[10px] font-black text-primary-500 uppercase tracking-widest">
          {mevkii || "BİLİNMEYEN MEVKİ"}
        </div>
        <div className="flex gap-1">
          {kanalAltinda === "Evet" && (
            <div
              title="Kanal Altı"
              className="p-1.5 bg-blue-500/10 text-blue-500 rounded-lg"
            >
              <Droplets size={12} />
            </div>
          )}
          {kanalSuyu === "Evet" && (
            <div
              title="Kanal Suyu"
              className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg"
            >
              <Activity size={12} />
            </div>
          )}
        </div>
      </div>
      <div className="text-lg font-black tracking-tighter uppercase">
        ADA {ada} / PARSEL {parsel}
      </div>
      <div className="flex gap-4 border-t border-slate-50 dark:border-white/5 pt-4">
        <div>
          <div className="text-[8px] font-bold text-slate-400 uppercase">
            ALAN
          </div>
          <div className="text-xs font-black">{alan} m²</div>
        </div>
        <div>
          <div className="text-[8px] font-bold text-slate-400 uppercase">
            HİSSE
          </div>
          <div className="text-xs font-black">{hisse}</div>
        </div>
      </div>
    </div>
  </div>
);

