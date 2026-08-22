import React from "react";
/* Kurum_SYNC_FORCE_V3 */
import {
  User, Layers, Clock, Save, Edit, Trash2, X, Shield, ShieldAlert, RefreshCw, Users,
  Zap, Droplets, Wallet, CreditCard, FileText, UserPlus, MapPin
} from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@renderer/store/useAppStore";
import { generateTestData } from "../../utils/testDataGenerator";

interface DetailHeaderProps {
  table: string;
  type: "view" | "create" | "detail";
  isEditing: boolean;
  values: any;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  setIsEditing: (val: boolean) => void;
  onSaveRecord?: () => void;
  onDeleteRecord?: () => void;
  onSave?: () => void;
  onDelete?: () => void;
  onClose: () => void;
  inline?: boolean;
  translateHeader: (h: string) => string;
  citizens?: any[];
  locations?: any[];
  profileData?: any;
  onOpenDetail?: (table: string, id: any) => void;
  onOpenCreate?: (table: string, initialData?: any) => void;
  setValues: (v: any) => void;
  data: any;
  title?: string;
  subtitle?: string;
  icon?: any;
  customTitle?: string;
  customIcon?: any;
  onCloseLabel?: string;
  hideActions?: boolean;
  isProcessing?: boolean;
  isFormValid?: boolean;
  onRefresh?: () => void;
  tabs?: { id: string; label: string; icon?: any; show?: boolean }[];
}

