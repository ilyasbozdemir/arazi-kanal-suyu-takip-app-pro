import React from 'react';
import { Globe, Navigation, Layers, Info, Calendar, Briefcase, Activity } from "lucide-react";
import { DetailSection } from "@renderer/components/detail/DetailSection";
import { FieldRenderer } from "@renderer/components/detail/FieldRenderer";
import { useRecordDetail } from "@renderer/hooks/useRecordDetail";
import { DetailHeader } from "@renderer/components/detail/DetailHeader";
import { getTableConfig } from "@renderer/config/TableConfig";

/**
 * GeneralEntityDetailView: A başarıyla fallback for simple entities (Depo, Hat, vb.)
 * Handles GeoJSON automatically.
 */
export const GeneralEntityDetailView: React.FC<any> = (props) => {
  const { table, type, data, citizens, locations, onRefresh, onClose, inline, draftGeometry, setDraftGeometry } = props;
  const logic = useRecordDetail(table, type, data, false, onRefresh, onClose);
  
  const { 
    values = {}, setValues, isEditing, setIsEditing, activeTab, setActiveTab,
    isProcessing, tcknStatus, sicilStatus, debounceTimer, isFormValid, touched, onFieldBlur,
    onSaveRecord, onDeleteRecord
  } = logic;

  const translateHeader = (h: string) => {
    const dict: any = { 
      "Depo_Adi": "DEPO ADI", 
      "hat_adi": "HAT ADI",
      "Kapasite_m3": "KAPASİTE (M³)",
      "GeoJSON": "COĞRAFİ VERİ (GeoJSON)",
      "Ad_Soyad": "MERAV AD SOYAD",
      "Gorev": "GÖREV TANIMI",
      "Durum": "GÖREV DURUMU"
    };
    return dict[h] || h;
  };

  const config = getTableConfig(table);
  const displayTitle = config.tableName || table;

  // Get All Columns except technical IDs
  let columns = Object.keys(values).filter(k => k !== 'id' && k !== 'GeoJSON' && k !== 'Vatandas_Id');
  if (columns.length === 0 && config.priorityColumns.length > 0) {
    columns = config.priorityColumns;
  }

  const renderField = (field: string, config?: any) => (
    <FieldRenderer 
      key={field} field={field} isEditing={type === 'create' ? true : isEditing} values={values} setValues={setValues}
      table={table}
      type={type as any} translateHeader={translateHeader}
      isRequiredFieldEmpty={(f) => (type === 'create' || isEditing) && !values[f]}
      tcknStatus={tcknStatus} sicilStatus={sicilStatus} debounceTimer={debounceTimer}
      vatandaslar={citizens} mevkiler={locations}
      isTouched={touched[field]}
      onBlur={() => onFieldBlur(field)}
      draftGeometry={draftGeometry} setDraftGeometry={setDraftGeometry}
      onOpenCreate={props.onOpenCreate}
      {...config}
    />
  );

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/50">
      <DetailHeader 
        table={table} type={type} isEditing={isEditing} values={values} 
        activeTab={activeTab} setActiveTab={setActiveTab} setIsEditing={setIsEditing} 
        onSaveRecord={onSaveRecord} onDeleteRecord={onDeleteRecord}
        onClose={onClose} inline={inline} translateHeader={translateHeader}
        setValues={setValues} data={data} isProcessing={isProcessing} isFormValid={isFormValid}
        title={values?.Mahalle_Adi || values?.Depo_Adi || values?.hat_adi || "Kayıt Detayı"}
        subtitle={`${displayTitle} veri analiz ve düzenleme paneli.`}
        icon={table === 'DATA_Mahalleler' ? Navigation : Layers}
      />
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-4xl mx-auto space-y-8">
           {activeTab === "genel" ? (
             <div className="bg-white dark:bg-slate-900/50 p-10 rounded-[40px] border border-slate-200 dark:border-white/5 space-y-6 shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-700">
                <h2 className="text-4xl font-black italic uppercase leading-none border-b-2 border-primary-500/20 pb-8 mb-10">
                  {type === 'create' ? 'YENİ KAYIT OLUŞTURMA' : 'KAYIT BİLGİLERİ DÜZENLEME'}
                </h2>
                
                <div className="space-y-8">
                   <DetailSection title="Özellikler ve Detaylar" icon={Info} iconColor="text-primary-500">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {columns.map(f => renderField(f))}
                      </div>
                   </DetailSection>

                   {["TANIM_Depolar", "TANIM_Sulama_Hatlari"].includes(table) || table.startsWith("MAP_") ? (
                     <DetailSection title="Coğrafi Yerleşim (GeoJSON)" icon={Globe} iconColor="text-violet-500">
                        <div className="p-2 border-2 border-dashed border-violet-500/20 rounded-3xl">
                           {renderField("GeoJSON", { color: "violet" })}
                        </div>
                     </DetailSection>
                   ) : null}
                </div>
             </div>
           ) : activeTab === "performans" ? (
             <div className="space-y-8 animate-in fade-in slide-in-from-right-10 duration-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-[32px] text-white shadow-2xl">
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">TOPLAM DAĞITIM</div>
                      <div className="text-4xl font-black tracking-tighter italic">{(logic.profileData?.fisler || []).reduce((acc: number, f: any) => acc + (Number(f.Kullanim_Saati) || 0), 0).toFixed(1)} <span className="text-sm">SAAT</span></div>
                      <Activity size={40} className="absolute right-6 bottom-6 opacity-10" />
                   </div>
                   <div className="bg-gradient-to-br from-primary-500 to-indigo-600 p-8 rounded-[32px] text-white shadow-2xl">
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">SORUMLU DEFTER</div>
                      <div className="text-4xl font-black tracking-tighter italic">{logic.profileData?.defterler?.length || 0} <span className="text-sm">ADET</span></div>
                      <Layers size={40} className="absolute right-6 bottom-6 opacity-10" />
                   </div>
                   <div className="bg-gradient-to-br from-violet-500 to-purple-600 p-8 rounded-[32px] text-white shadow-2xl">
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">TOPLAM FİŞ</div>
                      <div className="text-4xl font-black tracking-tighter italic">{logic.profileData?.fisler?.length || 0} <span className="text-sm">ADET</span></div>
                      <Navigation size={40} className="absolute right-6 bottom-6 opacity-10" />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <DetailSection title="Aylık Çalışma İstatistiği" icon={Calendar} iconColor="text-rose-500">
                      <div className="space-y-4">
                         {(logic.profileData?.monthlyStats || []).map((s: any) => (
                           <div key={s.month} className="flex items-center justify-between p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                              <span className="text-sm font-black text-slate-600 dark:text-slate-300 uppercase tracking-tight">{s.month}</span>
                              <div className="flex items-center gap-3">
                                 <div className="h-2 w-24 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.min(100, s.hours)}%` }} />
                                 </div>
                                 <span className="text-sm font-black text-rose-500 italic">{s.hours} SAAT</span>
                              </div>
                           </div>
                         ))}
                         {(!logic.profileData?.monthlyStats || logic.profileData.monthlyStats.length === 0) && (
                           <div className="text-center py-10 text-slate-400 text-xs font-bold uppercase italic">Henüz çalışma verisi bulunamadı.</div>
                         )}
                      </div>
                   </DetailSection>

                   <DetailSection title="Sorumlu Olduğu Defterler" icon={Briefcase} iconColor="text-primary-500">
                      <div className="space-y-4">
                         {(logic.profileData?.defterler || []).map((d: any) => (
                           <div key={d.id} className="flex items-center justify-between p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-primary-500 transition-all cursor-pointer group">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500 group-hover:bg-primary-500 group-hover:text-white transition-all">
                                    <Layers size={18} />
                                 </div>
                                 <span className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{d.Defter_Adi || d.Mahalle_Adi}</span>
                              </div>
                              <span className="text-[10px] font-black text-emerald-500 uppercase px-3 py-1 bg-emerald-500/10 rounded-full">AKTİF</span>
                           </div>
                         ))}
                         {(!logic.profileData?.defterler || logic.profileData.defterler.length === 0) && (
                           <div className="text-center py-10 text-slate-400 text-xs font-bold uppercase italic">Henüz zimmetli defter bulunamadı.</div>
                         )}
                      </div>
                   </DetailSection>
                </div>
             </div>
           ) : null}
        </div>
      </div>
    </div>
  );
};

