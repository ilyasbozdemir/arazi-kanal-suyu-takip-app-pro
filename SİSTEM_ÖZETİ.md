# 🌊 Kurum Başkanlığı - Arazi Suyu Yönetim Sistemi (Sulama CRM)

Bu döküman, sistemin teknik mimarisini, veritabanı yapısını ve mevcut tüm
özelliklerini içeren kapsamlı bir **Sistem Özeti**dir.

---

## 🛠 Teknik Mimari (Tech Stack)

- **Framework**: Electron.js (Desktop Application)
- **Frontend**: React (v18+) + TypeScript + Vite
- **Styling**: Tailwind CSS + Lucide Icons + Framer Motion (Animations)
- **Backend/Database**: SQLite (`better-sqlite3`)
- **Veri İşleme**: Excel Import/Export (`xlsx` kütüphanesi)

---

## 🛡️ Yedekleme Güvenliği ve Kripto Protokolü

Sistem, e-posta ile gönderilen yedek paketlerini (backup) sarsılmaz bir
disiplinle zırhlandırır:

- **Algoritma**: AES-256 (Askeri Seviye Şifreleme)
- **Anahtar Yapısı**: Her paket, oluşturulduğu anki `YYYYMMDD_HHMMSS`
  formatındaki **Timestamp** dizisi ile şifrelenir.
- **Otomatik Kurtarma**: Sistem, geri yükleme (Restore) sırasında dosya adındaki
  timestamp bilgisini otomatik olarak ayıklar ve şifreyi çözer.
- **Zafiyet Koruması**: E-posta gövdesinde anahtar paylaşılmaz; anahtar sadece
  dosya isminde pusuya yatmıştır.

---

## 📂 Proje Yapısı ve Dosyalar

- `src/main/index.ts`: Ana Electron süreci. Veritabanı şeması, IPC işleyicileri
  ve Excel motoru burada bulunur.
- `src/ui-engine/src/App.tsx`: Tüm kullanıcı arayüzü (Dashboard, Tablolar,
  Ayarlar) ve uygulama mantığı.
- `src/main/gender-guesser.ts`: İsimlerden cinsiyet tahmini yapan yardımcı
  modül.
- `resources/icon.ico`: Uygulama ikonu.

---

## 📊 Veritabanı Şeması (SQLite)

Uygulamanın kalbi olan SQLite veritabanı aşağıdaki ana tablolardan oluşur:

### 👤 Kayıtlar (Core Data)

- **VatandasTBL**: Kişi bilgileri (Ad, TC, Cinsiyet, İletişim, İl/İlçe vb.).
  `Cinsiyet` alanı analiz modülüyle güncellenir.
- **DATA_Tapu_Verisi**: Araziler ve mülkiyet bilgileri (Ada/Parsel, Mevkii,
  Yüzölçümü, Hissedar vb.).
- **DATA_Merav_Listesi**: Görevli (Merav) listesi.

### ⚙️ Tanımlamalar (Configs)

- **TANIM_Mevkiler**: Bölgedeki tüm mevkilerin/semtlerin listesi.
- **TANIM_Depolar**: Su depoları, koordinatları ve kapasiteleri.
- **TANIM_Sulama_Hatları**: Depolar ile mevkiler arasındaki fiziksel bağlantı
  hatları.
- **TANIM_Isim_Cinsiyet**: Akıllı cinsiyet analizi için kullanılan özel isim
  sözlüğü (Ad -> Cinsiyet).
- **TANIM_Sezon**: Aktif sulama sezonu bilgileri.

### 💧 İşlemler (Operations)

- **ISLEM_Su_Dagitim**: Ana operasyonel tablo. Sulama sırası, hat, kullanılan
  süre.
- **DATA_Sulama_Programı**: 15 günlük periyotlarla hazırlanan sulama takvimi.

### 💰 Muhasebe & Finans (Accounting)

- **MUHASEBE_Tahakkuk**: Borçlandırma kayıtları (Tutar, Kalan Borç, Durum vb.).
- **MUHASEBE_Tahsilat**: Ödeme/tahsilat kayıtları (Miktar, Makbuz No, Kasa vb.).
- **MUHASEBE_Kasa_Hareketleri**: Nakit ve kredi kartı giriş-çıkış operasyonları.

---

## 🚀 Öne Çıkan Özellikler

### 1. Akıllı Dashboard & İstatistikler

Kişi sayısı, parsel miktarı ve toplam tahakkuk tutarlarını canlı olarak
gösteren, tıklanabilir metrik kartları ve son hareketler akışı.

### 2. Akıllı Cinsiyet Analizi (Gender Engine)

Sistemdeki tüm isimleri (`VatandasTBL`), kullanıcı tarafından tanımlanan özel
kurallar (`TANIM_Isim_Cinsiyet`) üzerinden tarayarak cinsiyet sütununu otomatik
olarak günceller. **Ayarlar > Cinsiyet Yönetimi** sekmesinden yönetilir.

### 3. Tahakkuk ve Borç Takibi Modülü

Su dağıtım işlemlerinden doğan borçların ve ödeme durumlarının izlendiği modül.
Verilerini `MUHASEBE_Tahakkuk` ve `MUHASEBE_Tahsilat` tablolarından sarsılmaz
bir disiplinle çeker. Kullanıcıya merkezi bir borç takip ve kalem kalem ödeme
ekranı sunar.

### 4. Gelişmiş Excel Entegrasyonu

- **Sıfırla ve Yükle**: Veritabanını Excel'deki verilerle tamamen temizleyip
  yeniden kurar.
- **Erişim ve Birleştir (Merge)**: Mevcut verileri koruyarak yeni kayıtları
  ekler.
- **Sıra Koruma**: Excel satır sırasını (`Excel_Sirasi`) veritabanında muhafaza
  eder.

### 5. Mevki & Hat Yönetimi

Tapu verilerinden otomatik olarak mevkileri toplar ve sulama hatlarının hangi
depodan beslendiğini yönetir.

---

## 🔐 Uygulama Tercihleri (Settings)

Ayarlar bölümü iki ana kısımdan oluşur:

- **Genel & Veri**: DB dizini bilgisi, Excel import araçları ve Mevki
  senkronizasyonu.
- **Cinsiyet Yönetimi**: İsim havuzunu (Sözlük) düzenleme ve analiz motorunu
  tetikleme.

---

## 📝 Teknik Notlar & Geliştirici Bilgisi

Uygulama **Kurum Başkanlığı**'nin arazi suyu takip ihtiyaçlarına özel
olarak, **Olgu YBS** sistemini tamamlayıcı bir araç olarak tasarlanmıştır. Tüm
veriler yerel bilgisayarın `AppData` klasöründeki `arazi_su_takip.db`
dosyasında saklanır. **İlyas Bozdemir** tarafından geliştirilmiştir.
