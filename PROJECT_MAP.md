# PROJECT_MAP.md

## 🏗️ Genel Mimari

Bu proje bir **Electron** tabanlı masaüstü uygulamasıdır.

- **Main Process**: `src/main` (Veritabanı, IPC, Sistem olayları)
- **Renderer (UI Engine)**: `src/ui-engine` (React, Vite, Tailwind CSS, Zustand)

---

## 🖥️ UI Engine (Frontend)

### 📂 Screens (`src/ui-engine/src/screens`)

Uygulamanın ana sayfaları ve modül ekranları.

| Dosya Yolu                    | Açıklama                                                                                                    | Önemli Exportlar      |
| :---------------------------- | :---------------------------------------------------------------------------------------------------------- | :-------------------- |
| `sistem/Dashboard.tsx`        | Uygulama ana sayfası, özet istatistikler ve hızlı erişim menüleri.                                          | `Dashboard`           |
| `finans/AccountingScreen.tsx` | Kasa yönetimi, personel zimmetleri, tahakkuk ve tahsilat işlemleri. Kasa yoksa uyarı sistemi içerir.        | `AccountingScreen`    |
| `tapu/TapuDetailView.tsx`     | Tapu parsel detayları, mülkiyet bilgileri ve ilişkili sulama/muhasebe verileri (Zenginleştirilmiş veriler). | `TapuDetailView`      |
| `su/ActiveLedgersScreen.tsx`  | Aktif mahalle dağıtım defterlerinin listesi ve sezon yönetimi.                                              | `ActiveLedgersScreen` |
| `tasinmaz/MapViewScreen.tsx`  | Harita tabanlı parsel takip ekranı (Leaflet/GIS).                                                           | `MapView`             |
| `merav/MeravDetailView.tsx`   | Saha görevlilerinin detayları ve zimmetli bölgeleri.                                                        | `MeravDetailView`     |

### 🧩 Components (`src/ui-engine/src/components`)

Tekrar kullanılabilir UI parçaları.

| Dosya Yolu                           | Açıklama                                                                                         |
| :----------------------------------- | :----------------------------------------------------------------------------------------------- |
| `TableView.tsx`                      | Global tablo/liste/grid veri görüntüleme sistemi.                                                |
| `TabSystem.tsx`                      | Uygulama içi çoklu sekme (browser-like) yönetimi.                                                |
| `layout/MainContentRenderer.tsx`     | Aktif sekmeye göre hangi ekranın render edileceğini seçen ana motor.                             |
| `dashboard/MetricsGrid.tsx`          | Dashboard üzerindeki istatistik kartları.                                                        |
| `table/renderers/GridRenderer.tsx`   | Verilerin "Kart" (Grid) modunda render edilmesi (Premium tasarımlar).                            |
| `table/renderers/ListRenderer.tsx`   | Verilerin "Liste" modunda render edilmesi. Tapu için mali metrikler içerir.                      |
| `accounting/AccountingKasaTable.tsx` | Kasa listesi ve yetkili personel eşleşme tablosu. Sicil No ve Detay navigasyonu içerir.          |
| `su/DistributionGrid.tsx`            | Sulama fişleri gridi; birim fiyat, koçan ve görevli merav kontrolü yapar.                        |
| `su/DistributionFormModal.tsx`       | Yeni sulama kaydı giriş formu. Mükellef (TC/Sicil) ve Taşınmaz (Mevki/Hak) özet kartları içerir. |

### 📦 State Management (`src/ui-engine/src/stores`)

**Zustand** ile yönetilen global durum depoları.

| Dosya Yolu         | Açıklama                                                                | Export             |
| :----------------- | :---------------------------------------------------------------------- | :----------------- |
| `useAppStore.ts`   | Ana uygulama durumu (Aktif sekmeler, önbellek, global modal durumları). | `useAppStore`      |
| `kasaStore.ts`     | Kasa hareketleri ve bakiye takibi.                                      | `useKasaStore`     |
| `tapuStore.ts`     | Tapu verileri ve filtreleme durumu.                                     | `useTapuStore`     |
| `vatandasStore.ts` | Vatandaş kütüğü ve arama durumu.                                        | `useVatandasStore` |

### 🛠️ Services (`src/ui-engine/src/services`)

İş mantığı ve API haberleşme katmanı.

| Dosya Yolu                   | Açıklama                                                   |
| :--------------------------- | :--------------------------------------------------------- |
| `ElectronService.ts`         | Main process ile IPC üzerinden haberleşen sarsılmaz köprü. |
| `domain/TapuService.ts`      | Tapu ile ilgili karmaşık iş kuralları.                     |
| `repositories/UnitOfWork.ts` | Veritabanı işlemlerini koordine eden desen.                |

### 🔧 Utilities (`src/ui-engine/src/utils`)

Yardımcı fonksiyonlar.

| Dosya Yolu        | Açıklama                                                  |
| :---------------- | :-------------------------------------------------------- |
| `numberUtils.ts`  | Para formatlama, kısa sayı gösterimi (3.3k vb.).          |
| `validators.ts`   | TCKN ve Sicil No doğrulama mantığı.                       |
| `translations.ts` | Tablo başlıkları ve teknik terimlerin Türkçeleştirilmesi. |

---

## 🛠️ Main Process (`src/main`)

Backend ve veritabanı yönetim katmanı.

- `index.ts`: Ana giriş noktası ve IPC handler tanımları.
- `database/`: SQLite bağlantısı ve repository implementasyonları.

---

## 📋 Dosya Bağımlılık Haritası (Özet)

- **TableView** ➔ `recordConfig.ts` & `TableConfig.ts` üzerinden yapılandırılır.
- **MainContentRenderer** ➔ `menuConfig.ts` üzerinden sekmeleri yönetir.
- **AccountingScreen** ➔ `kasaStore.ts`, `AccountingInsights.tsx` (Uyarı
  Sistemi) ve `repair-financial-seeds` (Onarım) kullanır.
- **DistributionGrid** ➔ `REL_Defter_Merav` üzerinden görevli kontrolü,
  `MUHASEBE_Tahsilat` üzerinden silme kilidi ve `Vatandas_Id` (UUID) üzerinden
  mülkiyet sorgusu yapar.
- **AccountingFisTable** ➔ `TESCİL EDİLDİ` durum senkronu, mükerrer tahsilat
  engeli ve detaylı bilgi popover'ı (Mevki, Tarife, Tutar) içerir.
- **MeravGenelTab** ➔ Aktif sulama defterine (Defter_id) hızlı erişim ve
  vatandaş profili navigasyonu sağlar.
- **ExportService** ➔ `MappingEngine` ve `StyleManager` ile modüler Excel
  üretimi. `EXPORT_GUIDE.md` standartlarını uygular.
- **StatsHandler** ➔ Mahalle ve Mevki bazlı istatistikleri (Kişi/Parsel sayımı)
  sarsılmaz JOIN yapılarıyla hesaplar.
