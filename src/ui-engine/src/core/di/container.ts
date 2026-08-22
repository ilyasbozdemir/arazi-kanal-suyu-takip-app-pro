import 'reflect-metadata';
import { container } from 'tsyringe';
import { ElectronService } from '../../services/ElectronService';
import { MevkiService } from '../../services/domain/MevkiService';
import { TapuService } from '../../services/domain/TapuService';

// 🛡️ REGISTER SERVICES
container.registerInstance('IElectronService', ElectronService);
container.registerSingleton(MevkiService);
container.registerSingleton(TapuService);

export { container };
