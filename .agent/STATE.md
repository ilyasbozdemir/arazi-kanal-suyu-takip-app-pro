# Proje Durum ve Sürüm Notları (State & Release Notes)

Bu dosya, projede her geliştirme adımı sonrasında güncellenerek "nerede
kaldığımızı" ve "sonraki asımları" belgeleme amacıyla kullanılır. Yeni bir
oturum başladığında lütfen önce bu dosyaya göz atın.

## Sürüm Notları (Son Yapılan Değişiklikler)

### [v2.5.0] - 2026-04-23

- **Sarsılmaz Mevki Otomasyonu**: Taşınmaz kaydı sırasında girilen mevki
  isimleri veritabanı ile otomatik eşleşir; yoksa yeni mevki kaydı sarsılmaz bir
  şekilde oluşturulur.
- **Personel (Merav) Entegrasyonu**: Personel kayıt ekranı Citizen (Vatandaş)
  rehberi ile bağlandı. TCKN/İsim üzerinden personel seçimi aktif edildi.
- **Mevki Selector**: Tüm ilgili ekranlarda (Personel, Tapu vb.) ID yazmak
  yerine isimle arama/seçme özelliği (MevkiField) eklendi.
- **Şema Snapshot Protokolü**: `sql_history` altında her sürüm için veritabanı
  röntgeni (snapshot) alınmaya başlandı.
- **UI Temizliği**: Personel ekranındaki gereksiz GeoJSON/Harita bölümleri
  gizlendi, form alanları ilklendirildi.

### ✅ Sarsılmaz Teknik Doğrulama (Technical Tests)

- **Paket Sürümü (v2.5.0)**: ✅ PASSED
- **SQL Tarihçe Bütünlüğü**: ✅ PASSED
- **Mevki Otomasyon Mantığı**: ✅ PASSED
- **Veritabanı Şema Tanımı**: ✅ PASSED
- _Detaylı Rapor: /tests/v2.5.0_result.json)_

## Mevcut Durum (v2.5.0)

- **Aktif Sürüm**: v2.5.0 (Mevki & Personel Focus)
- **Mevki Otomasyonu**: Stabil çalışıyor (LandService üzerinden).
- **Personel Yönetimi**: Citizen rehberi ile tam entegre.
- **Veritabanı Tarihçesi**: `sql_history` klasöründe v2.5.0.json snapshot
  mevcut.

## Sonraki Adımlar (Next Steps)

1. **Harita Entegrasyonu Derinleştirme**: MevkiManagement ile MapViewScreen
   arasındaki "bölge bazlı gösterim" bağını kuvvetlendirmek.
2. **Performans**: Büyük veri setlerinde CitizenSelector ve MevkiSelector'ın
   debounce sürelerini optimize etmek.
3. **Lint Temizliği**: Kod genelindeki "inline style" ve "discernible text"
   (erişilebilirlik) uyarılarını gidermek.

## 🧪 Saha Test Takip Listesi (Dev-Mode)

Kullanıcı (Başkan) tarafından UI üzerinden test edilecek sarsılmaz senaryolar:

- [ ] **Vatandaş CRUD Testi**: Yeni vatandaş ekleme, bilgileri güncelleme ve
      silme işlemleri sorunsuz mu? (Durum: Beklemede)
- [ ] **Personel (Merav) Entegrasyonu**: Yeni personel eklerken "Kişi Seçici"
      rehberi doğru çalışıyor mu? (Durum: Beklemede)
- [ ] **Mevki Otomasyonu**: Yeni bir Tapu kaydı girerken Mevki adı yazıldığında
      otomatik ID ataması yapılıyor mu? (Durum: Beklemede)
- [ ] **Mevki Rehber Testi**: Personel veya Tapu ekranında Mevki seçici
      (MevkiField) tüm kayıtları getiriyor mu? (Durum: Beklemede)
- [ ] **Raporlar Ekranı**: Mevki Listesi raporu eksiksiz ve hatasız açılıyor mu?
      (Durum: Beklemede)
- [ ] **Harita Görünümü**: Parsel ve CBS katmanları sarsılmaz bir disiplinle
      render ediliyor mu? (Durum: Beklemede)

_Not: Test sonuçlarını bu listede [x] yaparak işaretleyebilir veya bana hata
ekranı atabilirsiniz._
