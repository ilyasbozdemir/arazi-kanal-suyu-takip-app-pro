import React, { useState, useEffect } from "react";
import { 
  MapPin, 
  Save, 
  Plus, 
  Loader2, 
  AlertCircle,
  RefreshCw,
  BookOpen
} from "lucide-react";
import { ElectronService } from "@renderer/services/ElectronService";
import { DetailHeader } from "@renderer/components/detail/DetailHeader";
import { useRecordDetail } from "@renderer/hooks/useRecordDetail";
import { DOMAIN_CONFIG } from "@renderer/constants/domainConfig";
import { LedgerCard } from "./LedgerCard";
import { useAppStore } from "@renderer/store/useAppStore";

// 🛡️ SARSILMAZ NİZAM: MAHALLE DEFTERİ DETAY GÖRÜNÜMÜ v2.1
export const MahalleDefteriDetailScreen: React.FC<any> = (props) => {
  const { table, type, data, onRefresh, onClose, inline } = props;
  const logic = useRecordDetail(table, type, data, false, onRefresh, onClose);

  // 1. TEMEL STATE NİZAMI
  const [selectedMahalles, setSelectedMahalles] = useState<string[]>([]);
  const [activeDonemMahalleIds, setActiveDonemMahalleIds] = useState<string[]>([]);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  const [mahalleAdi, setMahalleAdi] = useState<string>(data.Mahalle_Adi || "YÜKLENİYOR...");
  const [allMahalles, setAllMahalles] = useState<any[]>([]);
  const [allLocations, setAllLocations] = useState<any[]>([]);
  const [ledgers, setLedgers] = useState<any[]>([]);
  const [meravlar, setMeravlar] = useState<any[]>([]);
  const [isLoadingLedgers, setIsLoadingLedgers] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  const {
    values = {},
    setValues,
    isProcessing,
    isFormValid,
    onSaveRecord,
    isEditing,
  } = logic;

  const loadLedgers = async () => {
    if (type === 'create') return;
    setIsLoadingLedgers(true);
    try {
      // 🛡️ SCHEMA-AGNOSTIC COLUMN DETECTION
      const tableInfo = await (window as any).api.executeRaw("PRAGMA table_info(DATA_Dagitim_Donemleri)");
      const cols = tableInfo.success ? tableInfo.data.map((c: any) => c.name) : [];
      const hasBolgeId = cols.includes('Bolge_id');
      const hasMahalleId = cols.includes('Mahalle_id');

      const conditions = [];
      if (hasBolgeId) {
        if (data.id) conditions.push(`Bolge_id = '${data.id}'`);
        if (data.Mahalle_id) conditions.push(`Bolge_id = '${data.Mahalle_id}'`);
      }
      if (hasMahalleId) {
        if (data.id) conditions.push(`Mahalle_id = '${data.id}'`);
        if (data.Mahalle_id) conditions.push(`Mahalle_id = '${data.Mahalle_id}'`);
      }

      if (conditions.length === 0) {
        setLedgers([]);
        return;
      }

      const sql = `
        SELECT * FROM DATA_Dagitim_Donemleri 
        WHERE (${conditions.join(' OR ')})
        AND (deleted_at IS NULL OR deleted_at = '')
        ORDER BY Baslangic_Yili DESC
      `;
      const res = await (window as any).api.executeRaw(sql);
      
      if (res.success) {
        setLedgers(res.data || []);
      }

      const mahRes = await (window as any).api.executeRaw(`
        SELECT loc.Ad FROM DATA_Dagitim_Bolgeleri b 
        JOIN TANIM_Konumlar loc ON b.Mahalle_id = loc.id 
        WHERE b.id = '${data.id}'
      `);
      if (mahRes.success && mahRes.data.length > 0) {
        setMahalleAdi(mahRes.data[0].Ad);
      }
    } catch (err) { 
      console.error("[DIAGNOSTIC_ERROR] LoadLedgers failed:", err); 
    } finally { 
      setIsLoadingLedgers(false); 
    }
  };

  const loadData = async () => {
    try {
      const [mahRes, locRes, donemRes, meravRes] = await Promise.all([
        (window as any).api.getDbData('DATA_Dagitim_Bolgeleri'),
        (window as any).api.getDbData('TANIM_Konumlar'),
        (window as any).api.getDbData('DATA_Dagitim_Donemleri'),
        (window as any).api.getDbData('TANIM_Meravlar')
      ]);

      const bolgeler: any[] = mahRes.success ? (mahRes.data || []) : [];
      const donemleri: any[] = donemRes.success ? (donemRes.data || []).filter((d: any) => !d.deleted_at) : [];

      if (meravRes.success) setMeravlar(meravRes.data || []);

      if (mahRes.success) {
         setAllMahalles(bolgeler);
         setSelectedMahalles(bolgeler.filter((m: any) => !m.deleted_at).map((m: any) => m.Mahalle_id));
      }
      if (locRes.success) {
          const locations = locRes.data || [];
          const allowedTypes = DOMAIN_CONFIG.konum_tipleri.map(t => t.key);
          setAllLocations(locations.filter((l: any) => allowedTypes.includes(l.Tip)));
      }
      if (donemRes.success) {
         const bolgeIdsWithDonem = new Set(donemleri.map((d: any) => d.Bolge_id || d.Mahalle_id).filter(Boolean));
         const lockedKonumIds = bolgeler
           .filter((b: any) => bolgeIdsWithDonem.has(b.id) || bolgeIdsWithDonem.has(b.Mahalle_id))
           .map((b: any) => b.Mahalle_id)
           .filter(Boolean);
         setActiveDonemMahalleIds(lockedKonumIds);
      }
    } catch (err) { console.error("[DIAGNOSTIC_ERROR] loadData failed:", err); }
  };

  useEffect(() => {
    const init = async () => {
      await loadLedgers();
      if (type === 'create') await loadData();
    };
    init();
  }, [data?.id]);

  const handleBulkSave = async () => {
     setIsProcessingBulk(true);
     const blockedMahalles: string[] = [];
     
     try {
        const currentMahalleIds = allMahalles.filter(m => !m.deleted_at).map(m => String(m.Mahalle_id));
        const toAdd = selectedMahalles.filter(id => !currentMahalleIds.includes(String(id)));
        const toRemove = currentMahalleIds.filter(id => !selectedMahalles.map(sid => String(sid)).includes(String(id)));

        for (const id of toAdd) {
            const loc = allLocations.find(l => l.id === id);
            const deletedVersion = allMahalles.find(m => m.Mahalle_id === id && m.deleted_at);
            
            if (deletedVersion) {
               await ElectronService.executeRaw( 
                   `UPDATE DATA_Dagitim_Bolgeleri SET deleted_at = NULL, Durum = 'Aktif' WHERE id = '${deletedVersion.id}'`
                );
            } else {
               await (window as any).api.saveRecord( 
                   'DATA_Dagitim_Bolgeleri', 
                   { Mahalle_id: id, Tip: loc?.Tip || '', Durum: 'Aktif' }
                );
            }
        }

        for (const id of toRemove) {
           const existingRecord = allMahalles.find((m: any) => m.Mahalle_id === id);
           if (existingRecord) {
              const res = await (window as any).api.deleteRecord('DATA_Dagitim_Bolgeleri', existingRecord.id);
              if (!res.success) {
                 const locName = allLocations.find(l => l.id === id)?.Ad || id;
                 blockedMahalles.push(locName);
              }
           }
        }

        if (blockedMahalles.length > 0) {
           (window as any).api.showAlert({ 
              title: "BAZI BÖLGELER ÇIKARTILAMADI",
              message: `Aşağıdaki bölgelere ait sezon kayıtları (defter) bulunduğu için sistemden çıkartılamadı: \n\n${blockedMahalles.join(', ')}`, 
              type: 'warning' 
           });
        } else {
           (window as any).api.showAlert({ message: "Dağıtım Bölgeleri başarıyla güncellendi.", type: 'success' });
        }

        await loadData();
        useAppStore.getState().notifyChange('DATA_Dagitim_Bolgeleri');
        
        if (onRefresh) onRefresh();
        if (onClose) onClose();
     } catch (err) {
        console.error(err);
        (window as any).api.showAlert({ message: "Kayıt sırasında hata oluştu.", type: 'error' });
     } finally {
        setIsProcessingBulk(false);
     }
  };

  const handleCreateNewSeason = async () => {
    const currentYear = new Date().getFullYear().toString();
    const res = await (window as any).api.createDynamicLedger(data.id, currentYear);
    if (res.success) {
      (window as any).api.showAlert({ message: "Yeni sezon başarıyla başlatıldı.", type: 'success' });
      await loadLedgers();
      useAppStore.getState().notifyChange('DATA_Dagitim_Donemleri');
      
      if (onRefresh) onRefresh();
      window.dispatchEvent(new CustomEvent('KURUM_REFRESH_LEDGERS'));
    } else {
      (window as any).api.showAlert({ message: res.error, type: 'error' });
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <DetailHeader
        table={table} type={type} isEditing={isEditing} values={values}
        activeTab="genel" setActiveTab={() => {}} setIsEditing={() => {}}
        onSaveRecord={handleBulkSave} onDeleteRecord={() => {}}
        onClose={onClose} inline={inline} translateHeader={(h: any) => h === 'Mahalle_id' ? 'BÖLGE / MAHALLE' : h}
        setValues={setValues} data={data} isProcessing={type === 'create' ? isProcessingBulk : isProcessing} isFormValid={type === 'create' ? selectedMahalles.length > 0 : isFormValid}
        title={type === 'create' ? "Dağıtım Bölgeleri Yönetimi" : mahalleAdi}
        subtitle={`${DOMAIN_CONFIG.kurum.adi} - Bölgesel Su Dağıtım Yönetimi`}
        icon={MapPin}
      />

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-7xl mx-auto space-y-12">
          {type === 'create' ? (
             <div className="bg-white dark:bg-slate-900 rounded-[48px] p-12 border border-slate-200 shadow-2xl">
                <div className="flex items-center justify-between mb-10 border-b border-slate-50 pb-8">
                   <div className="space-y-1">
                      <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-800 dark:text-white">Bölge Seçimi</h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SİSTEME DAHİL EDİLECEK BÖLGELERİ İŞARETLEYİN</p>
                   </div>
                   <div className="px-6 py-3 bg-primary-500/10 text-primary-600 rounded-2xl text-[11px] font-black uppercase">
                      {selectedMahalles.length} BÖLGE SEÇİLİ
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {allLocations.map(l => {
                       const isChecked = selectedMahalles.includes(l.id);
                       const hasLedgers = activeDonemMahalleIds.includes(l.id);
                       return (
                          <div 
                             key={l.id} 
                             onClick={() => {
                                if (hasLedgers) {
                                   (window as any).api.showAlert({ message: "Bu bölgeye ait aktif sezon olduğu için seçimini değiştiremezsiniz.", type: 'warning' });
                                   return;
                                }
                                const sId = String(l.id);
                                if (selectedMahalles.some(id => String(id) === sId)) {
                                   setSelectedMahalles(prev => prev.filter(id => String(id) !== sId));
                                } else {
                                   setSelectedMahalles(prev => [...prev, sId]);
                                }
                             }}
                             className={`p-5 rounded-[32px] border-2 transition-all cursor-pointer flex items-center justify-between group ${isChecked ? 'bg-primary-500 border-primary-500 text-white shadow-xl shadow-primary-500/20' : 'bg-slate-50 dark:bg-white/5 border-transparent hover:border-primary-500/30'}`}
                          >
                             <div className="flex flex-col gap-0.5">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${isChecked ? 'text-white/60' : 'text-slate-400'}`}>{l.Tip}</span>
                                <span className="text-sm font-black uppercase italic">{l.Ad || l.Mevki_Adi}</span>
                                {hasLedgers && (
                                   <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full mt-1 ${isChecked ? 'bg-white/20 text-white' : 'bg-emerald-500/10 text-emerald-600'}`}>
                                      SEZON AKTİF
                                   </span>
                                )}
                             </div>
                             {hasLedgers ? (
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/30" title="Bu bölgeye ait aktif sezon kayıtları var, kaldıramazsınız.">
                                   <BookOpen size={16} className="text-white" />
                                </div>
                             ) : (
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isChecked ? 'bg-white border-white' : 'border-slate-200 group-hover:border-primary-500/50'}`}>
                                   {isChecked && <Plus size={14} className="text-primary-500" />}
                                </div>
                             )}
                          </div>
                       );
                    })}
                </div>
             </div>
          ) : (
            <div className="space-y-12">
               <div className="bg-white dark:bg-slate-900 rounded-[56px] p-12 border border-slate-200 shadow-2xl space-y-10">
                  <div className="flex items-center justify-between border-b border-slate-50 pb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-500/10 text-primary-500 rounded-2xl flex items-center justify-center shadow-inner">
                        <BookOpen size={24} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-800 dark:text-white leading-none">BÖLGESEL SULAMA DEFTERLERİ</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">AKTİF SEZON KAYITLARI VE ARŞİV</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 px-4 py-2 rounded-2xl border border-slate-100 dark:border-white/10">
                          <span className="text-[9px] font-black text-slate-400 uppercase">YIL:</span>
                          <select 
                             title="Sezon Yılı Seçin"
                             value={selectedYear}
                             onChange={(e) => setSelectedYear(e.target.value)}
                             className="bg-transparent outline-none text-sm font-black text-primary-600 uppercase cursor-pointer"
                          >
                             {Array.from(new Set([...ledgers.map(l => String(l.Baslangic_Yili)), new Date().getFullYear().toString()])).sort((a,b) => Number(b) - Number(a)).map(year => (
                                <option key={year} value={year}>{year}</option>
                             ))}
                          </select>
                       </div>
                       <button onClick={loadLedgers} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-primary-500 transition-colors flex items-center gap-2 text-[10px] font-black uppercase">
                          <RefreshCw size={16} className={isLoadingLedgers ? 'animate-spin' : ''} /> YENİLE
                       </button>
                       <button 
                         disabled={ledgers.some(l => String(l.Baslangic_Yili) === new Date().getFullYear().toString()) || isLoadingLedgers}
                         onClick={handleCreateNewSeason} 
                         title={ledgers.some(l => String(l.Baslangic_Yili) === new Date().getFullYear().toString()) ? "Bu yıla ait sezon zaten başlatılmış." : "Yeni sezonu başlat"}
                         className={`px-8 py-4 rounded-3xl font-black text-[11px] uppercase shadow-xl flex items-center gap-3 transition-transform active:scale-95 ${
                            ledgers.some(l => String(l.Baslangic_Yili) === new Date().getFullYear().toString())
                            ? 'bg-slate-100 dark:bg-white/5 text-slate-400 cursor-not-allowed shadow-none border border-slate-200 dark:border-white/10'
                            : 'bg-primary-500 hover:bg-primary-600 text-white shadow-primary-500/20'
                         }`}
                       >
                          <Plus size={18} /> {new Date().getFullYear()} SEZONUNU BAŞLAT
                       </button>
                    </div>
                  </div>

                  {isLoadingLedgers ? (
                     <div className="flex flex-col items-center justify-center py-24 space-y-4">
                        <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">DEFTERLER TARANIYOR...</p>
                     </div>
                  ) : ledgers.filter(l => String(l.Baslangic_Yili) === selectedYear).length === 0 ? (
                     <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-slate-100 rounded-[48px] bg-slate-50/50 space-y-6">
                        <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full shadow-xl flex items-center justify-center text-slate-200">
                           <BookOpen size={40} />
                        </div>
                        <div className="text-center">
                           <h3 className="text-lg font-black text-slate-400 uppercase tracking-tighter italic">{selectedYear} SEZONUNA AİT KAYIT BULUNAMADI</h3>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">BU YIL İÇİN HENÜZ BİR SULAMA DEFTERİ OLUŞTURULMAMIŞ.</p>
                        </div>
                     </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                       {ledgers.filter(l => String(l.Baslangic_Yili) === selectedYear).map(ledger => (
                          <LedgerCard 
                            key={ledger.id} 
                            ledger={ledger} 
                            mahalle={data}
                            personel={meravlar}
                            allKocanlar={[]} 
                            onOpen={(l) => {
                               const tabData = {
                                  id: `ledger-${l.id}`,
                                  type: 'ledger-detail',
                                  title: `${mahalleAdi} ${l.Baslangic_Yili}`,
                                  data: { 
                                     ledger: l, 
                                     mahalle: { id: data.id, Mahalle_Adi: mahalleAdi, Tip: data.Tip },
                                     activeTab: 'defter'
                                  }
                               };
                               if (props.addTab) props.addTab(tabData);
                               else window.dispatchEvent(new CustomEvent('KURUM_NAV_TAB', { detail: tabData }));
                            }}
                            onOpenDetail={() => {}}
                            onOpenCreate={() => {}}
                            onRefresh={loadLedgers} 
                          />
                       ))}
                    </div>
                  )}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
