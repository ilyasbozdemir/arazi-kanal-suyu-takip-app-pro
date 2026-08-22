import React from 'react';
/* Kurum_SYNC_FORCE_V6 */
import { FieldRenderer } from "@renderer/components/detail/FieldRenderer";
import { useRecordDetail } from "@renderer/hooks/useRecordDetail";
import { translateHeader } from "@renderer/utils/translations";
import { Layers, MapPin, Maximize2, Save, History, UserPlus, Droplet, FileText, ShieldCheck, ChevronRight, ShieldAlert } from 'lucide-react';
import { ElectronService } from '@renderer/services/ElectronService';
import { generateTestData } from '@renderer/utils/testDataGenerator';

export const TapuCreateScreen: React.FC<any> = ({ table, type, data, citizens, locations, onRefresh, onClose, onOpenDetail, onOpenCreate }) => {
  const logic = useRecordDetail(table, type, data, true, onRefresh, onClose);
  const [activeTab, setActiveTab] = React.useState('mandatory');
  
  const { 
    values = {}, setValues, isProcessing, tcknStatus, sicilStatus, debounceTimer,
    onSaveRecord, isFormValid, missingFields 
  } = logic;

  // --- 🪄 OTOMATİK HİSSE YÖNETİMİ ---
  // Artık Sahip_Turu manuel seçilmiyor, hissedar sayısına göre otomatik yorumlanıyor.

  const renderField = (field: string, overrideEditing?: boolean) => (
    <FieldRenderer 
      key={field} field={field} table={table} isEditing={overrideEditing !== undefined ? overrideEditing : true} values={values} setValues={setValues}
      type="create" translateHeader={translateHeader}
      renderTooltip={() => null}
      isRequiredFieldEmpty={(f: string) => !values[f]}
      tcknStatus={tcknStatus} sicilStatus={sicilStatus} debounceTimer={debounceTimer}
      vatandaslar={citizens} mevkiler={locations} onOpenDetail={onOpenDetail} onOpenCreate={onOpenCreate}
    />
  );

  const parse = (v: any) => typeof v === 'string' ? JSON.parse(v || '[]') : (v || []);
  const shareholders = parse(values.Hissedarlar_JSON);
  const isHisseli = shareholders.length > 1;

  const tabs = [
    { id: 'mandatory', label: '01. ZORUNLU BİLGİLER', icon: ShieldCheck, color: 'text-primary-500' },
    { id: 'optional', label: '02. EK DETAYLAR & YÖNETİM', icon: Layers, color: 'text-emerald-500' },
  ];

   const onSaveWithRelations = async () => {
      // 🛡️ Sarsılmaz Mükerrer Kayıt Kontrolü (Sadece hepsi doluysa kontrol et)
      if (values.Mevki_id && values.Ada && values.Parsel) {
         console.log("[TapuCreateView] Mükerrer kayıt kontrolü yapılıyor...");
         const resCheck = await ElectronService.getRecords('DATA_Tapu_Verisi', { 
            Mevki_id: values.Mevki_id, 
            Ada: values.Ada, 
            Parsel: values.Parsel 
         });

         if (resCheck.success && resCheck.data.length > 0) {
            ElectronService.showAlert({ 
               message: `HATA: Bu mevkide aynı Ada (${values.Ada}) ve Parsel (${values.Parsel}) numarasına sahip başka bir kayıt zaten mevcut! Sarsılmaz bir nizamla mükerrer kayda izin verilemez.`, 
               type: 'error' 
            });
            return;
         }
      }

      // 🛡️ Otomatik İsimlendirme (ilimbet-20-50 formatı)
      const selectedMevki = (locations || []).find((l: any) => String(l.id) === String(values.Mevki_id));
      const mevkiName = (selectedMevki?.Mevki_Adi || "mevki").toLocaleLowerCase('tr-TR').replace(/\s+/g, '-');
      const uniqueName = `${mevkiName}-${values.Ada || ''}-${values.Parsel || ''}`;
      
      const updatedValues = { ...values, Kayit_Adi: uniqueName };

      const parse = (v: any) => typeof v === 'string' ? JSON.parse(v || '[]') : (v || []);
      const shareholders = parse(values.Hissedarlar_JSON);
      const caretakers = parse(values.Ilgili_Kisiler_JSON);

      const payload = {
        tapuData: updatedValues,
        owners: shareholders.length > 0 ? shareholders.map((s: any) => ({
          Vatandas_Id: s.Vatandas_Id || s.TCKN || s.id  || s.value,
          Rol: s.Rol,
          Hisse_Pay: s.Hisse_Pay,
          Hisse_Payda: s.Hisse_Payda
        })) : (values.Sahip_id ? [{ Vatandas_Id: values.Sahip_id, Rol: 'MALİK', Hisse_Pay: 1, Hisse_Payda: 1 }] : []),
        zilyet: caretakers.length > 0 ? {
          Vatandas_Id: caretakers[0].Vatandas_Id || caretakers[0].TCKN || caretakers[0].id || caretakers[0].value,
          Beyan_Tarihi: caretakers[0].Beyan_Tarihi
        } : undefined
      };

      console.log("[TapuCreateView] Kayıt işlemi başlatılıyor. Payload:", payload);
      await onSaveRecord(payload);
   };

  return (
    <div className="h-full w-full flex bg-slate-50 dark:bg-slate-950 overflow-hidden animate-in fade-in duration-500 font-sans">
      
      {/* SOL SİDEBAR NAVİGASYON */}
      <div className="w-80 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/5 flex flex-col p-8 overflow-y-auto custom-scrollbar">
        <div className="mb-10 px-4">
          <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-primary-500 text-white rounded-lg shadow-lg shadow-primary-500/20">
                <Maximize2 size={18} />
             </div>
             <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tighter uppercase leading-none">TESCİL</h1>
          </div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">TAŞINMAZ KAYIT PANELİ</p>
        </div>

        <nav className="space-y-3 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between gap-4 px-6 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all group ${
                activeTab === tab.id
                ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/20 translate-x-2'
                : 'bg-transparent text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-4">
                 <tab.icon size={18} className={activeTab === tab.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} />
                 {tab.label}
              </div>
              {activeTab === tab.id && <ChevronRight size={14} className="opacity-50" />}
            </button>
          ))}
        </nav>

        {/* 🛡️ TESCİL KONTROL MERKEZİ */}
        <div className="mt-4 p-6 bg-slate-50 dark:bg-white/5 rounded-[32px] border border-slate-100 dark:border-white/5 space-y-6">
           <div className="space-y-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TESCİL DURUMU</p>
              <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter ${isFormValid ? 'text-emerald-500' : 'text-rose-500 animate-pulse'}`}>
                 <ShieldCheck size={14} /> {isFormValid ? 'TESCİLE HAZIR' : 'EKSİK VERİ VAR'}
              </div>
           </div>

           {!isFormValid && missingFields && missingFields.length > 0 && (
              <div className="space-y-2">
                 <p className="text-[8px] font-bold text-rose-500/50 uppercase tracking-widest text-center">ŞU ALANLAR DOLDURULMALIDIR:</p>
                 <div className="flex flex-wrap gap-1 justify-center">
                    {missingFields.map((f: string) => (
                       <span key={f} className="px-2 py-1 bg-rose-500 text-white rounded-lg text-[8px] font-black uppercase whitespace-nowrap">
                          {f}
                       </span>
                    ))}
                 </div>
              </div>
           )}

           <button 
              disabled={isProcessing || !isFormValid} 
              onClick={onSaveWithRelations} 
              className={`w-full py-5 font-black rounded-2xl shadow-2xl transition-all text-[10px] tracking-widest uppercase flex items-center justify-center gap-3 ${
                isFormValid 
                ? "bg-emerald-600 text-white shadow-emerald-600/30 hover:scale-[1.02] active:scale-[0.98]" 
                : "bg-slate-200 dark:bg-white/5 text-slate-400 cursor-not-allowed opacity-50 shadow-none"
              }`}
           >
              {isProcessing ? "İŞLENİYOR..." : "TESCİLİ TAMAMLA"} <Save size={16} />
           </button>
        </div>

        <div className="mt-8 pt-8 px-4 border-t border-slate-100 dark:border-white/5 space-y-3">
            <div className="p-4 bg-primary-500/5 rounded-2xl border border-primary-500/10">
               <p className="text-[8px] font-black text-primary-600 uppercase tracking-widest mb-1">DURUM</p>
               <p className="text-[10px] font-bold text-slate-500 leading-tight">Mevki, Ada ve Parsel sarsılmaz bir nizamla benzersiz olmalıdır.</p>
            </div>
            <button onClick={onClose} className="w-full flex items-center gap-3 px-6 py-4 text-slate-400 hover:text-rose-500 font-black text-[10px] uppercase tracking-widest transition-colors">
               Vazgeç ve Kapat
            </button>
            {import.meta.env?.DEV && (
              <button 
                 type="button" 
                 onClick={() => setValues(generateTestData(table, values))} 
                 className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white font-black rounded-xl shadow-sm transition-all text-[10px] tracking-widest uppercase border border-amber-500/20"
              >
                 🪄 TEST VERİSİ
              </button>
            )}
        </div>
      </div>

      {/* SAĞ İÇERİK ALANI */}
      <div className="flex-1 h-full overflow-y-auto custom-scrollbar bg-slate-50/30 dark:bg-slate-950/20 p-6 md:p-10">
        <div className="max-w-4xl mx-auto space-y-8 pb-24">
           
           <div className="flex items-center justify-between mb-12">
              <div>
                 <h2 className="text-4xl font-black italic uppercase tracking-tighter text-slate-800 dark:text-white leading-none">
                    {tabs.find(t => t.id === activeTab)?.label.split('. ')[1]}
                 </h2>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-3">VERİ TABANI TESCİL PROTOKOLÜ</p>
              </div>
           </div>

           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {activeTab === 'mandatory' ? (
                 <div className="space-y-12">
                    {/* Konum */}
                    <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm space-y-6">
                       <h3 className="flex items-center gap-3 text-[11px] font-black text-primary-500 uppercase tracking-[0.3em]">
                          <MapPin size={18} /> KONUM VE BÖLGE
                       </h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {renderField("Mevki_id")}
                          {renderField("Ada_Parsel")}
                       </div>
                    </div>

                    {/* Teknik */}
                    <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm space-y-6">
                       <h3 className="flex items-center gap-3 text-[11px] font-black text-emerald-500 uppercase tracking-[0.3em]">
                          <Maximize2 size={18} /> ALAN VE NİTELİK
                       </h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {renderField("Alan_m2")}
                          {renderField("Nitelik")}
                       </div>
                    </div>

                    {/* Sahiplik */}
                    <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm space-y-6">
                       <h3 className="flex items-center gap-3 text-[11px] font-black text-violet-500 uppercase tracking-[0.3em]">
                          <Layers size={18} /> MÜLKİYET YAPISI VE SU HAKKI
                       </h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {renderField("Aylik_Su_Hakki")}
                       </div>
                       <div className="mt-8 pt-8 border-t border-slate-50 dark:border-white/5">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">MÜLK SAHİPLERİ VE HİSSEDARLAR</p>
                          {renderField("Hissedarlar_JSON")}
                       </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm space-y-6">
                       <h3 className="flex items-center gap-3 text-[11px] font-black text-rose-500 uppercase tracking-[0.3em]">
                          <UserPlus size={18} /> ZİLYET VE BAKICILAR (OPSİYONEL)
                       </h3>
                       {renderField("Ilgili_Kisiler_JSON")}
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm space-y-6">
                        <h3 className="flex items-center gap-3 text-[11px] font-black text-blue-500 uppercase tracking-[0.3em]">
                           <FileText size={18} /> EK NOTLAR
                        </h3>
                        {renderField("Notlar")}
                    </div>
                 </div>
              ) : (
                 <div className="space-y-12">
                    {/* Tapu Kayıtları */}
                    <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm space-y-6">
                       <h3 className="flex items-center gap-3 text-[11px] font-black text-blue-500 uppercase tracking-[0.3em]">
                          <History size={18} /> RESMİ TAPU KAYITLARI
                       </h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="grid grid-cols-2 gap-4">
                             {renderField("Pafta")}
                             {renderField("Cilt_Sayfa")}
                          </div>
                          {renderField("Tasinmaz_No")}
                       </div>
                    </div>

                    {/* Su ve Kanal */}
                    <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm space-y-6">
                       <h3 className="flex items-center gap-3 text-[11px] font-black text-sky-500 uppercase tracking-[0.3em]">
                          <Droplet size={18} /> ALTYAPI BİLGİLERİ
                       </h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                          <FieldRenderer 
                             field="Kanal_Seviyesi_Altinda" table={table} isEditing={true} values={values} setValues={setValues}
                             type="create" translateHeader={translateHeader}
                             renderTooltip={() => null} isRequiredFieldEmpty={() => false}
                          />
                          <FieldRenderer 
                             field="Kanal_Suyu_Ile_Sulanan" table={table} isEditing={true} values={values} setValues={setValues}
                             type="create" translateHeader={translateHeader}
                             renderTooltip={() => null} isRequiredFieldEmpty={() => false}
                          />
                       </div>
                    </div>
                 </div>
              )}
           </div>

         </div>
      </div>
    </div>
  );
};
