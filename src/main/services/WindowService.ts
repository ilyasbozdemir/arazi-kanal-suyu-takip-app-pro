import { injectable } from 'tsyringe';
import { BrowserWindow } from 'electron';

/**
 * 🛡️ WINDOW SERVICE
 * Centralized logic for Electron window management.
 */
@injectable()
export class WindowService {
  private win: BrowserWindow | null = null;

  /**
   * Sets the main window instance to be managed.
   */
  setWindow(win: BrowserWindow) {
    this.win = win;
  }

  /**
   * Minimizes the window.
   */
  minimize() {
    this.win?.minimize();
  }

  /**
   * Toggles between maximize and unmaximize.
   */
  maximize() {
    if (!this.win) return;
    if (this.win.isMaximized()) {
      this.win.unmaximize();
    } else {
      this.win.maximize();
    }
  }

  /**
   * Closes the window.
   */
  close() {
    this.win?.close();
  }

  /**
   * Checks if the window is maximized.
   */
  isMaximized() {
    return this.win?.isMaximized() ?? false;
  }
}
