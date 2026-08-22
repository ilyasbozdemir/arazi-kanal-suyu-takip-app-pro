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
  { code: '100', name: '100 KASA HESABI', type: 'aktif', classCode: '1', isMainAccount: true, description: 'Nakit Tahsilat ve Kasiyer Vezne Hesabı' },
  { code: '101', name: '101 ALINAN ÇEKLER', type: 'aktif', classCode: '1', isMainAccount: true },
  { code: '102', name: '102 BANKALAR', type: 'aktif', classCode: '1', isMainAccount: true, description: 'Banka Vadesiz Mevduat Hesabı' },
  { code: '108', name: '108 DİĞER HAZIR DEĞERLER (POS / KREDİ KARTI)', type: 'aktif', classCode: '1', isMainAccount: true, description: 'Kredi Kartı ve POS Tahsilat Hesabı' },
  { code: '120', name: '120 ALICILAR / HİZMET ALANLAR', type: 'aktif', classCode: '1', isMainAccount: true, description: 'Vatandaş / Müşteri Hizmet Alacakları' },
  
  // 3XX - KISA VADELİ YABANCI KAYNAKLAR
  { code: '320', name: '320 SATICILAR / TEDARİKÇİLER', type: 'pasif', classCode: '3', isMainAccount: true },
  { code: '335', name: '335 PERSONELE BORÇLAR', type: 'pasif', classCode: '3', isMainAccount: true },

  // 6XX - GELİR TABLOSU HESAPLARI
  { code: '600', name: '600 YURTİÇİ SATIŞLAR / HİZMET GELİRLERİ', type: 'gelir', classCode: '6', isMainAccount: true, description: 'Arazi & Su Kullanım Gelirleri' },
  { code: '602', name: '602 DİĞER GELİRLER', type: 'gelir', classCode: '6', isMainAccount: true },

  // 7XX - GİDER HESAPLARI
  { code: '740', name: '740 HİZMET ÜRETİM MALİYETİ', type: 'gider', classCode: '7', isMainAccount: true },
  { code: '770', name: '770 GENEL YÖNETİM GİDERLERİ', type: 'gider', classCode: '7', isMainAccount: true },
];
