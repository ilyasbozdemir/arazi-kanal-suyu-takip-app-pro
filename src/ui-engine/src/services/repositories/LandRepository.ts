import { BaseRepository } from "./BaseRepository";
import { TABLES } from "../../constants/tables";
import { LandDto } from "../../models/dtos/Land.dto";

export class LandRepository extends BaseRepository<any, LandDto> {
  constructor() {
    super(TABLES.TAPU);
  }

  toDto(values: any): LandDto {
    const dto: any = {};
    const schemaFields: (keyof LandDto)[] = [
      "id", "Tasinmaz_No", "Mevki", "Ada", "Parsel", "Alan_m2", "Nitelik", 
      "Tapu_Sahibi_TCKN", "Sahip_Turu", "Hissedarlar_JSON", "Hisse_Orani", 
      "Varis_Durumu_Notu", "Kanal_Seviyesi_Altinda", "Kanal_Suyu_Ile_Sulanan", 
      "Tescil_Tarihi", "Yevmiye_No", "Mevki_id", "Sahip_id", "Aylik_Su_Hakki"
    ];

    schemaFields.forEach(field => {
      if (values[field] !== undefined) {
        dto[field] = values[field];
      }
    });

    return dto as LandDto;
  }

  toEntity(dto: LandDto): any {
    return dto;
  }
}

