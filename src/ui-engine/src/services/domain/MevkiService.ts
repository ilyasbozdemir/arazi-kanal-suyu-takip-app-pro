import { injectable, inject } from 'tsyringe';

/**
 * 🛡️ MEVKİ DOMAIN SERVICE (DI Ready)
 */
@injectable()
export class MevkiService {
  constructor(
    @inject('IElectronService') private electron: any // Using any for now to simplify
  ) {}

  async getDetails(id: string) {
    const res = await this.electron.mevki.getDetails(id);
    if (!res.success) throw new Error(res.error || 'Mevki detayları alınamadı.');
    return res.data; 
  }

  async sync() {
    return await this.electron.mevki.sync();
  }
}
