# 🗺️ KURUM BAŞKANLIĞI: SİSTEM MİMARİSİ VE BİLEŞEN HARİTASI

Bu doküman, projenin teknik yapısını, dosya hiyerarşisini ve UI ekranlarının kod
dosyalarıyla eşleşmesini anlamak için hazırlanan resmi kılavuzdur.

---

## 1. 🏗️ CORE SHELL & ORCHESTRATION

Uygulama çerçevesi ve sekme tabanlı yönetim bu merkezi dosyalardan kontrol
edilir:

| Bileşen           | Dosya Yolu                                                    | Rolü                                                          |
| :---------------- | :------------------------------------------------------------ | :------------------------------------------------------------ |
| **Main App**      | `src/App.tsx`                                                 | Uygulamanın giriş noktası. Global state ve sekmeleri yönetir. |
| **Tab Renderer**  | `src/ui-engine/src/components/layout/MainContentRenderer.tsx` | Aktif sekme tipine göre ekranları dinamik olarak render eder. |
| **Master Header** | `src/ui-engine/src/components/layout/NavigationHeader.tsx`    | Üst navigasyon barı ve mod seçici (Sezon Öncesi/Sonrası).     |
| **Search Engine** | `src/ui-engine/src/screens/sistem/SearchCenter.tsx`           | Merkezi arama ve hızlı erişim motoru (Ctrl+K).                |

---

## 2. 📊 DATA COLLECTION & LISTINGS

Tüm liste, grid ve kart görünümleri bu özel modüller tarafından desteklenir:

| Modül               | Dosya Yolu                                            | Açıklama                                                                     |
| :------------------ | :---------------------------------------------------- | :--------------------------------------------------------------------------- |
| **Table Engine**    | `src/ui-engine/src/components/TableView.tsx`          | Veri çekme, sayfalama ve filtreleme işlemlerinin ana mantığı.                |
| **Visual Content**  | `src/ui-engine/src/components/table/TableContent.tsx` | **DESIGN CENTER:** Kartların (Vatandaş, Tapu vb.) HTML/CSS kodlarını içerir. |
| **Registry Config** | `src/ui-engine/src/config/TableConfig.ts`             | Başlıklar, gizli kolonlar ve ikon eşleşmeleri için yapılandırma.             |
| **Data Enrichment** | `src/ui-engine/src/config/recordConfig.ts`            | Liste verilerini joinler ve hesaplanmış alanlarla zenginleştirme mantığı.    |

---

## 📄 3. RECORD MANAGEMENT & FORMS

Veri kayıtlarını oluşturmak ve güncellemek için kullanılan güçlü form motoru:

| Parça             | Dosya Yolu                                                   | Açıklama                                                                                      |
| :---------------- | :----------------------------------------------------------- | :-------------------------------------------------------------------------------------------- |
| **Form Shell**    | `src/ui-engine/src/components/RecordDetailView.tsx`          | Kaydet/İptal butonları ve sekme sistemini içeren ana modal sarmalayıcı.                       |
| **Field Factory** | `src/ui-engine/src/components/detail/core/FieldRenderer.tsx` | **KRİTİK:** Spesifik input tiplerini (Maskeli Telefon, Seçim Kutusu vb.) render eden fabrika. |
| **Atomic Field**  | `src/ui-engine/src/components/detail/core/DetailField.tsx`   | Input alanları, selectler ve textarealar için temel UI tasarımı.                              |
| **Phone Mask**    | `src/ui-engine/src/components/detail/core/FieldRenderer.tsx` | (Yeni) +90 ön eki ve dinamik sayısal maskeleme uygulaması.                                    |

---

## 🚀 4. SPECIALIZED DOMAIN MODULES

Kurum iş süreçleri için geliştirilmiş karmaşık ekranlar ve modüller:

| Ekran / Modül      | Dosya Yolu                                              | Fonksiyon                                                                  |
| :----------------- | :------------------------------------------------------ | :------------------------------------------------------------------------- |
| **Dashboard**      | `src/ui-engine/src/screens/sistem/Dashboard.tsx`        | İstatistikler, canlı veri özeti ve hızlı başlangıç kılavuzları.            |
| **Land Registry**  | `src/ui-engine/src/screens/tasinmaz/TapuManagement.tsx` | Parsel sorgulama, hissedar ağaçları ve mülkiyet detayları.                 |
| **Finance Center** | `src/ui-engine/src/screens/finans/AccountingScreen.tsx` | Tahsilatlar, makbuz kesme ve günlük kasa raporları.                        |
| **GIS Map**        | `src/renderer/src/screens/tasinmaz/MapViewScreen.tsx`   | GeoJSON katmanlarını ve altyapıyı görselleştiren interaktif harita motoru. |
| **Active Ledgers** | `src/ui-engine/src/screens/su/ActiveLedgersScreen.tsx`  | Gerçek zamanlı su dağıtım ve sayaç takip kayıtları.                        |

---

## 🛡️ 5. INFRASTRUCTURE & BACKEND

Veri sürekliliğini ve bütünlüğünü sağlayan temel katmanlar:

| Katman          | Dosya Yolu                           | Sorumluluk                                                    |
| :-------------- | :----------------------------------- | :------------------------------------------------------------ |
| **SQL Library** | `src/main/handlers/queryHandlers.ts` | Tüm salt-okunur (SELECT) sorgularının merkezi deposu.         |
| **IPC Bridge**  | `src/main/ipc/mainHandlers.ts`       | Frontend ile Main process arasındaki veri köprüsü.            |
| **DB Schema**   | `src/main/database/tables/`          | SQLite tablo tanımları ve denetim izi (audit trail) ayarları. |
| **Seeds**       | `src/main/db-helpers/seeds/`         | Yeni kurulumlar için varsayılan veriler (Konumlar, Tipler).   |

---

## 🛠️ DEVELOPER BATTLE PLAN

- **Bir kartın görünümünü değiştirmek mi gerekiyor?** ➔ `TableContent.tsx`
  dosyasına gidin.
- **Tabloya yeni bir kolon mu eklendi?** ➔ `TableConfig.ts` ve
  `FieldRenderer.tsx` dosyalarını güncelleyin.
- **Veriler listelerde görünmüyor mu?** ➔ `queryHandlers.ts` içindeki SQL
  hatalarını kontrol edin.
- **Yeni bir menü öğesi eklemek mi istiyorsunuz?** ➔ `menuConfig.ts` dosyasını
  kullanın.

---

_Kurum Başkanlığı Arazi & Su Takip Sistemi - Teknik Dokümantasyon v2.0_
