# 🏛️ Kurum Başkanlığı Sulama CRM - Kapsamlı Kullanım Rehberi (A-Z)

Bu rehber, sistemin neden geliştirildiğini, neler yapabildiğini ve gelecekteki
hedeflerini detaylıca açıklar.

---

## 🚀 Neden Bu Sisteme Geçtik? (Vizyon & Gerekçeler)

Kurum bünyesindeki sulama ve tapu kayıtlarının geleneksel **Excel**
dosyalarında takip edilmesi, zamanla telafisi güç hatalara yol açmaktadır:

- **Formül Bozulmaları:** Binlerce satırlık dosyalarda farkında olmadan bir
  formülün silinmesi tüm hesaplamaları (tahakkukları) bozabilir.
- **Veri Tekrarı & Kirlilik:** Aynı kişinin veya parselin mükerrer girilmesi
  sonucu yanlış faturalandırma yapılabilir.
- **Erişim Zorluğu:** Excel dosyaları tek bir bilgisayara hapsolur; veriye anlık
  ulaşmak ve raporlamak zordur.
- **İnsan Hatası:** Dalgınlıkla yanlış hücreye girilen bir veri, tüm sezonu
  etkileyebilir.

**Sistemimiz (YBS CRM), bu riskleri sıfırlamak, veriyi "kurumsal hafıza" haline
getirmek ve gelecekteki "OLGU YBS" entegrasyonu ile tam dijitalleşmeyi sağlamak
için kurulmuştur.**

---

## 🛠️ Sistem Neler Yapabilir? (Sınırlar & Yetenekler)

### 1. Akıllı Veri Yönetimi

- **Kişi Listesi:** Tüm kurum sakinlerini ve hissedarları "OLGU Sicil No" ile
  takip eder.
- **Tapu & Parsel:** Merkez İl/MEGSİS entegrasyonu ile parsel detaylarını ve
  geometrisini (koordinatlarını) anlık sorgular.
- **Mevkii Yönetimi:** Bölgelere göre (Örn: Yayla, Merkez, Ova) arazi gruplaması
  yapar.

### 2. Akıllı Arama Motoru (YENİ)

- **Kişisel:** `isim:baba_adı` formatıyla aile bağlarını ve kardeşleri anında
  bulur.
- **Parsel:** `ada/parsel` formatıyla (Örn: 101/5) araziyi saniyeler içinde
  süzebilir.

### 3. Operasyonel İşlemler

- **Su Dağıtımı & Hat Yönetimi:** Hangi hattın hangi depodan beslendiğini ve
  kimin ne kadar su kullandığını kayıt altına alır.
- **Tahakkuk Takibi:** Excel'deki riskli formüller yerine, sistem otomatik
  olarak tahakkuk fişi ve borç kaydı oluşturur.
- **Otomatik Yedekleme:** Güvenliğiniz için tüm veriyi şifreli olarak yedekler
  ve e-posta ile size gönderir.

### 4. Güvenlik

- **Kasa (Vault):** Hassas verileri (şifreler, özel notlar) askeri düzeyde
  (AES-256) şifreleme ile korur.
- **Uygulama Kilidi:** İzinsiz girişleri engellemek için ana giriş şifresi
  konulabilir.

---

## 🏁 Gelecek Hedefleri (Yol Haritası)

- **Merav Entegrasyonu:** Su dağıtıcıları (meravlar) sahada el terminalleri veya
  mobil uygulama ile bu sisteme anlık veri girebilecek.
- **OLGU YBS Entegrasyonu:** Sistemin oturmasıyla birlikte kurumnin ana
  yazılımı (OLGU) ile çift taraflı haberleşme sağlanacak.
- **Canlı İzleme:** Depo doluluk oranları ve sulama hatlarındaki su akışı
  Dashboad ekranından canlı izlenebilecek.

---

## 📂 Veritabanı Taşıma (Ev-Kurum Arası Çalışma)

Evde hazırladığınız bir veritabanını kuruma getirmek isterseniz:

1. **Ayarlar > Veritabanı** kısmından "Dışarıdan Veritabanı Yükle" seçeneğini
   kullanın.
2. Yükleme sonrası uygulama kendini yeniden başlatacak ve yeni verilerle
   açılacaktır.
3. _Dikkat:_ Mevcut veritabanınızı mutlaka yedeklemeyi unutmayın!

---

> [!TIP]
> **Unutmayın:** Bu sistem sadece bir kayıt tutucu değil, kurummizin
> gelecekteki "Akıllı Kurumcilik" vizyonunun temel taşıdır.
