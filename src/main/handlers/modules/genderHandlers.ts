import { ipcMain } from 'electron';
import { getDb } from '../../db';
import { guessGender } from '../../gender-guesser';
import { Logger } from '../../logger';

export const setupGenderHandlers = () => {
  const db = getDb();
  if (!db) return;

  // 1. Otomatik Analiz ve Tahminleme
  ipcMain.handle('analyze-genders', async () => {
    try {
      const people = db.prepare("SELECT id, Ad FROM DATA_Vatandas WHERE Cinsiyet IS NULL OR Cinsiyet = '' OR Cinsiyet = 'Belirsiz'").all() as any[];
      
      let maleCount = 0;
      let femaleCount = 0;
      let unknownCount = 0;

      const updateStmt = db.prepare("UPDATE DATA_Vatandas SET Cinsiyet = ? WHERE id = ?");
      
      const transaction = db.transaction((records: any[]) => {
        for (const person of records) {
          const guess = guessGender(person.Ad);
          if (guess !== 'Belirsiz') {
            updateStmt.run(guess, person.id);
            if (guess === 'Erkek') maleCount++;
            else femaleCount++;
          } else {
            unknownCount++;
          }
        }
      });

      transaction(people);

      return { 
        success: true, 
        stats: { maleCount, femaleCount, unknownCount } 
      };
    } catch (e: any) {
      Logger.error('GENDER_ANALYSIS', e.message);
      return { success: false, error: e.message };
    }
  });

  // 2. Belirsiz İsimleri Gruplayarak Getir
  ipcMain.handle('get-unknown-genders', async () => {
    try {
      const sql = `
        SELECT 
          TRIM(SUBSTR(Ad, 1, INSTR(Ad || ' ', ' '))) as name, 
          COUNT(*) as count 
        FROM DATA_Vatandas 
        WHERE (Cinsiyet IS NULL OR Cinsiyet = '' OR Cinsiyet = 'Belirsiz')
        GROUP BY name 
        ORDER BY count DESC
      `;
      const names = db.prepare(sql).all() as any[];
      return { success: true, names: names.filter(n => n.name && n.name.length > 1) };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

  // 3. Toplu Cinsiyet Atama (İsme Göre)
  ipcMain.handle('bulk-update-gender', async (_, name: string, gender: string) => {
    try {
      const sql = `
        UPDATE DATA_Vatandas 
        SET Cinsiyet = ? 
        WHERE Ad LIKE ? AND (Cinsiyet IS NULL OR Cinsiyet = '' OR Cinsiyet = 'Belirsiz')
      `;
      db.prepare(sql).run(gender, `${name}%`);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });
};
