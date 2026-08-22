import React from 'react';
import { AlertCircle, ShieldCheck, CreditCard } from 'lucide-react';

interface InsightsProps {
  kasalar: any[];
  onAddKasa?: () => void;
}

export const AccountingInsights: React.FC<InsightsProps> = ({ kasalar, onAddKasa }) => {
  const hasLowBalance = kasalar.some(k => (k.Bakiye || 0) <= 0);
  const hasZimmetRisk = kasalar.some(k => !k.Zimmet_id);

  return (
    <div className="flex gap-4">
      {kasalar.length === 0 && (
        <div className="flex-1 bg-amber-500/10 border border-amber-500/20 rounded-3xl p-5 flex items-start gap-4 animate-pulse">
          <div className="p-2 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-500/30">
            <AlertCircle size={20} />
          </div>
          <div>
            <h4 className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Kritik Uyarı: Kasa Tanımsız</h4>
            <p className="text-[10px] text-amber-600 mt-1 font-bold">HENÜZ TANIMLI BİR KASA YOK! TAHSİLAT YAPILAMAZ. LÜTFEN İLK KASANIZI TANIMLAYARAK SÜRECİ BAŞLATIN.</p>
            {onAddKasa && (
              <button 
                onClick={onAddKasa}
                className="mt-3 px-4 py-2 bg-amber-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
              >
                SÜRECİ BAŞLAT
              </button>
            )}
          </div>
        </div>
      )}

      {kasalar.length > 0 && hasLowBalance && (
        <div className="flex-1 bg-blue-500/10 border border-blue-500/20 rounded-3xl p-5 flex items-start gap-4">
          <div className="p-2 bg-blue-500 text-white rounded-xl shadow-lg">
            <AlertCircle size={16} />
          </div>
          <div>
            <h4 className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Düşük Nakit Bakiyesi</h4>
            <p className="text-[10px] text-blue-600 mt-1">Sıfır bakiyeli kasalar tespit edildi.</p>
          </div>
        </div>
      )}
      
      {hasZimmetRisk && (
        <div className="flex-1 bg-rose-500/10 border border-rose-500/20 rounded-3xl p-5 flex items-start gap-4">
          <div className="p-2 bg-rose-500 text-white rounded-xl shadow-lg">
            <ShieldCheck size={16} />
          </div>
          <div>
            <h4 className="text-[10px] font-black text-rose-800 uppercase tracking-widest">Denetim Riski</h4>
            <p className="text-[10px] text-rose-600 mt-1">Sorumlu atanmamış kasalar denetim dışıdır.</p>
          </div>
        </div>
      )}

      <div className="flex-1 bg-primary-500/10 border border-primary-500/20 rounded-3xl p-5 flex items-start gap-4">
        <div className="p-2 bg-primary-500 text-white rounded-xl shadow-lg">
          <CreditCard size={16} />
        </div>
        <div>
          <h4 className="text-[10px] font-black text-primary-800 uppercase tracking-widest">Kredi Kartı Nizamı</h4>
          <p className="text-[10px] text-primary-600 mt-1">Kredi kartı tahsilatları sanal havuzda kaydedilir.</p>
        </div>
      </div>
    </div>
  );
};
