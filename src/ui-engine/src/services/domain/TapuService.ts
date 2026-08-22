import { injectable, inject } from 'tsyringe';

/**
 * 🛡️ TAPU DOMAIN SERVICE (DI Ready)
 */
@injectable()
export class TapuService {
  constructor(
    @inject('IElectronService') private electron: any
  ) {}

  async getDetails(id: string) {
    const res = await this.electron.tapu.getDetails(id);
    if (!res.success) throw new Error(res.error || 'Tapu detayı alınamadı.');
    return res.data;
  }

  async getOwners(id: string) {
    const res = await this.electron.tapu.getOwners(id);
    return res.success ? res.data : [];
  }

  async save(data: any) {
    const res = await this.electron.saveRecord('DATA_Tapu_Verisi', data);
    if (!res.success) throw new Error(res.error || 'Kaydedilemedi.');
    return res;
  }
}
