const { app, BrowserWindow, ipcMain } = require('electron')
const ProgressBar = require('electron-progressbar');
const path = require('path')
const fs = require('fs-extra')

let win

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  })

  win.loadFile('index.html')
  win.webContents.openDevTools()
}

app.whenReady().then(createWindow)

// Copy MASCHINE Plugs and App to the desktop

ipcMain.on('copy-files', (event) => {
  const desktopPath = app.getPath('desktop')
  const nipatcherPath = path.join(desktopPath, 'NIPatcher')

  fs.mkdirSync(nipatcherPath, { recursive: true })

  let filesToCopy = [];

  if (process.platform === 'win32') {
    filesToCopy = [
      'C:\\Program Files\\Common Files\\VST3\\Maschine 2.VST3',
      'C:\\Program Files\\VSTPlugins\\Maschine 2.dll',
      'C:\\Program Files\\Steinberg\\VSTPlugins\\Maschine 2.dll',
      'C:\\Program Files\\Common Files\\VST2\\Maschine 2.dll',
      'C:\\Program Files\\Common Files\\Steinberg\\VST2\\Maschine 2.dll'
    ]
  } else if (process.platform === 'darwin') {
    filesToCopy = [
        '/Library/Audio/Plug-Ins/VST/Maschine 2.vst',
        '/Library/Audio/Plug-Ins/VST3/Maschine 2.vst3',
        '/Library/Audio/Plug-Ins/Components/Maschine 2.component',
        '/Library/Application Support/Avid/Audio/Plug-Ins/Maschine 2.aaxplugin',
        '/Applications/Native Instruments/Maschine 2/Maschine 2.app'
    ]
  }

  let progressBar = new ProgressBar({
    indeterminate: false,
    text: 'Copying files...',
    detail: 'Starting copy...',
    maxValue: filesToCopy.length
  });

  progressBar
    .on('completed', function() {
      progressBar.detail = 'Copy completed.';
    });

  let copyNextFile = () => {
    if (filesToCopy.length === 0) return;

    let file = filesToCopy.shift();
    const fileName = path.basename(file)
    const destination = path.join(nipatcherPath, fileName)

    console.log(`Copying ${file} to ${destination}`);
// Solution for .AXX Pace Crap - This code passes an options object with dereference: true to fs.copy when copying each file. This tells fs-extra to overwrite any existing files or folders in the destination and to follow symbolic links when copying.
    fs.copy(file, destination, { overwrite: true, dereference: true }, (err) => {
      if (err) {
        console.error(`Error copying ${file} to ${destination}: ${err}`);
        throw err;
      }
      progressBar.value += 1;
      progressBar.detail = `Copying file ${fileName}...`;
      copyNextFile();
    });
  }

  copyNextFile();
})
