import React, { useState } from 'react';
import { Info, Clock, MapPin, Layers, User, Activity, DollarSign, CheckCircle2, CreditCard, Printer } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { ElectronService } from '../../services/ElectronService';

interface FisTableProps {
  fisler: any[];
  onMutabakat?: (fis: any) => void;
  onPrintOdemeEmri?: (fis: any) => void;
}

const DistributionDetailPopover: React.FC<{ fisId: string }> = ({ fisId }) => {
  const [details, setDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDetails = async () => {
    if (details || isLoading) return;
    setIsLoading(true);
    try {
      // 🛡️ Sarsılmaz İlişkisel Sorgu: Tahakkuk -> Dağıtım -> Mevki
      const res = await ElectronService.executeRaw(`
        SELECT k.*, m.Mevki_Adi, v.Ad, v.Soyad
        FROM DATA_Dagitim_Kayitlar k
        LEFT JOIN DATA_Tasinmaz_Mevkileri m ON k.Mevki_id = m.id
        LEFT JOIN DATA_Vatandas v ON k.Vatandas_Id = v.id
        WHERE k.id = ?
      `, [fisId]);

      if (res.success && res.data && res.data.length > 0) {
        setDetails(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popover.Root onOpenChange={(open) => open && fetchDetails()}>
      <Popover.Trigger asChild>
        <button className="p-1.5 hover:bg-primary-500/10 text-primary-500 rounded-lg transition-all active:scale-95" title="SULAMA DETAYLARI">
          <Info size={14} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content 
          className="z-[200] w-80 bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-2xl border border-slate-200 dark:border-white/10 animate-in fade-in zoom-in-95 duration-200"
          sideOffset={5}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
              <div className="p-2 bg-primary-500/10 text-primary-500 rounded-xl">
                <Activity size={18} />
              </div>
              <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest italic">SULAMA DEFTER KAYDI</h4>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center py-8 gap-3">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">VERİ ÇEKİLİYOR...</span>
              </div>
            ) : details ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <span className="text-[8px] font-black text-slate-400 uppercase">MEVKİ</span>
                      <div className="flex items-center gap-1.5">
                         <MapPin size={10} className="text-indigo-500" />
                         <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase">{details.Mevki_Adi || '---'}</span>
                      </div>
                   </div>
                   <div className="space-y-1">
                      <span className="text-[8px] font-black text-slate-400 uppercase">ADA/PARSEL</span>
                      <div className="flex items-center gap-1.5">
                         <Layers size={10} className="text-emerald-500" />
                         <span className="text-[10px] font-black text-slate-800 dark:text-white">{details.Ada || '---'}/{details.Parsel || '---'}</span>
                      </div>
                   </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                   <div className="flex justify-between items-center mb-2">
                      <span className="text-[8px] font-black text-slate-400 uppercase">KULLANIM SÜRESİ</span>
                      <Clock size={10} className="text-amber-500" />
                   </div>
                   <div className="flex justify-between text-[11px] font-black dark:text-white tabular-nums">
                      <span>{details.Baslangic_Saati} - {details.Bitis_Saati}</span>
                      <span className="text-primary-500">{details.Sure_Saat} SAAT</span>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <span className="text-[8px] font-black text-slate-400 uppercase">BİRİM FİYAT</span>
                      <div className="flex items-center gap-1.5">
                         <DollarSign size={10} className="text-primary-500" />
                         <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase">{details.Birim_Fiyat || '---'} TL</span>
                      </div>
                   </div>
                   <div className="space-y-1">
                      <span className="text-[8px] font-black text-slate-400 uppercase">TOPLAM TAHAKKUK</span>
                      <div className="flex items-center gap-1.5">
                         <Activity size={10} className="text-emerald-500" />
                         <span className="text-[10px] font-black text-slate-800 dark:text-white">{details.Toplam_Tutar || '---'} TL</span>
                      </div>
                   </div>
                </div>

                 <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
                   <User size={10} className="text-slate-400" />
                   <span className="text-[9px] font-bold text-slate-500 uppercase">{details.Ad} {details.Soyad}</span>
                </div>
              </div>
            ) : (
              <p className="text-center py-4 text-[10px] font-black text-rose-500 uppercase italic">Kayıt Bulunamadı.</p>
            )}
          </div>
          <Popover.Arrow className="fill-white dark:fill-slate-900" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export const AccountingFisTable: React.FC<FisTableProps> = ({ fisler, onMutabakat, onPrintOdemeEmri }) => {
  return (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
          <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-32">Tarih</th>
          <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-32">Ad</th>
          <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-32">Soyad</th>
          <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] min-w-[140px]">Açıklama</th>
          <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-32">Durum</th>
          <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right w-32">Miktar</th>
          <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right w-40">İşlemler</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50 dark:divide-white/5">
        {fisler.map(f => (
          <tr key={f.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-all group">
            <td className="p-6">
              <div className="flex flex-col">
                 <span className="text-[13px] font-black text-slate-800 dark:text-white tabular-nums tracking-tighter">
                   {new Date(f.Tarih).toLocaleDateString('tr-TR')}
                 </span>
                 <span className="text-[9px] font-black text-primary-500 uppercase tracking-widest mt-0.5">{f.Fis_No}</span>
              </div>
            </td>
            <td className="p-6 font-black text-[11px] text-slate-700 dark:text-slate-200 uppercase whitespace-nowrap">
               {f.Ad || 'GENEL'}
            </td>
            <td className="p-6 font-black text-[11px] text-slate-700 dark:text-slate-200 uppercase whitespace-nowrap">
               {f.Soyad || 'MÜKELLEF'}
            </td>
            <td className="p-6">
              <div className="flex items-center gap-3">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-medium text-slate-400 uppercase italic truncate max-w-[200px]" title={f.Aciklama}>{f.Aciklama}</span>
                    {f.Sicil_No && <span className="text-[8px] font-black text-primary-500 uppercase mt-0.5">SİCİL: {f.Sicil_No}</span>}
                  </div>
                 {f.Fis_id && f.Donem_id && <DistributionDetailPopover fisId={f.Fis_id} />}
              </div>
            </td>
            <td className="p-6">
               <div className="flex">
                  <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                    (f.Durum === 'Ödendi' || f.Durum === 'TESCİL EDİLDİ') 
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                    : (f.Durum === 'Kısmi' ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20')
                  }`}>
                    {f.Durum === 'Ödendi' || f.Durum === 'TESCİL EDİLDİ' ? 'ÖDENDİ / TESCİL' : (f.Durum === 'Kısmi' ? 'KISMİ ÖDEME' : 'BEKLEMEDE')}
                  </span>
               </div>
            </td>
            <td className="p-6 text-right">
              <div className="flex flex-col items-end">
                 <span className="font-black text-base tabular-nums text-slate-900 dark:text-white tracking-tighter">
                   {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(f.Tutar || f.Miktar || 0)}
                 </span>
                 <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{f.Kategori || 'TAHAKKUK'}</span>
              </div>
            </td>
            <td className="p-6 text-right">
               <div className="flex justify-end items-center gap-3">
                 {onMutabakat && f.Durum !== 'Ödendi' && f.Durum !== 'TESCİL EDİLDİ' ? (
                   <button 
                     onClick={() => onMutabakat(f)}
                     className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                   >
                     <DollarSign size={14} /> TAHSİLAT YAP
                   </button>
                 ) : (
                   <>
                    {(f.Durum === 'Ödendi' || f.Durum === 'TESCİL EDİLDİ') && (
                      <button 
                        title={`Ödeme Yöntemi: ${f.Odeme_Yontemi || 'NAKİT'} (Değiştirmek için tıkla)`}
                        onClick={async () => {
                           const nextMethod = f.Odeme_Yontemi === 'KREDİ KARTI' ? 'NAKİT' : 'KREDİ KARTI';
                           const ok = await ElectronService.showConfirm({
                              title: 'ÖDEME TİPİ DEĞİŞİMİ',
                              message: `Bu fişin ödeme yöntemini ${f.Odeme_Yontemi || 'NAKİT'} -> ${nextMethod} olarak değiştirmek istediğinize emin misiniz? Kasa bakiyeleri otomatik güncellenecektir.`,
                              type: 'question'
                           });
                           if (ok) {
                              const res = await (window as any).electron.ipcRenderer.invoke('update-payment-method', f.id, nextMethod);
                              if (res.success) {
                                 ElectronService.showAlert({ message: 'Ödeme yöntemi başarıyla güncellendi.', type: 'success' });
                                 window.location.reload(); // En temiz yenileme
                              } else {
                                 ElectronService.showAlert({ message: res.error, type: 'error' });
                              }
                           }
                        }}
                        className={`p-2 rounded-xl transition-all ${f.Odeme_Yontemi === 'KREDİ KARTI' ? 'bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}
                      >
                         {f.Odeme_Yontemi === 'KREDİ KARTI' ? <CreditCard size={16} /> : <DollarSign size={16} />}
                      </button>
                    )}
                     {onPrintOdemeEmri && (
                       <button
                         title="Resmi Ödeme Emri Belgesi (A4) Yazdır"
                         onClick={() => onPrintOdemeEmri(f)}
                         className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white rounded-xl transition-all"
                       >
                         <Printer size={16} />
                       </button>
                     )}
                    <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl" title={f.Durum === 'Ödendi' || f.Durum === 'TESCİL EDİLDİ' ? 'Ödeme Tamamlandı' : 'İşlem Kapalı'}>
                        <CheckCircle2 size={16} />
                    </div>
                   </>
                 )}
               </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
