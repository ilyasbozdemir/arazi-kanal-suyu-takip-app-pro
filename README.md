# 💧 Kurum Başkanlığı Arazi Suyu Takip Sistemi

Bu uygulama, Kurum Başkanlığı'nin arazi suyu takibi ve yönetimi için geliştirilmiş modern bir masaüstü çözümüdür. 
**Electron + React + TypeScript** teknolojileri ile inşa edilmiştir.

---

## 🚀 Başlangıç (Geliştirici)

### 1. Gereksinimler
- **Node.js:** v18 veya üzeri tavsiye edilir.
- **pnpm:** Paket yönetimi için (veya npm).

### 2. Kurulum
Bağımlılıkları yüklemek için:
```bash
pnpm install
```

### 3. Çalıştırma (Dev Mode)
Uygulamayı geliştirme modunda başlatmak için:
```bash
pnpm run dev
```

### 4. Paketleme (Setup.exe Oluşturma)
Kullanıcılar için kurulabilir bir EXE dosyası üretmek için:
```bash
pnpm run package
```
Oluşan dosyalar `dist/` klasöründe yer alacaktır.

---

## 📂 Proje Yapısı

```
src/
  ├── main/         # Electron ana süreci (DB, IPC, Excel)
  ├── renderer/     # React kullanıcı arayüzü (Dashboard, Tablolar)
  └── preload/      # Güvenli köprü (Bridge)
resources/          # Logo, ikon ve varsayılan Excel verileri
dist/               # Paketleme (Build) çıktıları
```

---

## ✨ Öne Çıkan Özellikler

-   📊 **Modern Dashboard:** Metric kartları ve hızlı istatistikler.
-   📥 **Akıllı Excel Import:** Mevcut verilerle birleştirme (Merge) veya tertemiz kurulum.
-   👤 **Entegre Cinsiyet Analizi:** Özel **Gender Engine** modülü sisteme entegre edilmiştir. İsimlerden otomatik cinsiyet tahmini (Ad -> Cinsiyet) yaparak veritabanını akıllıca günceller.
-   💧 **Su Dağıtım Takibi:** Sulama saatleri, borçlandırma ve tahsilat yönetimi.
-   ⚡ **Performans:** SQLite tabanlı, binlerce kayıtla akıcı çalışma.
-   🇹🇷 **Türkçe Destek:** Tamamen Türkçe arayüz ve karakter desteği.

---

## 📝 Kullanım Notları

- Veritabanı dosyası (`arazi_su_takip.db`) uygulamanın `AppData` klasöründe yerel olarak saklanır.
- İlk kurulumda `resources/` altındaki Excel dosyasından veri çekilebilir.
- **İlyas Bozdemir** tarafından Kurum Başkanlığı için tasarlanmıştır.
