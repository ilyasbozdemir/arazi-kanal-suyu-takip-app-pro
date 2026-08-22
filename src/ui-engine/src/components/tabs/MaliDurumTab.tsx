import React, { useState } from 'react';
import { FileText, Landmark, TrendingDown, TrendingUp } from 'lucide-react';
import { AccrualsTab } from './AccrualsTab';
import { CollectionsTab } from './CollectionsTab';

interface MaliDurumTabProps {
  profileData: any;
  values?: any;
  citizen?: { id?: string; Ad?: string; Soyad?: string; TCKN?: string };
  onPay?: (tahakkuk: any) => void;
  onAddDebt?: () => void;
}

export const MaliDurumTab: React.FC<MaliDurumTabProps> = ({ profileData, values, citizen, onPay, onAddDebt }) => {
  const [innerTab, setInnerTab] = useState<'tahakkuk' | 'tahsilat'>('tahakkuk');

  const totalTahakkuk = (profileData?.tahakkuk || []).reduce(
    (sum: number, t: any) => sum + (Number(t.Toplam_Tutar || t.Miktar) || 0), 0
  );
  const totalDebt = Math.max(0, (profileData?.tahakkuk || []).reduce(
    (sum: number, t: any) => sum + (Number(t.Kalan_Borc) || 0), 0
  ));
  const totalTahsilat = Math.max(0, totalTahakkuk - totalDebt);

  return (
    <div className="space-y-6">
      {/* 🏛️ Özet Şerit */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[28px] border border-slate-100 dark:border-white/5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center shrink-0">
            <FileText size={22} />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">TOPLAM TAHAKKUK</p>
            <p className="text-lg font-black text-slate-800 dark:text-white tabular-nums">
              {totalTahakkuk.toLocaleString('tr-TR')} <span className="text-sm text-slate-400 font-bold">₺</span>
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-[28px] border border-slate-100 dark:border-white/5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center shrink-0">
            <TrendingUp size={22} />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">TOPLAM TAHSİLAT</p>
            <p className="text-lg font-black text-slate-800 dark:text-white tabular-nums">
              {totalTahsilat.toLocaleString('tr-TR')} <span className="text-sm text-slate-400 font-bold">₺</span>
            </p>
          </div>
        </div>

        <div className={`p-6 rounded-[28px] border shadow-sm flex items-center gap-4 ${
          totalDebt > 0
            ? 'bg-rose-50 dark:bg-rose-500/5 border-rose-100 dark:border-rose-500/10'
            : 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/10'
        }`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            totalDebt > 0 ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
          }`}>
            <TrendingDown size={22} />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">KALAN BORÇ</p>
            <p className={`text-lg font-black tabular-nums ${totalDebt > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {totalDebt.toLocaleString('tr-TR')} <span className="text-sm font-bold opacity-60">₺</span>
            </p>
          </div>
        </div>
      </div>

      {/* 🗂️ İç Tab Sistemi */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
        {/* İç Tab Bar */}
        <div className="flex items-center gap-0 border-b border-slate-100 dark:border-white/5 px-6 pt-4">
          <button
            onClick={() => setInnerTab('tahakkuk')}
            className={`flex items-center gap-2.5 px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-t-2xl transition-all relative ${
              innerTab === 'tahakkuk'
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                : 'text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/5'
            }`}
          >
            <FileText size={13} />
            TAHAKKUKLAR
            {(profileData?.tahakkuk?.length > 0) && (
              <span className={`px-2 py-0.5 rounded-full text-[8px] font-black ${
                innerTab === 'tahakkuk' ? 'bg-white/20 text-white' : 'bg-indigo-500/10 text-indigo-500'
              }`}>
                {profileData.tahakkuk.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setInnerTab('tahsilat')}
            className={`flex items-center gap-2.5 px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-t-2xl transition-all ${
              innerTab === 'tahsilat'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/5'
            }`}
          >
            <Landmark size={13} />
            TAHSİLATLAR
            {(profileData?.tahsilatlar?.length > 0) && (
              <span className={`px-2 py-0.5 rounded-full text-[8px] font-black ${
                innerTab === 'tahsilat' ? 'bg-white/20 text-white' : 'bg-emerald-500/10 text-emerald-500'
              }`}>
                {profileData.tahsilatlar.length}
              </span>
            )}
          </button>

          {/* Sağa yaslı: TAHSİLAT YAP butonu */}
          {innerTab === 'tahakkuk' && (
            <div className="ml-auto mb-1">
              <button
                onClick={() => onAddDebt?.()}
                className="px-6 py-2 bg-indigo-500 text-white font-black rounded-2xl shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all text-[9px] tracking-widest uppercase flex items-center gap-2"
              >
                <FileText size={14} /> MANUEL BORÇ EKLE
              </button>
            </div>
          )}
          {innerTab === 'tahsilat' && totalDebt > 0 && (
            <div className="ml-auto mb-1">
              <button
                onClick={() => {
                  const firstDebt = profileData?.tahakkuk?.find((t: any) => t.Kalan_Borc > 0);
                  onPay?.(firstDebt || null);
                }}
                className="px-6 py-2 bg-emerald-500 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all text-[9px] tracking-widest uppercase flex items-center gap-2"
              >
                <Landmark size={14} /> TAHSİLAT YAP
              </button>
            </div>
          )}
        </div>

        {/* İç Tab İçeriği */}
        <div className="p-6">
          {innerTab === 'tahakkuk' && (
            <AccrualsTab profileData={profileData} onPay={onPay} owners={profileData?.owners || []} citizen={citizen} />
          )}
          {innerTab === 'tahsilat' && (
            <CollectionsTab profileData={profileData} />
          )}
        </div>
      </div>
    </div>
  );
};
