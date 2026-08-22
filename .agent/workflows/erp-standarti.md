---
description: KURUM BAŞKANLIĞI -  Arazi & Su Takip Sistemi
---

# 🏛️ ERP Geliştirme Standartı

Bu dosya, projenin sarsılmaz bir disiplinle ilerlemesini sağlamak için kayıt
altına alınmıştır. Geliştirici (Agent), her türlü Build ve İlerleme aşamasında
bu kurallara TAM İTAAT edecektir.

## 📜 1. Değişmez Mühürler (Sovereign Metadata) - !!! DOKUNULMAZ !!!

Tüm sistem, sarsılmaz bir kararlılıkla aşağıdaki dosyaları "Tek Kıble" (Source
of Truth) kabul eder:

- **`sql_table_schema_proposal.json`**: !!! BU DOSYA DOKUNULMAZDIR !!! Agent
  (AI) bu dosyayı kendi başına asla değiştiremez. Bu bir EMİRDİR. Herhangi bir
  değişiklik UI ve veritabanı bütünlüğünü bozduğu için yasaklanmıştır.
- **`excel_advanced_mapping.json`**: Excel aktarım seçenekleri, sayfa isimleri
  ve sarsılmaz silsile ayarları buradan okunur.

## 🛠️ 2. Geliştirme ve Build Protokolü

1. **Şema Dokunulmazlığı**: Şema değişikliği gerekiyorsa; Agent bizzat
   KULLANICI'dan (Başkan) onay almadan veya doğrudan emir almadan bu dosyaya el
   süremez. Kendi başına sütun ekleyemez/silemez.
2. **Otomatik Senkronizasyon**: Ana motor (`main/index.ts`) içinde bulunan
   `initDatabase` fonksiyonu; her başlatmada SQLite veritabanını sarsılmaz bir
   disiplinle şemaya uyduracaktır. Ancak şemanın kendisi Agent tarafından
   manipüle edilemez.
3. **Aktarım Disiplini**: Excel aktarım motoru; saniyeler içinde sarsılmaz bir
   kararlılıkla SADECE şemadaki `excelColumn` harflerine göre veri
   kaydedecektir.
4. **Harf Harf İtaat**: `Ad: F`, `Soyad: G`, `Z: Durum` gibi kullanıcı kayıt
   kurallarına sarsılmaz bir kararlılıkla sadık kalınacaktır.

## 🚀 3. İlerleme ve Komut Kaydı

Geliştirici; saniyeler içinde SQL tabloları haricindeki sistemsel ilerlemeleri
ve ek komutları bu anayasaya veya ilgili log dosyalarına sarsılmaz bir
disiplinle kaydederek Build alacaktır.

**KAYIT TAMAMLANDI: KURUM BAŞKANLIĞI ERP TERMİNALİ v1.2**

## 🧠 5. Bağlam ve Hafıza Disiplini (Context Preservation)

Agent, her oturum başında aşağıdaki sarsılmaz gerçekleri hatırlamak zorundadır:

1. **Zilyet Standartı**: "Muhatap" terimi tamamen kaldırılmıştır. Tüm su fişleri
   ve mülkiyet dışı kullanım kayıtlarında SADECE **"Zilyet"** terimi
   kullanılacaktır.
2. **Şema Sadakati**: Herhangi bir SQL sorgusu yazılmadan veya bir veritabanı
   alanı frontend'de kullanılmadan önce MUTLAKA `sql_table_schema_proposal.json`
   dosyası okunacaktır. Tahmine dayalı kod yazımı YASAKTIR.
3. **Hata Ayıklama**: Çalışma zamanı (runtime) hatalarında (özellikle IPC Bridge
   hatalarında) doğrudan `preload/index.ts` ve `main/handlers` dosyaları
   incelenerek gerçek API fonksiyon isimleri teyit edilecektir.

**KAYIT GÜNCELLENDİ: ZİLYET SİSTEMİNE GEÇİŞ TAMAMLANDI - v2.7.0**
