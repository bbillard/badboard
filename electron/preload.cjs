const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('badboard', {
  replaceSeasonData: (rows) => ipcRenderer.invoke('replace-season-data', rows),
});
