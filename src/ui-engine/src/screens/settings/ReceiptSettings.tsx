import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Book, X, RefreshCw, Activity, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ElectronService } from '../../services/ElectronService';

export const ReceiptSettings: React.FC = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [personel, setPersonel] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newBook, setNewBook] = useState({ defter_adi: '', baslangic_no: 1, bitis_no: 500, Sorumlu_Merav_id: '' });
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  
  const [selectedBookForReceipts, setSelectedBookForReceipts] = useState<any>(null);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [isReceiptsLoading, setIsReceiptsLoading] = useState(false);

  const loadBooks = async () => {
    setIsLoading(true);
    try {
      const res = await (window as any).electron.ipcRenderer.invoke('get-db-data', 'TANIM_Sulama_Fis_Kocanlari');
      if (res.success) setBooks(res.data || []);
      const pRes = await (window as any).electron.ipcRenderer.invoke('get-personnel');
      if (pRes.success) setPersonel(pRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReceipts = async (book: any) => {
    setSelectedBookForReceipts(book);
    setIsReceiptsLoading(true);
    try {
      const sql = `
        SELECT f.*, v.Ad || ' ' || v.Soyad as Vatandas_Ad_Soyad, v.TCKN as Vatandas_Id
        FROM DATA_Dagitim_Kayitlar f
        LEFT JOIN DATA_Vatandas v ON f.Vatandas_Id = v.id
        WHERE f.Makbuz_Defter_id = ? AND f.deleted_at IS NULL
        ORDER BY f.Tarih DESC
      `;
      const res = await (window as any).electron.ipcRenderer.invoke('execute-raw-sql', sql, [book.id]);
      if (res.success) setReceipts(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsReceiptsLoading(false);
    }
  };

  useEffect(() => { loadBooks(); }, []);

  const handleSaveBook = async () => {
    if (!newBook.defter_adi) return;
    if (newBook.bitis_no !== 0 && newBook.bitis_no <= newBook.baslangic_no) {
      ElectronService.showAlert({ message: 'Bitiş no, başlangıç nodan büyük olmalıdır.', type: 'error' });
      return;
    }
    
    let finalName = newBook.defter_adi.trim();
    if (!editingBookId) {
      let counter = 1;
      while(books.find(b => b.defter_adi.toLocaleUpperCase('tr-TR') === finalName.toLocaleUpperCase('tr-TR'))) {
          finalName = `${newBook.defter_adi.trim()} ${counter}`;
          counter++;
      }
    }

    const bookData = {
      ...newBook,
      id: editingBookId || window.crypto.randomUUID(),
      defter_adi: finalName,
      son_no: editingBookId ? undefined : (newBook.baslangic_no - 1),
      aktif: 1
    };

    const res = await ElectronService.saveRecord('TANIM_Sulama_Fis_Kocanlari', bookData);
    if (res.success) {
      setNewBook({ defter_adi: '', baslangic_no: 1, bitis_no: 500, Sorumlu_Merav_id: '' });
      setEditingBookId(null);
      loadBooks();
      ElectronService.showAlert({ message: editingBookId ? 'Defter bilgileri güncellendi.' : 'Makbuz defteri başarıyla eklendi.', type: 'success' });
    }
  };

  const startEdit = (book: any) => {
    setNewBook({
      defter_adi: book.defter_adi,
      baslangic_no: book.baslangic_no,
      bitis_no: book.bitis_no,
      Sorumlu_Merav_id: book.Sorumlu_Merav_id || ''
    });
    setEditingBookId(book.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setNewBook({ defter_adi: '', baslangic_no: 1, bitis_no: 500, Sorumlu_Merav_id: '' });
    setEditingBookId(null);
  };

  const handleDeleteBook = async (id: string) => {
    const countRes = await (window as any).electron.ipcRenderer.invoke('execute-raw-sql', 
      "SELECT COUNT(*) as total FROM DATA_Dagitim_Kayitlar WHERE Makbuz_Defter_id = ?", [id]
    );
    const totalUsedCount = countRes.success ? (countRes.data[0]?.total || 0) : 0;
    
    if (totalUsedCount > 0) {
      ElectronService.showAlert({ 
        message: `KRİTİK HATA: Bu defterden kesilmiş ${totalUsedCount} adet fiş bulunmaktadır. Mevzuat gereği silinemez!`, 
        type: 'error' 
      });
      return;
    }

    const confirm = await ElectronService.showConfirm({
      message: 'Bu makbuz defterini silmek istediğinize emin misiniz?',
      type: 'warning'
    });
    if (confirm) {
      const res = await ElectronService.deleteRecord('TANIM_Sulama_Fis_Kocanlari', id);
      if (res.success) loadBooks();
    }
  };

  const getMevcut = (book: any) => (book.son_no || book.baslangic_no - 1) + 1;
  const getKalan = (book: any) => {
    if (book.bitis_no === 0) return '∞';
    return Math.max(0, (book.bitis_no || 9999) - getMevcut(book) + 1);
  };
  const getDoluluk = (book: any) => {
    if (book.bitis_no === 0) return 0;
    const toplam = (book.bitis_no || 9999) - book.baslangic_no + 1;
    const kullanilan = getMevcut(book) - book.baslangic_no;
    return Math.min(100, Math.max(0, Math.round((kullanilan / toplam) * 100)));
  };

  return (
    <div className="space-y-8 p-8 relative">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
          <Book size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">Makbuz Defteri Tanımları</h3>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Başlangıç ve bitiş numarasıyla seri yönetin</p>
        </div>
      </div>

      <div className={`bg-slate-50 dark:bg-white/5 border-2 rounded-2xl p-6 transition-all ${editingBookId ? 'border-primary-500 shadow-xl shadow-primary-500/10' : 'border-slate-200 dark:border-white/10'}`}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {editingBookId ? 'Defter Bilgilerini Güncelle' : 'Yeni Defter / Seri Tanımla'}
          </p>
          {editingBookId && (
             <button onClick={cancelEdit} className="text-[9px] font-black uppercase text-rose-500 hover:bg-rose-50 px-3 py-1 rounded-lg transition-all">İPTAL ET</button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="defter_adi" className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Defter / Seri Adı</label>
            <input
              id="defter_adi"
              title="Defter Adı"
              type="text"
              placeholder="Örn: 2026 - DAĞITIM SERİ A"
              value={newBook.defter_adi}
              onChange={(e) => setNewBook({ ...newBook, defter_adi: e.target.value })}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold outline-none focus:border-primary-500 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="sorumlu_personel" className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sorumlu Tahsildar</label>
            <select
              id="sorumlu_personel"
              title="Sorumlu Personel Seçimi"
              value={newBook.Sorumlu_Merav_id}
              onChange={(e) => setNewBook({ ...newBook, Sorumlu_Merav_id: e.target.value })}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold outline-none focus:border-primary-500 transition-all"
            >
              <option value="">-- Seçiniz --</option>
              {personel.map(p => <option key={p.id} value={p.id}>{p.Ad_Soyad || p.Ad}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="baslangic_no" className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Başlangıç No</label>
            <input
              id="baslangic_no"
              title="Başlangıç Numarası"
              type="number"
              min="1"
              value={newBook.baslangic_no}
              onChange={(e) => setNewBook({ ...newBook, baslangic_no: parseInt(e.target.value) || 1 })}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold outline-none focus:border-primary-500 transition-all"
            />
          </div>
          <div className="space-y-2">
             <label htmlFor="bitis_no" className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bitiş No</label>
             <input
              id="bitis_no"
              title="Bitiş Numarası"
              type="number"
              min={newBook.baslangic_no + 1}
              value={newBook.bitis_no === 0 ? '' : newBook.bitis_no}
              placeholder="∞ SINIRSIZ"
              onChange={(e) => setNewBook({ ...newBook, bitis_no: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold outline-none focus:border-primary-500 transition-all"
            />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-[11px] text-slate-400 font-bold uppercase italic">
            Defter Aralığı: <span className="text-primary-500">{newBook.baslangic_no}</span> → <span className="text-primary-500">{newBook.bitis_no || '∞'}</span>
          </p>
          <button
            onClick={handleSaveBook}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg ${
              editingBookId ? 'bg-primary-500 text-white' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
            }`}
          >
            {editingBookId ? <RefreshCw size={16} /> : <Plus size={16} />}
            {editingBookId ? "BİLGİLERİ GÜNCELLE" : "DEFTER OLUŞTUR"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {books.map((book) => {
          const mevcut = getMevcut(book);
          const kalan = getKalan(book);
          const doluluk = getDoluluk(book);
          const isInfinite = book.bitis_no === 0;
          const bitti = !isInfinite && typeof kalan === 'number' && kalan <= 0;
          const sorumlu = personel.find(p => p.id === book.Sorumlu_Merav_id);

          return (
            <div key={book.id} className={`p-6 bg-white dark:bg-slate-800 border-2 rounded-2xl shadow-sm hover:shadow-md transition-all group ${bitti ? 'border-rose-300' : 'border-slate-100 dark:border-white/5'}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-primary-500 transition-colors">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{book.defter_adi}</h4>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${bitti ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {isInfinite ? 'SINIRSIZ SERİ' : bitti ? 'SERİ DOLDU' : 'AKTİF SERİ'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                   <button onClick={() => startEdit(book)} title="Düzenle" className="p-2 text-slate-300 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                     <Activity size={16} />
                   </button>
                   <button onClick={() => handleDeleteBook(book.id)} title="Sil" className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                     <Trash2 size={16} />
                   </button>
                </div>
              </div>

              {sorumlu && (
                 <div className="mb-4 p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                    <span className="text-[8px] font-black text-slate-400 block uppercase mb-0.5">Sorumlu Tahsildar</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase italic">{sorumlu.Ad_Soyad || sorumlu.Ad}</span>
                 </div>
              )}

              <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl text-center">
                  <span className="text-[8px] font-black text-slate-400 block uppercase">Başlangıç</span>
                  <span className="text-sm font-black text-slate-700 dark:text-slate-200">{book.baslangic_no}</span>
                </div>
                <div className="p-2.5 bg-primary-50 dark:bg-primary-500/10 rounded-xl text-center border border-primary-100 dark:border-primary-500/20">
                  <span className="text-[8px] font-black text-primary-400 block uppercase">Mevcut</span>
                  <span className="text-sm font-black text-primary-600">#{mevcut}</span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl text-center">
                  <span className="text-[8px] font-black text-slate-400 block uppercase">Bitiş</span>
                  <span className="text-sm font-black text-slate-700 dark:text-slate-200">{isInfinite ? '∞' : book.bitis_no}</span>
                </div>
              </div>

              <button
                onClick={() => loadReceipts(book)}
                className="w-full py-3 bg-slate-100 dark:bg-white/5 hover:bg-primary-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-200 dark:border-white/10 flex items-center justify-center gap-2 mb-4"
              >
                <Search size={14} /> Fişleri Listele
              </button>

              {!isInfinite && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase">
                    <span>Doluluk</span>
                    <span>{doluluk}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${doluluk}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${bitti ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedBookForReceipts && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md">
           <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[85vh]">
              <div className="px-10 py-8 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-500"><FileText size={24} /></div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">{selectedBookForReceipts.defter_adi} — Kayıtlar</h3>
                 </div>
                 <button 
                    title="Pencereyi Kapat"
                    onClick={() => setSelectedBookForReceipts(null)} 
                    className="p-3 bg-white dark:bg-white/5 rounded-2xl text-slate-400 hover:text-rose-500 transition-all border border-slate-200 dark:border-white/10 shadow-sm"
                 >
                    <X size={24} />
                 </button>
              </div>

              <div className="flex-1 overflow-auto p-10">
                 {isReceiptsLoading ? (
                   <div className="flex flex-col items-center justify-center py-20 gap-4"><RefreshCw size={40} className="text-primary-500 animate-spin" /><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Çekiliyor...</p></div>
                 ) : receipts.length > 0 ? (
                    <table className="w-full">
                       <thead>
                          <tr className="border-b border-slate-100 dark:border-white/5">
                             <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase">No</th>
                             <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase">Tarih</th>
                             <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase">Mükellef</th>
                             <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase">Tutar</th>
                          </tr>
                       </thead>
                       <tbody>
                          {receipts.map(r => (
                             <tr key={r.id} className="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                <td className="px-4 py-4 text-[13px] font-black text-primary-500">#{r.Makbuz_No || r.Makbuz_Sira_No}</td>
                                <td className="px-4 py-4 text-[12px] font-bold text-slate-600 dark:text-slate-400 italic">{new Date(r.Tarih).toLocaleDateString('tr-TR')}</td>
                                <td className="px-4 py-4">
                                   <div className="flex flex-col">
                                      <span className="text-[13px] font-black text-slate-800 dark:text-white uppercase">{r.Vatandas_Ad_Soyad}</span>
                                      <span className="text-[10px] font-bold text-slate-400">{r.Vatandas_Id}</span>
                                   </div>
                                </td>
                                <td className="px-4 py-4 text-right">
                                   <span className="text-[14px] font-black text-primary-600">{Number(r.Toplam_Tutar || r.Tutar).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 ) : (
                    <div className="flex flex-col items-center justify-center py-20 opacity-40"><FileText size={64} className="text-slate-300" /><p className="text-xs font-black text-slate-400 uppercase">Kayıt bulunamadı.</p></div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
