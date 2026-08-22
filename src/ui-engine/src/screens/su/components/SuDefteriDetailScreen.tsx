import React from "react";
/* Kurum_SYNC_FORCE_V1 */
import { Droplets, Calendar, User, MapPin, Clock, CreditCard, Hash, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { DetailSection } from "@renderer/components/detail/DetailSection";
import { FieldRenderer } from "@renderer/components/detail/FieldRenderer";
import { DetailHeader } from "@renderer/components/detail/DetailHeader";
import { useRecordDetail } from "@renderer/hooks/useRecordDetail";
import { DeleteConfirmModal } from "@renderer/components/modals/DeleteConfirmModal";

export const SuDefteriDetailScreen: React.FC<any> = (props) => {
  const { table, type, data, citizens, locations, onRefresh, onClose, onOpenDetail, inline } = props;
  const logic = useRecordDetail(table, type, data, true, onRefresh, onClose);

  const {
    values = {}, setValues, isEditing, setIsEditing, activeTab, setActiveTab,
    isProcessing, isDeleteModalOpen, setIsDeleteModalOpen,
    onSaveRecord, onDeleteRecord, profileData
  } = logic;

  const translateHeader = (h: string) => {
    const m: any = {
      "Vatandas_Id": "TC KİMLİK NO",
      "Mevki": "MEVKİ",
      "Ada_Parsel": "ADA / PARSEL",
      "Sure_Saat": "SÜRE (SAAT)",
      "Tutar": "TOPLAM TUTAR",
      "Odeme_Durumu": "ÖDEME DURUMU",
      "Su_Tipi": "SU TİPİ",
      "Kullanim_Sekli": "KULLANIM ŞEKLİ",
      "Birim_Fiyat": "BİRİM FİYAT",
      "Gece_Gunduz": "VARDİYA",
      "Donem": "DÖNEM",
      "Notlar": "NOTLAR",
      // Su Defteri Alanları
      "Sira_No": "DEFTER SIRA NO",
      "Su_Kaynagi": "SU KAYNAĞI",
      "Kayit_Tarihi": "KAYIT TARİHİ",
      "Aciklama": "AÇIKLAMA"
    };
    return m[h] || h;
  };

  const renderField = (field: string, config?: any) => (
    <FieldRenderer
      key={field} field={field} isEditing={isEditing} values={values} setValues={setValues}
      table={table}
      type={type as any} translateHeader={translateHeader}
      isRequiredFieldEmpty={(f) => isEditing && !values[f]}
      vatandaslar={citizens} mevkiler={locations} onOpenDetail={onOpenDetail} {...config}
    />
  );

  const isDagitim = table === "ISLEM_Su_Dagitim";

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <DetailHeader
        table={table} type={type} values={values}
        activeTab={activeTab} setActiveTab={setActiveTab} setIsEditing={setIsEditing}
        onSaveRecord={onSaveRecord} onDeleteRecord={onDeleteRecord}
        onClose={onClose} inline={inline} translateHeader={translateHeader}
        setValues={setValues} data={data} profileData={profileData}
        title={isDagitim ? "Su Dağıtım Tahakkuku" : "Su Defteri Kaydı"}
        subtitle={isDagitim ? "Kanal Suyu Salma ve Ücretlendirme Detayı" : "Yayla Su Sırası ve Sıralı Defter Kaydı"}
        icon={Droplets}
        isEditing={isEditing}
        isProcessing={isProcessing}
        onSave={onSaveRecord}
        onDelete={() => setIsDeleteModalOpen(true)}
      />

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="bg-white dark:bg-slate-900/50 p-10 rounded-[48px] border border-slate-200 dark:border-white/5 shadow-2xl space-y-10 relative overflow-hidden">
             {/* 📐 Estetik Arka Plan Elemanları */}
             <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
             <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

             <div className="flex items-center justify-between border-b-2 border-primary-500/10 pb-8">
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 bg-primary-500 text-white rounded-[24px] flex items-center justify-center shadow-lg shadow-primary-500/20">
                      {isDagitim ? <Clock size={32} /> : <Hash size={32} />}
                   </div>
                   <div>
                      <h2 className="text-4xl font-black italic uppercase leading-none">
                         {isEditing ? "DÜZENLEME FORMU" : (isDagitim ? "TAHAKKUK FİŞİ" : "DEFTER SAYFASI")}
                      </h2>
                      <div className="flex items-center gap-2 mt-2">
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">REFERANS ID:</span>
                         <span className="text-[10px] font-mono text-slate-500">{values.id?.substring(0, 13)}</span>
                      </div>
                   </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                   {values.Odeme_Durumu === "Ödenmedi" && (
                      <div className="px-6 py-2 bg-blue-500/10 text-blue-600 border border-blue-500/20 rounded-2xl flex items-center gap-2">
                         <AlertCircle size={14} />
                         <span className="text-[10px] font-black uppercase tracking-widest">ÖDEME BEKLENİYOR</span>
                      </div>
                   )}
                   {values.Odeme_Durumu === "Ödendi" && (
                      <div className="px-6 py-2 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-2xl flex items-center gap-2">
                         <CheckCircle size={14} />
                         <span className="text-[10px] font-black uppercase tracking-widest">TAHSİLAT TAMAMLANDI</span>
                      </div>
                   )}
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* 👤 Taraf Bilgileri */}
                <div className="space-y-10">
                   <DetailSection title="Hak Sahibi Bilgileri" icon={User} iconColor="text-indigo-500">
                      <div className="space-y-6">
                         {renderField("Vatandas_Id", { icon: User, color: "indigo" })}
                         {!isDagitim && renderField("Sira_No", { icon: Hash, color: "slate" })}
                      </div>
                   </DetailSection>

                   <DetailSection title="Konum ve Alan Bilgisi" icon={MapPin} iconColor="text-emerald-500">
                      <div className="space-y-6">
                         {renderField("Mevki", { icon: MapPin, color: "emerald" })}
                         {isDagitim ? renderField("Ada_Parsel", { icon: MapPin, color: "emerald" }) : renderField("Su_Kaynagi", { icon: Droplets, color: "sky" })}
                      </div>
                   </DetailSection>

                   <DetailSection title="Dönem ve Zamanlama" icon={Calendar} iconColor="text-sky-500">
                      <div className="grid grid-cols-2 gap-6">
                         {renderField("Donem", { color: "sky" })}
                         {isDagitim ? renderField("Gece_Gunduz", { color: "sky" }) : renderField("Kayit_Tarihi", { color: "sky" })}
                      </div>
                   </DetailSection>
                </div>

                {/* 💰 Tahakkuk ve Ödeme */}
                <div className="space-y-10">
                   {isDagitim ? (
                      <>
                        <DetailSection title="Kullanım ve Ücretlendirme" icon={Clock} iconColor="text-primary-500">
                           <div className="p-8 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-[40px] space-y-6">
                              <div className="grid grid-cols-2 gap-6">
                                 {renderField("Sure_Saat", { color: "primary" })}
                                 {renderField("Birim_Fiyat", { color: "primary" })}
                              </div>
                              <div className="flex flex-col gap-2 pt-4 border-t border-slate-200 dark:border-white/10">
                                 <span className="text-[10px] font-black uppercase text-slate-400">HESAPLANAN TOPLAM TUTAR</span>
                                 <div className="flex items-center justify-between">
                                    <h4 className="text-4xl font-black italic tabular-nums text-slate-800 dark:text-white">
                                       {(Number(values.Tutar) || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} <span className="text-xl not-italic ml-1">TL</span>
                                    </h4>
                                    <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg"><CreditCard size={20} /></div>
                                 </div>
                              </div>
                           </div>
                        </DetailSection>

                        <DetailSection title="Ödeme ve Hizmet Detayı" icon={CreditCard} iconColor="text-blue-500">
                           <div className="space-y-6">
                              {renderField("Odeme_Durumu", { color: "blue" })}
                              <div className="grid grid-cols-2 gap-6">
                                 {renderField("Su_Tipi", { color: "slate" })}
                                 {renderField("Kullanim_Sekli", { color: "slate" })}
                              </div>
                           </div>
                        </DetailSection>
                      </>
                   ) : (
                      <DetailSection title="Defter Notları ve Arşiv" icon={FileText} iconColor="text-slate-500">
                         <div className="space-y-6">
                            {renderField("Aciklama", { color: "slate" })}
                            <div className="p-8 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-[40px] flex flex-col items-center justify-center text-center gap-4">
                               <FileText size={48} className="text-slate-200" />
                               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">BU KAYIT SU DEFTERİ SIRALAMA SİSTEMİNE DAHİLDİR</p>
                            </div>
                         </div>
                      </DetailSection>
                   )}

                   <DetailSection title="Ek Notlar" icon={FileText} iconColor="text-slate-500">
                      {renderField("Notlar", { color: "slate" })}
                   </DetailSection>
                </div>
             </div>
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={onDeleteRecord}
        isProcessing={isProcessing}
        message={`Bu ${isDagitim ? 'tahakkuk' : 'defter'} kaydını sistemden kalıcı olarak silmeyi onaylıyor musunuz?`}
      />
    </div>
  );
};

