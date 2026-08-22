import React, { useState, FC } from 'react';
import { 
  MapPin, Bookmark, Info, Navigation, Home, Search, 
  Layers, Activity
} from 'lucide-react';
import { DetailHeader } from '../../../components/detail/DetailHeader';
import { useRecordDetail } from "../../../hooks/useRecordDetail";
import { useMevkiDetailLogic } from './useMevkiDetailLogic';
import { ElectronService } from "../../../services/ElectronService";
import { MevkiEditView } from './MevkiEditView';
import { DeleteConfirmModal } from "../../../components/modals/DeleteConfirmModal";

interface MevkiDetailScreenProps {
  table: string;
  type: string;
  data?: any;
  onClose: () => void;
  onRefresh?: () => void;
  onRowClick?: (table: string, id: any) => void;
}

export const MevkiDetailScreen: FC<MevkiDetailScreenProps> = ({ table, type, data, onClose, onRefresh, onRowClick }) => {
  const logic = useRecordDetail(table, type, data, true, onRefresh, onClose);
  const { values, setValues, isEditing, setIsEditing, isDeleteModalOpen, setIsDeleteModalOpen, onDeleteRecord, isProcessing } = logic;
  const { 
    availableCities, availableDistricts, availableTowns, availableNeighborhoods, availableLocations,
    handleCityChange, handleDistrictChange, handleTownChange, handleNeighborhoodChange,
    displayNames
  } = useMevkiDetailLogic(values, setValues, type);
  
  const [activeTab, setActiveTab] = useState("genel");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [tapuRecords, setTapuRecords] = useState<any[]>([]);
  const [isLoadingTapu, setIsLoadingTapu] = useState(false);

  const tabs = [
    { id: 'genel', label: 'GENEL BİLGİLER', icon: Info },
    { id: 'tasinmazlar', label: 'TAŞINMAZ KAYITLARI', icon: Home }
  ];

  // 🛡️ Sarsılmaz Veri Yükleme: Mevkiye bağlı taşınmazları çek
  React.useEffect(() => {
    if (activeTab === 'tasinmazlar' && values.id) {
       loadTapuRecords();
    }
  }, [activeTab, values.id]);

  const loadTapuRecords = async () => {
    setIsLoadingTapu(true);
    try {
       const res = await ElectronService.getRecords('DATA_Tapu_Verisi', { Mevki_id: values.id });
       if (res.success) setTapuRecords(res.data);
    } catch (error) {
       console.error("Tapu kayıtları yüklenemedi:", error);
    } finally {
       setIsLoadingTapu(false);
    }
  };

  const translateHeader = (h: string) => {
    const m: any = { 
      "Mevki_Adi": "MEVKİ ADI", "Aciklama": "AÇIKLAMA", "Il": "İL", "Ilce": "İLÇE", "Belde": "BELDE",
      "Mahalle_Koy": "MAHALLE/KÖY", "Bolge_Tipi": "BÖLGE / ARAZİ TİPİ", "Altyapi_Durumu": "ALTYAPI / SULAMA DURUMU"
    };
    return m[h] || h;
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      <DetailHeader 
        table={table} type={type as any} values={values} setValues={setValues} data={data}
        title={values.Mevki_Adi || "Yeni Mevki Kaydı"} subtitle="Mevki ve Bölge Bilgileri" onClose={onClose}
        isEditing={isEditing} setIsEditing={setIsEditing} onSave={logic.onSaveRecord} onDelete={() => setIsDeleteModalOpen(true)} icon={MapPin}
        onRefresh={onRefresh} activeTab={activeTab} setActiveTab={setActiveTab}
        translateHeader={translateHeader} isFormValid={logic.isFormValid}
        tabs={tabs}
      />

      <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-5xl mx-auto p-12">
             {activeTab === "genel" && (
                isEditing ? (
                  <MevkiEditView 
                    values={values} setValues={setValues}
                    availableCities={availableCities} availableDistricts={availableDistricts}
                    availableTowns={availableTowns} availableNeighborhoods={availableNeighborhoods}
                    availableLocations={availableLocations} handleCityChange={handleCityChange}
                    handleDistrictChange={handleDistrictChange} handleTownChange={handleTownChange}
                    handleNeighborhoodChange={handleNeighborhoodChange} displayNames={displayNames}
                    translateHeader={translateHeader}
                  />
                ) : (
                  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                     {/* 🛡️ Sarsılmaz İstatistik Paneli */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-primary-500 to-indigo-600 p-8 rounded-[40px] text-white shadow-2xl shadow-primary-500/20 relative overflow-hidden group">
                           <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                           <div className="relative z-10 flex items-center justify-between">
                              <div>
                                 <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70 mb-2">TOPLAM TAŞINMAZ</p>
                                 <h3 className="text-4xl font-black italic">{tapuRecords.length} <span className="text-sm not-italic opacity-60">ADET</span></h3>
                              </div>
                              <div className="w-16 h-16 bg-white/20 rounded-[24px] flex items-center justify-center backdrop-blur-xl">
                                 <Home size={32} />
                              </div>
                           </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-xl relative overflow-hidden group">
                           <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl" />
                           <div className="relative z-10 flex items-center justify-between">
                              <div>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">TOPLAM ARAZİ ALANI</p>
                                 <h3 className="text-4xl font-black italic text-slate-800 dark:text-white">
                                    {tapuRecords.reduce((sum, r) => sum + (Number(r.Alan_m2) || 0), 0).toLocaleString('tr-TR')} 
                                    <span className="text-sm not-italic text-emerald-500 ml-2">m²</span>
                                 </h3>
                              </div>
                              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-[24px] flex items-center justify-center">
                                 <Layers size={32} />
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* 🛡️ Ana Bilgi Kartı */}
                        <div className="lg:col-span-2 space-y-8">
                           <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl p-10 rounded-[48px] border border-slate-100 dark:border-white/5 shadow-sm space-y-10">
                              <div className="flex items-center gap-4 border-b border-slate-100 dark:border-white/5 pb-8">
                                 <div className="w-12 h-12 bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-500">
                                    <Bookmark size={24} />
                                 </div>
                                 <div>
                                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-800 dark:text-white">{values.Mevki_Adi || '---'}</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">RESMİ MEVKİ VE BÖLGE TANIMI</p>
                                 </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div className="p-6 bg-slate-50 dark:bg-white/2 rounded-[32px] border border-slate-100 dark:border-white/5 group hover:border-primary-500/30 transition-all">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                       <Layers size={12} className="text-primary-500" /> BÖLGE TİPİ
                                    </p>
                                    <p className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase">{values.Bolge_Tipi || 'BELİRTİLMEMİŞ'}</p>
                                 </div>
                                 <div className="p-6 bg-slate-50 dark:bg-white/2 rounded-[32px] border border-slate-100 dark:border-white/5 group hover:border-primary-500/30 transition-all">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                       <Activity size={12} className="text-sky-500" /> ALTYAPI DURUMU
                                    </p>
                                    <p className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase">{values.Altyapi_Durumu || 'BELİRTİLMEMİŞ'}</p>
                                 </div>
                              </div>

                              <div className="space-y-4">
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2">
                                    <Info size={12} className="text-primary-500" /> EK AÇIKLAMALAR
                                 </p>
                                 <div className="p-8 bg-slate-50/50 dark:bg-white/2 rounded-[32px] border border-dashed border-slate-200 dark:border-white/10 text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-400">
                                    {values.Aciklama || 'Bu mevki için henüz bir açıklama girilmemiş.'}
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* 🛡️ Konum Matrisi */}
                        <div className="space-y-8">
                           <div className="bg-slate-900 text-white p-10 rounded-[48px] shadow-2xl relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/20 blur-3xl" />
                              <div className="relative z-10 space-y-8">
                                 <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                                    <Navigation className="text-primary-400" size={24} />
                                    <h4 className="text-lg font-black uppercase italic tracking-tight">KONUM MATRİSİ</h4>
                                 </div>
                                 
                                 <div className="space-y-6">
                                    {[
                                       { label: 'İL', value: displayNames.Il || values.Il, icon: MapPin },
                                       { label: 'İLÇE', value: displayNames.Ilce || values.Ilce, icon: MapPin },
                                       { label: 'BELDE', value: displayNames.Belde || values.Belde, icon: Home },
                                       { label: 'MAHALLE', value: displayNames.Mahalle_Koy || values.Mahalle_Koy_Adi || values.Mahalle_Koy, icon: Home, highlight: true }
                                    ].map((loc, idx) => (
                                       <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl ${loc.highlight ? 'bg-primary-500/20 border border-primary-500/30' : 'bg-white/5 border border-white/5'}`}>
                                          <div className="flex items-center gap-3">
                                             <loc.icon size={14} className="text-primary-400" />
                                             <span className="text-[10px] font-black opacity-50 tracking-widest">{loc.label}</span>
                                          </div>
                                          <span className={`text-xs font-black uppercase tracking-tight ${loc.highlight ? 'text-primary-400' : 'text-white'}`}>{loc.value || '---'}</span>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           </div>
                           
                           <div className="p-8 bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-white/5 flex items-center gap-6 group hover:scale-[1.02] transition-all cursor-pointer" onClick={() => setActiveTab('tasinmazlar')}>
                              <div className="w-14 h-14 bg-primary-500 rounded-[20px] flex items-center justify-center text-white shadow-lg shadow-primary-500/30 group-hover:rotate-12 transition-transform">
                                 <Search size={24} />
                              </div>
                              <div>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">HIZLI ERİŞİM</p>
                                 <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tighter">TAŞINMAZLARI LİSTELE</h4>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                )
             )}

             {activeTab === "tasinmazlar" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                   <div className="flex items-center justify-between">
                      <div>
                         <h3 className="text-xl font-black uppercase italic flex items-center gap-3">
                            <Home className="text-primary-500" size={24} />
                            Taşınmaz Kayıtları
                         </h3>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Bu mevkiye kayıtlı tüm tapu ve arazi bilgileri</p>
                      </div>
                      <div className="px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-2xl text-xs font-black text-slate-500 uppercase tracking-widest">
                         {tapuRecords.length} KAYIT
                      </div>
                   </div>

                   <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
                      <table className="w-full">
                         <thead>
                            <tr className="bg-slate-50 dark:bg-white/2">
                               <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Ada/Parsel</th>
                               <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Malik</th>
                               <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Alan (m²)</th>
                               <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">İşlem</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {isLoadingTapu ? (
                               <tr><td colSpan={4} className="py-20 text-center animate-pulse font-black text-slate-300 uppercase tracking-widest">Veriler Yükleniyor...</td></tr>
                            ) : tapuRecords.length === 0 ? (
                               <tr><td colSpan={4} className="py-20 text-center font-black text-slate-300 uppercase tracking-widest">Kayıt Bulunamadı</td></tr>
                            ) : tapuRecords.map(r => (
                               <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-white/2 transition-colors cursor-pointer group" onClick={() => onRowClick?.('DATA_Tapu_Verisi', r.id)}>
                                  <td className="px-6 py-4 font-black text-sm text-slate-700 dark:text-slate-200">{r.Ada || '---'} / {r.Parsel || '---'}</td>
                                  <td className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400">{r.Tapu_Sahibi_Ad_Soyad || 'Bilinmeyen'}</td>
                                  <td className="px-6 py-4 text-right font-black text-sm text-slate-800 dark:text-white">{Number(r.Alan_m2).toLocaleString('tr-TR')}</td>
                                  <td className="px-6 py-4 text-right">
                                     <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-300 group-hover:bg-primary-500 group-hover:text-white transition-all mx-auto mr-0">
                                        <Activity size={14} />
                                     </div>
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
             )}
          </div>
      </div>

      <DeleteConfirmModal
         isOpen={isDeleteModalOpen}
         onClose={() => setIsDeleteModalOpen(false)}
         onConfirm={onDeleteRecord}
         isProcessing={isProcessing}
         message={`"${values.Mevki_Adi}" isimli mevkiyi silmeyi onaylıyor musunuz?`}
      />
    </div>
  );
};
