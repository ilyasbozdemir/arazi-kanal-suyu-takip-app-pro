/**
 * 🛡️ GÜNEYURT KURUMSİ - SİSTEM KONFİGÜRASYON MERKEZİ
 * Uygulama genelinde kullanılan sarsılmaz sabitler ve varsayılan yapılar.
 */
export const SYSTEM_CONFIG = {
  // 🛡️ Ana Operatör Kimlik Bilgileri
  OPERATOR_TCKN: '00000000000',
  
  // 🛡️ Varsayılan Kullanıcı Profili (Fallback)
  DEFAULT_PROFILE: {
    id: 'system-default',
    name: 'SİSTEM OPERATÖRÜ',
    title: 'Tahsildar',
    email: 'email',
    phone: '',
    image: '',
    citizenId: '00000000000'
  },

  // 🛡️ Kurumsal Kasa Altyapısı (Tek Düzen Hesap Planı - TDHP Uyumlu)
  DEFAULT_KASALAR: [
    { 
      id: 'kasa-nakit-zimmet', 
      Hesap_Kodu: '100',
      Kasa_Adi: '100 KASA HESABI (NAKİT VEZNE)', 
      Durum: 'AKTİF', 
      Sistem_Verisi: 1,
      Aciklama: 'Kasiyer/Veznedar zimmetindeki resmi TDHP 100 Nakit Kasası.' 
    },
    { 
      id: 'kasa-kredi-karti', 
      Hesap_Kodu: '108',
      Kasa_Adi: '108 POS KREDİ KARTI HESABI', 
      Durum: 'AKTİF', 
      Sistem_Verisi: 1,
      Aciklama: 'Kredi kartı ve dijital pos tahsilatlarının aktarıldığı TDHP 108 Kredi Kartı Hesabı.' 
    },
    { 
      id: 'kasa-kurum-ana', 
      Hesap_Kodu: '102',
      Kasa_Adi: '102 BANKA MEVDUAT HESABI', 
      Durum: 'AKTİF', 
      Sistem_Verisi: 1,
      Aciklama: 'Kurumsal resmi banka mevduat hesabı.' 
    }
  ]
};
