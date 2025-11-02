/// <reference types="electron" />

declare global {
  interface Window {
    electron?: {
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
    };
  }
}

export {};
