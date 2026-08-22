/**
 * 🛡️ TEK DÜZEN HESAP PLANI (TDHP) MODELİ VE SABİTLERİ
 */

export interface TdhpAccount {
  code: string;
  name: string;
  type: 'aktif' | 'pasif' | 'gelir' | 'gider' | 'nazim';
  classCode: string; // 1, 2, 3, 4, 5, 6, 7, 8, 9
  parentCode?: string;
  isMainAccount: boolean;
  description?: string;
}

export interface TdhpTransaction {
  id: string | number;
  accountCode: string;
  accountName: string;
  accountType: 'aktif' | 'pasif' | 'gelir' | 'gider' | 'nazim';
  date: string;
  description: string;
  fishNo: string;
  referenceNo: string;
  debit: number;        // Borç Tutarı
  credit: number;       // Alacak Tutarı
  debitTotal: number;   // Toplam Borç
  creditTotal: number;  // Toplam Alacak
  borcKalan: number;    // Borç Kalması (debit > credit ise)
  alacakKalan: number;  // Alacak Kalması (credit > debit ise)
  bakiye: number;       // Net Bakiye
  auxiliaryAccount?: {  // Muavin / Yardımcı Hesap
    code: string;
    name: string;
    type: 'customer' | 'supplier' | 'project' | 'personnel' | 'merav';
  };
  costCenter?: string;
  projectCode?: string;
  documentType?: string;
  dueDate?: string;
  createdAt: string;
  status: 'recorded' | 'pending' | 'reconciled';
}

export const TDHP_CLASSES = [
  { code: '1', name: '1XX – Dönen Varlıklar' },
  { code: '2', name: '2XX – Duran Varlıklar' },
  { code: '3', name: '3XX – Kısa Vadeli Yabancı Kaynaklar' },
  { code: '4', name: '4XX – Uzun Vadeli Yabancı Kaynaklar' },
  { code: '5', name: '5XX – Özkaynaklar' },
  { code: '6', name: '6XX – Gelir Tablosu Hesapları' },
  { code: '7', name: '7XX – Gider Hesapları' },
  { code: '8', name: '8XX – Serbest Hesaplar' },
  { code: '9', name: '9XX – Nazım Hesaplar' },
];

export const TDHP_MAIN_ACCOUNTS: TdhpAccount[] = [
  // 1XX - DÖNEN VARLIKLAR
  { code: '100', name: 'KASA HESABI', type: 'aktif', classCode: '1', isMainAccount: true },
  { code: '100.01', name: 'Merkez Nakit Kasası', type: 'aktif', classCode: '1', parentCode: '100', isMainAccount: false },
  { code: '100.02', name: 'Vezne Kasiyer Kasası', type: 'aktif', classCode: '1', parentCode: '100', isMainAccount: false },
  
  { code: '101', name: 'ALINAN ÇEKLER', type: 'aktif', classCode: '1', isMainAccount: true },
  { code: '102', name: 'BANKALAR', type: 'aktif', classCode: '1', isMainAccount: true },
  { code: '102.01', name: 'Banka Vadesiz Mevduat Hesabı', type: 'aktif', classCode: '1', parentCode: '102', isMainAccount: false },
  
  { code: '108', name: 'DİĞER HAZIR DEĞERLER', type: 'aktif', classCode: '1', isMainAccount: true },
  { code: '109', name: 'KREDİ KARTLARI / POS TAHSİLAT HESABI', type: 'aktif', classCode: '1', isMainAccount: true },
  { code: '109.01', name: 'POS Kredi Kartı Tahsilat Kasası', type: 'aktif', classCode: '1', parentCode: '109', isMainAccount: false },
  
  { code: '120', name: 'ALICILAR / HİZMET ALANLAR', type: 'aktif', classCode: '1', isMainAccount: true },
  { code: '120.01', name: 'Vatandaş / Müşteri Hizmet Alacakları', type: 'aktif', classCode: '1', parentCode: '120', isMainAccount: false },
  
  // 3XX - KISA VADELİ YABANCI KAYNAKLAR
  { code: '320', name: 'SATICILAR / TEDARİKÇİLER', type: 'pasif', classCode: '3', isMainAccount: true },
  { code: '335', name: 'PERSONELE BORÇLAR', type: 'pasif', classCode: '3', isMainAccount: true },

  // 6XX - GELİR TABLOSU HESAPLARI
  { code: '600', name: 'YURTİÇİ SATIŞLAR / HİZMET GELİRLERİ', type: 'gelir', classCode: '6', isMainAccount: true },
  { code: '600.01', name: 'Arazi & Su Tahsilat Gelirleri', type: 'gelir', classCode: '6', parentCode: '600', isMainAccount: false },
  { code: '602', name: 'DİĞER GELİRLER', type: 'gelir', classCode: '6', isMainAccount: true },

  // 7XX - GİDER HESAPLARI
  { code: '740', name: 'HİZMET ÜRETİM MALİYETİ', type: 'gider', classCode: '7', isMainAccount: true },
  { code: '770', name: 'GENEL YÖNETİM GİDERLERİ', type: 'gider', classCode: '7', isMainAccount: true },
];
