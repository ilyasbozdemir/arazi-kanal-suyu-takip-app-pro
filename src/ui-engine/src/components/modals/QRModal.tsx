import { ExternalLink, QrCode, X } from "lucide-react";

export const QRModal = ({ isOpen, onClose, title, data, type }: { isOpen: boolean, onClose: () => void, title: string, data: string, type: 'tel' | 'wp' | 'mail' | 'search' }) => {
   if (!isOpen) return null;

   let qrData = data;
   if (type === 'tel' || type === 'wp') {
      const digits = data.replace(/\D/g, '');
      let cleanPhone = digits;
      if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
      if (cleanPhone.startsWith('90')) cleanPhone = cleanPhone.substring(2);
      if (type === 'tel') qrData = `tel:+90${cleanPhone}`;
      if (type === 'wp') qrData = `https://wa.me/90${cleanPhone}`;
   }
   if (type === 'mail') qrData = `mailto:${data}`;
   if (type === 'search') qrData = data; // TCKN or Profile ID

   const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;

   return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
         <div className="bg-white dark:bg-slate-900 p-12 rounded-[64px] border border-white/10 shadow-2xl max-w-md w-full text-center space-y-8 animate-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center mb-4">
               <div className="p-4 bg-primary-500/10 text-primary-500 rounded-3xl"><QrCode size={32} /></div>
               <button onClick={onClose} title="Kapat" className="p-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <div className="space-y-2">
               <h3 className="text-3xl font-black uppercase italic tracking-tighter">{title}</h3>
               <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">TELEFONUNUZUN KAMERASI İLE KAREKODU TARATIN</p>
            </div>
            <div className="p-8 bg-white rounded-[48px] shadow-inner border-8 border-slate-50">
               <img src={qrUrl} alt="QR Code" className="w-full aspect-square" />
            </div>
            <div className="flex flex-col gap-3">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">
                  Bu karekod, yüksek güvenlikli veri protokolleri ile oluşturulmuştur. {title.toLowerCase()} işlemi için kameranızı doğrultmanız yeterlidir.
               </p>
               <a href={qrData} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-4 bg-slate-100 dark:bg-white/5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-500 hover:text-white transition-all">
                  <ExternalLink size={14} /> VEYA BURAYA TIKLAYIN
               </a>
            </div>
         </div>
      </div>
   );
};
