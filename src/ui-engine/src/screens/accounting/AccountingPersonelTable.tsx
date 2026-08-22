import React from 'react';
import { Edit3 } from 'lucide-react';

interface PersonelTableProps {
  personel: any[];
  setEditingItem: (item: any) => void;
  setNewPersonel: (personel: any) => void;
  setIsModalOpen: (open: boolean) => void;
}

export const AccountingPersonelTable: React.FC<PersonelTableProps> = ({
  personel,
  setEditingItem,
  setNewPersonel,
  setIsModalOpen
}) => {
  return (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-slate-50 dark:border-white/5">
          <th className="p-6 text-[10px] font-black text-slate-400 uppercase">Personel</th>
          <th className="p-6 text-[10px] font-black text-slate-400 uppercase text-right">İşlem</th>
        </tr>
      </thead>
      <tbody>
        {personel.map(p => (
          <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
            <td className="p-6">
              <div className="flex flex-col">
                <span className="font-bold text-sm text-slate-800 dark:text-white uppercase">{p.Ad} {p.Soyad} <span className="text-[9px] bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded ml-2">{p.Unvan}</span></span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{p.TCKN || 'TCKN YOK'}</span>
              </div>
            </td>
            <td className="p-6 text-right">
              <div className="flex justify-end gap-2 transition-all">
                <button title="Personeli Düzenle" onClick={() => {
                  setEditingItem(p);
                  setNewPersonel({
                    Unvan: p.Unvan,
                    Vatandas_Id: p.Vatandas_Id || '',
                    Ad_Soyad: `${p.Ad} ${p.Soyad}`,
                    TCKN: p.TCKN
                  });
                  setIsModalOpen(true);
                }} className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg">
                  <Edit3 size={16}/>
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
