import React, { useMemo } from "react";
/* Kurum_SYNC_FORCE_V3 */
import { RecordDetailViewProps } from "../types/detail";

// Modüler İthalat (Southyurt Professional Architecture)
import { VatandasDetailScreen } from "@renderer/screens/vatandas/VatandasDetailScreen";
import { VatandasCreateOrUpdateScreen } from "@renderer/screens/vatandas/VatandasCreateOrUpdateScreen";
import { MevkiDetailScreen } from "@renderer/screens/tasinmaz/components/MevkiDetailScreen";
import { TapuCreateScreen } from "@renderer/screens/tapu/TapuCreateScreen";
import { TapuDetailScreen } from "@renderer/screens/tapu/TapuDetailScreen";
import { GeneralEntityDetailView } from "./GeneralEntityDetailView";
import { SuDefteriDetailScreen } from "@renderer/screens/su/components/SuDefteriDetailScreen";
import { MahalleDefteriDetailScreen } from "@renderer/screens/su/components/MahalleDefteriDetailScreen";
import { PersonelDetailScreen } from "@renderer/screens/sistem/components/PersonelDetailScreen";
import { MeravDetailScreen } from "@renderer/screens/merav/MeravDetailScreen";
import { FinanceSettingsScreen } from "@renderer/screens/settings/FinanceSettingsScreen";

/**
 * RecordDetailView: The "Grand Router" of Entity Detail Views.
 * Highly modularized to keep components under 300 lines.
 */
export const RecordDetailViewScreen: React.FC<RecordDetailViewProps> = (props) => {
  const { table, isOpen, inline, type } = props;

  // Performans Seal: useMemo ile sadece tablo veya tip değiştiğinde render kararını ver
  const content = useMemo(() => {
    if (!isOpen && !inline) return null;

    if (table === "DATA_Vatandas") {
      return props.type === 'create' ? <VatandasCreateOrUpdateScreen {...props} /> : <VatandasDetailScreen {...props} />;
    }

    if (table === "DATA_Tapu_Verisi") {
      return props.type === 'create' ? <TapuCreateScreen {...props} /> : <TapuDetailScreen {...props} />;
    }

    if (table === "DATA_Dagitim_Bolgeleri") {
      return <MahalleDefteriDetailScreen {...props} />;
    }

    if (table === "DATA_Tasinmaz_Mevkileri" ) {
      return <MevkiDetailScreen {...props} />;
    }

    if (table === "TANIM_Personel") {
      return <PersonelDetailScreen {...props} />;
    }

    if (table === "TANIM_Meravlar") {
      return <MeravDetailScreen {...props} />;
    }

    if (table === "TANIM_Depolar" || table === "TANIM_Sulama_Hatlari") {
      return <GeneralEntityDetailView {...props} />;
    }

    if (table === "TANIM_Vergi_Oranlari") {
      return <FinanceSettingsScreen initialTab="tax" />;
    }

    if (table === "TANIM_Faiz_Oranlari") {
      return <FinanceSettingsScreen initialTab="interest" />;
    }

    if (table === "ISLEM_Su_Dagitim" || table === "DATA_Su_Defteri") {
        return <SuDefteriDetailScreen {...props} />;
    }

    // FALLBACK
    return (
      <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/50">
         <div className="flex-1 overflow-y-auto p-20 animate-in fade-in duration-500 text-center">
            <div className="max-w-4xl mx-auto p-16 bg-white dark:bg-slate-900 rounded-[56px] shadow-2xl border border-slate-100 dark:border-white/5">
                <h2 className="text-4xl font-black italic uppercase leading-none border-b pb-8 mb-10">GENEL VERİ YÖNETİMİ</h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest italic">Kayıt ayrıntıları ve düzenleme paneli yükleniyor...</p>
            </div>
         </div>
      </div>
    );
  }, [table, type, isOpen, inline, props.data]);

  return <>{content}</>;
};
