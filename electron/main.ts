import { app, BrowserWindow, ipcMain, Menu, Tray, globalShortcut, nativeTheme } from 'electron';
import * as path from 'path';
import Store from 'electron-store';

const store = new Store();
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
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
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
  tray = new Tray(trayIconPath);
  
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

  // Register global shortcuts
  globalShortcut.register('CommandOrControl+Shift+A', () => {
    mainWindow?.show();
    mainWindow?.webContents.send('quick-add');
  });

  globalShortcut.register('CommandOrControl+Shift+S', () => {
    mainWindow?.show();
    mainWindow?.webContents.send('quick-search');
  });

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
