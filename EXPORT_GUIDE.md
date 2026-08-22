# 🚀 KURUM BAŞKANLIĞI - EXCEL EXPORT REHBERİ (V1)

Bu rehber, kurum bünyesindeki sulama ve mali kayıtların resmi evrak formatında (Excel) nasıl üretileceğini, tasarım standartlarını ve kod mimarisini açıklar.

## 📐 Tasarım Standartları

Tüm raporlar aşağıdaki görsel hiyerarşiye uygun olmalıdır:

### 1. Sayfa Yapısı (Portrait / Yayla)
- **Kullanım Amacı**: Küçük boyutlu listeler, makbuz dökümleri.
- **Standartlar**: 
  - Yönelim: Dikey (Portrait)
  - Kenar Boşlukları: Dar (Dar marjlar maksimum veri sığdırmalıdır)
  - Yazdırma: Tek sayfaya sığdır (Fit to one page wide)

### 2. Sayfa Yapısı (Landscape / Mahalle)
- **Kullanım Amacı**: Mahalle Defterleri, geniş kolonlu tablolar.
- **Standartlar**:
  - Yönelim: Yatay (Landscape)
  - Kolonlar: Dinamik genişlik, kritik veriler (Ad-Soyad) geniş tutulmalıdır.

## 🏗️ Kod Mimarisi (Modular Design)

Export sistemi tek bir dosyaya yığılmak yerine aşağıdaki modüllere ayrılmıştır:

### 1. `BaseExcelHandler`
Workbook ve Worksheet başlatma, sayfa yapısı (margins, orientation) ayarlarından sorumludur.

### 2. `StyleManager`
Hücre stilleri (Bold, Color, Alignment, Borders) ve koşullu biçimlendirme kurallarını yönetir. Tüm stil tanımları merkezi bir yerden yapılmalıdır.

### 3. `MappingEngine`
`export_mapping.json` dosyasındaki konfigürasyonu okur, dinamik değerleri (`{YIL}`, `{MAHALLE}`) yerleştirir ve veri satırlarını (`dataRows`) oluşturur.

## 📄 Yapılandırma Formatı (`export_mapping.json`)

Yeni bir rapor formatı eklemek için JSON dosyasına aşağıdaki şablon eklenmelidir:

```json
{
  "RAPOR_ADI": {
    "pageSetup": { "orientation": "landscape", "paperSize": 9 },
    "columnWidths": [5, 25, 15, 10],
    "headerRowsCount": 5,
    "staticCells": [
      { "at": "A1", "v": "KURUM BAŞKANLIĞI", "style": { "bold": true, "size": 14 } }
    ],
    "dataRows": {
      "startRow": 6,
      "mapping": {
        "A": "row_index",
        "B": "Ad_Soyad",
        "C": "Ada_Parsel"
      }
    }
  }
}
```

## 🛠️ Geliştirme Notları
- **Dinamik Veri**: `{key}` formatındaki her şey `dynamicValues` objesinden beslenir.
- **Hücre Birleştirme**: `merges` dizisi içindeki hücre aralıkları (örn: "A1:D1") otomatik birleştirilir.
- **Formüller**: Eğer bir hücrede hesaplama gerekiyorsa (Örn: `E{row} * F{row}`), `{row}` değişkeni o anki satır numarasıyla yer değiştirir.

---
*KURUM BAŞKANLIĞI - Bilgi İşlem Birimi*
