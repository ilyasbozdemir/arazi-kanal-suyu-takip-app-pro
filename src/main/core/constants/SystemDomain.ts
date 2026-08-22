/**
 * 🛡️ KURUM BAŞKANLIĞI - SİSTEM ANAYASASI VE DOMAIN TANIMLARI
 * Bu dosya tüm kurumsal ayarları, anahtar kelimeleri ve sistem modlarını merkezi olarak yönetir.
 */

export const SYSTEM_SETTINGS = {
  KURUM_ADI: {
    key: 'kurum_adi',
    label: 'Kurum Adı',
    description: 'Resmi raporlarda ve başlıkta görünecek kurum adı.',
    default: 'KURUM BAŞKANLIĞI'
  },
  KURUM_LOGO: {
    key: 'kurum_logo',
    label: 'Kurum Logosu',
    description: 'Rapor çıktıları için Base64 formatında veya URL olarak logo.',
    default: ''
  },
  SISTEM_MODU: {
    key: 'sistem_modu',
    label: 'Sistem Çalışma Modu',
    description: 'Uygulamanın hangi modda çalışacağını belirler.',
    options: ['SULAMA_TAKIP', 'ARAZI_YONETIMI', 'TAM_ERP'],
    default: 'SULAMA_TAKIP'
  },
  VARSAYILAN_BIRIM_FIYAT: {
    key: 'varsayilan_birim_fiyat',
    label: 'Varsayılan Su Birim Fiyatı',
    description: 'Tarife tanımlanmamış bölgeler için baz alınacak fiyat.',
    default: '1.00'
  },
  LIST_VIEW_MODE: {
    key: 'LIST_VIEW_MODE',
    label: 'Varsayılan Liste Görünümü',
    description: 'Veri kütüklerinde (Vatandaş, Tapu vb.) varsayılan gösterim modu.',
    options: ['table', 'list', 'grid'],
    default: 'grid'
  },
  MAP_SHOW_POINTERS: {
    key: 'map_show_pointers',
    label: 'Harita Pointerlarını Göster',
    description: 'Tapu kayıtları için harita üzerinde iğnelerin (marker) görünüp görünmeyeceği.',
    default: 'true'
  },
  MAP_SHOW_WATER_INFRA: {
    key: 'map_show_water_infra',
    label: 'Su Altyapısını Göster',
    description: 'Boru hatları, depolar ve vanaların harita üzerinde gösterimi.',
    default: 'true'
  },
  MAP_CLIP_OUTSIDE_BOUNDARY: {
    key: 'map_clip_outside_boundary',
    label: 'Sınır Dışı Verileri Gizle',
    description: 'Sorumluluk alanı GeoJSON dosyası dışındaki verilerin haritadan gizlenmesi.',
    default: 'true'
  },
  MAP_DEFAULT_ZOOM: {
    key: 'map_default_zoom',
    label: 'Varsayılan Harita Zoom',
    description: 'Harita açıldığında başlangıç ölçeği.',
    default: '14'
  }
};

/**
 * 🛡️ SEED DATA GENERATOR
 * Veritabanı ilk kurulduğunda atılacak kayıtları bu JSON'dan türetiriz.
 */
export const INITIAL_SEED_DATA = Object.values(SYSTEM_SETTINGS).map(s => ({
  anahtar: s.key,
  deger: s.default
}));
