// AI-HLP 桌面应用主进程
// 模块功能：控制Electron应用的生命周期和原生浏览器窗口管理
// 技术栈：Electron、Node.js

const { app, BrowserWindow } = require('electron');
const path = require('path');

/**
 * 创建浏览器窗口
 * @returns {BrowserWindow} - 返回创建的浏览器窗口实例
 */
function createWindow() {
  // 创建浏览器窗口，设置窗口大小和web偏好设置
  const mainWindow = new BrowserWindow({
    width: 800,  // 窗口宽度
    height: 600, // 窗口高度
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // 预加载脚本路径
      nodeIntegration: true, // 启用Node.js集成
      contextIsolation: false // 禁用上下文隔离（开发环境方便调试）
    }
  });

  // 加载应用的HTML文件
  mainWindow.loadFile('index.html');

  // 打开开发者工具（开发环境使用，生产环境注释）
  // mainWindow.webContents.openDevTools();

  return mainWindow;
}

// 当Electron完成初始化并准备创建浏览器窗口时触发
app.whenReady().then(() => {
  // 创建主窗口
  createWindow();

  // 在macOS上，当点击dock图标并且没有其他窗口打开时，重新创建一个窗口
  // 这是macOS应用的标准行为
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 当所有窗口关闭时触发
app.on('window-all-closed', () => {
  // 在Windows和Linux上，关闭所有窗口后退出应用
  // 在macOS上，应用会保持在dock中，点击dock图标重新创建窗口
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

