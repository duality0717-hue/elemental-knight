const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const fs = require('node:fs');
const path = require('node:path');
app.setPath('userData', path.join(app.getPath('appData'), 'Elemental Knight'));
let win, preferences, mode = 'manual', busy = false;
let state = { phase: 'idle', message: 'Buscá actualizaciones cuando quieras.' };
const snapshot = () => ({ ...state, mode, version: app.getVersion(), supported: app.isPackaged });
function send(phase, message) {
  state = { phase, message };
  if (win && !win.isDestroyed()) win.webContents.send('updates:state', snapshot());
}
function policy() {
  autoUpdater.autoDownload = mode === 'automatic';
  autoUpdater.autoInstallOnAppQuit = mode === 'automatic';
}
async function check() {
  if (!app.isPackaged) return send('idle', 'Las actualizaciones están disponibles en la versión instalada.');
  if (busy || ['downloading', 'downloaded'].includes(state.phase)) return;
  busy = true;
  try { await autoUpdater.checkForUpdates(); }
  catch { send('error', 'No se pudo consultar la versión. Revisá tu conexión o intentá más tarde.'); }
  finally { busy = false; }
}
autoUpdater.on('checking-for-update', () => send('checking', 'Buscando actualizaciones…'));
autoUpdater.on('update-available', info => send('available', `Versión ${info.version} disponible.`));
autoUpdater.on('update-not-available', () => send('idle', 'Tenés la última versión publicada.'));
autoUpdater.on('download-progress', p => send('downloading', `Descargando: ${Math.floor(p.percent)}%`));
autoUpdater.on('update-downloaded', () => send('downloaded', 'Actualización descargada. Podés instalarla ahora; en modo automático se instala al cerrar.'));
autoUpdater.on('error', () => send('error', 'No se pudo actualizar. Revisá la conexión y que exista una versión publicada.'));
app.whenReady().then(() => {
  preferences = path.join(app.getPath('userData'), 'updates.json');
  try { if (JSON.parse(fs.readFileSync(preferences, 'utf8')).mode === 'automatic') mode = 'automatic'; } catch {}
  policy();
  win = new BrowserWindow({ width: 1440, height: 980, minWidth: 800, minHeight: 600, backgroundColor: '#090f16', autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true } });
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', e => e.preventDefault());
  function trusted(event) { if (event.sender !== win.webContents || event.senderFrame !== win.webContents.mainFrame) throw new Error('Unauthorized'); }
  ipcMain.handle('updates:get', event => { trusted(event); return snapshot(); });
  ipcMain.handle('updates:mode', (event, value) => {
    trusted(event);
    if (!['manual', 'automatic'].includes(value)) throw new Error('Invalid mode');
    fs.mkdirSync(app.getPath('userData'), { recursive: true });
    fs.writeFileSync(preferences + '.tmp', JSON.stringify({ mode: value }));
    fs.renameSync(preferences + '.tmp', preferences);
    mode = value; policy();
    if (mode === 'automatic') {
      if (state.phase === 'downloaded') autoUpdater.addQuitHandler();
      else if (state.phase === 'available') download(); else check();
    }
    return snapshot();
  });
  ipcMain.handle('updates:check', async event => { trusted(event); await check(); return snapshot(); });
  ipcMain.handle('updates:download', async event => { trusted(event); await download(); return snapshot(); });
  ipcMain.handle('updates:install', event => { trusted(event); if (state.phase === 'downloaded') autoUpdater.quitAndInstall(); });
  win.loadFile(path.join(__dirname, '..', 'index.html'));
  win.webContents.once('did-finish-load', () => { if (mode === 'automatic') check(); });
  const timer = setInterval(() => { if (mode === 'automatic') check(); }, 60 * 60 * 1000);
  timer.unref();
});
async function download() {
  if (!app.isPackaged || state.phase !== 'available') return;
  send('downloading', 'Descargando actualización…');
  try { await autoUpdater.downloadUpdate(); } catch { send('error', 'La descarga falló. Volvé a buscar actualizaciones para reintentar.'); }
}
app.on('window-all-closed', () => app.quit());
