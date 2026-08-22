import React from 'react';
import { X } from 'lucide-react';
import { VatandasCreateOrUpdateScreen } from '../../VatandasCreateOrUpdateScreen';
import { TableNames } from '../../../../config/recordConfig';

interface FastCitizenModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTCKN?: string;
  onSuccess: (vatandas: any) => void;
}

/**
 * 🛡️ KURUM SARSILMAZ MODAL ÜNİTESİ
 * Bu bileşen, ana vatandaş kayıt ekranını (VatandasCreateOrUpdateScreen) 
 * bir modal içerisine gömerek "her yerde aynı kurallar" ilkesini uygular.
 */
export const FastCitizenModal: React.FC<FastCitizenModalProps> = ({ isOpen, onClose, initialTCKN, onSuccess }) => {
  if (!isOpen) return null;

  // 🛡️ Başarı durumunda yakalama mekanizması
  // VatandasCreateOrUpdateScreen içindeki useRecordDetail başarılı kayıttan sonra onRefresh'i (yeni veriyle) çağırır.
  const handleSuccess = (newCitizen: any) => {
    // Ana ekrandan gelen tam vatandaş verisini (id, ad, soyad vb.) üst bileşene paslıyoruz.
    onSuccess(newCitizen); 
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300">
      {/* Arka Plan Karartma */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={onClose} />

      {/* Modal Gövdesi - Tam Ekran Benzeri Büyük Yapı */}
      <div className="relative w-full h-full max-w-7xl bg-white dark:bg-slate-900 rounded-[64px] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-12 duration-500">
        
        {/* Üst Kapatma Butonu (Yüzen) */}
        <button 
          onClick={onClose} 
          className="absolute top-8 right-8 z-[1100] w-14 h-14 bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-500 rounded-full shadow-2xl flex items-center justify-center transition-all hover:rotate-90 active:scale-90"
        >
          <X size={24} />
        </button>

        {/* Ana Ekran Bileşeni */}
        <div className="flex-1 overflow-hidden">
          <VatandasCreateOrUpdateScreen 
             table={TableNames.VATANDAS}
             type="create"
             data={{ TCKN: initialTCKN, Ad: '', Soyad: '' }}
             onRefresh={handleSuccess} // Başarı durumunda burası tetiklenir
             onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
};
