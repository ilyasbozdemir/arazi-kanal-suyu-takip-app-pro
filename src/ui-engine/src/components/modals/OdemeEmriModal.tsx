import React, { useRef } from 'react';
import { X, Printer, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OdemeEmriModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: {
    yevmiyeNo?: string;
    yevmiyeTarihi?: string;
    butceYili?: string;
    muhasebeBirimKodu?: string;
    muhasebeBirimAdi?: string;
    kurumAdi?: string;
    birimAdi?: string;
    yukleniciFirma?: string;
    yukleniciVergiNo?: string;
    yukleniciBankaSube?: string;
    yukleniciIban?: string;
    yukleniciVergiDairesi?: string;
    yukleniciAdres?: string;
    brutTutar?: number;
    damgaVergisi?: number;
    kdvTevkifat?: number;
    gelirVergisi?: number;
    aciklama?: string;
    odemeEmriBelgeNo?: string;
    kontrolEdenAdi?: string;
    kontrolEdenUnvan?: string;
    gerceklestirmeGorevlisiAdi?: string;
    gerceklestirmeGorevlisiUnvan?: string;
    olurKisiAdi?: string;
    olurKisiUnvan?: string;
    odeyinizKisiAdi?: string;
    odeyinizKisiUnvan?: string;
  };
}

