const { app, BrowserWindow, ipcMain, net, shell } = require('electron');
const path = require('path');
const fs = require('fs');

const isDev = require('electron-is-dev');

const DATA_DIR = path.join('D:', 'origin-chronicle', 'data');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  ensureDataDir();
  createWindow();

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

// File I/O handlers
ipcMain.handle('readFile', async (event, filename) => {
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return { success: true, data };
    }
    return { success: false, error: 'File not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('writeFile', async (event, filename, content) => {
  const filePath = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('deleteFile', async (event, filename) => {
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('listFiles', async () => {
  try {
    const files = fs.readdirSync(DATA_DIR);
    return { success: true, files };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ── URL ステータス確認 ──────────────────────────────────────
ipcMain.handle('check-url-status', async (_e, url) =>
  new Promise((resolve) => {
    const timer = setTimeout(() => resolve('timeout'), 8000);
    const run = (method) => {
      try {
        const req = net.request({ method, url });
        req.on('response', (res) => {
          clearTimeout(timer);
          const s = res.statusCode;
          if (s === 200 || s === 206) { resolve('ok'); return; }
          if (s === 401 || s === 403) { resolve('403'); return; }
          if (s === 404) { resolve('404'); return; }
          if (s === 405 && method === 'HEAD') { run('GET'); return; }
          resolve(String(s));
        });
        req.on('error', () => { clearTimeout(timer); resolve('error'); });
        req.end();
      } catch { clearTimeout(timer); resolve('error'); }
    };
    run('HEAD');
  })
);

// ── インボックス登録 ────────────────────────────────────────
const getInboxPath = () =>
  app.isPackaged
    ? path.join(app.getPath('userData'), 'resource_inbox.json')
    : path.join(app.getAppPath(), 'src', 'data', 'resource_inbox.json');

ipcMain.handle('add-to-inbox', async (_e, entry) => {
  const p = getInboxPath();
  let list = [];
  if (fs.existsSync(p)) {
    try { list = JSON.parse(fs.readFileSync(p, 'utf-8')); } catch {}
  }
  list.push(entry);
  fs.writeFileSync(p, JSON.stringify(list, null, 2), 'utf-8');
  return { ok: true };
});

// ── 外部ブラウザ ────────────────────────────────────────────
ipcMain.handle('open-external', async (_e, url) => {
  await shell.openExternal(url);
});
