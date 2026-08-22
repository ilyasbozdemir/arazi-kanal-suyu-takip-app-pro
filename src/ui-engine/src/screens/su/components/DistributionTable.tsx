import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from '@renderer/components/ui/popover';
import { User, MapPin, Hash, ShieldCheck, Info, Activity, Trash2, ChevronRight, ChevronLeft, AlertCircle, Lock as LockIcon } from 'lucide-react';

interface DistributionTableProps {
  data: any[];
  isArchived: boolean;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  onEdit: (row: any) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onDetail: (row: any) => void;
  formatDate: (date: string) => string;
  formatCurrency: (amount: number) => string;
  meravCount?: number;
  receiptBookCount?: number;
}

export const DistributionTable: React.FC<DistributionTableProps> = ({
  data,
  isArchived,
  currentPage,
  setCurrentPage,
  totalPages,
  onEdit,
  onDelete,
  onDetail,
  formatDate,
  formatCurrency,
  meravCount = 0,
  receiptBookCount = 0
}) => {
  const isMissingConfig = meravCount === 0 || receiptBookCount === 0;

  return (
    <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col">
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 sticky top-0 z-10">
              <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tarih</th>
              <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mükellef & Taşınmaz</th>
              <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tarife</th>
              <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider">Süre (Saat)</th>
              <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hesaplanan Tutar</th>
              <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider">#</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={`${row.id}-${idx}`}
                className={`border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group ${row.deleted_at ? 'opacity-50 bg-slate-50/50 dark:bg-white/2 overflow-hidden' : ''}`}
              >
                <td className="px-6 py-4" onClick={() => onDetail(row)}>
                  <span className="text-[13px] text-slate-700 dark:text-slate-300 font-medium">{formatDate(row.Tarih)}</span>
                </td>
                <td className="px-6 py-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <div className="flex flex-col group/pop">
                        <div className="flex items-center gap-2">
                           <span className={`text-[13px] font-black uppercase tracking-tighter group-hover/pop:text-primary-500 transition-colors ${row.deleted_at ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>{row.Ad_Soyad}</span>
                           {row.deleted_at && <span className="text-[9px] font-black bg-rose-500 text-white px-2 py-0.5 rounded ml-2 animate-pulse">İPTAL EDİLDİ</span>}
                           <Info size={12} className="text-slate-300 group-hover/pop:text-primary-400 opacity-0 group-hover/pop:opacity-100 transition-all" />
                        </div>
                        <div className="flex gap-2 mb-0.5">
                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">TC: {row.TCKN || '---'}</span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-2">
                           <span className="text-[10px] font-black text-primary-500 bg-primary-500/5 px-2 py-0.5 rounded italic">{row.Ada_Parsel}</span>
                           {row.Makbuz_No && (
                              <span className="text-[10px] font-black text-amber-600 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 italic">
                                 {row.Makbuz_Defter_Adi || 'KOÇAN'} #{row.Makbuz_No}
                              </span>
                           )}
                        </div>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent side="right" align="start" className="w-80 p-0 overflow-hidden shadow-2xl border-none">
                       <div className="bg-primary-500 p-4 text-white">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><User size={20} /></div>
                             <div>
                                <h4 className="text-xs font-black uppercase tracking-tighter leading-tight">{row.Ad_Soyad}</h4>
                                <p className="text-[9px] font-bold opacity-70 uppercase tracking-widest mt-0.5">Mükellef Detay Bilgisi</p>
                             </div>
                          </div>
                       </div>
                       <div className="p-5 space-y-4 bg-white dark:bg-slate-900">
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-1">
                                <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">TC KİMLİK NO</label>
                                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700 dark:text-white"><Hash size={12} className="text-primary-500" /> {row.TCKN || '---'}</div>
                             </div>
                             <div className="space-y-1">
                                <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">SİCİL NUMARASI</label>
                                <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-600"><ShieldCheck size={12} /> {row.Sicil_No || '---'}</div>
                             </div>
                          </div>
                          <div className="h-px bg-slate-100 dark:bg-white/5 w-full" />
                          <div className="space-y-3">
                             <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-lg"><MapPin size={14} /></div>
                                 <div className="space-y-1">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Taşınmaz Konumu</span>
                                    <div className="flex items-center gap-2">
                                       <p className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-tighter">{row.Ada_Parsel}</p>
                                       <span className="text-slate-300">/</span>
                                       <PopoverClose asChild>
                                          <button 
                                             onClick={(e) => {
                                                e.stopPropagation();
                                                if (row.Mevki_id) {
                                                   window.dispatchEvent(new CustomEvent('KURUM_NAV_TAB', { 
                                                      detail: { 
                                                         id: `mevki-${row.Mevki_id}`, 
                                                         type: 'detail', 
                                                         table: 'DATA_Tasinmaz_Mevkileri', 
                                                         title: row.Mevki, 
                                                         data: { id: row.Mevki_id } 
                                                      } 
                                                   }));
                                                }
                                             }}
                                             className="text-[11px] font-black text-primary-500 hover:text-primary-600 hover:underline uppercase tracking-tighter transition-all"
                                          >
                                             {row.Mevki || 'MEVKİ BİLGİSİ YOK'}
                                          </button>
                                       </PopoverClose>
                                    </div>
                                 </div>
 
                                 {row.Hissedarlar && (
                                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
                                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Tüm Paydaşlar (Hissedarlar)</span>
                                       <div className="space-y-1">
                                          {row.Hissedarlar.split(',').map((h: string, idx: number) => (
                                             <div key={idx} className="flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-tight">
                                                <span className="text-primary-500">#</span>
                                                {h.trim()}
                                             </div>
                                          ))}
                                       </div>
                                    </div>
                                 )}
                             </div>
                          </div>
                          <button 
                             onClick={() => onDetail(row)}
                             className="w-full py-3 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary-500 hover:text-white transition-all border border-slate-200 dark:border-white/5"
                          >
                             TAM DETAYI GÖRÜNTÜLE
                          </button>
                       </div>
                    </PopoverContent>
                  </Popover>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${row.Tarife_Modu === 'NIGHT' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'}`}>
                    {row.Tarife_Modu === 'NIGHT' ? 'GECE' : 'GÜNDÜZ'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-[13px] font-black text-slate-900 dark:text-white">{row.Sure_Saat} SAAT</span>
                </td>
                <td className="px-6 py-4 text-right">
                   <span className={`text-[14px] font-black ${row.deleted_at ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>{formatCurrency(row.Tutar)}</span>
                 </td>
                <td className="px-6 py-4 text-right">
                  {!isArchived && !row.deleted_at && (
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={(e) => { e.stopPropagation(); onEdit(row); }}
                        className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-white/5 rounded-lg transition-all"
                        title="Fişi Düzenle"
                      >
                        <Activity size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          if (row.Makbuz_No) {
                             e.stopPropagation();
                             return;
                          }
                          onDelete(row.id, e);
                        }}
                        disabled={!!row.Makbuz_No}
                        className={`p-2 rounded-lg transition-all ${row.Makbuz_No ? 'text-slate-200 cursor-not-allowed grayscale opacity-30 shadow-none' : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-white/5'}`}
                        title={row.Makbuz_No ? "MÜHÜRLÜ KAYIT SİLİNEMEZ: Resmileşmiş tahakkuklar sadece muhasebe üzerinden iptal edilebilir." : "Fişi Sil"}
                      >
                        {row.Makbuz_No ? <LockIcon size={16} /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                   <div className="flex flex-col items-center justify-center space-y-4">
                      {isMissingConfig ? (
                         <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center animate-bounce">
                            <AlertCircle size={32} />
                         </div>
                      ) : (
                         <Activity size={48} className="text-slate-300 animate-pulse" />
                      )}
                      
                      <div className="space-y-2">
                         <h3 className={`text-sm font-black uppercase tracking-tighter ${isMissingConfig ? 'text-rose-600' : 'text-slate-800 dark:text-white'}`}>
                            {isMissingConfig ? 'KRİTİK OPERASYONEL EKSİKLİK!' : 'BU DEFTER İÇİN FİŞ BULUNAMADI'}
                         </h3>
                         <div className="flex flex-col items-center gap-1">
                            {meravCount === 0 && (
                               <p className="text-[10px] font-black text-rose-500 bg-rose-500/5 px-3 py-1 rounded-full border border-rose-500/10 uppercase tracking-widest italic">
                                  ⚠️ GÖREVLİ MERAV ATANMAMIŞ! Kayıt girmek için önce personel görevlendirin.
                               </p>
                            )}
                            {receiptBookCount === 0 && (
                               <p className="text-[10px] font-black text-rose-500 bg-rose-500/5 px-3 py-1 rounded-full border border-rose-500/10 uppercase tracking-widest italic">
                                  ⚠️ FİŞ KOÇANI TANIMLANMAMIŞ! Lütfen geçerli bir koçan tescil edin.
                               </p>
                            )}
                            {!isMissingConfig && (
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                                  HENÜZ BİR SULAMA FİŞİ KESİLMEMİŞ VEYA ARADIĞINIZ KRİTERLERE UYGUN VERİ YOK
                               </p>
                            )}
                         </div>
                      </div>
                   </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🛡️ SAYFALAMA KONTROLLERİ */}
      {totalPages > 1 && (
        <div className="p-6 bg-slate-50 dark:bg-white/5 border-t border-slate-200 dark:border-white/10 flex items-center justify-center gap-2">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg text-slate-500 disabled:opacity-30 hover:bg-slate-50 transition-colors"
            title="Önceki Sayfa"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-1">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                title={`Sayfa ${i + 1}`}
                className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-primary-500 text-white shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-white/10 hover:bg-slate-50'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg text-slate-500 disabled:opacity-30 hover:bg-slate-50 transition-colors"
            title="Sonraki Sayfa"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};
