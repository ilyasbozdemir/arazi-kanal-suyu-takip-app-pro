# Project Rules & Constraints

## 1. Veri Giriş Kuralları (Data Entry Rules)

### Ad ve Soyad Formatı (Name Formatting)

- Tüm isim alanları (**Ad**, **Soyad**, **Baba_Adi**, **Ana_Adi**, **Sahibi**
  vb.) otomatik olarak **Title Case** (İlk Harf Büyük, Gerisi Küçük) formatına
  dönüştürülmelidir.
- **Teknik Uygulama**: Türkçe karakter desteği için `toLocaleUpperCase('tr-TR')`
  ve `toLocaleLowerCase('tr-TR')` metodları kullanılmalıdır.
- Kullanıcı yazarken veya veri yapıştırıldığında bu kural her zaman
  uygulanmalıdır.

### TCKN Doğrulama (TCKN Validation)

- TCKN alanları tam olarak 11 haneli ve sayısal olmalıdır.
- Matematiksel TCKN doğrulama algoritması (10. ve 11. hane kontrolü) her zaman
  uygulanmalıdır.
- e-kurum sorgulama adımlarında, kayıt bulunamazsa kullanıcıya şu mesaj
  gösterilmelidir:
  > "Lütfen Tahsilat biriminden veya Mali Hizmetler Md'den sicil kaydı yaptırıp
  > bilgileri buraya sicil no ile ekleyin."
- **Sicil No Zorunluluğu**: Yeni Kişi kayıtlarında Sicil No olmadan işleme izin
  verilmemelidir.

## 2. Tasarım Prensipleri (Design Principles)

- UI her zaman premium ve modern (glassmorphism, soft shadow, black-slate theme)
  görünmelidir.
- Inter veya Outfit gibi modern tipografiler kullanılmalıdır.
- Butonlar ve etkileşimli öğeler için Framer Motion animasyonları tercih
  edilmelidir.

## 3. Sürüm ve Durum Takibi (State & Release Tracking) - ZORUNLU

- **Her geliştirme adımının veya sorunun sonunda**, bir sonraki oturumda (veya
  farklı bir oturuma geçildiğinde) nerede kalındığını net bir şekilde
  hatırlayabilmek için `.agent/STATE.md` dosyası GÜNCELLENMELİDİR.
- Bu dosyada şunlar yer almalıdır:
  1. **Son Yapılan Değişiklikler (Release Notes/Changelog)**: Hangi dosyalar
     düzenlendi, hangi özellikler eklendi/düzeltildi.
  2. **Mevcut Durum**: Projede tam olarak şu an ne yapılıyor veya yapılmaya
     çalışıldı.
  3. **Bekleyen Görevler/Sonraki Adımlar (Next Steps)**: Yapılacak ilk iş ne
     olmalı, bilinen hatalar veya eksikler neler.
- "Far tutulmuş tavşan gibi donmamak" adına bu kural kesindir. Bir chat oturumu
  başlatıldığında her zaman ajan (agent) bu dosyaya bakarak bağlama hakim
  olmalıdır.

## 4. Sarsılmaz SQL Tarihçe & Şema Snapshot Protokolü (Mandatory)

- **Veritabanı Değişiklik Takibi**: Herhangi bir SQL tablo yapısı değişikliği, yeni tablo ekleme veya kolon güncellemesi yapıldığında; bu değişiklikler MUTLAKA `sql_history/` klasörü altında yeni bir sürüm dosyası (`vX.X.X.json`) olarak kaydedilmelidir.
- **Şema Snapshot Zorunluluğu**: v2.4.1 sürümünden itibaren oluşturulan her tarihçe dosyası, o anki veritabanı şemasının teknik dökümünü içeren `schemaSnapshot` objesini barındırmalıdır.
- **İsimlendirme Standardı**: Proje genelinde ve tarihçe kayıtlarında her zaman **"Kurum Başkanlığı"** ismi kullanılmalıdır. "G-Kurum" veya benzeri kısaltmalardan kaçınılmalıdır.
- **Süreklilik**: Her sohbet/oturum sonunda yapılan işler hem `.agent/STATE.md` dosyasına hem de (eğer teknik bir değişim varsa) `sql_history/` klasörüne "Kurum Başkanlığı" vizyonuna uygun şekilde işlenmelidir.
