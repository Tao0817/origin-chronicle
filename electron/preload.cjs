const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  readFile: (filename) => ipcRenderer.invoke('readFile', filename),
  writeFile: (filename, content) => ipcRenderer.invoke('writeFile', filename, content),
  deleteFile: (filename) => ipcRenderer.invoke('deleteFile', filename),
  listFiles: () => ipcRenderer.invoke('listFiles'),
});
