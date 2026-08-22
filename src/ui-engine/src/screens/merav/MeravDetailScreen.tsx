import React, { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Briefcase,
  FileText,
  MapPin,
  Phone,
  ShieldCheck,
  TrendingUp,
  User,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  Calendar,
  Layers,
  Activity
} from "lucide-react";
import { useRecordDetail } from "@renderer/hooks/useRecordDetail";
import { DetailHeader } from "@renderer/components/detail/DetailHeader";
import { MeravEditView } from "./MeravEditView";
import { MeravDevirModal } from "./modals/MeravDevirModal";
import { MeravGenelTab } from "./tabs/MeravGenelTab";
import { MeravFislerTab } from "./tabs/MeravFislerTab";
import { MeravSistemTab } from "./tabs/MeravSistemTab";

export const MeravDetailScreen: React.FC<any> = (props) => {
  const { table, type, data, citizens, onRefresh, onClose, inline } = props;
  const logic = useRecordDetail(table, type, data, true, onRefresh, onClose);

  const {
    values = {},
    setValues,
    isEditing,
    setIsEditing,
    activeTab,
    setActiveTab,
    isProcessing,
    isFormValid,
    onSaveRecord,
    onDeleteRecord,
    profileData,
  } = logic;

  const [isDevirModalOpen, setIsDevirModalOpen] = React.useState(false);
  const [selectedSourceMerav, setSelectedSourceMerav] = React.useState("");
  const [isDevirProcessing, setIsDevirProcessing] = React.useState(false);
  const [allMeravlar, setAllMeravlar] = React.useState<any[]>([]);

  const [citizen, setCitizen] = useState<any>(null);
  const [loadingCitizen, setLoadingCitizen] = useState(false);

  useEffect(() => {
    const findCitizen = async () => {
      // 🛡️ Sarsılmaz Arama: Hem values hem profileData hem de props.data kontrol et
      const targetTCKN = values.Vatandas_Id || profileData?.Vatandas_Id || data?.Vatandas_Id;
      
      if (!targetTCKN) {
          // 🛡️ KRİTİK FALLBACK: Eğer TCKN hiçbir yerden gelmediyse, elimizdeki ID ile Merav tablosuna bak (User Talep)
          const meravLookup = await (window as any).api.executeRaw(`SELECT Vatandas_Id FROM TANIM_Meravlar WHERE id = ?`, [data?.id]);
          if (meravLookup.success && meravLookup.data?.[0]?.Vatandas_Id) {
              const res = await (window as any).api.executeRaw(`SELECT * FROM DATA_Vatandas WHERE TCKN = ?`, [meravLookup.data[0].Vatandas_Id]);
              if (res.success && res.data?.[0]) {
                  setCitizen(res.data[0]);
              }
              return;
          }

          // Eğer ID bir TCKN formatındaysa (11 hane numeric) onu dene
          if (data?.id && data.id.length === 11 && /^\d+$/.test(data.id)) {
              const res = await (window as any).api.executeRaw(`SELECT * FROM DATA_Vatandas WHERE TCKN = ?`, [data.id]);
              if (res.success && res.data?.[0]) {
                  setCitizen(res.data[0]);
              }
          }
          return;
      }

      if (props.citizens?.length > 0) {
        const found = props.citizens.find((c: any) => c.TCKN === targetTCKN);
        if (found) {
            setCitizen(found);
            return;
        }
      }
      
      setLoadingCitizen(true);
      const res = await (window as any).api.executeRaw(`SELECT * FROM DATA_Vatandas WHERE TCKN = ?`, [targetTCKN]);
      if (res.success && res.data?.[0]) {
          setCitizen(res.data[0]);
      }
      setLoadingCitizen(false);
    };
    findCitizen();
  }, [data?.Vatandas_Id, values.Vatandas_Id, props.citizens]);

  // 🛡️ Edit Mode Delegation
  if (isEditing || type === 'create') {
     return <MeravEditView {...props} values={values} setValues={setValues} logic={logic} />;
  }

  const loadAllMeravlar = async () => {
    const res = await (window as any).electron.ipcRenderer.invoke("get-db-data", "TANIM_Meravlar");
    if (res.success) {
      setAllMeravlar((res.data || []).filter((p: any) => p.id !== data?.id && p.Aktif !== 0));
    }
  };

  const handleDevirAction = async () => {
    if (!selectedSourceMerav) return;
    const confirm = await (window as any).electron.ipcRenderer.invoke("show-confirm", {
        title: "SAHA GÖREV DEVİR PROTOKOLÜ",
        message: "Seçilen Meravın tüm açık tahsilat sorumlulukları üzerinize devredilecektir. Devam edilsin mi?",
        type: "warning",
    });
    if (!confirm) return;
    setIsDevirProcessing(true);
    try {
      const res = await (window as any).electron.ipcRenderer.invoke("merav-devir", { oldMeravId: selectedSourceMerav, newMeravId: data?.id });
      if (res.success) {
        (window as any).api.showAlert({ title: "BAŞARILI", message: "Saha görev devri tamamlandı.", type: "success" });
        setIsDevirModalOpen(false);
        onRefresh();
      } else {
        (window as any).api.showAlert({ title: "HATA", message: "Devir hatası: " + res.error, type: "error" });
      }
    } finally {
      setIsDevirProcessing(false);
    }
  };

  const handleDeleteWithCheck = async () => {
     const countRes = await (window as any).api.executeRaw(`SELECT COUNT(*) as cnt FROM REL_Defter_Merav WHERE Merav_id = ? AND Aktif = 1`, [data.id]);
     const count = countRes.success ? countRes.data[0].cnt : 0;
     
     if (count > 0) {
        (window as any).api.showAlert({ 
           title: "SİLME ENGELLENDİ", 
           message: `Bu Meravın üzerine zimmetli ${count} adet aktif defter bulunmaktadır. Önce görev devri yapmalısınız.`, 
           type: 'warning' 
        });
        return;
     }
     onDeleteRecord();
  };

  const translateHeader = (h: string) => {
    const dict: any = { "Vatandas_Id": "VATANDAŞ TCKN", "Aktif": "DURUM" };
    return dict[h] || h;
  };

  const assignments = values.assignments || profileData?.assignments || [];

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] dark:bg-[#020617] overflow-hidden font-sans text-slate-900 dark:text-slate-100">
      <DetailHeader
        table={table} type={type} isEditing={isEditing} values={values}
        activeTab={activeTab} setActiveTab={setActiveTab} setIsEditing={setIsEditing}
        onSaveRecord={onSaveRecord} onDeleteRecord={handleDeleteWithCheck}
        onClose={onClose} inline={inline} translateHeader={translateHeader}
        setValues={setValues} data={data} isProcessing={isProcessing} isFormValid={isFormValid}
        title={values.Ad_Soyad || (citizen ? `${citizen.Ad} ${citizen.Soyad}` : (loadingCitizen ? "Yükleniyor..." : "Merav Kartı"))}
        subtitle="Saha Sulama ve Dağıtım Görevlisi Yönetimi"
        icon={User}
        tabs={[
          { id: "genel", label: "GENEL BİLGİLER", icon: Briefcase },
          { id: "fisler", label: "SAHA FİŞLERİ", icon: FileText },
          { id: "sistem", label: "SİSTEM & DENETİM", icon: ShieldCheck },
        ]}
      />

      <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
         <AnimatePresence mode="wait">
            {activeTab === "genel" && (
              <MeravGenelTab 
                values={values}
                citizen={citizen}
                loadingCitizen={loadingCitizen}
                profileData={profileData}
                assignments={assignments}
                onOpenDetail={props.onOpenDetail}
                onDevirOpen={() => { loadAllMeravlar(); setIsDevirModalOpen(true); }}
              />
            )}

            {activeTab === "fisler" && (
              <MeravFislerTab 
                profileData={profileData}
                onOpenDetail={props.onOpenDetail}
              />
            )}

            {activeTab === "sistem" && (
              <MeravSistemTab 
                values={values}
                table={table}
                data={data}
              />
            )}
         </AnimatePresence>
      </div>

      <MeravDevirModal 
        isOpen={isDevirModalOpen}
        onClose={() => setIsDevirModalOpen(false)}
        allMeravlar={allMeravlar}
        selectedSourceMerav={selectedSourceMerav}
        setSelectedSourceMerav={setSelectedSourceMerav}
        onConfirm={handleDevirAction}
        isProcessing={isDevirProcessing}
      />
    </div>
  );
};
