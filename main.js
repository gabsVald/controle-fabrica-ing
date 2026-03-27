const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "Controle de Fábrica - ING",
    icon: path.join(__dirname, 'assets/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Em produção, carregamos o arquivo gerado pelo build do Expo
  // Em desenvolvimento, você pode apontar para o localhost:8081 se desejar
  const isDev = !app.isPackaged;
  
  if (isDev) {
    win.loadURL('http://localhost:8081'); // Ajuste a porta se necessário
  } else {
    win.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  // Remove o menu padrão (Arquivo, Editar, etc) para parecer um software profissional
  win.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});