export const OdemeEmriModal: React.FC<OdemeEmriModalProps> = ({
  isOpen,
  onClose,
  data = {}
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const butceYili = data.butceYili || new Date().getFullYear().toString();
  const yevmiyeTarihi = data.yevmiyeTarihi || new Date().toLocaleDateString('tr-TR');
  const yevmiyeNo = data.yevmiyeNo || 'YEV-' + Date.now().toString().slice(-6);
  const brutTutar = data.brutTutar || 0;
  const damgaVergisi = data.damgaVergisi || Math.round(brutTutar * 0.00948 * 100) / 100;
  const kdvTevkifat = data.kdvTevkifat || 0;
  const gelirVergisi = data.gelirVergisi || 0;
  const kesintiToplam = damgaVergisi + kdvTevkifat + gelirVergisi;
  const netOdenen = brutTutar - kesintiToplam;

  const formatTL = (val: number) => {
    const parts = val.toFixed(2).split('.');
    return {
      tl: new Intl.NumberFormat('tr-TR').format(parseInt(parts[0], 10)),
      kr: parts[1] || '00'
    };
  };

  const brutSplit = formatTL(brutTutar);
  const damgaSplit = formatTL(damgaVergisi);
  const kesintiSplit = formatTL(kesintiToplam);
  const netSplit = formatTL(netOdenen);

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10 my-8"
        >
          {/* Header Controls (No Print) */}
          <div className="p-6 bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between no-print">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="font-black text-slate-800 dark:text-white uppercase italic text-sm">Resmi Ödeme Emri Belgesi</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Strateji ve Bütçe Başkanlığı Standart A4 Şablonu</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handlePrint}
                className="flex items-center gap-2 px-5 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl font-black text-xs uppercase shadow-lg shadow-primary-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                <Printer size={16} /> Resmi Yazdır (A4)
              </button>
              <button 
                onClick={onClose}
                className="p-3 hover:bg-slate-200 dark:hover:bg-white/10 rounded-2xl transition-all text-slate-500"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Printable HTML Container */}
          <div className="p-8 overflow-y-auto max-h-[75vh] bg-white text-black" ref={printRef}>
            <style>{`
              @media print {
                body * { visibility: hidden; }
                #odeme-emri-print-area, #odeme-emri-print-area * { visibility: visible; }
                #odeme-emri-print-area { position: absolute; left: 0; top: 0; width: 100%; font-size: 8.5pt; color: #000; font-family: 'Times New Roman', Times, serif; }
                .no-print { display: none !important; }
              }
            `}</style>

            <div id="odeme-emri-print-area" className="font-serif text-[9.5pt] leading-normal text-black bg-white p-2">
              {/* ÖDEME EMRİ DETAY TABLOSU */}
              <table className="w-full border-collapse border border-black text-[9pt] mb-3">
                <tbody>
                  <tr>
                    <td colSpan={10} className="text-center font-bold text-[11pt] p-2 border border-black uppercase bg-slate-50">
                      ÖDEME EMRİ BELGESİ
                    </td>
                  </tr>
                  <tr>
                    <td className="font-bold p-1 border border-black w-[18%]">Muhasebe Birim Kodu</td>
                    <td colSpan={4} className="p-1 border border-black">{data.muhasebeBirimKodu || '70151'}</td>
                    <td className="font-bold p-1 border border-black w-[12%]">Bütçe Yılı</td>
                    <td className="p-1 border border-black w-[12%]">{butceYili}</td>
                    <td rowSpan={6} className="font-bold text-[8pt] text-center bg-gray-50 p-1 border border-black w-[2%] leading-tight italic">
                      İ<br />L<br />G<br />İ<br />L<br />İ<br />N<br />İ<br />N
                    </td>
                    <td className="font-bold p-1 border border-black w-[16%]">Adı, Soyadı / Ünvanı</td>
                    <td className="p-1 border border-black font-bold w-[24%]">{data.yukleniciFirma || 'SİSTEM İLGİLİSİ'}</td>
                  </tr>
                  <tr>
                    <td className="font-bold p-1 border border-black">Muhasebe Birim Adı</td>
                    <td colSpan={4} className="p-1 border border-black">{data.muhasebeBirimAdi || 'Mali Hizmetler Müdürü'}</td>
                    <td className="font-bold p-1 border border-black">Yevmiye Tarihi</td>
                    <td className="p-1 border border-black">{yevmiyeTarihi}</td>
                    <td className="font-bold p-1 border border-black">T.C. / Vergi No</td>
                    <td className="p-1 border border-black">{data.yukleniciVergiNo || '00000000000'}</td>
                  </tr>
                  <tr>
                    <td rowSpan={2} className="font-bold p-1 border border-black text-center align-middle">Kurum-Birim Kodu</td>
                    <td className="font-bold text-center text-[7.5pt] p-0.5 border border-black">İl</td>
                    <td className="font-bold text-center text-[7.5pt] p-0.5 border border-black">İlçe</td>
                    <td className="font-bold text-center text-[7.5pt] p-0.5 border border-black">Kurum</td>
                    <td className="font-bold text-center text-[7.5pt] p-0.5 border border-black">Birim</td>
                    <td className="font-bold p-1 border border-black">Yevmiye No.su</td>
                    <td className="p-1 border border-black">{yevmiyeNo}</td>
                    <td className="font-bold p-1 border border-black">Banka Şube Adı</td>
                    <td className="p-1 border border-black">{data.yukleniciBankaSube || 'Merkez Şubesi'}</td>
                  </tr>
                  <tr>
                    <td className="text-center p-1 border border-black">70</td>
                    <td className="text-center p-1 border border-black">01</td>
                    <td className="text-center p-1 border border-black">70151</td>
                    <td className="text-center p-1 border border-black">01</td>
                    <td colSpan={2} className="bg-slate-50 border border-black">&nbsp;</td>
                    <td className="font-bold p-1 border border-black">Banka Hesap No (IBAN)</td>
                    <td className="p-1 border border-black font-mono text-[8pt]">{data.yukleniciIban || 'TR00 0000 0000 0000 0000 0000 00'}</td>
                  </tr>
                  <tr>
                    <td className="font-bold p-1 border border-black">Kurum Adı</td>
                    <td colSpan={6} className="p-1 border border-black">{data.kurumAdi || 'KURUM BAŞKANLIĞI'}</td>
                    <td className="font-bold p-1 border border-black">Bağlı Olduğu V. Dairesi</td>
                    <td className="p-1 border border-black">{data.yukleniciVergiDairesi || 'Merkez Vergi Dairesi'}</td>
                  </tr>
                  <tr>
                    <td className="font-bold p-1 border border-black">Birim Adı</td>
                    <td colSpan={6} className="p-1 border border-black">{data.birimAdi || 'Strateji ve Bütçe Birimi'}</td>
                    <td className="font-bold p-1 border border-black">Adresi</td>
                    <td className="p-1 border border-black">{data.yukleniciAdres || 'Merkez Yerleşkesi'}</td>
                  </tr>
                </tbody>
              </table>

              {/* HESAP KODLARI VE TUTARLAR TABLOSU */}
              <table className="w-full border-collapse border border-black text-[8.5pt] mt-2 mb-3">
                <tbody>
                  <tr className="bg-rose-50 font-bold text-center">
                    <td rowSpan={2} className="border border-black p-1">Hesap<br />No</td>
                    <td colSpan={4} rowSpan={2} className="border border-black p-1">Kurumsal Kod</td>
                    <td colSpan={4} rowSpan={2} className="border border-black p-1">Fonksiyonel Kod</td>
                    <td rowSpan={2} className="border border-black p-1">Fin<br />Kod</td>
                    <td colSpan={4} rowSpan={2} className="border border-black p-1">Ekonomik Kod</td>
                    <td colSpan={4} className="border border-black p-1">Tutar</td>
                    <td className="border border-black p-1">Hesap / Ayrıntı Adı</td>
                  </tr>
                  <tr className="bg-rose-50 font-bold text-center">
                    <td colSpan={2} className="border border-black p-1">Borç</td>
                    <td colSpan={2} className="border border-black p-1">Alacak</td>
                    <td className="border border-black p-1">&nbsp;</td>
                  </tr>
                  <tr className="bg-rose-50 text-[7.5pt] text-center">
                    <td className="border border-black">&nbsp;</td>
                    <td className="border border-black">1</td><td className="border border-black">2</td><td className="border border-black">3</td><td className="border border-black">4</td>
                    <td className="border border-black">1</td><td className="border border-black">2</td><td className="border border-black">3</td><td className="border border-black">4</td>
                    <td className="border border-black">1</td>
                    <td className="border border-black">1</td><td className="border border-black">2</td><td className="border border-black">3</td><td className="border border-black">4</td>
                    <td className="border border-black w-[8%]">TL</td><td className="border border-black w-[3%]">kr</td>
                    <td className="border border-black w-[8%]">TL</td><td className="border border-black w-[3%]">kr</td>
                    <td className="border border-black">&nbsp;</td>
                  </tr>

                  {/* ROW 1: 830 Bütçe Gideri */}
                  <tr>
                    <td className="text-center border border-black p-1">830</td>
                    <td className="text-center border border-black p-1">70</td><td className="text-center border border-black p-1">01</td><td className="text-center border border-black p-1">__</td><td className="text-center border border-black p-1">__</td>
                    <td className="text-center border border-black p-1">01</td><td className="text-center border border-black p-1">3</td><td className="text-center border border-black p-1">9</td><td className="text-center border border-black p-1">00</td>
                    <td className="text-center border border-black p-1">1</td>
                    <td className="text-center border border-black p-1">03</td><td className="text-center border border-black p-1">5</td><td className="text-center border border-black p-1">1</td><td className="text-center border border-black p-1">90</td>
                    <td className="text-right font-bold border border-black p-1">{brutSplit.tl}</td>
                    <td className="text-right border border-black p-1">{brutSplit.kr}</td>
                    <td className="text-center border border-black p-1">&nbsp;</td>
                    <td className="text-center border border-black p-1">&nbsp;</td>
                    <td className="text-[8pt] border border-black p-1">{data.aciklama || 'Sulama Hizmet Üretim Bütçe Gideri'}</td>
                  </tr>

                  {/* ROW 2: 360 Damga Vergisi */}
                  <tr>
                    <td className="text-center border border-black p-1">360</td>
                    <td className="text-center border border-black p-1">70</td><td className="text-center border border-black p-1">01</td><td className="text-center border border-black p-1">__</td><td className="text-center border border-black p-1">__</td>
                    <td className="text-center border border-black p-1">&nbsp;</td><td className="text-center border border-black p-1">&nbsp;</td><td className="text-center border border-black p-1">&nbsp;</td><td className="text-center border border-black p-1">&nbsp;</td>
                    <td className="text-center border border-black p-1">&nbsp;</td>
                    <td className="text-center border border-black p-1">1</td><td className="text-center border border-black p-1">5</td><td className="text-center border border-black p-1">1</td><td className="text-center border border-black p-1">1</td>
                    <td className="text-center border border-black p-1">&nbsp;</td><td className="text-center border border-black p-1">&nbsp;</td>
                    <td className="text-right font-bold border border-black p-1">{damgaSplit.tl}</td>
                    <td className="text-right border border-black p-1">{damgaSplit.kr}</td>
                    <td className="text-[8pt] border border-black p-1">Damga Vergisi Kesintisi (Binde 9.48)</td>
                  </tr>

                  {/* ROW 3: 835 Gider Yansıtma */}
                  <tr>
                    <td className="text-center border border-black p-1">835</td>
                    <td className="text-center border border-black p-1">70</td><td className="text-center border border-black p-1">01</td><td className="text-center border border-black p-1">__</td><td className="text-center border border-black p-1">__</td>
                    <td className="text-center border border-black p-1">&nbsp;</td><td className="text-center border border-black p-1">&nbsp;</td><td className="text-center border border-black p-1">&nbsp;</td><td className="text-center border border-black p-1">&nbsp;</td>
                    <td className="text-center border border-black p-1">&nbsp;</td>
                    <td className="text-center border border-black p-1">&nbsp;</td><td className="text-center border border-black p-1">&nbsp;</td><td className="text-center border border-black p-1">&nbsp;</td><td className="text-center border border-black p-1">&nbsp;</td>
                    <td className="text-right font-bold border border-black p-1">{brutSplit.tl}</td>
                    <td className="text-right border border-black p-1">{brutSplit.kr}</td>
                    <td className="text-center border border-black p-1">&nbsp;</td><td className="text-center border border-black p-1">&nbsp;</td>
                    <td className="text-[8pt] border border-black p-1">Gider Yansıtma Hesabı</td>
                  </tr>

                  {/* ROW 4: 805 Gelir Yansıtma */}
                  <tr>
                    <td className="text-center border border-black p-1">805</td>
                    <td className="text-center border border-black p-1">70</td><td className="text-center border border-black p-1">01</td><td className="text-center border border-black p-1">__</td><td className="text-center border border-black p-1">__</td>
                    <td className="text-center border border-black p-1">&nbsp;</td><td className="text-center border border-black p-1">&nbsp;</td><td className="text-center border border-black p-1">&nbsp;</td><td className="text-center border border-black p-1">&nbsp;</td>
                    <td className="text-center border border-black p-1">&nbsp;</td>
                    <td className="text-center border border-black p-1">&nbsp;</td><td className="text-center border border-black p-1">&nbsp;</td><td className="text-center border border-black p-1">&nbsp;</td><td className="text-center border border-black p-1">&nbsp;</td>
                    <td className="text-center border border-black p-1">&nbsp;</td><td className="text-center border border-black p-1">&nbsp;</td>
                    <td className="text-right font-bold border border-black p-1">{brutSplit.tl}</td>
                    <td className="text-right border border-black p-1">{brutSplit.kr}</td>
                    <td className="text-[8pt] border border-black p-1">Gelir Yansıtma Hesabı</td>
                  </tr>

                  {/* TOPLAM */}
                  <tr className="font-bold">
                    <td colSpan={14} className="text-right border border-black p-1">TOPLAM</td>
                    <td className="text-right border border-black p-1">{brutSplit.tl}</td>
                    <td className="text-right border border-black p-1">{brutSplit.kr}</td>
                    <td className="text-right border border-black p-1">{kesintiSplit.tl}</td>
                    <td className="text-right border border-black p-1">{kesintiSplit.kr}</td>
                    <td className="border border-black p-1">&nbsp;</td>
                  </tr>

                  <tr className="font-bold">
                    <td colSpan={14} className="text-right border border-black p-1">Bütçe Gideri Tahakkuk Toplam</td>
                    <td className="text-right border border-black p-1">{brutSplit.tl}</td>
                    <td className="text-right border border-black p-1">{brutSplit.kr}</td>
                    <td className="text-right border border-black p-1">0</td>
                    <td className="text-right border border-black p-1">00</td>
                    <td className="border border-black p-1">&nbsp;</td>
                  </tr>

                  <tr>
                    <td colSpan={19} className="p-2 font-bold border border-black">
                      Yukarıda Yazılı; {brutSplit.tl} TL {brutSplit.kr} kr. Bütçe Gideri Tahakkuk Ettirilmiştir. Ödenmesi / Mahsubu Gerekir.
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* KONTROL VE TAHAKKUK ÖZET TABLOSU */}
              <table className="w-full border-collapse border border-black text-[8.5pt] mb-3">
                <tbody>
                  <tr className="font-bold text-center border border-black">
                    <td className="p-1 border border-black">Öd. Emri<br />Belgesi No</td>
                    <td colSpan={2} className="p-1 border border-black">Bütçe Giderleri<br />Tahakkuk Topl.</td>
                    <td colSpan={2} className="p-1 border border-black">Özel Gider<br />İndirimi Top.</td>
                    <td colSpan={2} className="p-1 border border-black">Kesinti<br />Toplamı</td>
                    <td colSpan={2} className="p-1 border border-black">Ödenmesi<br />Gereken</td>
                    <td className="p-1 border border-black">Çek-Gönderme<br />Emri No</td>
                    <td rowSpan={3} className="align-top p-2 text-left w-[40%] border border-black">
                      Kontrol Edilmiş ve Uygun Görülmüştür.<br /><br />
                      Tarih: {yevmiyeTarihi}<br /><br />
                      İmza / Ad Soyad : <span className="font-bold">{data.kontrolEdenAdi || '...................'}</span><br />
                      Unvan : {data.kontrolEdenUnvan || 'Mali Hizmetler Müdürü'}
                    </td>
                  </tr>
                  <tr className="text-center border border-black">
                    <td rowSpan={2} className="align-middle border border-black">{data.odemeEmriBelgeNo || 'OEM-2026/001'}</td>
                    <td className="font-bold w-[10%] border border-black">TL</td><td className="w-[3%] border border-black">kr</td>
                    <td className="font-bold w-[10%] border border-black">TL</td><td className="w-[3%] border border-black">kr</td>
                    <td className="font-bold w-[10%] border border-black">TL</td><td className="w-[3%] border border-black">kr</td>
                    <td className="font-bold w-[10%] border border-black">TL</td><td className="w-[3%] border border-black">kr</td>
                    <td rowSpan={2} className="align-middle border border-black">................</td>
                  </tr>
                  <tr className="text-center font-bold border border-black">
                    <td className="border border-black">{brutSplit.tl}</td><td className="border border-black">{brutSplit.kr}</td>
                    <td className="border border-black">0</td><td className="border border-black">00</td>
                    <td className="border border-black">{kesintiSplit.tl}</td><td className="border border-black">{kesintiSplit.kr}</td>
                    <td className="border border-black">{netSplit.tl}</td><td className="border border-black">{netSplit.kr}</td>
                  </tr>
                </tbody>
              </table>

              {/* OLUR / ONAY TABLOSU */}
              <table className="w-full border-collapse border border-black text-[8.5pt]">
                <tbody>
                  <tr className="text-center font-bold bg-slate-50 border border-black">
                    <td className="w-[33%] p-1 border border-black">GERÇEKLEŞTİRME GÖREVLİSİ</td>
                    <td className="w-[34%] p-1 border border-black">OLUR</td>
                    <td className="w-[33%] p-1 border border-black">ÖDEYİNİZ / MAHSUP EDİNİZ</td>
                  </tr>
                  <tr className="text-center h-[70px] border border-black">
                    <td className="align-top p-2 text-left border border-black">
                      Yukarıdaki giderlerin kabulleri yapılmış olup ödenmesi uygundur.<br /><br />
                      Ad Soyad: <span className="font-bold">{data.gerceklestirmeGorevlisiAdi || '...................'}</span><br />
                      Unvan: {data.gerceklestirmeGorevlisiUnvan || 'Harcama Yetkilisi'}
                    </td>
                    <td className="align-top p-2 text-left border border-black">
                      Tarih: {yevmiyeTarihi}<br /><br />
                      İmza / Ad Soyad : <span className="font-bold">{data.olurKisiAdi || '...................'}</span><br />
                      Unvan : {data.olurKisiUnvan || 'Mali Hizmetler Müdürü'}
                    </td>
                    <td className="align-top p-2 text-left border border-black">
                      Ad Soyad: <span className="font-bold">{data.odeyinizKisiAdi || '...................'}</span><br />
                      Unvan: {data.odeyinizKisiUnvan || 'Kurum Başkanı / Harcama Yetkilisi'}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="p-2 font-bold text-[9pt] border border-black">
                      Yalnız; {netSplit.tl} TL {netSplit.kr} kr. Ödenmiştir / Mahsup Edilmiştir.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
