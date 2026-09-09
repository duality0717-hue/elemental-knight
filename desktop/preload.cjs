const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('knightDesktop', {
  get: () => ipcRenderer.invoke('updates:get'),
  setMode: mode => ipcRenderer.invoke('updates:mode', mode),
  check: () => ipcRenderer.invoke('updates:check'),
  download: () => ipcRenderer.invoke('updates:download'),
  install: () => ipcRenderer.invoke('updates:install'),
  subscribe: callback => {
    const handler = (_event, state) => callback(state);
    ipcRenderer.on('updates:state', handler);
    return () => ipcRenderer.removeListener('updates:state', handler);
  }
});
