import { SqliteUnitOfWork } from "@infrastructure/database/SqliteUnitOfWork";

export class GetActiveLedgersHubQueryHandler {
  constructor(private uow: SqliteUnitOfWork) {}

  async handle() {
    try {
      // 1. Fetch all managed regions with their active periods for the current year
      const currentYear = new Date().getFullYear();
      const sql = `
        SELECT 
          b.id as Bolge_Record_Id,
          b.Mahalle_id,
          b.Tip as Mahalle_Tip,
          loc.Ad as Mahalle_Adi,
          l.id as id, -- Donem ID
          COALESCE(l.Baslangic_Yili, ${currentYear}) as Baslangic_Yili,
          l.Donem_Adi,
          l.Durum
        FROM DATA_Dagitim_Bolgeleri b
        LEFT JOIN TANIM_Konumlar loc ON b.Mahalle_id = loc.id
        LEFT JOIN DATA_Dagitim_Donemleri l ON b.id = l.Bolge_id AND l.Baslangic_Yili = ${currentYear} AND (l.deleted_at IS NULL OR l.deleted_at = '')
        WHERE b.deleted_at IS NULL OR b.deleted_at = ''
        ORDER BY loc.Ad ASC
      `;
      
      const rawLedgers = this.uow.db.prepare(sql).all() as any[];
      
      // 2. Fetch stats for each ledger in parallel
      const enrichedLedgers = await Promise.all(rawLedgers.map(async (ledger: any) => {
        try {
          const statsSql = `
            SELECT 
              COUNT(*) as total_records,
              SUM(Toplam_Tutar) as total_amount,
              SUM(Kullanim_Saati) as total_hours,
              (
                SELECT SUM(ts.Miktar) 
                FROM MUHASEBE_Tahsilat ts
                JOIN MUHASEBE_Tahakkuk th ON ts.Tahakkuk_id = th.id
                WHERE th.Fis_id IN (SELECT id FROM DATA_Dagitim_Kayitlar WHERE Donem_id = ? AND (deleted_at IS NULL OR deleted_at = ''))
                AND ts.deleted_at IS NULL
              ) as total_collected
            FROM DATA_Dagitim_Kayitlar
            WHERE Donem_id = ? AND (deleted_at IS NULL OR deleted_at = '')
          `;
          const stats = this.uow.db.prepare(statsSql).get(ledger.id, ledger.id) as any;
          return { 
            ...ledger, 
            stats: {
              total_records: stats?.total_records || 0,
              total_amount: stats?.total_amount || 0,
              total_hours: stats?.total_hours || 0,
              total_collected: stats?.total_collected || 0
            } 
          };
        } catch (e) {
          return { ...ledger, stats: { total_records: 0, total_amount: 0, total_hours: 0, total_collected: 0 } };
        }
      }));

      return { success: true, data: enrichedLedgers };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}
