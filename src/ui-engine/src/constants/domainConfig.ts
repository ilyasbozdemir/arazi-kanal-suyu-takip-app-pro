/**
 * KURUM BAŞKANLIĞI - Dağıtım ve İdari Bölge Yapılandırması
 * Bu dosya kurumsal hiyerarşiyi ve konum domain'lerini yönetir.
 */

export const DOMAIN_CONFIG = {
  kurum: {
    adi: "KURUM BAŞKANLIĞI",
    logo: "kurum_logo_url", // TANIM_Ayarlar'dan gelecek
    il: "MERKEZ İL",
    ilce: "MERKEZ İLÇE",
    belde: "KURUM"
  },
  
  // Konum Tipleri (Domain olarak kullanılacak)
  konum_tipleri: [
    { key: "IL", label: "İl" },
    { key: "ILCE", label: "İlçe" },
    { key: "BELDE", label: "Belde / Kurum" },
    { key: "KOY", label: "Köy" },
    { key: "MAHALLE", label: "Mahalle" },
    { key: "BOLGE", label: "Özel Dağıtım Bölgesi (Yayla, Mevkii vb.)" }
  ],

  // Varsayılan Hiyerarşi (Seçimlerde yardımcı olması için)
  varsayilan_hiyerarsi: {
    il_id: "70", // Merkez İl
    ilce_id: "70400", // Merkez İlçe
    belde_id: "70450" // Kurum
  }
};
