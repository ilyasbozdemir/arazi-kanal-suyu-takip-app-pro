---
description: Projeyi geliştirme (dev) modunda çalıştırma ve genel bakış
---

# 🚀 Sulama CRM Geliştirme Rehberi (KRİTİK)

// turbo-all

> [!IMPORTANT]
> **AJAN İÇİN TALİMAT:** Bu proje geliştirme aşamasındadır. Uygulama
> kapandığında veya dev server düştüğünde **OTOMATİK OLARAK** `pnpm run dev`
> komutunun çalıştırılması zorunludur. Kullanıcıdan onay beklemeden
> (SafeToAutoRun: true) başlatılmalıdır.

## 1. Geliştirme Sunucusunu Başlatma

Projeyi canlı izleme modunda başlatmak için:

```powershell
pnpm run dev
```

## 2. Proje Yapısı

- `src/main/index.ts`: Electron ana süreci (SQLite, Excel Import, Gender
  Analysis, IPC Handlers)
- `src/ui-engine/src/App.tsx`: React/Tailwind arayüzü (Dashboard, TableView,
  Akıllı Kartlar, Caching)
- `src/main/gender-guesser.ts`: Kesin eşleşme tabanlı (list-based) cinsiyet
  analiz motoru.

## 3. Güncel Özellikler & Veri Yapısı

- **Akıllı Önbellek (Caching):** Uygulama açılışında `preFetchAllData()` ile tüm
  tablolar hafızaya alınır. Sekme geçişleri anlıktır.
- **Kişi Detay Kartları:** İsimli/İkonlu şık kart yapısı (`RecordDetailView`).
- **Sulama Hattı Akış:** Hareketli su simülasyonu içeren görsel planlama ekranı.
- **OLGU Sicil No:** Veri eşleştirmeleri artık Olgu YBS uyumlu `OLGU Sicil No`
  üzerinden yapılmaktadır.

## 4. Kritik Kurallar

- Tablo silme/güncelleme sonrası `getData(tableName, true)` ile cache
  tazelenmelidir.
- Yeni kod eklerken `App.tsx` içindeki devasa dosya boyutundan dolayı parça
  parça düzenleme yapılmalıdır.
- **Sultan** ismi her zaman kadın isimleri listesinde yer almalıdır.
