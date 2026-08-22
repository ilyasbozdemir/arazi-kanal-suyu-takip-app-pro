# 🏛️ KURUM BAŞKANLIĞI: MODERN MİMARİ VE YENİDEN YAPILANDIRMA ÖNERİSİ

Proje ölçeği büyüdükçe (Citizen -> Land Registry -> Debt -> Distribution -> Map), kodun sürdürülebilir kalması için **Onion Architecture**, **CQRS** ve **Repository** desenlerini içeren bu mimari rehber hazırlanmıştır.

---

## 1. 📂 FRONTEND KLASÖR YAPISI (ÖNERİ)

Daha modüler ve ölçeklenebilir bir yapı için önerilen dizin hiyerarşisi:

```text
src/ui-engine/src/
├── pages/                  # Uygulama rotaları (Layout ve sayfaların bağlandığı üst katman)
├── screens/                # Bağımsız domain ekranları
│   ├── citizen/
│   │   ├── CitizenScreen.tsx       # Ana ekran orkestratörü
│   │   ├── sections/               # Büyük ve modüler sayfa bölümleri
│   │   │   ├── CitizenStats.tsx
│   │   │   ├── CitizenGrid.tsx
│   │   ├── components/             # Sadece bu ekrana özel UI bileşenleri
│   │   ├── hooks/                  # Domain-özel veri çekme ve iş mantığı (hooks)
│   │   └── services/               # Bu domain için API/IPC etkileşim katmanı
├── components/             # Uygulama genelinde paylaşılan atomik bileşenler (Button, Input, Modal vb.)
├── core/                   # Merkezi DI, Context, Store ve Base sınıflar
└── shared/                 # Ortak yardımcılar (Utils), Tipler (Types) ve Sabitler (Constants)
```

---

## 2. 🧅 ONION ARCHITECTURE (BACKEND / MAIN PROCESS)

Bağımlılıkların merkeze (Domain) doğru aktığı, iş mantığının dış dünyadan (Veritabanı, IPC) izole edildiği katmanlı yapı.

1. **Core Layer (Merkez):** Hiçbir dış bağımlılığı yoktur.
   - `entities/`: Veri modelleri (Citizen, LandRegistry).
   - `interfaces/`: Repository ve Unit of Work soyutlamaları.
2. **Application Layer:** İş mantığını yönetir.
   - **CQRS Uygulaması:**
     - `commands/`: Yazma işlemleri (Örn: `CreateCitizenCommand`).
     - `queries/`: Okuma işlemleri (Örn: `GetCitizenDetailsQuery`).
     - `handlers/`: Komut ve sorguları işleyen mantık sınıfları.
3. **Infrastructure Layer:** Dış dünya entegrasyonları.
   - `repositories/`: Somut SQL implementasyonları.
   - `database/`: SQLite bağlantısı, migrasyonlar ve şema tanımları.
4. **Presentation (IPC) Layer:** Frontend ile iletişim kuran katman.
   - `ipc/`: İstekleri Application Layer'a ileten ince (thin) controller yapısı.

---

## 🛠️ 3. ÖNERİLEN DESIGN PATTERNS

### A. CQRS (Command Query Responsibility Segregation)
- **Neden?** Okuma (karmaşık joinler, arama) ve yazma (ekleme/güncelleme) işlemlerinin gereksinimleri farklıdır. Bunları ayırmak performansı ve kod okunabilirliğini artırır.
- **Örnek:** Genel bir `CitizenService` yerine `GetCitizenQueryHandler` kullanılması.

### B. Repository & Unit of Work
- **Repository:** Veri erişimini soyutlar, SQL sorgularının iş mantığına sızmasını engeller.
- **Unit of Work:** Birden fazla tabloyu etkileyen işlemlerde (örn: bir kaydı silerken ona bağlı harita geometrisini de silmek) işlem bütünlüğünü (**Transaction**) sağlar. "Ya hep ya hiç" prensibi ile çalışır.

### C. Dependency Injection (DI)
- **Neden?** Bileşenlerin oluşturulmasını kullanımından ayırarak sistemi daha test edilebilir ve esnek hale getirir.

---

## 📝 4. NAMING CONVENTIONS (PROFESYONEL STANDARTLAR)

Kod tabanında tutarlılığı sağlamak için aşağıdaki isimlendirme standartlarını takip ediniz:

| Tip | Desen (Pattern) | Örnekler |
| :--- | :--- | :--- |
| **Booleans** | `is{State}`, `has{Attribute}`, `should{Action}` | `isLoading`, `hasDebt`, `shouldRefresh` |
| **Collections** | Çoğul isimler (Plural nouns) | `citizens`, `propertyList`, `ledgers` |
| **Event Props** | `on{Event}` | `onSave`, `onRowClick`, `onFilterChange` |
| **Internal Handlers** | `handle{Event}` | `handleSave`, `handleDelete`, `handleSearch` |
| **Data Fetching** | `fetch{Entity}`, `get{Entity}` | `fetchCitizens`, `getRecordById` |
| **Components** | PascalCase | `CitizenCard`, `DetailField`, `MainLayout` |
| **Files** | kebab-case veya PascalCase | `citizen-screen.tsx` veya `CitizenScreen.tsx` |

---

## 🚀 GELİŞİM YOL HARİTASI

1. **Aşama 1:** Dev boyutlu ekran dosyalarını modüler `sections/` ve `hooks/` yapılarına bölerek parçalayın.
2. **Aşama 2:** `queryHandlers.ts` içindeki ham SQL sorgularını ilgili `Repository` sınıflarına taşıyın.
3. **Aşama 3:** IPC handler'larını sadece Komut (Command) veya Sorgu (Query) fırlatacak şekilde inceltin (Thin Controller).

---
_Bu mimari, Kurum projesini dünya standartlarında bir yazılım ürününe dönüştürecektir._
