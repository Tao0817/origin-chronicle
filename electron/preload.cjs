const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  readFile: (filename) => ipcRenderer.invoke('readFile', filename),
  writeFile: (filename, content) => ipcRenderer.invoke('writeFile', filename, content),
  deleteFile: (filename) => ipcRenderer.invoke('deleteFile', filename),
  listFiles: () => ipcRenderer.invoke('listFiles'),
  checkUrlStatus: (url) => ipcRenderer.invoke('check-url-status', url),
  addToInbox: (entry) => ipcRenderer.invoke('add-to-inbox', entry),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  saveEvent: (event) => ipcRenderer.invoke('save-event', event),
});
