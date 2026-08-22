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

  // 🛡️ Kurumsal Kasa Altyapısı (TDHP Tek Düzen Hesap Planı Uyumlu)
  DEFAULT_KASALAR: [
    { 
      id: 'kasa-nakit-zimmet', 
      Hesap_Kodu: '100.02',
      Kasa_Adi: '100.02 VEZNE KASİYER KASASI (ZİMMETLİ)', 
      Durum: 'AKTİF', 
      Sistem_Verisi: 1,
      Aciklama: 'Kasiyer/Veznedar zimmetindeki günlük TDHP 100.02 nakit havuzu.' 
    },
    { 
      id: 'kasa-kredi-karti', 
      Hesap_Kodu: '109.01',
      Kasa_Adi: '109.01 POS KREDİ KARTI TAHSİLAT KASASI', 
      Durum: 'AKTİF', 
      Sistem_Verisi: 1,
      Aciklama: 'Dijital tahsilatların tescil edildiği TDHP 109.01 POS kredi kartı kasası.' 
    },
    { 
      id: 'kasa-kurum-ana', 
      Hesap_Kodu: '100.01',
      Kasa_Adi: '100.01 MERKEZ NAKİT KASASI', 
      Durum: 'AKTİF', 
      Sistem_Verisi: 1,
      Aciklama: 'Kurumsal ana havuz ve TDHP 100.01 merkez nakit kasası.' 
    },
    {
      id: 'kasa-banka-mevduat',
      Hesap_Kodu: '102.01',
      Kasa_Adi: '102.01 BANKA MEVDUAT HESABI',
      Durum: 'AKTİF',
      Sistem_Verisi: 1,
      Aciklama: 'Kurum banka vadesiz mevduat hesabı.'
    }
  ]
};
