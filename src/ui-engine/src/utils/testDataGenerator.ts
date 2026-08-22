import { getTableConfig } from "../config/TableConfig";

export const generateTestData = (table: string, currentValues: any) => {
  const ts = new Date().getTime().toString().slice(-4);
  const data: any = { ...currentValues };
  
  if (table === 'DATA_Vatandas') {
    data.Ad = "Test Ad " + ts;
    data.Soyad = "Test Soyad " + ts;
    data.Unvan = "Test Ünvan " + ts;
    data.TCKN = "1111111111" + ts[3];
    data.Sicil_No = "100" + ts;
    data.Telefon = "+90555" + ts + ts.substring(0,3);
    data.Adres = "Test Mah. Test Sok. No:" + ts;
    data.Dogum_Tarihi = "1990-01-01";
    data.Baba_Adi = "Test Baba";
    data.Ana_Adi = "Test Ana";
  } else if (table === 'DATA_Tapu_Verisi') {
    data.Ada = "10" + ts[3];
    data.Parsel = "20" + ts[2];
    data.Alan_m2 = 1000 + Number(ts);
    data.Nitelik = "TARLA";
    data.Aylik_Su_Hakki = "10 Saat";
    data.Pafta = "P-" + ts;
    data.Cilt_Sayfa = "C-" + ts;
    data.Tasinmaz_No = "1000" + ts;
    data.Notlar = "Test amacıyla otomatik oluşturuldu.";
  } else if (table === 'MUHASEBE_Tahsilat') {
     data.Miktar = 1500;
     data.Odeme_Yontemi = "Nakit";
     data.Aciklama = "Test Tahsilat " + ts;
  } else if (table === 'MUHASEBE_Z_Raporu') {
     data.Nakit_Tutar = 5000;
     data.Banka_Tutar = 2000;
     data.Aciklama = "Test Z Raporu " + ts;
  } else if (table === 'TANIM_Personel') {
    data.Unvan = "Test Personel " + ts;
    data.Eposta = `test${ts}@kurum.gov.tr`;
    data.Telefon = "+90555111" + ts;
    data.Sifre = "123456";
    data.Durum = "Aktif";
    data.Aktif = 1;
  } else if (table === 'TANIM_Meravlar') {
    data.Telefon = "+90555222" + ts;
    data.Aktif = 1;
  } else if (table === 'DATA_Tasinmaz_Mevkileri') {
    data.Mevki_Adi = "Test Mevki " + ts;
    data.Mahalle_Koy = "Test Mahalle";
    data.Aciklama = "Otomatik oluşturulan test mevkisi";
  } else if (table === 'DATA_Dagitim_Bolgeleri') {
    data.Tip = "SULAMA BÖLGESİ";
    data.Durum = "Aktif";
  } else {
     const cols = Object.keys(currentValues || {});
     if (cols.length === 0) {
        const config = getTableConfig(table);
        config.priorityColumns.forEach(k => {
           if (k !== 'id' && !k.endsWith('_id') && !k.endsWith('_Id') && !k.endsWith('_JSON')) {
              data[k] = "Test " + ts;
           }
        });
     } else {
        cols.forEach(k => {
           if (k !== 'id' && !k.endsWith('_id') && !k.endsWith('_Id') && !k.endsWith('_JSON') && (!currentValues[k] || currentValues[k] === '')) {
              data[k] = "Test " + ts;
           }
        });
     }
  }
  return data;
}
