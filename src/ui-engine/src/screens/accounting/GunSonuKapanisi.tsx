import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, ArrowRightLeft, Lock, ChevronRight, ChevronLeft, Scale, DollarSign, CreditCard } from 'lucide-react';
import { ElectronService } from '../../services/ElectronService';

interface Props {
  kasalar: any[];
  personel: any[];
  onDone: () => void;
}

const STEPS = ['Fiziki Sayım', 'Mutabakat', 'Fark İşlemi', 'Virman Kontrolü', 'Kapanış'];

export const GunSonuKapanisi: React.FC<Props> = ({ kasalar, personel, onDone }) => {
  const [step, setStep] = useState(0);
  const [sayimlar, setSayimlar] = useState<Record<string, { nakit: number, pos: number }>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [kapanisYapildi, setKapanisYapildi] = useState(false);

  const fmt = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);
  const bugun = new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // 🛡️ SADECE ZİMMETLİ KASALARDA İŞLEM YAP (Sistem kasalarını sayıma sokma)
  const zimmetliKasalar = kasalar.filter(k => k.Zimmet_id);

  // 🛡️ NAKİT VE POS AYRIMI (İDARİ USUL)
  const farklar = zimmetliKasalar.map(k => {
    const sistemNakit = k.Bakiye || 0;
    const sistemPos = k.Pos_Bakiye || 0; 
    
    const fizikiNakit = sayimlar[k.id]?.nakit ?? sistemNakit;
    const fizikiPos = sayimlar[k.id]?.pos ?? sistemPos;
    
    const farkNakit = fizikiNakit - sistemNakit;
    const farkPos = fizikiPos - sistemPos;
    
    return { ...k, sistemNakit, sistemPos, fizikiNakit, fizikiPos, farkNakit, farkPos };
  });

  const toplamFark = farklar.reduce((s, f) => s + f.farkNakit + f.farkPos, 0);

  const handleKapama = async () => {
    setIsProcessing(true);
    try {
      const tarih = new Date().toISOString();
      const anaKasa = kasalar.find(k => k.Sistem_Verisi === 1 || k.Kasa_Adi.toLocaleUpperCase('tr-TR').includes('ANA') || k.Kasa_Adi.toLocaleUpperCase('tr-TR').includes('KURUM') || k.Kasa_Adi.toLocaleUpperCase('tr-TR').includes('MERKEZ'));

      if (!anaKasa) {
         throw new Error("KURUM ANA TAHSİLAT KASASI bulunamadı! Gün sonu devri yapılamaz.");
      }

      for (const k of farklar) {
        // 📊 Z-RAPORU KAYDI (RESMİ ARŞİV)
        const zRaporId = crypto.randomUUID();
        await ElectronService.saveRecord('MUHASEBE_Z_Raporu', {
          id: zRaporId,
          Rapor_No: `Z-${k.id.split('-')[0]}-${Date.now()}`,
          Tarih: tarih,
          Kasa_id: k.id,
          Veznedar_id: k.Zimmet_id,
          Sistem_Nakit: k.sistemNakit,
          Sistem_Pos: k.sistemPos,
          Fiziki_Nakit: k.fizikiNakit,
          Fiziki_Pos: k.fizikiPos,
          Fark_Nakit: k.farkNakit,
          Fark_Pos: k.farkPos,
          Toplam_Ciro: k.fizikiNakit + k.fizikiPos,
          Aciklama: `GÜN SONU KAPANIŞI — ${k.Kasa_Adi} | Toplam Fark: ${fmt(k.farkNakit + k.farkPos)}`
        });

        // 🛡️ NOKSAN VARSA BORÇLANDIRMA (YENİ GÜVENLİK PROTOKOLÜ)
        const toplamFarkKasa = k.farkNakit + k.farkPos;
        if (toplamFarkKasa < 0 && k.Zimmet_id) {
           const sorumlu = personel.find(p => p.id === k.Zimmet_id);
           if (sorumlu && sorumlu.Vatandas_Id) {
              const borcTutari = Math.abs(toplamFarkKasa);
              await ElectronService.saveRecord('MUHASEBE_Tahakkuk', {
                id: crypto.randomUUID(),
                Vatandas_Id: sorumlu.Vatandas_Id,
                Fis_id: zRaporId,
                Miktar: borcTutari,
                Tarih: tarih,
                Tur: 'GÜN_SONU_NOKSANI',
                Aciklama: `${k.Kasa_Adi} — GÜN SONU KASADA NOKSAN TESPİTİ (${fmt(borcTutari)})`,
                Durum: 'Bekliyor'
              });
              console.log(`[MUHASEBE] Kasa noksanı için borçlandırma yapıldı: ${sorumlu.Ad_Soyad} -> ${fmt(borcTutari)}`);
           }
        }

        // 🛡️ ANA KASAYA DEVİR İŞLEMİ (VİRMAN - NAKİT VE POS)
        if (k.id !== anaKasa.id) {
           const nakitDevir = k.fizikiNakit;
           const posDevir = k.fizikiPos;
           
           if (nakitDevir > 0 || posDevir > 0) {
              // 1. Mevcut Kasadan Çıkış (Veznedarın kasası sıfırlanır)
              await (window as any).electron.ipcRenderer.invoke('execute-raw-sql', `
                UPDATE TANIM_Kasalar SET Bakiye = 0, Pos_Bakiye = 0 WHERE id = ?
              `, [k.id]);

              // 2. Ana Kasaya Giriş (Nakit ve POS ayrı ayrı eklenir)
              await (window as any).electron.ipcRenderer.invoke('execute-raw-sql', `
                UPDATE TANIM_Kasalar SET Bakiye = COALESCE(Bakiye, 0) + ?, Pos_Bakiye = COALESCE(Pos_Bakiye, 0) + ? WHERE id = ?
              `, [nakitDevir, posDevir, anaKasa.id]);

              // 3. Virman Fişi (Nakit için)
              if (nakitDevir > 0) {
                await ElectronService.saveRecord('MUHASEBE_Fisler', {
                  id: crypto.randomUUID(),
                  Islem_Tarihi: tarih,
                  Fis_No: `VIR-N-${Date.now()}`,
                  Aciklama: `GÜN SONU NAKİT DEVİR: ${k.Kasa_Adi} -> ${anaKasa.Kasa_Adi}`,
                  Tutar: nakitDevir,
                  Kasa_id: k.id,
                  Tip: 'VİRMAN',
                  Odeme_Yontemi: 'NAKİT'
                });
              }

              // 4. Virman Fişi (Kredi Kartı / POS için)
              if (posDevir > 0) {
                await ElectronService.saveRecord('MUHASEBE_Fisler', {
                  id: crypto.randomUUID(),
                  Islem_Tarihi: tarih,
                  Fis_No: `VIR-P-${Date.now()}`,
                  Aciklama: `GÜN SONU KREDİ KARTI/POS DEVİR: ${k.Kasa_Adi} -> ${anaKasa.Kasa_Adi}`,
                  Tutar: posDevir,
                  Kasa_id: k.id,
                  Tip: 'VİRMAN',
                  Odeme_Yontemi: 'KREDİ KARTI'
                });
              }
           } else {
              // Devredilecek hiçbir şey yoksa bile kasayı garantiye alıp sıfırla
              await (window as any).electron.ipcRenderer.invoke('execute-raw-sql', `
                UPDATE TANIM_Kasalar SET Bakiye = 0, Pos_Bakiye = 0 WHERE id = ?
              `, [k.id]);
           }
        }
      }

      setKapanisYapildi(true);
      ElectronService.showAlert({ message: `Gün sonu kapanışı ve ana kasaya devir işlemi (Nakit ve POS) başarıyla tamamlandı.`, type: 'success' });
    } catch (e: any) {
      ElectronService.showAlert({ message: `Kapanış hatası: ${e.message}`, type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (kapanisYapildi) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[32px] p-16 text-center space-y-6 shadow-sm">
        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30">
          <CheckCircle2 size={40} className="text-white" />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Gün Sonu Kayıt Altına Alındı</h2>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{bugun}</p>
        <p className="text-[11px] text-slate-400">Tüm Nakit ve POS fişleri hiyerarşik düzen içerisinde oluşturulmuştur.</p>
        <button onClick={onDone} className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">
          Ana Panele Dön
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Adım Göstergesi */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[32px] p-6 shadow-sm">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 ${i <= step ? 'text-slate-800 dark:text-white' : 'text-slate-300 dark:text-slate-600'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  i < step ? 'bg-emerald-500 text-white' :
                  i === step ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' :
                  'bg-slate-100 dark:bg-white/5 text-slate-400'
                }`}>
                  {i < step ? <CheckCircle2 size={16} /> : i + 1}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-2 ${i < step ? 'bg-emerald-300' : 'bg-slate-100 dark:bg-white/5'}`} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[32px] overflow-hidden shadow-sm">

          <div className="p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex items-center gap-4">
            <div className="w-10 h-10 bg-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20">
              {step === 0 && <Scale size={18} className="text-white" />}
              {step === 1 && <CheckCircle2 size={18} className="text-white" />}
              {step === 2 && <AlertCircle size={18} className="text-white" />}
              {step === 3 && <ArrowRightLeft size={18} className="text-white" />}
              {step === 4 && <Lock size={18} className="text-white" />}
            </div>
            <div>
              <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tighter">{STEPS[step]}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{bugun}</p>
            </div>
          </div>

          <div className="p-8 overflow-y-auto max-h-[60vh] custom-scrollbar">
            {/* ADIM 1: FİZİKİ SAYIM */}
            {step === 0 && (
              <div className="space-y-4">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                   <p className="text-[11px] font-black text-amber-600 uppercase tracking-widest leading-relaxed">
                     <AlertCircle size={14} className="inline mr-1 mb-0.5" />
                     DİKKAT: Bugün içinde tekrar Z-Raporu alıyorsanız, lütfen KASADAKİ TÜM PARAYI DEĞİL, sadece BİR ÖNCEKİ Z-RAPORUNDAN SONRA YAPILAN YENİ TAHSİLATLARI (Yeni Nakit ve Yeni POS Sliplerini) giriniz. Aynı veriyi tekrar saydırmayınız!
                   </p>
                </div>
                {zimmetliKasalar.map(k => (
                  <div key={k.id} className="p-6 bg-slate-50 dark:bg-white/5 rounded-[32px] space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
                       <p className="font-black text-slate-800 dark:text-white uppercase text-sm italic">{k.Kasa_Adi}</p>
                       <div className="flex gap-4">
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Sistem Nakit: {fmt(k.Bakiye || 0)}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Sistem POS: {fmt(k.Pos_Bakiye || 0)}</p>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><DollarSign size={10} className="text-emerald-500"/> Fiziki Nakit (₺)</label>
                        <input
                          type="number"
                          placeholder={(k.Bakiye || 0).toString()}
                          value={sayimlar[k.id]?.nakit ?? ''}
                          onChange={e => setSayimlar(prev => ({ ...prev, [k.id]: { ...prev[k.id], nakit: parseFloat(e.target.value) || 0 } }))}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-white/10 rounded-xl text-lg font-black text-right outline-none focus:border-emerald-500 tabular-nums"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><CreditCard size={10} className="text-primary-500"/> POS Slip Toplamı (₺)</label>
                        <input
                          type="number"
                          placeholder={(k.Pos_Bakiye || 0).toString()}
                          value={sayimlar[k.id]?.pos ?? ''}
                          onChange={e => setSayimlar(prev => ({ ...prev, [k.id]: { ...prev[k.id], pos: parseFloat(e.target.value) || 0 } }))}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-white/10 rounded-xl text-lg font-black text-right outline-none focus:border-primary-500 tabular-nums"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ADIM 2: MUTABAKAT */}
            {step === 1 && (
              <div className="space-y-4">
                {farklar.map(k => (
                  <div key={k.id} className={`p-6 rounded-[32px] border-2 ${(k.farkNakit === 0 && k.farkPos === 0) ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20'}`}>
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-black text-slate-800 dark:text-white uppercase italic">{k.Kasa_Adi}</span>
                      {(k.farkNakit === 0 && k.farkPos === 0)
                        ? <span className="flex items-center gap-1 text-emerald-600 text-[10px] font-black uppercase tracking-widest"><CheckCircle2 size={14} /> TAM MUTABAKAT</span>
                        : <span className="flex items-center gap-1 text-rose-600 text-[10px] font-black uppercase tracking-widest"><AlertCircle size={14} /> FARK TESPİT EDİLDİ</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <p className="text-[9px] font-black text-slate-400 uppercase text-center tracking-widest">NAKİT ANALİZİ</p>
                          <div className="grid grid-cols-2 gap-4 text-center">
                             <div><p className="text-[8px] text-slate-400 font-black">Sistem</p><p className="text-sm font-black text-slate-800 dark:text-white">{fmt(k.sistemNakit)}</p></div>
                             <div><p className="text-[8px] text-slate-400 font-black">Fiziki</p><p className="text-sm font-black text-slate-800 dark:text-white">{fmt(k.fizikiNakit)}</p></div>
                          </div>
                          <p className={`text-center font-black text-xs ${k.farkNakit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>Fark: {k.farkNakit >= 0 ? '+' : ''}{fmt(k.farkNakit)}</p>
                       </div>
                       <div className="space-y-4 border-l border-slate-100 dark:border-white/5 pl-8">
                          <p className="text-[9px] font-black text-slate-400 uppercase text-center tracking-widest">POS ANALİZİ</p>
                          <div className="grid grid-cols-2 gap-4 text-center">
                             <div><p className="text-[8px] text-slate-400 font-black">Sistem</p><p className="text-sm font-black text-slate-800 dark:text-white">{fmt(k.sistemPos)}</p></div>
                             <div><p className="text-[8px] text-slate-400 font-black">Slip</p><p className="text-sm font-black text-slate-800 dark:text-white">{fmt(k.fizikiPos)}</p></div>
                          </div>
                          <p className={`text-center font-black text-xs ${k.farkPos >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>Fark: {k.farkPos >= 0 ? '+' : ''}{fmt(k.farkPos)}</p>
                       </div>
                    </div>
                  </div>
                ))}
                <div className={`p-4 rounded-2xl text-center ${toplamFark === 0 ? 'bg-emerald-500' : 'bg-rose-500'} text-white`}>
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-80">Toplam Net Fark</p>
                  <p className="text-2xl font-black tabular-nums">{toplamFark >= 0 ? '+' : ''}{fmt(toplamFark)}</p>
                </div>
              </div>
            )}

            {/* ADIM 3: FARK İŞLEMİ */}
            {step === 2 && (
              <div className="space-y-4">
                {farklar.filter(k => k.farkNakit !== 0 || k.farkPos !== 0).length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <CheckCircle2 size={48} className="mx-auto text-emerald-400" />
                    <p className="font-black text-slate-600 dark:text-slate-400 uppercase">Tüm birimler mutabık. Fark yok.</p>
                  </div>
                ) : (
                  farklar.filter(k => k.farkNakit !== 0 || k.farkPos !== 0).map(k => (
                    <div key={k.id} className="p-6 rounded-2xl border bg-slate-50 dark:bg-white/5 border-slate-200">
                       <p className="font-black text-slate-800 dark:text-white uppercase italic">{k.Kasa_Adi}</p>
                       <div className="mt-2 space-y-1">
                          {k.farkNakit !== 0 && <p className={`text-[10px] font-black uppercase ${k.farkNakit > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>Nakit: {k.farkNakit > 0 ? 'FAZLA' : 'NOKSAN'} ({fmt(k.farkNakit)})</p>}
                          {k.farkPos !== 0 && <p className={`text-[10px] font-black uppercase ${k.farkPos > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>POS: {k.farkPos > 0 ? 'FAZLA' : 'NOKSAN'} ({fmt(k.farkPos)})</p>}
                       </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ADIM 4: VİRMAN KONTROLÜ */}
            {step === 3 && (
              <div className="space-y-4">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                  Tahsilat birimleri arasındaki sanal virman mutabakatı.
                </p>
                {kasalar.filter(k => k.Zimmet_id).map(k => {
                  const p = personel.find(x => x.id === k.Zimmet_id);
                  return (
                    <div key={k.id} className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-white/5 rounded-2xl">
                      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center"><ArrowRightLeft size={18} className="text-white" /></div>
                      <div className="flex-1">
                        <p className="font-black text-slate-800 dark:text-white uppercase text-sm">{k.Kasa_Adi}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Sorumlu: {p?.Ad_Soyad || '—'}</p>
                      </div>
                      <span className="font-black text-lg tabular-nums text-blue-600">{fmt(k.Bakiye || 0)}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ADIM 5: KAPANIŞ */}
            {step === 4 && (
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 bg-rose-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-rose-500/30">
                  <Lock size={28} className="text-white" />
                </div>
                <h4 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Günü Kapat</h4>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest max-w-sm mx-auto">
                  {bugun} tarihli gün sonu kapanışı resmi onay sürecine dahil edilecektir.
                </p>
                <button
                  onClick={handleKapama}
                  disabled={isProcessing}
                  className="w-full max-w-sm mx-auto py-4 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isProcessing ? 'İşleniyor...' : 'GÜNÜ KAPAT'}
                </button>
              </div>
            )}
          </div>

          {/* Navigasyon */}
          <div className="px-8 py-5 border-t border-slate-100 dark:border-white/5 flex justify-between">
            <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-xl font-black text-[10px] uppercase tracking-widest disabled:opacity-30 hover:bg-slate-200 transition-all">
              <ChevronLeft size={14} /> Geri
            </button>
            {step < STEPS.length - 1 && (
              <button onClick={() => setStep(s => s + 1)}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">
                İleri <ChevronRight size={14} />
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
