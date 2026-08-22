import React from "react";
import { ArrowRight, MapPin, User, Home, Droplets, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAppStore } from "@renderer/store/useAppStore";

interface ListRendererProps {
  rows: any[];
  rowVirtualizer: any;
  tableName: string;
  config: any;
  onRowClick?: (table: string, id: any) => void;
  observerTarget: React.RefObject<any>;
  hasMore: boolean;
}

const getRowMeta = (tableName: string, item: any, cachedData: any) => {
  let primary = "";
  let secondary = "";
  let icon: any = MapPin;
  let iconBg = "bg-slate-100 dark:bg-slate-800";
  let iconColor = "text-slate-400";
  let tags: { label: string; color: string }[] = [];

  if (tableName === "DATA_Vatandas") {
    primary = `${item.Ad || ''} ${item.Soyad || ''}`.trim() || "İSİMSİZ";
    const parents = [item.Baba_Adı, item.Anne_Adı].filter(Boolean).join(" / ");
    secondary = parents || "Ebeveyn Bilgisi Yok";
    if (item.Dogum_Yeri) secondary += ` · ${item.Dogum_Yeri}`;
    icon = User;
    iconBg = "bg-indigo-500/10";
    iconColor = "text-indigo-500";
    if (item.TCKN) tags.push({ label: item.TCKN, color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" });
    if (item.Sicil_No) tags.push({ label: `SİCİL: ${item.Sicil_No}`, color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" });
    if (item.Cinsiyet) {
       const isMale = item.Cinsiyet === 'Erkek';
       tags.push({ label: item.Cinsiyet, color: isMale ? "bg-blue-500/10 text-blue-600" : "bg-rose-500/10 text-rose-600" });
    }

  } else if (tableName === "DATA_Tapu_Verisi") {
    primary = `Ada ${item.Ada || "?"} / Parsel ${item.Parsel || "?"}`;
    icon = Home;
    iconBg = "bg-primary-500/10";
    iconColor = "text-primary-500";

    const ownerName = item.Tapu_Sahibi_Ad_Soyad || "SAHİP YOK";
    const mevki = item.Mevki || "MEVKİSİZ";
    const area = item.Alan_m2 ? `${Number(item.Alan_m2).toLocaleString('tr-TR')} m²` : "";
    secondary = `${ownerName} · ${mevki} · ${area}`;

    if (item.Nitelik) tags.push({ label: item.Nitelik, color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" });
    if (item.Aylik_Su_Hakki) tags.push({ label: `${item.Aylik_Su_Hakki} SAAT`, color: "bg-sky-500/10 text-sky-600 dark:text-sky-400" });
    if (item.Paydas_Sayisi > 1) tags.push({ label: `${item.Paydas_Sayisi} HİSSEDAR`, color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" });

    const balance = (Number(item.Toplam_Tahakkuk) || 0) - (Number(item.Toplam_Tahsilat) || 0);
    if (balance > 0) {
      tags.push({ label: `${balance.toLocaleString('tr-TR')} ₺ BORÇ`, color: "bg-rose-500/10 text-rose-600 dark:text-rose-400" });
    }

  } else if (tableName === "DATA_Dagitim_Bolgeleri") {
    const loc = (cachedData.TANIM_Konumlar || []).find((l: any) => String(l.id) === String(item.Mahalle_id));
    primary = loc?.Ad || "BİLİNMEYEN BÖLGE";
    const stats = useAppStore.getState().locStats?.[item.Mahalle_id];
    secondary = `${item.Tip || "GENEL"} · ${stats?.vatandasCount || 0} Kişi, ${stats?.tapuCount || 0} Parsel, ${stats?.ledgerCount || 0} Sezon`;
    icon = MapPin;
    iconBg = "bg-violet-500/10";
    iconColor = "text-violet-500";

  } else if (tableName === "TANIM_Meravlar") {
    primary = `${item.Ad || ''} ${item.Soyad || ''}`.trim() || item.Ad_Soyad || "İSİMSİZ";
    const loc = (cachedData.TANIM_Konumlar || []).find((l: any) => String(l.id) === String(item.Mahalle_id));
    secondary = loc ? `${loc.Ad} SORUMLUSU` : "GENEL SORUMLU";
    icon = User;
    iconBg = "bg-indigo-500";
    iconColor = "text-white";

  } else if (tableName === "DATA_Tasinmaz_Mevkileri") {
    const loc = (cachedData.TANIM_Konumlar || []).find((l: any) => String(l.id) === String(item.Konum_id));
    primary = item.Mevki_Adi || "İSİMSİZ MEVKİ";
    const mStats = useAppStore.getState().mevkiStats?.[item.id];
    secondary = `${loc?.Ad || "BÖLGESİZ"} · ${mStats?.tapuCount || 0} Parsel, ${Math.round(mStats?.totalArea || 0).toLocaleString('tr-TR')} m²`;
    icon = MapPin;
    iconBg = "bg-emerald-500/10";
    iconColor = "text-emerald-500";

  } else {
    primary = item[Object.keys(item).find(k => k.includes('Ad')) || ''] || item.id?.toString().substring(0, 8) || "KAYIT";
    secondary = item[Object.keys(item).find(k => k.includes('Aciklama') || k.includes('Not')) || ''] || "";
  }

  return { primary, secondary, icon, iconBg, iconColor, tags };
};

export const ListRenderer: React.FC<ListRendererProps> = ({
  rows,
  rowVirtualizer,
  tableName,
  config,
  onRowClick,
  observerTarget,
  hasMore,
}) => {
  const cachedData = useAppStore((state) => state.cachedData);

  return (
    <div className="space-y-3 pb-12 relative" style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: "100%" }}>
      {rowVirtualizer.getVirtualItems().map((virtualRow: any) => {
        const isSentinel = virtualRow.index >= rows.length;

        if (isSentinel) {
          return (
            <div
              key="sentinel"
              ref={observerTarget}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "80px",
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className="flex items-center justify-center"
            >
              {hasMore && (
                <div className="w-8 h-8 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
              )}
            </div>
          );
        }

        const row = rows[virtualRow.index];
        const item = row.original;
        const meta = getRowMeta(tableName, item, cachedData);
        const IconComp = meta.icon;

        return (
          <div
            key={row.id}
            onClick={() => onRowClick && onRowClick(tableName, item.id)}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
              padding: "4px 0",
            }}
            className="group"
          >
            <div className="bg-white dark:bg-slate-900 p-5 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm hover:border-primary-500/30 hover:shadow-md transition-all cursor-pointer flex items-center justify-between h-full">
              <div className="flex items-center gap-5 min-w-0 flex-1">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all ${meta.iconBg} ${meta.iconColor}`}>
                  <IconComp size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight truncate">{meta.primary}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-70 mt-0.5 truncate">{meta.secondary}</p>
                </div>
              </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-4">
                  <div className="flex flex-wrap justify-end gap-1 max-w-[200px]">
                    {meta.tags.map((tag, i) => (
                      <span key={i} className={`px-2 py-0.5 text-[7px] font-black rounded border border-current/10 uppercase tracking-tighter whitespace-nowrap ${tag.color}`}>
                        {tag.label}
                      </span>
                    ))}
                  </div>
                  <div className="w-8 h-8 flex items-center justify-center text-slate-300 group-hover:text-primary-500 group-hover:bg-primary-500/10 rounded-xl transition-all ml-2">
                    <ArrowRight size={16} />
                  </div>
                </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
