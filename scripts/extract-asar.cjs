const asar = require('asar');
const path = require('path');
const fs = require('fs');

/**
 * ASAR Ayıklama Scripti
 * Kullanım: node scripts/extract-asar.cjs <asar-dosya-yolu> [cikti-dizini]
 */

const args = process.argv.slice(2);

if (args.length < 1) {
  console.log('\n❌ Kullanım hatası!');
  console.log('Kullanım: node scripts/extract-asar.cjs <asar-dosya-yolu> [cikti-dizini]');
  console.log('Örnek: node scripts/extract-asar.cjs "D:\\Program Files\\app\\resources\\app.asar" "./cikti"\n');
  process.exit(1);
}

const asarPath = path.resolve(args[0]);
const outPath = args[1] ? path.resolve(args[1]) : path.join(process.cwd(), 'extracted_asar_' + Date.now());

if (!fs.existsSync(asarPath)) {
  console.error(`\n❌ Hata: ASAR dosyası bulunamadı: ${asarPath}\n`);
  process.exit(1);
}

// Çıktı klasörü yoksa oluştur
if (!fs.existsSync(outPath)) {
  fs.mkdirSync(outPath, { recursive: true });
}

console.log('\n-----------------------------------');
console.log('📦 ASAR Ayıklama İşlemi Başladı');
console.log(`📂 Kaynak: ${asarPath}`);
console.log(`🎯 Hedef:  ${outPath}`);
console.log('-----------------------------------\n');

try {
  asar.extractAll(asarPath, outPath);
  console.log('✅ İşlem Başarıyla Tamamlandı!');
  console.log(`Klasöre göz atın: ${outPath}\n`);
} catch (err) {
  console.error('❌ Ayıklama sırasında bir hata oluştu:');
  console.error(err.message);
  
  if (err.message.includes("Cannot find module 'asar'")) {
    console.log('\n💡 İpucu: asar paketi yüklü değil. Şu komutu çalıştırın:');
    console.log('pnpm add -D asar\n');
  }
}
