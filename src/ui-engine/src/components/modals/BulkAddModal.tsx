import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { BulkEditableTable } from '../table/BulkEditableTable';
import { getTableConfig } from '@renderer/config/TableConfig';
import { translateHeader as globalTranslate } from '@renderer/utils/translations';
import { ElectronService } from '@renderer/services/ElectronService';
import { useAppStore } from '@renderer/store/useAppStore';

interface BulkAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableName: string;
  onSuccess: () => void;
}

export const BulkAddModal: React.FC<BulkAddModalProps> = ({ isOpen, onClose, tableName, onSuccess }) => {
  const mevkiler = useAppStore(state => state.cachedData.DATA_Tasinmaz_Mevkileri) || [];

  const columnsConfig = useMemo(() => {
    const config = getTableConfig(tableName);
    // Determine which fields to show for bulk entry based on the table
    let fields: any[] = [];
    
    if (tableName === 'DATA_Vatandas') {
      fields = [
        { accessorKey: 'TCKN', header: 'TC KİMLİK / VKN', type: 'text' },
        { accessorKey: 'Ad', header: 'AD / ÜNVAN', type: 'text' },
        { accessorKey: 'Soyad', header: 'SOYAD', type: 'text' },
        { accessorKey: 'Baba_Adi', header: 'BABA ADI', type: 'text' },
        { accessorKey: 'Telefon', header: 'TELEFON', type: 'text' },
        { accessorKey: 'Ilce', header: 'İLÇE', type: 'text' },
        { accessorKey: 'Mahalle_Koy', header: 'MAHALLE', type: 'text' },
      ];
    } else if (tableName === 'DATA_Tapu_Verisi') {
      const mevkiOptions = mevkiler.map((m: any) => ({ label: m.Ad || m.Mevki_Adi, value: m.Ad || m.Mevki_Adi }));
      const nitelikOptions = ["ARSA", "TARLA", "BAĞ", "BAHÇE", "KONUT", "TİCARİ", "ZEYTİNLİK", "ELMALIK", "KİRAZLIK", "BOŞ ALAN"].map(o => ({ label: o, value: o }));
      fields = [
        { accessorKey: 'Sahip_id', header: 'MALİK (KİŞİ ARA)', type: 'citizen-search' },
        { accessorKey: 'Mevki', header: 'MEVKİ', type: 'datalist', options: mevkiOptions },
        { accessorKey: 'Ada', header: 'ADA', type: 'number' },
        { accessorKey: 'Parsel', header: 'PARSEL', type: 'number' },
        { accessorKey: 'Alan_m2', header: 'ALAN (m2)', type: 'number' },
        { accessorKey: 'Aylik_Su_Hakki', header: 'AYLIK SU HAKKI (SAAT)', type: 'number' },
        { accessorKey: 'Nitelik', header: 'NİTELİK', type: 'datalist', options: nitelikOptions },
        { accessorKey: 'Notlar', header: 'AÇIKLAMA / NOT', type: 'text' },
      ];
    } else {
      // Fallback: Use some priority columns
      const cols = config.priorityColumns?.slice(0, 7) || ['Ad', 'Soyad', 'TCKN', 'Telefon'];
      fields = cols.map(c => ({
        accessorKey: c,
        header: globalTranslate(c).toUpperCase(),
        type: 'text'
      }));
    }
    
    return fields;
  }, [tableName]);

  const handleSave = async (data: any[]) => {
    try {
      let successCount = 0;
      let errors = [];
      
      for (const row of data) {
        // Remove empty keys
        const cleanedRow: any = {};
        Object.keys(row).forEach(k => {
          if (row[k]) cleanedRow[k] = row[k];
        });

        // Skip if fully empty
        if (Object.keys(cleanedRow).length === 0) continue;
        
        let res;
        if (tableName === 'DATA_Tapu_Verisi') {
           const mevkiStr = cleanedRow.Mevki;
           if (mevkiStr) {
             const found = mevkiler.find((m: any) => (m.Ad || m.Mevki_Adi) === mevkiStr);
             if (found) {
               cleanedRow.Mevki_id = found.id;
             } else {
               cleanedRow._Mevki_Temp_Name = mevkiStr;
             }
           }
           
           const payload = {
              tapuData: cleanedRow,
              owners: cleanedRow.Sahip_id ? [{ Vatandas_Id: cleanedRow.Sahip_id, Rol: 'MALİK', Hisse_Pay: 1, Hisse_Payda: 1 }] : []
           };
           res = await ElectronService.tapu.saveFull(payload);
        } else {
           res = await ElectronService.saveRecord(tableName, cleanedRow);
        }

        if (res.success) {
          successCount++;
        } else {
          errors.push(res.error);
        }
      }

      if (errors.length > 0) {
        ElectronService.showAlert({
          message: `${successCount} kayıt eklendi. ${errors.length} kayıt HATA aldı:\n${errors.slice(0, 3).join('\\n')}`,
          type: 'warning'
        });
      } else {
        ElectronService.showAlert({
          message: `${successCount} adet veri başarıyla eklendi!`,
          type: 'success'
        });
        onSuccess();
        onClose();
      }
    } catch (e: any) {
      ElectronService.showAlert({ message: "ÇOKLU EKLEME HATASI: " + e.message, type: 'error' });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="relative w-full h-full bg-slate-50 dark:bg-slate-950 overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 shrink-0">
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                ÇOKLU VERİ GİRİŞİ: {globalTranslate(tableName).toUpperCase()}
              </h2>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Klavye yön tuşlarını kullanarak hızlıca verileri girin veya Excel'den kopyalayıp yapıştırın.
              </p>
            </div>
            <button
              onClick={onClose}
              title="Kapat"
              className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-500/20 text-slate-500 hover:text-rose-500 rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Grid Area */}
          <div className="flex-1 overflow-hidden p-6 relative">
            <BulkEditableTable
              columnsConfig={columnsConfig}
              onSave={handleSave}
              tableName={tableName}
              initialRows={10}
              onClose={onClose}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
