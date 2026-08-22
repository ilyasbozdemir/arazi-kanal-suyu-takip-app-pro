import React from "react";
import { Layers, MapPin, Maximize2, Phone, User, Users } from "lucide-react";
import { MeravResponsibilityArea } from "../helpers/MeravHelpers";
import { useAppStore } from "../../../store/useAppStore";

interface GridRendererProps {
  rows: any[];
  columnsCount: number;
  rowVirtualizer: any;
  tableName: string;
  config: any;
  onRowClick?: (table: string, id: any) => void;
  observerTarget: React.RefObject<any>;
  hasMore: boolean;
}

export const GridRenderer: React.FC<GridRendererProps> = ({
  rows,
  columnsCount,
  rowVirtualizer,
  tableName,
  config,
  onRowClick,
  observerTarget,
  hasMore,
}) => {
  const cachedData = useAppStore((state) => state.cachedData);
  const colWidth = 100 / columnsCount;

  return (
    <div className="relative pb-12" style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: "100%" }}>
      {rowVirtualizer.getVirtualItems().map((virtualRow: any) => {
        const rowIndex = virtualRow.index;
        const itemsInRow = [];

        for (let i = 0; i < columnsCount; i++) {
          const index = rowIndex * columnsCount + i;
          if (index < rows.length) {
            console.log(rows[index]);
            itemsInRow.push({ item: rows[index].original, rowId: rows[index].id, colIndex: i });
          } else if (index === rows.length && hasMore && i === 0) {
            itemsInRow.push({ isSentinel: true, colIndex: i });
          }
        }

        return itemsInRow.map((slot: any) => {
          if (slot.isSentinel) {
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
                className="flex items-center justify-center col-span-full"
              >
                <div className="w-8 h-8 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
              </div>
            );
          }

          const { item, rowId, colIndex } = slot;
          const isVatandas = tableName === "DATA_Vatandas";

          return (
            <div
              key={rowId}
              onClick={() => onRowClick && onRowClick(tableName, item.id)}
              style={{
                position: "absolute",
                top: 0,
                left: `${colIndex * colWidth}%`,
                width: `${colWidth}%`,
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                padding: "10px",
              }}
              className="group"
            >
              <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer h-full relative overflow-hidden flex flex-col justify-between">
                {isVatandas ? (
                  <div className="flex flex-col h-full relative">
                    <div className={`absolute -right-16 -top-16 w-48 h-48 blur-[80px] opacity-[0.08] ${item.Cinsiyet === "Erkek" ? "bg-blue-500" : "bg-rose-500"}`} />
                    
                    <div className="flex items-center gap-5 mb-6">
                      <div className={`w-20 h-20 min-w-[80px] rounded-[28px] flex items-center justify-center text-2xl font-black shadow-inner border-4 border-white dark:border-slate-800 relative ${item.Cinsiyet === "Erkek" ? "bg-blue-50 text-blue-600" : "bg-rose-50 text-rose-600"}`}>
                        {`${(item.Ad || "?")[0]}${(item.Soyad || "")[0]}`.toUpperCase()}
                        {/* Subtle Status Indicator Dot */}
                        <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 shadow-sm ${item.Durum === 'Ölü' || item.Olum_Tarihi ? 'bg-slate-400' : 'bg-emerald-500'}`} title={item.Durum === 'Ölü' || item.Olum_Tarihi ? 'Vefat' : 'Sağ'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] truncate">
                            {item.TCKN ? `TCKN: ${item.TCKN}` : `SİCİL: ${item.Sicil_No || "---"}`}
                          </span>
                          {/* Age Badge */}
                          {(() => {
                            const age = (() => {
                              if (!item.Dogum_Tarihi) return null;
                              try {
                                const parts = item.Dogum_Tarihi.split(/[./-]/);
                                let bDate;
                                if (parts.length === 3) bDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                                else bDate = new Date(item.Dogum_Tarihi);
                                if (isNaN(bDate.getTime())) return null;
                                const today = new Date();
                                let a = today.getFullYear() - bDate.getFullYear();
                                const m = today.getMonth() - bDate.getMonth();
                                if (m < 0 || (m === 0 && today.getDate() < bDate.getDate())) a--;
                                return a;
                              } catch { return null; }
                            })();
                            return age !== null && (
                              <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-white/5 rounded-md text-[8px] font-black text-slate-500 uppercase tracking-tighter">
                                {age} YAŞ
                              </span>
                            );
                          })()}
                        </div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tighter leading-none group-hover:text-primary-500 truncate transition-colors">{item.Ad} {item.Soyad}</h3>
                        {item.Meslek && (
                          <div className="flex items-center gap-1.5 mt-1.5">
                             <div className="w-1 h-1 rounded-full bg-primary-500/40" />
                             <span className="text-[9px] font-bold text-primary-500/70 tracking-[0.1em] italic">{item.Meslek}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-6 px-1">
                       <div className="space-y-1">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Baba Adı</span>
                          <div className="text-[11px] font-black text-slate-700 dark:text-slate-200 truncate">{item.Baba_Adi || "---"}</div>
                       </div>
                       <div className="space-y-1">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Anne Adı</span>
                          <div className="text-[11px] font-black text-slate-700 dark:text-slate-200 truncate">{item.Ana_Adi || "---"}</div>
                       </div>
                       <div className="space-y-1">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Doğum Yeri</span>
                          <div className="text-[11px] font-black text-slate-700 dark:text-slate-200 truncate">{item.Dogum_Yeri || "---"}</div>
                       </div>
                       <div className="space-y-1">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                            {item.Durum === 'Ölü' || item.Olum_Tarihi ? 'Ölüm Tarihi' : 'Doğum Tarihi'}
                          </span>
                          <div className={`text-[11px] font-black truncate ${item.Durum === 'Ölü' || item.Olum_Tarihi ? 'text-rose-500' : 'text-slate-700 dark:text-slate-200'}`}>
                            {item.Olum_Tarihi || item.Dogum_Tarihi || "---"}
                          </div>
                       </div>
                    </div>

                    <div className="mt-auto space-y-3">
                       <div className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-100 dark:border-slate-800 group-hover:bg-primary-500/[0.03] transition-colors">
                          <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-primary-500">
                             <Phone size={14} />
                          </div>
                          <span className="text-xs font-black text-slate-600 dark:text-slate-300 tabular-nums">{item.Telefon || item.Cep_Telefonu || "---"}</span>
                       </div>
                       <div className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-100 dark:border-slate-800 group-hover:bg-emerald-500/[0.03] transition-colors">
                          <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-emerald-500">
                             <MapPin size={14} />
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 truncate leading-tight" title={item.Adres || "---"}>{item.Adres || "---"}</span>
                       </div>
                    </div>
                  </div>
                ) : tableName === "DATA_Tapu_Verisi" ? (
                  <div className="flex flex-col h-full relative group/tapu">
                    {/* 🛡️ Arka Plan Dekorasyonu */}
                    <div className="absolute -right-12 -top-12 w-40 h-40 bg-emerald-500/5 blur-3xl rounded-full" />
                    
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Layers size={24} />
                         </div>
                         <div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">ADA / PARSEL</span>
                            <h4 className="text-lg font-black text-slate-800 dark:text-white leading-none">{item.Ada || "0"} / {item.Parsel || "0"}</h4>
                         </div>
                      </div>
                      <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black rounded-lg border border-emerald-100 dark:border-emerald-500/10">
                         {item.Alan_m2?.toLocaleString('tr-TR')} m²
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                       {/* 🛡️ Malik ve Bakıcı Bilgisi */}
                       <div className="space-y-2">
                              <div className="relative group/hissedar flex-1 min-w-0">
                                <span className="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase truncate block">
                                   {item.Tapu_Sahibi_Ad_Soyad || "BİLİNMEYEN"} 
                                   <span className="ml-1 text-[8px] opacity-40 font-bold tracking-tighter">[{item.Tapu_Sahibi_TCKN || '---'}]</span>
                                   {item.Hissedar_Sayisi > 1 && (
                                     <span className="ml-2 text-[9px] text-primary-500 font-black bg-primary-500/10 px-1.5 py-0.5 rounded cursor-help">
                                       +{item.Hissedar_Sayisi - 1} HİSSEDAR
                                     </span>
                                   )}
                                </span>
                                
                                {item.Hissedar_Sayisi > 1 && item.Hissedarlar && (
                                  <div className="absolute left-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 border-2 border-primary-500/20 rounded-2xl shadow-2xl p-4 z-[300] opacity-0 pointer-events-none group-hover/hissedar:opacity-100 group-hover/hissedar:pointer-events-auto transition-all duration-300 scale-95 group-hover/hissedar:scale-100">
                                    <div className="flex items-center gap-2 mb-3 border-b border-slate-100 dark:border-white/5 pb-2">
                                       <Users size={12} className="text-primary-500" />
                                       <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest">TAM PAYDAŞ LİSTESİ</span>
                                    </div>
                                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                                       {item.Hissedarlar.map((h: string, idx: number) => (
                                          <div key={idx} className="p-2 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                                             <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 block leading-tight">{h}</span>
                                          </div>
                                       ))}
                                    </div>
                                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-white/5 flex justify-between items-center">
                                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">TOPLAM PAYDAŞ:</span>
                                       <span className="text-[10px] font-black text-primary-600">{item.Hissedar_Sayisi}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                          {item.Bakici_Ad_Soyad && (
                            <div className="flex items-center gap-2 pl-4 border-l-2 border-amber-500/30">
                               <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">BAKICI:</span>
                               <span className="text-[10px] font-bold text-slate-500 truncate">{item.Bakici_Ad_Soyad}</span>
                            </div>
                          )}
                       </div>

                       {/* 🛡️ Lokasyon */}
                       <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <MapPin size={12} className="text-slate-300" />
                          <span className="truncate">{item.Mevki || "MEVKİ YOK"}</span>
                       </div>
                    </div>

                    {/* 🛡️ Operasyonel Metrikler */}
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                       <div className="p-2.5 bg-blue-50 dark:bg-blue-500/5 rounded-2xl border border-blue-100 dark:border-blue-500/10 flex flex-col items-center text-center">
                          <span className="text-[7px] font-black text-blue-500 uppercase block mb-1">SULAMA DURUMU</span>
                          <span className="text-xs font-black text-blue-700 dark:text-blue-300">
                             {Number(item.Toplam_Sulama_Saat || 0).toFixed(1)} <span className="text-[8px] opacity-40">/ {item.Aylik_Su_Hakki || 0} SAAT</span>
                          </span>
                       </div>
                       <div className="p-2.5 bg-violet-50 dark:bg-violet-500/5 rounded-2xl border border-violet-100 dark:border-violet-500/10 flex flex-col items-center text-center">
                          <span className="text-[7px] font-black text-violet-500 uppercase block mb-1">FİNANSAL DURUM</span>
                          <span className={`text-xs font-black ${ (item.Toplam_Tahakkuk - item.Toplam_Tahsilat) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                             {((item.Toplam_Tahakkuk || 0) - (item.Toplam_Tahsilat || 0)).toLocaleString('tr-TR')} <span className="text-[8px] opacity-60">₺</span>
                          </span>
                       </div>
                    </div>
                  </div>
                ) : tableName === "TANIM_Meravlar" ? (
                  <>
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-16 h-16 bg-indigo-500 text-white rounded-[24px] flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <User size={28} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-tight truncate">{item.Ad_Soyad || "GÖREVLİ"}</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                           <div className={`w-2 h-2 rounded-full ${item.Aktif ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.Aktif ? 'GÖREVDE' : 'PASİF'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                       <div className="flex flex-col gap-1 p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Sorumlu Olduğu Bölgeler</span>
                          <MeravResponsibilityArea id={item.id} tckn={item.Vatandas_Id} />
                       </div>
                       
                       <div className="flex items-center justify-between px-2">
                          <div className="flex items-center gap-2">
                             <Phone size={12} className="text-indigo-500" />
                             <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{item.Telefon || item.Vatandas_Telefon || "---"}</span>
                          </div>
                          <button title="Detayları Görüntüle" className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-500 hover:text-white transition-all">
                             <Maximize2 size={14} />
                          </button>
                       </div>
                    </div>
                  </>
                ) : tableName === "DATA_Dagitim_Bolgeleri" ? (
                  <div className="flex flex-col h-full relative group/card">
                     <div className="absolute -right-12 -top-12 w-40 h-40 bg-emerald-500/5 blur-3xl rounded-full" />
                     
                     <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-emerald-500 text-white rounded-[20px] flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                           <MapPin size={28} />
                        </div>
                        <div className="min-w-0">
                           <h4 className="text-lg font-black text-slate-800 dark:text-white uppercase leading-tight truncate">
                              {(cachedData.TANIM_Konumlar || []).find((l: any) => String(l.id) === String(item.Mahalle_id))?.Ad || "BİLİNMEYEN"}
                           </h4>
                           <div className="flex items-center gap-1.5 mt-0.5">
                              <Layers size={10} className="text-emerald-500" />
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.Tip || "GENEL"}</span>
                           </div>
                        </div>
                     </div>

                     <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className={`w-2.5 h-2.5 rounded-full ${item.Durum === 'Aktif' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.Durum || "PASİF"}</span>
                        </div>
                        <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[9px] font-black rounded-lg border border-emerald-100 dark:border-emerald-900/50 uppercase tracking-widest">
                           BÖLGE DETAYINA GİT
                        </div>
                     </div>
                  </div>
                ) : tableName === "DATA_Tasinmaz_Mevkileri" ? (
                  <div className="flex flex-col h-full relative">
                     <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary-500/5 blur-3xl rounded-full" />
                     
                     <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-primary-500/10 text-primary-500 rounded-2xl flex items-center justify-center shrink-0">
                           <MapPin size={24} />
                        </div>
                        <div className="min-w-0">
                           <h4 className="text-lg font-black text-slate-800 dark:text-white uppercase leading-tight truncate">
                              {item.Mevki_Adi || "İSİMSİZ MEVKİ"}
                           </h4>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mt-0.5">
                              {(cachedData.TANIM_Konumlar || []).find((l: any) => String(l.id) === String(item.Konum_id))?.Ad || "KONUMSUZ"}
                           </span>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-2 mb-6">
                        <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                           <span className="text-[7px] font-black text-slate-400 uppercase block mb-1 tracking-widest">Parsel Kapasitesi</span>
                           <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                              {useAppStore.getState().mevkiStats?.[item.id]?.tapuCount || 0} <span className="text-[10px] opacity-60">ADET</span>
                           </span>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                           <span className="text-[7px] font-black text-slate-400 uppercase block mb-1 tracking-widest">Toplam Alan</span>
                           <span className="text-sm font-black text-emerald-600">
                              {Math.round(useAppStore.getState().mevkiStats?.[item.id]?.totalArea || 0).toLocaleString('tr-TR')} <span className="text-[10px] opacity-60">m²</span>
                           </span>
                        </div>
                     </div>

                     <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <User size={12} className="text-slate-400" />
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                              {useAppStore.getState().mevkiStats?.[item.id]?.citizenCount || 0} Kayıtlı Malik
                           </span>
                        </div>
                        <div className="w-8 h-8 flex items-center justify-center bg-slate-50 dark:bg-white/5 rounded-xl text-slate-400 group-hover:bg-primary-500 group-hover:text-white transition-all">
                           <Maximize2 size={14} />
                        </div>
                     </div>
                  </div>
                ) : (
                  <div className="flex flex-col h-full justify-center items-center text-center">
                    <Layers size={32} className="text-slate-300 mb-4" />
                    <h4 className="text-lg font-black text-slate-800 dark:text-white uppercase">{item[config.gridCard?.title || ""]}</h4>
                    <p className="text-sm font-bold text-slate-400">{item[config.gridCard?.subtitle || ""]}</p>
                  </div>
                )}
              </div>
            </div>
          );
        });
      })}
    </div>
  );
};
