# 🛡️ KURUM BAŞKANLIĞI - SARSILMAZ KRİPTO YEDEKLEME PROTOKOLÜ (v1.0)

Bu doküman, sistemin veri güvenliğini sağlamak amacıyla uygulanan yedekleme ve
şifreleme protokolünü tanımlar.

## 1. Yedekleme Paketi (ZIP Arşivi)

Yedekleme işlemi tetiklendiğinde sistem otomatik olarak bir **ZIP** arşivi
oluşturur. Bu arşiv şunları içerir:

- `KANAL_ARAZI_SUYU_TAKIPDB.db` (Veya şifreli hali: `.db.enc`)
- `.vault_recovery.key` (Gizli kurtarma anahtarı)

## 2. Sarsılmaz Kripto (AES-256)

Oluşturulan ZIP paketi doğrudan ham haliyle gönderilmez. Paket, **AES-256**
algoritması kullanılarak şifrelenir.

### 🔑 Kombo Anahtar (Key) Yapısı

Şifreleme anahtarı olarak paketin oluşturulduğu anın sarsılmaz ikili doğrulaması
kullanılır:

- **Format:** `YYYYMMDD_HHMMSS_UNIXTIMESTAMP`
- **Örnek:** `20260423_125341_1713870000`

## 3. Dosya Uzantısı ve İsimlendirme

Şifrelenmiş yedek paketleri şu formatta isimlendirilir:
`G_KURUM_YEDEK_YYYYMMDD_HHMMSS_UNIXTIMESTAMP.zip.aes`

## 4. Geri Yükleme ve Güvenlik Döngüsü

Bu paketin içeriğine ulaşmak için:

1. Dosya adındaki **Timestamp** (sayı grubu) tespit edilmelidir.
2. Bu timestamp anahtar olarak kullanılarak AES-256 çözme işlemi uygulanmalıdır.
3. Çözülen `.zip` arşivi açılarak içindeki verilere ulaşılabilir.

> [!IMPORTANT]
> **Timestamp bilgisi (dosya adındaki sayı grubu) olmadan bu paketi AES ile
> çözmek ve içindeki verilere ulaşmak sarsılmaz bir şekilde imkansızdır.**

## 5. Örnek Kurtarma Uygulaması (Node.js)

Aşağıdaki kod parçası, şifreli `.zip.aes` paketini orijinal haline döndürmek
için kullanılır:

```javascript
const crypto = require("crypto");
const fs = require("fs");

const decryptBackup = (encryptedFilePath, outputZipPath) => {
    // 1. Dosya ismindeki anahtarı (timestamp) bul
    // Format: G_KURUM_YEDEK_20260423_133800_1713870000.zip.aes
    const matches = encryptedFilePath.match(/(\d{8}_\d{6}_\d+)/);
    if (!matches) throw new Error("Dosya isminde geçerli anahtar bulunamadı!");

    const sarsilmazKey = matches[1]; // Örn: 20260423_133800_1713870000

    // 2. AES-256 anahtarını sarsılmaz şekilde hashle (32 byte)
    const key = crypto.createHash("sha256").update(sarsilmazKey).digest();
    const iv = Buffer.alloc(16, 0); // Standart IV

    // 3. Şifreyi çöz
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    const input = fs.readFileSync(encryptedFilePath);
    const decrypted = Buffer.concat([decipher.update(input), decipher.final()]);

    fs.writeFileSync(outputZipPath, decrypted);
    console.log("✅ Veri sarsılmaz bir şekilde kurtarıldı: " + outputZipPath);
};

// Kullanım:
// decryptBackup('G_KURUM_YEDEK_...zip.aes', 'kurtarilan_yedek.zip');
```

---

© 2023-2026 Kurum Başkanlığı Teknik Denetim Merkezi
