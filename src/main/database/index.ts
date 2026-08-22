import { DATA_Vatandas } from "./tables/DATA_Vatandas";
import { DATA_Tapu_Verisi } from "./tables/DATA_Tapu_Verisi";
import { MUHASEBE_Tahakkuk } from "./tables/MUHASEBE_Tahakkuk";
import { MUHASEBE_Tahsilat } from "./tables/MUHASEBE_Tahsilat";
import { DATA_Dagitim_Bolgeleri } from "./tables/DATA_Dagitim_Bolgeleri";
import { DATA_Dagitim_Donemleri } from "./tables/DATA_Dagitim_Donemleri";
import { DATA_Tasinmaz_Mevkileri } from "./tables/DATA_Tasinmaz_Mevkileri";
import { DATA_Dagitim_Kayitlar } from "./tables/DATA_Dagitim_Kayitlar";
import { REL_TASINMAZ_VATANDAS } from "./tables/REL_TASINMAZ_VATANDAS";
import { REL_TASINMAZ_ZILYET } from "./tables/REL_TASINMAZ_ZILYET";
import { LOG_Activities } from "./tables/LOG_Activities";
import { MAP_Mevki_Listesi } from "./tables/MAP_Mevki_Listesi";
import { MAP_Katmanlar } from "./tables/MAP_Katmanlar";
import { MAP_Depolar } from "./tables/MAP_Depolar";
import { MAP_Altyapi } from "./tables/MAP_Altyapi";
import { TANIM_Ayarlar } from "./tables/TANIM_Ayarlar";
import { TANIM_Personel } from "./tables/TANIM_Personel";
import { TANIM_Kasalar } from "./tables/TANIM_Kasalar";

import { TANIM_Sulama_Fis_Kocanlari } from "./tables/TANIM_Sulama_Fis_Kocanlari";
import { TANIM_Su_Ucretleri } from "./tables/TANIM_Su_Ucretleri";
import { MUHASEBE_Kasa_Hareketleri } from "./tables/MUHASEBE_Kasa_Hareketleri";
import { MUHASEBE_Fisler } from "./tables/MUHASEBE_Fisler";
import { TANIM_Meravlar } from "./tables/TANIM_Meravlar";
import { REL_Defter_Merav } from "./tables/REL_Defter_Merav";
import { MUHASEBE_Z_Raporu } from "./tables/MUHASEBE_Z_Raporu";
import { TANIM_Konumlar } from "./tables/TANIM_Konumlar";
import { SYSTEM_Logs } from "./tables/SYSTEM_Logs";
import { SYSTEM_Analytics } from "./tables/SYSTEM_Analytics";
import { TANIM_Vergi_Oranlari } from "./tables/TANIM_Vergi_Oranlari";
import { TANIM_Faiz_Oranlari } from "./tables/TANIM_Faiz_Oranlari";

export const TablePrefixLogic = {
  DATA: "OPERASYONEL SİCİL VE ARŞİV VERİLERİ (Vatandaş, Tapu, Defter vb.)",
  MAP: "TEKNİK CBS VE HARİTALAMA VERİLERİ (Koordinat, Poligon, GIS vb.)",
  TANIM: "SİSTEM AYARLARI VE KONFİGÜRASYON (Personel, Ayarlar, Ücretler vb.)",
  TASINMAZ: "MÜLKİYET VE İLİŞKİSEL KÖPRÜ TABLOLARI (Sahip, Zilyet vb.)",
  MUHASEBE: "FİNANSAL HAREKET VE KASA YÖNETİMİ (Kasa Hareketleri vb.)",
};

export const schema = {
  database: "KANAL_ARAZI_SUYU_TAKIPDB",
  app_title: "KURUM BAŞKANLIĞI - KANAL VE ARAZİ SULAMA MODÜLÜ",
  developer: {
    name: "İlyas BOZDEMİR",
    web: "https://ilyasbozdemir.dev",
    github: "https://github.com/ilyasbozdemir"
  },
  version: "3.0.0-beta.1",
  tables: [
    DATA_Vatandas,
    DATA_Tapu_Verisi,
    MUHASEBE_Tahakkuk,
    MUHASEBE_Tahsilat,
    DATA_Dagitim_Bolgeleri,
    DATA_Dagitim_Donemleri,
    DATA_Dagitim_Kayitlar,
    DATA_Tasinmaz_Mevkileri,

    REL_TASINMAZ_VATANDAS,
    REL_TASINMAZ_ZILYET,
    LOG_Activities,

    MAP_Mevki_Listesi,
    MAP_Katmanlar,
    MAP_Depolar,
    MAP_Altyapi,

    TANIM_Konumlar,
    TANIM_Kasalar,
    TANIM_Ayarlar,
    TANIM_Meravlar,
    TANIM_Personel,
    TANIM_Su_Ucretleri,
    TANIM_Sulama_Fis_Kocanlari,

    MUHASEBE_Kasa_Hareketleri,
    MUHASEBE_Fisler,
    MUHASEBE_Z_Raporu,

    REL_Defter_Merav,

    SYSTEM_Logs,
    SYSTEM_Analytics,
    TANIM_Vergi_Oranlari,
    TANIM_Faiz_Oranlari,
  ],
};
