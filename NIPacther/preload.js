const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  copyFiles: () => ipcRenderer.send('copy-files')
})