export const DetailHeader: React.FC<DetailHeaderProps> = (props) => {
  const {
    table, type, isEditing, values, activeTab, setActiveTab, setIsEditing,
    onSaveRecord, onDeleteRecord, onSave, onDelete, onClose, inline, translateHeader,
    citizens, locations, profileData, onOpenDetail, setValues, data,
    title: propTitle, subtitle: propSubtitle, icon: PropIcon, isProcessing, isFormValid,
    onRefresh, customTitle, customIcon, onCloseLabel, hideActions, tabs, onOpenCreate
  } = props;

  const cachedData = useAppStore(state => state.cachedData);

  const getTitle = () => {
    if (customTitle) return customTitle;
    if (propTitle) return propTitle;
    if (type === "create") return `${translateHeader(table)} Kayıt Girişi`;
    if (table === "DATA_Vatandas") return "T.C. Mükellef Dosyası";
    if (table === "DATA_Tapu_Verisi") return "T.C. Taşınmaz Kayıt Bilgisi";
    if (table === "DATA_Tasinmaz_Mevkileri") return "T.C. Mevki / Bölge Kaydı";
    if (table === "DATA_Dagitim_Donemleri") return `T.C. ${values?.Mahalle_Adi?.toLocaleUpperCase('tr-TR') || 'MAHALLE'} SULAMA DEFTERİ`;
    return values?.id?.toString().substring(0, 8) || "RESMİ KAYIT GÖRÜNÜMÜ";
  };

  const FinalIcon = customIcon || PropIcon;

  const getSubTitle = () => {
    if (propSubtitle) return propSubtitle;
    if (!values) return "VERİ YÜKLENİYOR...";

    if (table === "DATA_Tapu_Verisi") {
      const mId = values.Mevki_id || values.mevki_id;
      const mName = values.Mevki || values.mevki;

      const allLocations = [...(locations || []), ...(cachedData.DATA_Tasinmaz_Mevkileri || []), ...(cachedData.TANIM_Konumlar || [])];

      const match = allLocations.find((x: any) =>
        (mId && String(x.id) === String(mId)) ||
        (mName && x.Mevki_Adi === mName) ||
        (mName && x.mevki_adi === mName) ||
        (mName && x.Ad === mName)
      );

      const displayName = mName || match?.Mevki_Adi || match?.Ad || (mId ? `MEVKİ ID: ${mId}` : 'BÖLGE / MEVKİ SEÇİLMEMİŞ');

      return (
        <div key="st-mevki" className="flex items-center gap-2">
          <span
            onClick={(e) => {
              e.stopPropagation();
              const finalId = match?.id || mId;
              const targetTable = match?.table_name || (match?.Ad ? 'TANIM_Konumlar' : 'DATA_Tasinmaz_Mevkileri');
              if (finalId && finalId !== 'create') onOpenDetail?.(targetTable, finalId);
              else if (mName) onOpenCreate?.('DATA_Tasinmaz_Mevkileri', { Mevki_Adi: mName });
            }}
            className="cursor-pointer transition-all border-b-2 border-indigo-500/30 hover:border-indigo-500 text-indigo-500 hover:text-indigo-600 font-black tracking-tighter uppercase py-0.5 text-[11px] animate-pulse hover:animate-none"
          >
            {displayName}
          </span>
        </div>
      );
    }
    const humanId = (() => {
      if (!values?.id) return 'YENİ';
      if (table === "DATA_Vatandas") return values.Sicil_No || values.id.toString().substring(0, 8);
      if (table === "DATA_Tapu_Verisi") return `${values.Ada_No || '?'}-${values.Parsel_No || '?'}`;
      if (table === "TANIM_Personel") return values.Sicil_No || values.id.toString().substring(0, 8);
      return values.id.toString().substring(0, 8);
    })();

    return `${translateHeader(table)} / #${(humanId || '...').toLocaleUpperCase('tr-TR')}`;
  };

  const getOwnerTag = () => {
    if (table === "DATA_Tapu_Verisi") {
      return null;
    }
    return null;
  };

  const finalOnSave = onSave || onSaveRecord || (() => { });
  const finalOnDelete = onDelete || onDeleteRecord || (() => { });
  const showSaveButton = isEditing || type === "create";

  return (
    <div className="flex-none p-6 flex items-center justify-between border-b border-white/5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl sticky top-0 z-[60] overflow-hidden">
      <div className="absolute -left-20 -top-20 w-48 h-48 bg-primary-500/10 blur-[80px] pointer-events-none" />
      <div className="absolute left-1/2 -top-10 w-32 h-32 bg-violet-500/10 blur-[60px] pointer-events-none" />

      <div className="flex items-center gap-6 relative z-10">
        <motion.div
          whileHover={{ scale: 1.05, rotate: -5 }}
          className="w-14 h-14 bg-gradient-to-br from-primary-400 to-primary-600 rounded-[20px] flex items-center justify-center text-white shadow-[0_10px_20px_-5px_rgba(var(--primary-rgb),0.5)] ring-4 ring-primary-500/5 overflow-hidden"
        >
          {FinalIcon ? <FinalIcon size={28} /> : (table === "DATA_Vatandas" ? <User size={28} /> : <Layers size={28} />)}
        </motion.div>

        <div className="space-y-1.5 focus-within:z-50">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic leading-none">
              {getTitle()}
            </h1>
            {getOwnerTag()}
          </div>
          <div className="flex items-center gap-2">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] italic">
              {table === "DATA_Dagitim_Donemleri" ? `${values.Yil || ''} DÖNEMİ RESMİ ARŞİV KAYDI` : getSubTitle()}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 relative z-10">
        {(type === "view" || type === "detail") && !isEditing && !hideActions && (
          <div className="p-1 bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-2xl flex items-center mr-2 border border-white/10 shadow-lg">
            {(tabs || [
              { id: "genel", label: "GENEL VERİLER" },
              { id: "sulama", label: "💧 SULAMA GEÇMİŞİ", show: table === "DATA_Tapu_Verisi" || table === "DATA_Vatandas" },
              { id: "mali", label: "🏛️ MALİ DURUM", show: table === "DATA_Tapu_Verisi" || table === "DATA_Vatandas" },
              { id: "performans", label: "PERFORMANS ANALİZİ", show: table === "TANIM_Personel" },
              { id: "tapu", label: (table.includes("Mevki") ? "BAĞLI TAŞINMAZLAR" : "TAPU ARŞİVİ"), show: table === "DATA_Vatandas" || table.includes("Mevki") },
              { id: "defter", label: "DEFTER KAYITLARI", show: table === "DATA_Vatandas" },
              { id: "cari", label: "🏛️ CARİ HESAP", show: table === "DATA_Vatandas" },
              { id: "hareketler", label: "İŞLEM GEÇMİŞİ", show: (table === "DATA_Vatandas" || table === "DATA_Tapu_Verisi" || table.includes("Mevki") || table === "TANIM_Personel") && ((profileData?.movements?.length > 0) || (profileData?.tahsilatlar?.length > 0)) }
            ]).filter((t: any) => t.show !== false).map(t => (
              <button
                key={t.id}
                type="button"
                title={t.label}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === t.id
                    ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/30'
                    : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          {showSaveButton && (
            <>
              <button
                type="button"
                title="Değişiklikleri İptal Et"
                onClick={() => { setValues(data); setIsEditing(false); if (type === 'create') onClose(); }}
                className="px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-500 font-bold rounded-xl hover:bg-slate-100 transition-all text-[10px] tracking-widest uppercase border border-slate-200 dark:border-white/10"
              >
                İPTAL
              </button>
              {import.meta.env?.DEV && (
                <button
                  type="button"
                  title="Test Verisi Doldur"
                  onClick={() => setValues(generateTestData(table, values))}
                  className="px-4 py-2.5 bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white font-bold rounded-xl transition-all text-[10px] tracking-widest uppercase border border-amber-500/20"
                >
                  🪄 TEST VERİSİ
                </button>
              )}
              <button
                type="button"
                title="Kaydı Onayla"
                disabled={isProcessing || !isFormValid}
                onClick={finalOnSave}
                className={`px-6 py-2.5 font-black rounded-xl shadow-xl flex items-center gap-2 transition-all text-[10px] tracking-widest uppercase border-0 ${!isProcessing && isFormValid
                    ? "bg-emerald-500 text-white shadow-emerald-500/20 hover:scale-105 active:scale-95"
                    : "bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed opacity-50 shadow-none"
                  }`}
              >
                {isFormValid ? (
                  <Save size={14} className="stroke-[3]" />
                ) : (
                  <div className="flex items-center gap-1 text-rose-500 animate-pulse">
                    <ShieldAlert size={14} />
                  </div>
                )}
                {isProcessing ? "İşleniyor..." : "KAYDET"}
              </button>
            </>
          )}

          {(type === "view" || type === "detail") && !isEditing && !hideActions && (
            <div className="flex items-center gap-2">
              {/* ⚡ HIZLI ERİŞİM MENÜSÜ */}
              <div className="relative group">


                {/* DROPDOWN PANEL */}
                <div className="absolute top-full right-0 mt-4 w-72 bg-slate-900/95 backdrop-blur-3xl border border-white/10 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-6 opacity-0 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-[100]">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 px-2">OPERASYONEL KISAYOLLAR</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'su', label: 'SU FİŞİ', icon: Droplets, color: 'text-sky-500', bg: 'bg-sky-500/10', table: 'MUHASEBE_Tahakkuk' },
                      { id: 'tahsilat', label: 'TAHSİLAT', icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-500/10', table: 'MUHASEBE_Tahsilat' },
                      { id: 'vatandas', label: 'VATANDAŞ', icon: UserPlus, color: 'text-indigo-500', bg: 'bg-indigo-500/10', table: 'DATA_Vatandas' },
                      { id: 'tapu', label: 'TAPU KAYDI', icon: MapPin, color: 'text-rose-500', bg: 'bg-rose-500/10', table: 'DATA_Tapu_Verisi' },
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => onOpenDetail?.(item.table, 'create')}
                        className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all group/item"
                      >
                        <div className={`w-10 h-10 ${item.bg} ${item.color} rounded-xl flex items-center justify-center mb-3 group-hover/item:scale-110 transition-transform`}>
                          <item.icon size={20} />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 group-hover/item:text-white">{item.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/5">
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest text-center italic opacity-50">GÜNEY YURT KURUMSİ ERP V5</p>
                  </div>
                </div>
              </div>

              <button type="button" title="Kaydı Düzenle" onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-6 py-2.5 bg-primary-500 text-white font-black rounded-xl shadow-xl shadow-primary-500/30 hover:scale-105 active:scale-95 transition-all text-[10px] tracking-widest uppercase border-2 border-primary-400/20"><Edit size={16} className="stroke-[3]" /> DÜZENLE</button>
              <button
                type="button" title="Kaydı Sil"
                onClick={finalOnDelete}
                className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl shadow-md border-2 border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all">
                <Trash2 size={18} className="stroke-[2.5]" />
              </button>
            </div>
          )}

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="p-2.5 text-slate-400 hover:text-primary-500 hover:bg-primary-500/10 rounded-xl transition-all"
              title="Verileri Yenile"
            >
              <RefreshCw size={20} className={isProcessing ? "animate-spin" : ""} />
            </button>
          )}

          {(!inline || onCloseLabel) && (
            <button
              type="button"
              title="Kapat"
              onClick={onClose}
              className={`flex items-center gap-2 transition-all shadow-xl font-black text-[9px] uppercase tracking-widest ${onCloseLabel ? 'px-6 py-3 bg-rose-500 text-white rounded-2xl hover:bg-rose-600' : 'p-2.5 bg-slate-900 text-white rounded-xl hover:bg-rose-600'}`}
            >
              <X size={onCloseLabel ? 14 : 18} />
              {onCloseLabel && <span>{onCloseLabel}</span>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

