import React from 'react';
/* Kurum_SYNC_FORCE_V4 */
import { 
  UserPlus, Save, Fingerprint, Users, MapPin, 
  ShieldCheck, Landmark, PhoneCall, Smartphone, Mail, Calendar, User, Heart, Home, Camera, ChevronRight, Contact, AlertCircle, Info
} from "lucide-react";
import { FieldRenderer } from "../../components/detail/FieldRenderer";
import { useRecordDetail } from "../../hooks/useRecordDetail";
import { translateHeader } from "../../utils/translations"; 
import { ElectronService } from "../../services/ElectronService";
import { generateTestData } from "../../utils/testDataGenerator";

export const VatandasCreateOrUpdateScreen: React.FC<any> = (props) => {
  const { table, type, data, citizens, locations, onRefresh, onClose, onOpenDetail } = props;

  // SARSILMAZ AKILLI MANTIK: Dışarıdan hazır mantık geliyorsa onu kullan, yoksa kendi mantığını kur.
  const internalLogic = useRecordDetail(table, type, data, true, onRefresh, onClose);
  
  const logic = props.values ? props : internalLogic;

  const { 
    values = {}, setValues, isProcessing, tcknStatus, sicilStatus, debounceTimer,
    onSaveRecord, isFormValid, errors = {} as any 
  } = logic;

  const [activeTab, setActiveTab] = React.useState('mandatory');

  // 🛡️ TEMEL SEVİYE ZORUNLULUK MANTIĞI - MAKSİMUM ESNEKLİK
  const isRequiredFieldEmpty = (field: string) => {
     return false;
  };

  const renderField = (field: string) => {
    return (
      <FieldRenderer 
        key={field} field={field} isEditing={true} values={values} setValues={setValues}
        table={table}
        type="create" translateHeader={translateHeader}
        renderTooltip={() => null}
        error={errors[field]}
        isRequiredFieldEmpty={isRequiredFieldEmpty}
        tcknStatus={tcknStatus} sicilStatus={sicilStatus} debounceTimer={debounceTimer}
        vatandaslar={citizens} mevkiler={locations} onOpenDetail={onOpenDetail}
      />
    );
  };

  const [ppPreview, setPpPreview] = React.useState<string | null>(null);

  const handlePickPhoto = async () => {
    let currentId = values.id || (values as any).id;
    if (!currentId) {
       currentId = crypto.randomUUID();
       setValues({ ...values, id: currentId });
    }
    const result = await ElectronService.pickCitizenProfilePicture(currentId);
    if (result.success && result.path) {
      setValues({ ...values, Profil_Foto_Yolu: result.path, id: currentId });
    }
  };

  React.useEffect(() => {
    if (values.Profil_Foto_Yolu) {
      ElectronService.getCitizenProfileImage(values.Profil_Foto_Yolu).then(setPpPreview);
    } else {
      setPpPreview(null);
    }
  }, [values.Profil_Foto_Yolu]);

  const tabs = [
    { id: 'mandatory', label: '01. KİMLİK BİLGİLERİ', icon: Fingerprint },
    { id: 'personal', label: '02. ŞAHSİ DETAYLAR', icon: User },
    { id: 'contact', label: '03. İLETİŞİM & ADRES', icon: Smartphone },
  ];

  return (
    <div className="h-full w-full flex bg-slate-50 dark:bg-slate-950 overflow-hidden animate-in fade-in duration-500">
      
      {/* 🏛️ SOL SİDEBAR NAVİGASYON */}
      <div className="w-80 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/5 flex flex-col p-8 shrink-0 z-20">
        <div className="mb-10 px-4">
          <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-primary-500 text-white rounded-lg shadow-lg shadow-primary-500/20">
                <UserPlus size={18} />
             </div>
             <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tighter uppercase leading-none">MÜKELLEF</h1>
          </div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">ESNEK VERİ GİRİŞİ</p>
        </div>

        {/* STEPPER / TABS */}
        <nav className="space-y-3 mb-8 flex-1 overflow-y-auto custom-scrollbar">
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

        {/* KAYDET & KONTROL */}
        <div className="mt-auto space-y-4">
            <button 
               disabled={isProcessing || !isFormValid} 
               onClick={onSaveRecord} 
               className={`w-full py-5 font-black rounded-2xl shadow-2xl transition-all text-[10px] tracking-widest uppercase flex items-center justify-center gap-3 ${
                isFormValid 
                ? "bg-primary-600 text-white shadow-primary-600/30 hover:scale-[1.02] active:scale-[0.98]" 
                : "bg-slate-100 dark:bg-white/5 text-slate-300 cursor-not-allowed grayscale"
               } ${isProcessing ? "opacity-50 cursor-not-allowed shadow-none" : ""}`}
            >
               {isProcessing ? "İŞLENİYOR..." : (type === 'create' ? "TESCİL ET" : "GÜNCELLE")} <Save size={16} />
            </button>
            <button onClick={onClose} className="w-full flex items-center justify-center gap-3 py-4 text-slate-400 hover:text-slate-600 font-black text-[10px] uppercase tracking-widest transition-colors">
               VAZGEÇ
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
      <div className="flex-1 h-full overflow-y-auto custom-scrollbar p-12 bg-slate-50/30 dark:bg-slate-950/20">
        <div className="max-w-5xl mx-auto space-y-12 pb-24">
           
           <div className="flex items-center justify-between mb-8">
              <div>
                 <h2 className="text-4xl font-black italic uppercase tracking-tighter text-slate-800 dark:text-white leading-none">
                    {tabs.find(t => t.id === activeTab)?.label.split('. ')[1]}
                 </h2>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-3">
                   KURUM BAŞKANLIĞI VERİ YÖNETİM SİSTEMİ
                 </p>
              </div>
           </div>

           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
              
              {activeTab === 'mandatory' && (
                 <div className="bg-white dark:bg-slate-900 rounded-[48px] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden flex flex-col md:flex-row">
                    <div className="md:w-64 bg-slate-50/50 dark:bg-white/5 p-8 flex flex-col items-center border-r border-slate-100 dark:border-white/5">
                       <div className="w-40 h-40 bg-white dark:bg-slate-800 rounded-[40px] border-4 border-white dark:border-slate-700 shadow-xl overflow-hidden flex items-center justify-center relative group">
                          {ppPreview ? (
                            <img src={ppPreview} alt="PP" className="w-full h-full object-cover" />
                          ) : (
                            <User size={64} className="text-slate-200" />
                          )}
                          <button onClick={handlePickPhoto} title="Fotoğraf Seç" className="absolute inset-0 bg-black/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <Camera size={24} />
                          </button>
                       </div>
                    </div>
                    <div className="flex-1 p-10 space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          {renderField("Ad")}
                          {renderField("Soyad")}
                          {renderField("Unvan")}
                       </div>
                       <div className="h-px bg-slate-100 dark:bg-white/5"></div>
                       <div className="grid grid-cols-2 gap-8">
                          {renderField("TCKN")}
                          {renderField("Sicil_No")}
                       </div>
                       <div className="h-px bg-slate-100 dark:bg-white/5"></div>
                       <div className="grid grid-cols-2 gap-8">
                          {renderField("Baba_Adi")}
                          {renderField("Ana_Adi")}
                       </div>
                    </div>
                 </div>
              )}

              {activeTab === 'personal' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-100 dark:border-white/5 shadow-sm space-y-8">
                       <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-3">
                          <Users size={16} /> DOĞUM BİLGİLERİ
                       </h3>
                       <div className="space-y-6">
                          {renderField("Dogum_Tarihi")}
                          {renderField("Cinsiyet")}
                       </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-100 dark:border-white/5 shadow-sm space-y-8">
                       <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-3">
                          <Heart size={16} /> DİĞER DETAYLAR
                       </h3>
                       <div className="space-y-6">
                          {renderField("Dogum_Yeri")}
                          {renderField("Meslek")}
                       </div>
                    </div>
                 </div>
              )}

              {activeTab === 'contact' && (
                 <div className="bg-white dark:bg-slate-900 p-12 rounded-[48px] border border-slate-100 dark:border-white/5 shadow-sm space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                       <div className="space-y-8">
                          <h3 className="text-[10px] font-black text-sky-500 uppercase tracking-widest">İLETİŞİM</h3>
                          {renderField("Telefon")}
                          {renderField("Eposta")}
                       </div>
                       <div className="space-y-8">
                          <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">ADRES</h3>
                          {renderField("Adres")}
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
