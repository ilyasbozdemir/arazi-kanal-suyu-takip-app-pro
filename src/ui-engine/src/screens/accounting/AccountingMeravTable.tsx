import React from 'react';
import { Edit3, MapPin } from 'lucide-react';

interface MeravTableProps {
  meravlar: any[];
  setEditingItem: (item: any) => void;
  setNewPersonel: (personel: any) => void;
  setIsModalOpen: (open: boolean) => void;
}

export const AccountingMeravTable: React.FC<MeravTableProps> = ({
  meravlar,
  setEditingItem,
  setNewPersonel,
  setIsModalOpen
}) => {
  return (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-slate-50 dark:border-white/5">
          <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Saha Görevlisi (Merav)</th>
          <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sorumlu Bölge / Mevki</th>
          <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">İşlem</th>
        </tr>
      </thead>
      <tbody>
        {meravlar.map(m => (
          <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
            <td className="p-6">
               <div className="flex flex-col">
                  <span className="font-black text-sm text-slate-800 dark:text-white uppercase italic tracking-tight">{m.Ad_Soyad}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TCKN: {m.Vatandas_Id}</span>
               </div>
            </td>
            <td className="p-6">
               <div className="flex items-center gap-2">
                  <MapPin size={12} className="text-primary-500" />
                  <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase italic">
                    {m.Sorumlu_Mahalle} {m.Sorumlu_Bolge ? `/ ${m.Sorumlu_Bolge}` : ''}
                  </span>
               </div>
            </td>
            <td className="p-6 text-right">
              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button title="Merav Düzenle" onClick={() => {
                  setEditingItem(m);
                  setNewPersonel({
                    Vatandas_Id: m.Vatandas_Id || '',
                    Ad_Soyad: m.Ad_Soyad,
                    Sorumlu_Mahalle: m.Sorumlu_Mahalle || '',
                    Sorumlu_Bolge: m.Sorumlu_Bolge || ''
                  });
                  setIsModalOpen(true);
                }} className="p-2 text-slate-400 hover:text-primary-500 rounded-lg">
                  <Edit3 size={15}/>
                </button>
              </div>
            </td>
          </tr>
        ))}
        {meravlar.length === 0 && (
          <tr>
            <td colSpan={3} className="p-12 text-center text-xs font-bold text-slate-400 uppercase italic">
              Henüz saha görevlisi (merav) tanımlanmamış.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};
