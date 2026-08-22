import { z } from "zod";

/**
 * Vatandas Form Doğrulama Şeması (Zod)
 * kurum ERP Standartı: Eski verilere saygı, yeni verilere rehberlik.
 */
export const vatandasSchema = z.object({
  Ad: z.preprocess((val) => val ?? "", z.string().min(1, "AD BOŞ BIRAKILAMAZ").max(100)),
  Soyad: z.preprocess((val) => val ?? "", z.string().max(100).optional().or(z.literal(""))),
  Unvan: z.preprocess((val) => val ?? "", z.string().max(100).optional().or(z.literal(""))),
  TCKN: z.preprocess((val) => val ?? "", z.string().optional().refine(val => !val || val.length === 11, {
    message: "TCKN 11 HANELİ OLMALIDIR"
  })),
  Sicil_No: z.preprocess((val) => val ?? "", z.string().optional()),
  Durum: z.preprocess((val) => {
    if (val === "Aktif" || val === "AKTİF") return "SAĞ";
    if (val === "Pasif" || val === "PASİF") return "ÖLÜ";
    return (val === "" || val === null || val === undefined) ? "SAĞ" : val;
  }, z.enum(["SAĞ", "ÖLÜ", "AKTİF", "PASİF"]).default("SAĞ")),
  Cinsiyet: z.preprocess((val) => val ?? "", z.string().optional()),
  Telefon: z.preprocess((val) => val ?? "", z.string().optional()),
  Cep_Telefonu: z.preprocess((val) => val ?? "", z.string().optional()),
  E_Posta_Adresi: z.preprocess((val) => val ?? "", z.string().email("GEÇERSİZ E-POSTA FORMATI").optional().or(z.literal(""))),
  Dogum_Tarihi: z.preprocess((val) => val ?? "", z.string().optional()),
  Dogum_Yeri: z.preprocess((val) => val ?? "", z.string().optional()),
  Ana_Adi: z.preprocess((val) => val ?? "", z.string().optional()),
  Baba_Adi: z.preprocess((val) => val ?? "", z.string().optional()),
  Mahalle_Koy: z.preprocess((val) => val ?? "", z.string().optional()),
  Adres: z.preprocess((val) => val ?? "", z.string().optional()),
  Uyruk: z.preprocess((val) => val ?? "T.C.", z.string().optional()),
});

export type VatandasSchemaType = z.infer<typeof vatandasSchema>;

