import React from "react";

export const ColumnRenderer = {
  highlightText: (text: any, highlight: string) => {
    if (!highlight || !highlight.trim() || !text) return <span className="font-semibold">{text}</span>;
    
    // Akıllı Arama operatörlerini temizle (sadece değerleri al)
    const rawTerms = highlight.trim().split(/\s+/);
    const searchTerms = rawTerms.map(term => {
        if (term.includes(':')) return term.split(':')[1];
        if (term.includes('=')) return term.split('=')[1];
        if (term.startsWith('~')) return ""; // Regex araması vurgulanmaz
        return term;
    }).filter(t => t && t.length > 0).flatMap(t => t.split(','));

    if (searchTerms.length === 0) return <span className="font-semibold">{text}</span>;

    const trMap: any = { 'i': '[iİ]', 'İ': '[iİ]', 'ı': '[ıI]', 'I': '[ıI]', 'ş': '[şŞ]', 'Ş': '[şŞ]', 'ğ': '[ğĞ]', 'Ğ': '[ğĞ]', 'ü': '[üÜ]', 'Ü': '[üÜ]', 'ö': '[öÖ]', 'Ö': '[öÖ]', 'c': '[cCçÇ]', 'ç': '[cCçÇ]', 'Ç': '[cCçÇ]' };
    const pattern = searchTerms.map(t => t.split('').map(c => trMap[c] || c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join('')).join('|');
    
    try {
      const parts = String(text).split(new RegExp(`(${pattern})`, "gi"));
      return (
        <span className="font-semibold">
          {parts.map((p, i) => 
            searchTerms.some(t => p.toLocaleLowerCase('tr-TR').includes(t.toLocaleLowerCase('tr-TR'))) 
            ? <mark key={i} className="bg-blue-100 text-blue-900 dark:bg-blue-900/50 dark:text-blue-200 px-0.5 rounded-sm ring-1 ring-blue-200 dark:ring-blue-800">{p}</mark> 
            : p
          )}
        </span>
      );
    } catch (e) { return <span className="font-semibold">{text}</span>; }
  },

  renderStatusBadge: (val: any) => {
    const formatted = (!isNaN(parseFloat(val)) && parseFloat(val) % 1 === 0) ? String(parseInt(val)) : String(val);
    return (
      <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-black border border-indigo-100 dark:border-indigo-500/20 tabular-nums shadow-sm" title={String(val)}>
        {formatted}
      </span>
    );
  },

  renderNumberBadge: (val: any) => {
    const formatted = (!isNaN(parseFloat(val)) && parseFloat(val) % 1 === 0) ? String(parseInt(val)) : String(val);
    return (
      <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-black border border-blue-100 dark:border-blue-500/20 tabular-nums shadow-sm" title={String(val)}>
        {formatted}
      </span>
    );
  }
};

