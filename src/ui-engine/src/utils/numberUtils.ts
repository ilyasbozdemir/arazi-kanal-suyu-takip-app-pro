/**
 * KURUM BAŞKANLIĞI - Sayı Formatlama Yardımcıları
 * Sarsılmaz nizamda büyük sayıları profesyonelce formatlar.
 */

/**
 * Sayıları kısaltılmış formatta (1k, 1.2M vb.) döndürür.
 */
export const formatCompactNumber = (value: number): string => {
  if (value === null || value === undefined) return '0';
  
  const formatter = Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  });
  
  return formatter.format(value);
};

/**
 * Sayıları Türkçe para formatında (1.250,50 ₺) döndürür.
 */
export const formatCurrency = (value: number): string => {
  if (value === null || value === undefined) return '0,00 ₺';
  
  return value.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' ₺';
};

/**
 * Sayıları standart Türkçe formatında (1.250) döndürür.
 */
export const formatNumber = (value: number): string => {
  if (value === null || value === undefined) return '0';
  return value.toLocaleString('tr-TR');
};

/**
 * Sayıları Excel sütun formatına (A, B, ..., Z, AA, AB...) çevirir.
 * @param index 0-tabanlı index
 */
export const getExcelColumnName = (index: number): string => {
  let result = "";
  let n = index;
  while (n >= 0) {
    result = String.fromCharCode((n % 26) + 65) + result;
    n = Math.floor(n / 26) - 1;
  }
  return result;
};
