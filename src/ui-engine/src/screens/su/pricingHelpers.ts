/**
 * Su Ücret Tarifeleri için Yardımcı Fonksiyonlar
 */

export const getDayanakLabel = (type: string) => {
  const labels: any = {
    'MECLIS_KARARI': 'KURUM MECLİS KARARI',
    'ENCUMEN_KARARI': 'KURUM ENCÜMEN KARARI',
    'KANUN': 'KANUN / MEVZUAT',
    'GENELGE': 'BAKANLIK GENELGESİ',
    'UST_YAZI': 'ÜST YAZI / RESMİ YAZIŞMA',
    'DIGER': 'DİĞER RESMİ DAYANAK'
  };
  return labels[type] || type;
};

export const getNumberLabel = (type: string) => {
  switch(type) {
    case 'KANUN': return 'Kanun Numarası';
    case 'GENELGE': return 'Genelge Sayısı';
    case 'UST_YAZI': return 'Evrak / Sayı No';
    default: return 'Karar / Dayanak No';
  }
};

export const getDayanakPlaceholder = (type: string) => {
  switch(type) {
    case 'KANUN': return 'Örn: 2462 Sayılı Kurum Gelirleri Kanunu';
    case 'GENELGE': return 'Örn: Bakanlık Su Tasarrufu Genelgesi';
    case 'UST_YAZI': return 'Örn: E-12345678-100-01';
    case 'MECLIS_KARARI': return 'Örn: 2026/12 Sayılı Meclis Kararı';
    case 'ENCUMEN_KARARI': return 'Örn: 2026/45 Sayılı Encümen Kararı';
    default: return 'Dayanak / Karar Numarası veya Adı';
  }
};

export const getDayanakHint = (type: string) => {
  switch(type) {
    case 'KANUN': return 'İlgili kanunun numarasını ve adını yazınız.';
    case 'GENELGE': return 'Genelgenin tarih ve sayısını veya konusunu yazınız.';
    case 'UST_YAZI': return 'Gelen resmi yazının sayı/evrak numarasını giriniz.';
    default: return 'Resmi kayıt numarasını giriniz.';
  }
};
