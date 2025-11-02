import { app, BrowserWindow, ipcMain, Menu, Tray, globalShortcut, nativeTheme, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import Store from 'electron-store';

const store = new Store();

// Backup data periodically
let backupInterval: NodeJS.Timeout | null = null;
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    frame: false,
    backgroundColor: '#0a0a0a',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: true,
    },
    show: false,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../react/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  // Tray functionality for quick access
  const trayIconPath = path.join(__dirname, '../../build/icon.png');
  
  // Check if icon exists before creating tray
  if (!fs.existsSync(trayIconPath)) {
    console.warn('Tray icon not found at:', trayIconPath);
    // Use a default icon or skip tray creation
    return;
  }
  
  try {
    tray = new Tray(trayIconPath);
  } catch (error) {
    console.error('Failed to create tray:', error);
    return;
  }
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show App', click: () => mainWindow?.show() },
    { label: 'Quick Add Task', click: () => mainWindow?.webContents.send('quick-add') },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]);
  
  tray.setToolTip('Ultimate Todo App');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    mainWindow?.show();
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  // Register global shortcuts with error handling
  try {
    const registered1 = globalShortcut.register('CommandOrControl+Shift+A', () => {
      mainWindow?.show();
      mainWindow?.webContents.send('quick-add');
    });
    if (!registered1) {
      console.warn('Failed to register quick-add shortcut');
    }

    const registered2 = globalShortcut.register('CommandOrControl+Shift+S', () => {
      mainWindow?.show();
      mainWindow?.webContents.send('quick-search');
    });
    if (!registered2) {
      console.warn('Failed to register quick-search shortcut');
    }
  } catch (error) {
    console.error('Error registering shortcuts:', error);
  }

  // Start automatic backup every 5 minutes
  startAutoBackup();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  if (backupInterval) {
    clearInterval(backupInterval);
  }
});

// IPC handlers
ipcMain.handle('minimize-window', () => {
  mainWindow?.minimize();
});

ipcMain.handle('maximize-window', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.handle('close-window', () => {
  mainWindow?.close();
});

ipcMain.handle('get-store', (_, key) => {
  return store.get(key);
});

ipcMain.handle('set-store', (_, key, value) => {
  store.set(key, value);
});

ipcMain.handle('delete-store', (_, key) => {
  store.delete(key);
});

ipcMain.handle('clear-store', () => {
  store.clear();
});

ipcMain.handle('get-theme', () => {
  return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
});

ipcMain.handle('set-theme', (_, theme) => {
  nativeTheme.themeSource = theme;
});

// Auto backup functionality
function startAutoBackup() {
  backupInterval = setInterval(() => {
    try {
      const backupData = {
        timestamp: new Date().toISOString(),
        data: store.store,
      };
      const backupDir = path.join(app.getPath('userData'), 'backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      const backupFile = path.join(backupDir, `backup-${Date.now()}.json`);
      fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
      
      // Keep only last 10 backups
      const files = fs.readdirSync(backupDir)
        .filter(f => f.startsWith('backup-'))
        .sort()
        .reverse();
      
      if (files.length > 10) {
        files.slice(10).forEach(f => {
          fs.unlinkSync(path.join(backupDir, f));
        });
      }
    } catch (error) {
      console.error('Backup failed:', error);
    }
  }, 5 * 60 * 1000); // Every 5 minutes
}

// Manual backup
ipcMain.handle('create-backup', () => {
  try {
    const backupData = {
      timestamp: new Date().toISOString(),
      data: store.store,
    };
    const backupDir = path.join(app.getPath('userData'), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    const backupFile = path.join(backupDir, `manual-backup-${Date.now()}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    return { success: true, path: backupFile };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

// Restore from backup
ipcMain.handle('restore-backup', (_, filePath: string) => {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    store.store = data.data;
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

// Export data
ipcMain.handle('export-data', async () => {
  try {
    const data = store.store;
    const exportPath = path.join(app.getPath('downloads'), `todo-export-${Date.now()}.json`);
    fs.writeFileSync(exportPath, JSON.stringify(data, null, 2));
    shell.showItemInFolder(exportPath);
    return { success: true, path: exportPath };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

// Import data
ipcMain.handle('import-data', (_, filePath: string) => {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    store.store = data;
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

// Open external links safely
ipcMain.handle('open-external', (_, url: string) => {
  shell.openExternal(url);
});
