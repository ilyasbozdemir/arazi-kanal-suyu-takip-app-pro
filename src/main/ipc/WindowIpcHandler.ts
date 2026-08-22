import { ipcMain } from 'electron';
import { injectable, inject } from 'tsyringe';
import { WindowService } from '../services/WindowService';

/**
 * 🛡️ WINDOW IPC HANDLER
 * Bridges frontend window commands to the WindowService.
 */
@injectable()
export class WindowIpcHandler {
  constructor(
    @inject(WindowService) private windowService: WindowService
  ) {}

  register() {
    ipcMain.on('window-minimize', () => this.windowService.minimize());
    ipcMain.on('window-maximize', () => this.windowService.maximize());
    ipcMain.on('window-close', () => this.windowService.close());
    
    ipcMain.handle('is-window-maximized', () => {
      return this.windowService.isMaximized();
    });
  }
}
