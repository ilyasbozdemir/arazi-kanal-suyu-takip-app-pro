import { ipcMain } from 'electron';
import * as os from 'os';
import { schema, TablePrefixLogic } from '../../database/index';

export const setupSystemHandlers = () => {
  let lastCpuUsage = process.cpuUsage();
  let lastCpuTime = Date.now();

  ipcMain.handle('get-system-metrics', async () => {
    const currentCpuUsage = process.cpuUsage(lastCpuUsage);
    const currentTime = Date.now();
    const deltaTime = (currentTime - lastCpuTime) * 1000;
    
    lastCpuUsage = process.cpuUsage();
    lastCpuTime = currentTime;

    const cpuPercent = Math.min(99, Math.round((currentCpuUsage.user + currentCpuUsage.system) / deltaTime * 100));
    const mem = process.memoryUsage();
    const heapMb = Math.round(mem.heapUsed / 1024 / 1024);

    let osName = `${os.type()} ${os.release()}`;
    if (os.type() === 'Windows_NT') {
      const parts = os.release().split('.');
      const build = parseInt(parts[2] || '0', 10);
      if (build >= 22000) osName = `Windows 11 (Build ${build})`;
      else if (os.release().startsWith('10.')) osName = `Windows 10 (Build ${build})`;
    }

    return { success: true, data: { cpu: cpuPercent, ram: heapMb, os: osName, arch: os.arch() } };
  });

  ipcMain.handle('get-db-schema', async () => {
    try {
      return { 
        success: true, 
        data: {
          database: schema.database,
          version: schema.version,
          prefixLogic: TablePrefixLogic,
          tables: schema.tables.map(t => ({
            name: t.name,
            columns: t.columns,
            hasAudit: t.hasAudit
          }))
        }
      };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });
};
