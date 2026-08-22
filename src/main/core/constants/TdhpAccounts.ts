/**
 * 🛡️ TEK DÜZEN HESAP PLANI (TDHP) & STRATEJİ BÜTÇE KODLARI
 * Strateji ve Bütçe Başkanlığı Kamu Muhasebesi ve Sulama Suyu Bütçe Hesap Kodları
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
  { code: '1', name: '1XX – Dönen Varlıklar (Kasa, Alacaklar)' },
  { code: '2', name: '2XX – Duran Varlıklar (Tesis, Kanal Tesisatı)' },
  { code: '3', name: '3XX – Kısa Vadeli Yabancı Kaynaklar' },
  { code: '4', name: '4XX – Uzun Vadeli Yabancı Kaynaklar' },
  { code: '5', name: '5XX – Özkaynaklar' },
  { code: '6', name: '6XX – Gelir Tablosu Hesapları (Su Gelirleri)' },
  { code: '7', name: '7XX – Hizmet Maliyet & Gider Hesapları' },
  { code: '8', name: '8XX – Bütçe ve Yansıtma Hesapları' },
  { code: '9', name: '9XX – Nazım Hesaplar' },
];

export const TDHP_MAIN_ACCOUNTS: TdhpAccount[] = [
  // 1XX - DÖNEN VARLIKLAR (KASA & ALACAKLAR) - AKTİF
  { code: '100', name: '100 KASA HESABI', type: 'aktif', classCode: '1', isMainAccount: true, description: 'Nakit Tahsilat ve Vezne Hesabı' },
  { code: '100.01', name: '100.01 Merkez Nakit Vezne Kasası', type: 'aktif', classCode: '1', parentCode: '100', isMainAccount: false, description: 'Veznedar zimmetli nakit kasası' },
  
  { code: '101', name: '101 ALINAN ÇEKLER', type: 'aktif', classCode: '1', isMainAccount: true },
  { code: '102', name: '102 BANKALAR', type: 'aktif', classCode: '1', isMainAccount: true, description: 'Kurum Vadesiz Banka Hesabı' },
  { code: '102.01', name: '102.01 Banka Vadesiz Mevduat Hesabı', type: 'aktif', classCode: '1', parentCode: '102', isMainAccount: false },
  
  { code: '109', name: '109 POS KREDİ KARTI TAHSİLAT HESABI', type: 'aktif', classCode: '1', isMainAccount: true, description: 'Kredi Kartı ve POS Tahsilat Hesabı' },
  { code: '109.01', name: '109.01 POS Kredi Kartı Kasası', type: 'aktif', classCode: '1', parentCode: '109', isMainAccount: false },
  
  // ALACAKLAR GRUBU (KANUNİ KODLAR) - AKTİF
  { code: '120', name: '120 ALICILAR HESABI (CARİ SU ALACAKLARI)', type: 'aktif', classCode: '1', isMainAccount: true, description: 'Vadesi gelmemiş cari su ve hizmet alacakları' },
  { code: '120.01', name: '120.01 Cari Sulama Suyu Alacakları', type: 'aktif', classCode: '1', parentCode: '120', isMainAccount: false },
  
  { code: '121', name: '121 ALACAK SENETLERİ (VADELİ/TAKSİTLİ BORÇLAR)', type: 'aktif', classCode: '1', isMainAccount: true, description: 'Taksitlendirilen veya taahhüde bağlanan sulama borçları' },
  { code: '128', name: '128 ŞÜPHELİ HİZMET ALACAKLARI (İCRALIK/TAKİPLİ)', type: 'aktif', classCode: '1', isMainAccount: true, description: 'Vadesi geçen, takibe ve icraya aktarılan borçlar' },
  { code: '129', name: '129 ŞÜPHELİ ALACAKLAR KARŞILIĞI (-)', type: 'aktif', classCode: '1', isMainAccount: true, description: 'Şüpheli alacaklar için ayrılan karşılık hesabı' },
  
  // 3XX - KISA VADELİ YABANCI KAYNAKLAR - PASİF
  { code: '320', name: '320 SATICILAR / TEDARİKÇİLER', type: 'pasif', classCode: '3', isMainAccount: true },
  { code: '335', name: '335 PERSONELE BORÇLAR', type: 'pasif', classCode: '3', isMainAccount: true },
  { code: '360', name: '360 ÖDENECEK VERGİ VE FONLAR', type: 'pasif', classCode: '3', isMainAccount: true, description: 'Damga Vergisi, KDV Tevkifatı ve Yasal Kesintiler' },

  // 6XX - GELİR TABLOSU HESAPLARI (STRATEJİ & BÜTÇE KODLARI)
  { code: '600', name: '600 YURTİÇİ SATIŞLAR / HİZMET GELİRLERİ', type: 'gelir', classCode: '6', isMainAccount: true, description: 'Genel Hizmet Gelirleri' },
  { code: '600.01', name: '600.01 Sulama Suyu Kullanım Gelirleri (Kanal Suyu)', type: 'gelir', classCode: '6', parentCode: '600', isMainAccount: false, description: 'Saatlik ve dönümlük kanal suyu kullanım gelirleri' },
  { code: '600.02', name: '600.02 Arazi & Ekipman Hizmet Gelirleri', type: 'gelir', classCode: '6', parentCode: '600', isMainAccount: false, description: 'Arazi ölçüm ve iş makinesi hizmet gelirleri' },
  { code: '602', name: '602 DİĞER GELİRLER', type: 'gelir', classCode: '6', isMainAccount: true },
  { code: '602.01', name: '602.01 Gecikme Zammı ve Faiz Gelirleri', type: 'gelir', classCode: '6', parentCode: '602', isMainAccount: false, description: 'Vadesi geçen borçların yasal faiz ve zam gelirleri' },

  // 7XX - HİZMET MALİYETİ VE GİDER HESAPLARI
  { code: '740', name: '740 HİZMET ÜRETİM MALİYETİ', type: 'gider', classCode: '7', isMainAccount: true, description: 'Sulama Hizmet Üretim Maliyetleri' },
  { code: '740.01', name: '740.01 Sulama Kanal Bakım & Onarım Giderleri', type: 'gider', classCode: '7', parentCode: '740', isMainAccount: false, description: 'Beton kanal, kapak ve tesisat onarım giderleri' },
  { code: '740.02', name: '740.02 Pompa & Elektrik Enerjisi Giderleri', type: 'gider', classCode: '7', parentCode: '740', isMainAccount: false, description: 'Sulama tesisleri elektrik ve enerji harcamaları' },
  { code: '770', name: '770 GENEL YÖNETİM GİDERLERİ', type: 'gider', classCode: '7', isMainAccount: true, description: 'Vezne ve Genel Yönetim Giderleri' },
  { code: '770.01', name: '770.01 Vezne & Personel Yönetim Harcamaları', type: 'gider', classCode: '7', parentCode: '770', isMainAccount: false },

  // 8XX - BÜTÇE VE YANSITMA HESAPLARI (KAMU MUHASEBESİ)
  { code: '800', name: '800 BÜTÇE GELİRLERİ HESABI', type: 'gelir', classCode: '8', isMainAccount: true, description: 'Tahsil Edilen Resmi Bütçe Gelirleri' },
  { code: '805', name: '805 GELİR YANSITMA HESABI', type: 'pasif', classCode: '8', isMainAccount: true, description: 'Bütçe Gelirleri Karşılık Ve Yansıtması' },
  { code: '830', name: '830 BÜTÇE GİDERLERİ HESABI', type: 'gider', classCode: '8', isMainAccount: true, description: 'Resmi Bütçe Gider Harcamaları' },
  { code: '835', name: '835 GİDER YANSITMA HESABI', type: 'aktif', classCode: '8', isMainAccount: true, description: 'Bütçe Giderleri Karşılık Ve Yansıtması' },
];
