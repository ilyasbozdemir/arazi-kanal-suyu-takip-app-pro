import React from 'react';
import { History, Edit3, Trash2 } from 'lucide-react';

interface KasaTableProps {
  kasalar: any[];
  personel: any[];
  addTab?: (tab: any) => void;
  onOpenDetail?: (table: string, id: any) => void;
  loadKasaMovements: (kasa: any) => void;
  setActiveSubTab: (tab: any) => void;
  setEditingItem: (item: any) => void;
  setNewKasa: (kasa: any) => void;
  setIsModalOpen: (open: boolean) => void;
  handleDeleteKasa: (id: string) => void;
}

export const AccountingKasaTable: React.FC<KasaTableProps> = ({
  kasalar,
  personel,
  addTab,
  onOpenDetail,
  loadKasaMovements,
  setActiveSubTab,
  setEditingItem,
  setNewKasa,
  setIsModalOpen,
  handleDeleteKasa
}) => {
  const getResponsible = (id: string) => {
    return personel.find(p => p.id === id);
  };
  return (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-slate-50 dark:border-white/5">
          <th className="p-6 text-[10px] font-black text-slate-400 uppercase">TDHP Hesap / Kasa</th>
          <th className="p-6 text-[10px] font-black text-slate-400 uppercase text-right">Bakiye</th>
          <th className="p-6 text-[10px] font-black text-slate-400 uppercase text-right">İşlem</th>
        </tr>
      </thead>
      <tbody>
        {kasalar.map(k => (
          <tr key={k.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
            <td className="p-6">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-mono">
                  {k.Hesap_Kodu || '100.01'}
                </span>
                <span className="font-bold text-sm text-slate-800 dark:text-white uppercase">{k.Kasa_Adi}</span>
                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${k.Kasa_Tipi === 'BANKA' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                   {k.Kasa_Tipi === 'BANKA' ? '🏦 BANKA / POS' : '💵 NAKİT KASA'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>{k.Konum || 'KONUM YOK'}</span>
                <span>—</span>
                {k.Zimmet_id ? (
                  <button 
                    onClick={() => {
                      const resp = getResponsible(k.Zimmet_id);
                      const vatandasId = resp?.Vatandas_Id;
                      if (onOpenDetail && vatandasId) {
                        onOpenDetail('DATA_Vatandas', vatandasId);
                      } else if (addTab && vatandasId) {
                        addTab({
                          id: `vatandas-${vatandasId}`,
                          type: 'detail',
                          table: 'DATA_Vatandas',
                          title: resp?.Ad_Soyad || 'DETAY',
                          data: { id: vatandasId }
                        });
                      }
                    }}
                    className="text-primary-500 hover:underline decoration-primary-500/30 underline-offset-2"
                  >
                    {getResponsible(k.Zimmet_id)?.Ad_Soyad} 
                    <span className="ml-1 opacity-60">({getResponsible(k.Zimmet_id)?.Sicil_No || 'SİCİLSİZ'})</span>
                  </button>
                ) : (
                  <span className={`italic font-black ${k.Sistem_Verisi ? 'text-emerald-500' : 'text-rose-500 opacity-60'}`}>
                    {k.Sistem_Verisi ? 'GENEL TAHSİLAT / KURUMSAL' : 'ZİMMET YOK'}
                  </span>
                )}
              </div>
            </td>
            <td className="p-6 text-right font-black text-lg text-emerald-500 tabular-nums">
              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(k.Bakiye || 0)}
            </td>
            <td className="p-6 text-right">
              <div className="flex justify-end gap-2 transition-all">
                <button title="Hareket Geçmişi" onClick={() => { loadKasaMovements(k); setActiveSubTab('hareketler'); }} className="p-2 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg">
                  <History size={16} />
                </button>
                <button title="Kasayı Düzenle" onClick={() => { 
                  setEditingItem(k); 
                  setNewKasa({
                    Kasa_Adi: k.Kasa_Adi,
                    Bakiye: k.Bakiye,
                    Konum: k.Konum || '',
                    Kasa_Tipi: k.Kasa_Tipi || 'NAKİT',
                    Zimmet_id: k.Zimmet_id || ''
                  }); 
                  setIsModalOpen(true); 
                }} className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg">
                  <Edit3 size={16} />
                </button>
                {!k.Sistem_Verisi && (
                  <button title="Kasayı Sil" onClick={() => handleDeleteKasa(k.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
