# Antigravity Knowledge & Skills Index

_Bu dosya Antigravity'nin projeye dair kazandığı yetenekleri ve kullanıcı
tercihlerini sarsılmaz bir disiplinle kaydeder._

## 📂 Proje Yapısı ve Mimari Tercihler

- **Mimari**: Onion Architecture (Soğan Mimarisi) benzeri katmanlı yapı tercih
  ediliyor.
- **UI/UX Standartı**: "Quiet Luxury" - Sessiz lüks, premium, koyu/açık mod
  uyumlu, modern tipografi (Inter/Outfit).
- **Veri Kaynağı**: SQLite (better-sqlite3) + WAL Modu.
- **Validasyon**: Zod tabanlı şema kontrolü + gerçek zamanlı (debounce)
  veritabanı benzersizlik kontrolü (TCKN/Sicil).

## 🛠️ Özel "Sarsılmaz" Yetenekler (Skills)

- **Mevki Otomasyonu**: Tapu kaydı sırasında girilen metin bazlı mevki bilgisini
  otomatik olarak `DATA_Mevki_Bilgisi` tablosuyla (ID bazlı) eşleştirme ve eksik
  mevkileri anlık oluşturma.
- **Hisse Pay Kilidi**: Kurum Başkanlığı standartlarına uygun olarak hisse
  payını (numerator) 1'e kilitleyip sadece paydayı (denominator) kullanıcıya
  yönettirme.
- **Otomatik JSON Serileştirme**: SQLite binding hatalarını önlemek için backend
  handler'larında objeleri otomatik `JSON.stringify` yapma.
- **Hızlı Kişi Kaydı**: Tapu veya başka bir formdayken bulunamayan TCKN'ler için
  modal üzerinden anlık kişi kartı oluşturma yeteneği.

## 📝 Kullanıcı Tercihleri (User Logic)

- **Büyük Harf Disiplini**: Soyad, Baba Adı, Ana Adı gibi alanların otomatik
  büyük harf yapılması.
- **Sarsılmaz Loglama**: Her kritik işlem için (Alert, Confirm, Save) detaylı
  log tutulması ve bu logların `İŞLEM GEÇMİŞİ` sekmelerinde gösterilmesi.
- **ID Bazlı İlişkiler**: İsim bazlı aramadan sonra mutlaka ID bazlı veri
  saklama (`Mevki_id`, `Sahip_id`).

## 🛑 SARSILMAZ KIRMIZI ÇİZGİLER (Red Lines)

1. **İsimlendirme**: Projenin adı her zaman **Kurum Başkanlığı**'dir. "G-Kurum", "GB" veya benzeri kısaltmalar asla kullanılmaz.
2. **Teknik Arşiv**: Her sohbet sonunda veritabanı veya mimari bir değişim yapılmışsa, `sql_history` klasörüne o anki şemayı içeren bir `schemaSnapshot` JSON dosyası eklenmesi zorunludur.
3. **UI Kalitesi**: Arayüzde asla "LOREM IPSUM" veya geçici yer tutucular kullanılmaz. Her zaman premium, animasyonlu ve Kurum Başkanlığı prestijine uygun tasarım yapılmalıdır.
4. **Veri Bütünlüğü**: Veriler asla sadece isimle eşleştirilmez; her zaman `id` (UUID) üzerinden ilişkisel (RDBMS) yapı korunmalıdır.
5. **Kesintisiz Durum Takibi**: Her oturum kapatılmadan önce `.agent/STATE.md` dosyası, bir sonraki seans için nerede kalındığını gösterecek şekilde güncellenmelidir.

## ⚠️ Kritik Notlar

- Mevki detayında sadece o Mevki_id'ye sahip tapuları çek.
- Vatandaş detayında TAPU ARŞİVİ ve İŞLEM GEÇMİŞİ sekmeleri her zaman aktif ve
  dolu olmalı.
- `window.api` üzerinden erişilen metodlar `preload/index.ts` içerisinde tanımlı
  olmalı.
- **Sarsılmaz Protokol**: Her teknik değişim bir "Sarsılmaz Snapshot" içermelidir.
