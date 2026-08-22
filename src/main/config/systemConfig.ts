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

  // 🛡️ Kurumsal Kasa Altyapısı
  DEFAULT_KASALAR: [
    { 
      id: 'kasa-nakit-zimmet', 
      Kasa_Adi: 'ZİMMETLİ NAKİT KASASI', 
      Durum: 'AKTİF', 
      Sistem_Verisi: 1,
      Aciklama: 'Operatörün sarsılmaz sorumluluğundaki günlük nakit havuzu.' 
    },
    { 
      id: 'kasa-kredi-karti', 
      Kasa_Adi: 'KREDİ KARTI / POS KASASI', 
      Durum: 'AKTİF', 
      Sistem_Verisi: 1,
      Aciklama: 'Dijital tahsilatların tescil edildiği resmi POS kasası.' 
    },
    { 
      id: 'kasa-kurum-ana', 
      Kasa_Adi: 'KURUM ANA TAHSİLAT KASASI', 
      Durum: 'AKTİF', 
      Sistem_Verisi: 1,
      Aciklama: 'Kurumsal ana havuz ve genel bütçe kasası.' 
    }
  ]
};
