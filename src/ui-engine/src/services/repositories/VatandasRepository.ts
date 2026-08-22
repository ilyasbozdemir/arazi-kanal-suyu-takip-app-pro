import { BaseRepository } from "./BaseRepository";
import { TABLES } from "../../constants/tables";
import { VatandasDto } from "../../models/dtos/Vatandas.dto";

export class VatandasRepository extends BaseRepository<any, VatandasDto> {
  constructor() {
    super(TABLES.VATANDAS);
  }

  /**
   * Form Modelinden veya entity'den gelen veriyi veritabanı şemasına (DTO) dönüştürür.
   * "Kurum Filtre": Şemada olmayan alanlar (Sicil_Confirmed vb.) burada elenir.
   */
  toDto(values: any): VatandasDto {
    const dto: any = {};
    const schemaFields: (keyof VatandasDto)[] = [
      "id", "Sicil_No", "Tur", "TCKN", "Unvan", "Vergi_No", "Ad", "Soyad", 
      "Baba_Adi", "Ana_Adi", "Dogum_Yeri", "Dogum_Tarihi", "Cinsiyet", 
      "Seri_No", "Il", "Ilce", "Mahalle_Koy", "Cilt_No", "Aile_Sira_No", 
      "Uyruk", "Telefon", "Cep_Telefonu", "E_Posta_Adresi", "Adres_Turu", 
      "Adres", "Olum_Tarihi", "Durum"
    ];

    schemaFields.forEach(field => {
      if (values[field] !== undefined) {
        dto[field] = values[field];
      }
    });

    if (!dto.Durum) dto.Durum = "SAĞ";
    return dto as VatandasDto;
  }

  toEntity(dto: VatandasDto): any {
    return dto;
  }

  async checkAvailability(field: "TCKN" | "Sicil_No", value: string, currentId?: string): Promise<{ available: boolean, message?: string }> {
    if (!value) return { available: true };
    
    const query = field === "TCKN" ? { TCKN: value } : { Sicil_No: value };
    const existing = await this.getAll(query);
    
    if (existing.length > 0 && existing[0].id !== currentId) {
      const person = existing[0];
      const fieldName = field === "TCKN" ? "TC KİMLİK NO" : "SİCİL NUMARASI";
      return { 
        available: false, 
        message: field === "TCKN" ? "TCKN ZATEN KAYITLI!" : "BU SİCİL NO ZATEN KAYITLI!" 
      };
    }
    return { available: true };
  }
}

