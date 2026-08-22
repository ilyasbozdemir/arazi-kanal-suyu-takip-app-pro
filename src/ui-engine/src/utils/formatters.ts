/**
 * formatters.ts: Veri formatlama ve dönüştürme yardımcılarını içerir.
 */

/**
 * Türk Lirası veya virgüllü sayı formatını (1.250,50) 
 * standart JS Float formatına (1250.50) dönüştürür.
 */
export const parseTurkishFloat = (value: any): number => {
  if (value === null || value === undefined || value === "") return 0;
  
  const str = String(value);
  // Noktaları sil (binlik ayırıcı), virgülü noktaya çevir (ondalık ayırıcı)
  const normalized = str.replace(/\./g, '').replace(/,/g, '.');
  const num = parseFloat(normalized);
  
  return isNaN(num) ? 0 : num;
};

/**
 * Yazıların ilk harfini büyütür (Türkçe karakter duyarlı)
 */
export const toTitleCaseTR = (str: string): string => {
  if (!str) return "";
  return str.split(' ').map(word => 
    word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1).toLocaleLowerCase('tr-TR')
  ).join(' ');
};

