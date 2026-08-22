import React, { useState, useEffect } from "react";

/**
 * 🛡️ Helper: Merav'ın sorumlu olduğu bölgeleri REL_Defter_Merav üzerinden bulur.
 * Bu bileşen Merav kartlarında (Grid ve Liste) dinamik bölge bilgisi göstermek için kullanılır.
 */
export const MeravResponsibilityArea: React.FC<{ id: string; tckn: string }> = ({ id, tckn }) => {
  const [areas, setAreas] = useState<string>("YÜKLENİYOR...");

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const res = await (window as any).api.executeRaw(`
          SELECT DISTINCT loc.Ad 
          FROM REL_Defter_Merav rel
          JOIN DATA_Dagitim_Donemleri d ON rel.Defter_id = d.id
          JOIN DATA_Dagitim_Bolgeleri b ON (d.Bolge_id = b.id OR d.Mahalle_id = b.id OR d.Mahalle_id = b.Mahalle_id)
          JOIN TANIM_Konumlar loc ON b.Mahalle_id = loc.id
          WHERE rel.Merav_id = ? AND rel.Aktif = 1
        `, [id]);

        if (res.success && res.data.length > 0) {
          setAreas(res.data.map((r: any) => r.Ad).join(", "));
        } else {
          setAreas("TÜM BÖLGELERDE YETKİLİ");
        }
      } catch (err) {
        setAreas("BÖLGE BİLGİSİ ALINAMADI");
      }
    };
    fetchAreas();
  }, [id]);

  return (
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate max-w-[200px]" title={areas}>
      {areas}
    </span>
  );
};
