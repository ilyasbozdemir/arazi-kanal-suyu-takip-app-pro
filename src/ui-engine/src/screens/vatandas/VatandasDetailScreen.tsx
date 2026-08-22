import React, { useState } from 'react';

import { 
 Landmark, FileText,
} from "lucide-react";
import { MaliDurumTab } from '@renderer/components/tabs/MaliDurumTab';
import { DetailHeader } from "@renderer/components/detail/DetailHeader";
import { GeneralTab } from './components/tabs/GeneralTab';
import { AccrualsTab } from '@renderer/components/tabs/AccrualsTab';
import { CollectionsTab } from '@renderer/components/tabs/CollectionsTab';
import { AccountingLedgerTab } from '@renderer/components/tabs/AccountingLedgerTab';
import { IrrigationHistoryTab } from '@renderer/components/tabs/IrrigationHistoryTab';
import { DeedArchiveTab } from './components/tabs/DeedArchiveTab';
import { DistributionLedgerTab } from './components/tabs/DistributionLedgerTab';
import { TahsilatFormModal } from './components/modals/TahsilatFormModal';
import { ManuelBorcFormModal } from './components/modals/ManuelBorcFormModal';
import { VatandasCreateOrUpdateScreen } from './VatandasCreateOrUpdateScreen';
import { translateHeader } from "@renderer/utils/translations";
import { useRecordDetail } from "@renderer/hooks/useRecordDetail";
import { ElectronService } from "@renderer/services/ElectronService";
import { QRModal } from '@renderer/components/modals/QRModal';
import { DeleteConfirmModal } from "@renderer/components/modals/DeleteConfirmModal";



export const VatandasDetailScreen: React.FC<any> = (props) => {
  const { table, type, data, citizens, locations, onRefresh, onClose, onOpenDetail, inline } = props;

  // SARSILMAZ MANTIK KATMANI (Logic Layer)
  const logic = useRecordDetail(table, type, data, true, onRefresh, onClose);

  const {
     values = {}, setValues, isEditing, setIsEditing, activeTab: logicTab = "genel", setActiveTab: setLogicTab,
     isProcessing, tcknStatus, sicilStatus, errors, isFormValid, debounceTimer,
     isDeleteModalOpen, setIsDeleteModalOpen,
     onSaveRecord, onDeleteRecord, profileData: logicProfileData
  } = logic;

  const profileData = logicProfileData || (props as any).profileData;

  const [activeQR, setActiveQRState] = useState<{ type: 'tel' | 'wp' | 'mail' | 'search', data: string, title: string } | null>(null);
  const setActiveQR = React.useCallback((qr: any) => {
     setActiveQRState(qr);
  }, []);
  const [isTahsilatOpen, setIsTahsilatOpen] = useState(false);
  const [isManuelBorcOpen, setIsManuelBorcOpen] = useState(false);
  const [payingTahakkuk, setPayingTahakkuk] = useState<any>(null);
  const [ppPreview, setPpPreview] = useState<string | null>(null);

  React.useEffect(() => {
     if (values.Profil_Foto_Yolu) {
        ElectronService.getCitizenProfileImage(values.Profil_Foto_Yolu).then(setPpPreview);
     } else {
        setPpPreview(null);
     }
  }, [values.Profil_Foto_Yolu]);

  // EĞER DÜZENLEME MODUNDAYSA SİHİRBAZI GÖSTER
  if (isEditing) {
    return (
      <VatandasCreateOrUpdateScreen 
        {...props}
        {...logic}
        onClose={() => setIsEditing(false)}
        onRefresh={onRefresh}
      />
    );
  }

  // NORMAL GÖRÜNÜM (READ-ONLY TABS)
  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
       <DetailHeader
          table={table} type={type} values={values}
          title="Mükellef Bilgi Kartı"
          activeTab={logicTab} setActiveTab={setLogicTab} isEditing={isEditing} setIsEditing={setIsEditing}
          onSaveRecord={onSaveRecord} onDelete={() => setIsDeleteModalOpen(true)}
          onClose={onClose} inline={inline} translateHeader={translateHeader}
          setValues={setValues} data={data} citizens={citizens} locations={locations} onOpenDetail={onOpenDetail}
          profileData={profileData} onRefresh={onRefresh}
       />
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
           <div className={`mx-auto transition-all duration-500 max-w-[1400px]`}>
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                  {logicTab === "genel" && (
                     <>
                        <GeneralTab values={values} setActiveQR={setActiveQR} ppPreview={ppPreview} />
                     </>
                  )}
                {logicTab === 'sulama' && (
                   <IrrigationHistoryTab values={values} profileData={profileData} />
                )}
                {logicTab === 'mali' && (
                   <MaliDurumTab
                      profileData={profileData}
                      values={values}
                      citizen={{ id: values.id, Ad: values.Ad, Soyad: values.Soyad, TCKN: values.TCKN }}
                      onAddDebt={() => setIsManuelBorcOpen(true)}
                      onPay={(t: any) => {
                         setPayingTahakkuk(t);
                         setIsTahsilatOpen(true);
                      }}
                   />
                )}
                {logicTab === 'tapu' && (
                   <DeedArchiveTab values={values} profileData={profileData} onOpenDetail={onOpenDetail} />
                )}
                {logicTab === 'defter' && (
                   <DistributionLedgerTab values={values} profileData={profileData} />
                )}
                {logicTab === 'cari' && (
                   <AccountingLedgerTab profileData={profileData} />
                )}
             </div>
          </div>
       </div>
       <QRModal
          isOpen={!!activeQR}
          onClose={() => setActiveQR(null)}
          title={activeQR?.title || ''}
          data={activeQR?.data || ''}
          type={activeQR?.type || 'tel'}
       />
        <TahsilatFormModal 
           isOpen={isTahsilatOpen}
           onClose={() => {
              setIsTahsilatOpen(false);
              setPayingTahakkuk(null);
           }}
           onSuccess={() => {
              onRefresh?.();
              logic.refresh();
           }}
           citizen={payingTahakkuk ? { 
              id: payingTahakkuk.Vatandas_Id || values.id, 
              TCKN: payingTahakkuk.Vatandas_TCKN || values.TCKN, 
              Ad: payingTahakkuk.Vatandas_Ad || values.Ad, 
              Soyad: payingTahakkuk.Vatandas_Soyad || values.Soyad 
           } : { id: values.id, TCKN: values.TCKN, Ad: values.Ad, Soyad: values.Soyad }}
           tahakkukId={payingTahakkuk?.id}
           initialAmount={payingTahakkuk?.Kalan_Borc}
           totalDebt={payingTahakkuk ? payingTahakkuk.Kalan_Borc : (profileData?.tahakkuk?.reduce((acc: number, curr: any) => acc + (Number(curr.Kalan_Borc) || 0), 0) || 0)}
        />
        <ManuelBorcFormModal 
           isOpen={isManuelBorcOpen}
           onClose={() => setIsManuelBorcOpen(false)}
           onSuccess={() => {
              onRefresh?.();
              logic.refresh();
           }}
           citizen={{ id: values.id, TCKN: values.TCKN, Ad: values.Ad, Soyad: values.Soyad }}
        />
        <DeleteConfirmModal
           isOpen={isDeleteModalOpen}
           onClose={() => setIsDeleteModalOpen(false)}
           onConfirm={onDeleteRecord}
           isProcessing={isProcessing}
           message={`${values.Ad} ${values.Soyad} isimli mükellefi silmeyi onaylıyor musunuz?`}
        />
    </div>
  );
};
