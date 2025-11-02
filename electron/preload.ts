import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  
  // Store operations
  getStore: (key: string) => ipcRenderer.invoke('get-store', key),
  setStore: (key: string, value: any) => ipcRenderer.invoke('set-store', key, value),
  deleteStore: (key: string) => ipcRenderer.invoke('delete-store', key),
  clearStore: () => ipcRenderer.invoke('clear-store'),
  
  // Theme
  getTheme: () => ipcRenderer.invoke('get-theme'),
  setTheme: (theme: string) => ipcRenderer.invoke('set-theme', theme),
  
  // Backup & Data
  createBackup: () => ipcRenderer.invoke('create-backup'),
  restoreBackup: (filePath: string) => ipcRenderer.invoke('restore-backup', filePath),
  exportData: () => ipcRenderer.invoke('export-data'),
  importData: (filePath: string) => ipcRenderer.invoke('import-data', filePath),
  
  // External links
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  
  // Event listeners
  onQuickAdd: (callback: () => void) => {
    const subscription = (_event: IpcRendererEvent) => callback();
    ipcRenderer.on('quick-add', subscription);
    return () => ipcRenderer.removeListener('quick-add', subscription);
  },
  onQuickSearch: (callback: () => void) => {
    const subscription = (_event: IpcRendererEvent) => callback();
    ipcRenderer.on('quick-search', subscription);
    return () => ipcRenderer.removeListener('quick-search', subscription);
  },
});

// Type definitions for TypeScript
export interface ElectronAPI {
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  getStore: (key: string) => Promise<any>;
  setStore: (key: string, value: any) => Promise<void>;
  deleteStore: (key: string) => Promise<void>;
  clearStore: () => Promise<void>;
  getTheme: () => Promise<string>;
  setTheme: (theme: string) => Promise<void>;
  createBackup: () => Promise<{ success: boolean; path?: string; error?: string }>;
  restoreBackup: (filePath: string) => Promise<{ success: boolean; error?: string }>;
  exportData: () => Promise<{ success: boolean; path?: string; error?: string }>;
  importData: (filePath: string) => Promise<{ success: boolean; error?: string }>;
  openExternal: (url: string) => Promise<void>;
  onQuickAdd: (callback: () => void) => () => void;
  onQuickSearch: (callback: () => void) => () => void;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
