/** 🛡️ TANIM_Konumlar Entity */
export interface TANIM_Konumlar {
  id: string;
  Parent_id: string | null;
  Tip: 'İL' | 'İLÇE' | 'BELDE' | 'KÖY' | 'MAHALLE' | 'BOLGE';
  Ad: string;
  Kod: string;
}
