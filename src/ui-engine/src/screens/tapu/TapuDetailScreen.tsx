import React from 'react';
/* Kurum_SYNC_FORCE_V6 */
import { Layers, MapPin, Maximize2, Droplet, Droplets, ArrowRight, Bookmark, Home, Hash, History, User, Lock, Users, Save, ShieldCheck, ChevronRight, FileText, UserPlus, ShieldAlert, Landmark } from "lucide-react";
import { DetailSection } from "@renderer/components/detail/DetailSection";
import { FieldRenderer } from "@renderer/components/detail/FieldRenderer";
import { useRecordDetail } from "@renderer/hooks/useRecordDetail";
import { DetailHeader } from "@renderer/components/detail/DetailHeader";
import { DeleteConfirmModal } from "@renderer/components/modals/DeleteConfirmModal";
import { TahsilatFormModal } from '@renderer/screens/vatandas/components/modals/TahsilatFormModal';
import { ManuelBorcFormModal } from '@renderer/screens/vatandas/components/modals/ManuelBorcFormModal';
import { translateHeader } from "@renderer/utils/translations";
import { AccrualsTab } from '@renderer/components/tabs/AccrualsTab';
import { CollectionsTab } from '@renderer/components/tabs/CollectionsTab';
import { IrrigationHistoryTab } from '@renderer/components/tabs/IrrigationHistoryTab';
import { AccountingLedgerTab } from '@renderer/components/tabs/AccountingLedgerTab';
import { MaliDurumTab } from '@renderer/components/tabs/MaliDurumTab';
import { motion, AnimatePresence } from 'framer-motion';
import { TapuEditView } from './TapuEditView';
import { useState } from 'react';
export const TapuDetailScreen: React.FC<any> = (props) => {
   const { table, type, data, citizens, locations, onRefresh, onClose, onOpenDetail, onOpenCreate, inline } = props;

   const logic = useRecordDetail(table, type, data, true, onRefresh, onClose);
   const {
      values = {}, setValues, isEditing, setIsEditing, activeTab: logicTab = "genel", setActiveTab: setLogicTab,
      isProcessing, tcknStatus, sicilStatus, errors, missingFields,
      isDeleteModalOpen, setIsDeleteModalOpen,
      onSaveRecord, onDeleteRecord, profileData, isFormValid
   } = logic;

   const [isTahsilatOpen, setIsTahsilatOpen] = useState(false);
   const [isManuelBorcOpen, setIsManuelBorcOpen] = useState(false);
   const [payingTahakkuk, setPayingTahakkuk] = useState<any>(null);

   const renderField = (field: string, config?: any) => (
      <FieldRenderer
         key={field} field={field} isEditing={(type === 'create' || isEditing)} values={values} setValues={setValues}
         type={type as any} translateHeader={translateHeader}
         isRequiredFieldEmpty={(f) => (type === 'create' || isEditing) && !values[f]}
         tcknStatus={tcknStatus} sicilStatus={sicilStatus}
         vatandaslar={citizens} mevkiler={locations} onOpenDetail={onOpenDetail} onOpenCreate={onOpenCreate} {...config}
      />
   );

   return (
      <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/50 overflow-hidden font-sans">
         <DetailHeader
            table={table} type={type} values={values}
            title="Taşınmaz Detayı"
            activeTab={logicTab} setActiveTab={setLogicTab} isEditing={isEditing} setIsEditing={setIsEditing}
            onSaveRecord={onSaveRecord} onDelete={() => setIsDeleteModalOpen(true)}
            onClose={onClose} inline={inline} translateHeader={translateHeader}
            setValues={setValues} data={data} citizens={citizens} locations={locations} onOpenDetail={onOpenDetail}
            profileData={profileData}
         />

         <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
            <div className="mx-auto max-w-[1400px]">
               <AnimatePresence mode="wait">
                  {isEditing ? (
                     <TapuEditView
                        values={values}
                        setValues={setValues}
                        renderField={renderField}
                        isProcessing={isProcessing}
                        isFormValid={isFormValid}
                        onSave={onSaveRecord}
                        onCancel={() => setIsEditing(false)}
                     />
                  ) : (
                     <motion.div
                        key="view-content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-8 pb-20"
                     >
                        {logicTab === "genel" && (
                           <>
                              <div className="relative p-8 md:p-10 bg-gradient-to-br from-indigo-700 via-primary-600 to-indigo-800 rounded-[32px] md:rounded-[48px] shadow-[0_32px_80px_-20px_rgba(37,99,235,0.3)] overflow-hidden group">
                                 <div className="absolute -right-20 -bottom-20 opacity-10 group-hover:scale-110 transition-transform duration-1000 rotate-12"><Home size={400} /></div>
                                 <div className="relative z-10 flex flex-wrap items-center justify-between gap-12">
                                    <div className="flex items-center gap-10">
                                       <div className="w-32 h-32 bg-white/10 backdrop-blur-xl rounded-[44px] border border-white/20 flex items-center justify-center p-3">
                                          <div className="w-full h-full rounded-[32px] bg-white flex items-center justify-center shadow-2xl">
                                             <Home size={48} className="text-primary-500" />
                                          </div>
                                       </div>
                                       <div className="space-y-4">
                                          <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none drop-shadow-2xl">
                                             {values.Ada || '-'}/{values.Parsel || '-'}
                                          </h1>
                                          <div className="flex flex-wrap items-center gap-8 text-white/50 font-bold text-xs tracking-[0.2em] uppercase">
                                             <div className="flex items-center gap-2.5"><Hash size={18} className="text-white/30" /> PAFTA: <span className="text-white">{values.Pafta || '-'}</span></div>
                                             <div className="flex items-center gap-2.5"><Bookmark size={18} className="text-white/30" /> YEVMİYE: <span className="text-white">{values.Yevmiye_No || '-'}</span></div>
                                          </div>
                                       </div>
                                    </div>
                                    <div className="flex items-center gap-6 bg-white/10 backdrop-blur-xl p-8 rounded-[40px] border border-white/10 shadow-2xl">
                                       <div className="w-16 h-16 bg-emerald-500 text-white rounded-[20px] shadow-2xl shadow-emerald-500/40 flex items-center justify-center"><Maximize2 size={32} /></div>
                                       <div>
                                          <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] block mb-1">TAPU YÜZÖLÇÜMÜ</span>
                                          <span className="text-3xl md:text-4xl font-black text-white tabular-nums tracking-tighter">{values.Alan_m2 || '0'}<span className="text-lg ml-2 text-white/40">M²</span></span>
                                       </div>
                                    </div>
                                 </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                 <DetailSection title="Mülkiyet Bilgisi" icon={User} iconColor="text-indigo-500">
                                    <div className="space-y-4">
                                       {(profileData?.owners || []).length > 0 ? (
                                          (profileData.owners).map((owner: any) => (
                                             <div key={owner.id} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-white/5 rounded-3xl group border border-transparent hover:border-indigo-500/20 transition-all">
                                                <div className="flex items-center gap-4">
                                                   <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black text-xs">
                                                      {owner.Rol?.substring(0, 1) || 'M'}
                                                   </div>
                                                   <div>
                                                      <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{owner.Rol || 'MALİK'}</h4>
                                                      <h3 className="text-sm font-black italic uppercase tracking-tighter text-slate-800 dark:text-white">
                                                         {owner.Ad && owner.Soyad && owner.Ad !== 'undefined' ? `${owner.Ad} ${owner.Soyad}` : (owner.Ad_Soyad || owner.TCKN || owner.id || '---')}
                                                      </h3>
                                                      {owner.Hisse_Pay && <p className="text-[9px] font-bold text-indigo-500/60 uppercase">HİSSE: {owner.Hisse_Pay}/{owner.Hisse_Payda}</p>}
                                                   </div>
                                                </div>
                                                <button type="button" title="Kişi Profiline Git" onClick={() => onOpenDetail?.('DATA_Vatandas', owner.id)} className="p-3 bg-white dark:bg-slate-800 text-slate-400 hover:bg-indigo-500 hover:text-white rounded-xl transition-all shadow-sm">
                                                   <ArrowRight size={16} />
                                                </button>
                                             </div>
                                          ))
                                       ) : (
                                          <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl text-center border-2 border-dashed border-slate-200 dark:border-white/5">
                                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">KAYITLI MALİK BULUNAMADI</p>
                                          </div>
                                       )}
                                    </div>
                                 </DetailSection>

                                 <DetailSection title="Zilyet & Bakıcı Bilgisi" icon={UserPlus} iconColor="text-rose-500">
                                    <div className="space-y-4">
                                       {(profileData?.zilyetler || []).length > 0 ? (
                                          (profileData.zilyetler).map((zilyet: any) => (
                                             <div key={zilyet.id} className="flex items-center justify-between p-6 bg-rose-500/5 rounded-3xl border border-transparent hover:border-rose-500/20 transition-all">
                                                <div className="flex items-center gap-4">
                                                   <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-black text-xs">
                                                      {zilyet.Rol?.substring(0, 1) || 'Z'}
                                                   </div>
                                                   <div>
                                                      <h4 className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-0.5">{zilyet.Rol || 'ZİLYET/BAKICI'}</h4>
                                                      <h3 className="text-sm font-black italic uppercase tracking-tighter text-slate-800 dark:text-white">
                                                         {zilyet.Ad && zilyet.Soyad && zilyet.Ad !== 'undefined' ? `${zilyet.Ad} ${zilyet.Soyad}` : (zilyet.Ad_Soyad || zilyet.TCKN || zilyet.id || '---')}
                                                      </h3>
                                                   </div>
                                                </div>
                                                <button type="button" title="Kişi Profiline Git" onClick={() => onOpenDetail?.('DATA_Vatandas', zilyet.id)} className="p-3 bg-white dark:bg-slate-800 text-slate-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-sm">
                                                   <ArrowRight size={16} />
                                                </button>
                                             </div>
                                          ))
                                       ) : (
                                          <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-[32px] text-center border-2 border-dashed border-slate-200 dark:border-white/5 flex flex-col items-center justify-center gap-3">
                                             <ShieldAlert size={24} className="text-slate-300" />
                                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">BU TAŞINMAZDA KAYITLI<br />BAKICI VEYA ZİLYET YOK</p>
                                          </div>
                                       )}
                                    </div>
                                 </DetailSection>

                                 <DetailSection title="Su ve Teknik Bilgiler" icon={Droplets} iconColor="text-sky-500">
                                    <div className="space-y-4">
                                       <div className="p-6 bg-sky-500/5 rounded-3xl border border-sky-500/10 flex items-center justify-between">
                                          <div>
                                             <span className="text-[9px] font-black text-sky-500 uppercase tracking-widest block mb-1">AYLIK SU HAKKI</span>
                                             <span className="text-3xl font-black text-sky-600 tabular-nums tracking-tighter">{values.Aylik_Su_Hakki || '0'} <span className="text-xs text-sky-500/50">SAAT</span></span>
                                          </div>
                                          <Droplet size={32} className="text-sky-500/20" />
                                       </div>

                                       <div className="grid grid-cols-2 gap-4">
                                          <div className={`p-5 rounded-3xl border ${values.Kanal_Seviyesi_Altinda ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-rose-500/5 border-rose-500/10'}`}>
                                             <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-2">KANAL ALTI</span>
                                             <span className={`text-[10px] font-black uppercase ${values.Kanal_Seviyesi_Altinda ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {values.Kanal_Seviyesi_Altinda ? 'EVET' : 'HAYIR'}
                                             </span>
                                          </div>
                                          <div className={`p-5 rounded-3xl border ${values.Kanal_Suyu_Ile_Sulanan ? 'bg-sky-500/5 border-sky-500/10' : 'bg-rose-500/5 border-rose-500/10'}`}>
                                             <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-2">KANAL SUYU</span>
                                             <span className={`text-[10px] font-black uppercase ${values.Kanal_Suyu_Ile_Sulanan ? 'text-sky-500' : 'text-rose-500'}`}>
                                                {values.Kanal_Suyu_Ile_Sulanan ? 'EVET' : 'HAYIR'}
                                             </span>
                                          </div>
                                       </div>

                                       <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-transparent">
                                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">ARAZİ NİTELİĞİ</span>
                                          <div className="flex items-center gap-3">
                                             <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg"><Bookmark size={14} /></div>
                                             <span className="text-xs font-black text-slate-700 dark:text-white uppercase truncate">{values.Nitelik || 'BELİRTİLMEMİŞ'}</span>
                                          </div>
                                       </div>
                                    </div>
                                 </DetailSection>
                              </div>

                              <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
                                 <div className="flex items-center gap-3 px-8 pt-8 pb-4">
                                    <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl"><FileText size={16} /></div>
                                    <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">ÖZEL NOTLAR VE SULAMA AÇIKLAMALARI</h3>
                                 </div>
                                 <div className="px-8 pb-8">
                                    {values.Notlar ? (
                                       <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{values.Notlar}</p>
                                    ) : (
                                       <p className="text-[10px] font-black text-slate-300 dark:text-white/20 uppercase tracking-widest italic">Bu taşınmaz için henüz özel not girilmemiştir.</p>
                                    )}
                                 </div>
                              </div>
                           </>
                        )}

                        {logicTab === "sulama" && <IrrigationHistoryTab profileData={profileData} />}
                        {logicTab === "mali" && (
                           <MaliDurumTab
                              profileData={profileData}
                              values={values}
                              onAddDebt={() => setIsManuelBorcOpen(true)}
                              onPay={(t: any) => {
                                 setPayingTahakkuk(t);
                                 setIsTahsilatOpen(true);
                              }}
                           />
                        )}
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>
         </div>

         <DeleteConfirmModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={onDeleteRecord}
            isProcessing={isProcessing}
            message={`Ada: ${values.Ada} / Parsel: ${values.Parsel} olan bu taşınmazı silmeyi onaylıyor musunuz?`}
         />

         <TahsilatFormModal
            isOpen={isTahsilatOpen}
            onClose={() => {
               setIsTahsilatOpen(false);
               setPayingTahakkuk(null);
            }}
            onSuccess={() => {
               onRefresh && onRefresh();
               logic.refresh();
            }}
            citizen={payingTahakkuk ? {
               id: payingTahakkuk.Vatandas_Id,
               TCKN: payingTahakkuk.Vatandas_TCKN,
               Ad: payingTahakkuk.Vatandas_Ad,
               Soyad: payingTahakkuk.Vatandas_Soyad
            } : { id: '', TCKN: '', Ad: '', Soyad: '' }}
            tahakkukId={payingTahakkuk?.id}
            initialAmount={payingTahakkuk?.Kalan_Borc}
            totalDebt={payingTahakkuk?.Kalan_Borc || 0}
         />

         <ManuelBorcFormModal
            isOpen={isManuelBorcOpen}
            onClose={() => setIsManuelBorcOpen(false)}
            onSuccess={() => {
               onRefresh && onRefresh();
               logic.refresh();
            }}
            citizen={(profileData?.owners?.[0] || profileData?.zilyetler?.[0]) ? { 
               id: (profileData?.owners?.[0] || profileData?.zilyetler?.[0]).id, 
               TCKN: (profileData?.owners?.[0] || profileData?.zilyetler?.[0]).TCKN, 
               Ad: (profileData?.owners?.[0] || profileData?.zilyetler?.[0]).Ad, 
               Soyad: (profileData?.owners?.[0] || profileData?.zilyetler?.[0]).Soyad 
            } : { id: '', TCKN: '', Ad: '', Soyad: '' }}
            tasinmazId={values.id}
         />
      </div>
   );
};
