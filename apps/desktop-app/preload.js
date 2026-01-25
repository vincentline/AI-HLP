// AI-HLP 桌面应用预加载脚本
// 模块功能：在渲染进程中安全地访问 Node.js API，实现主进程和渲染进程的通信
// 技术栈：Electron、Node.js

const { contextBridge, ipcRenderer } = require('electron');

// 向渲染进程暴露安全的API
// 使用contextBridge确保渲染进程无法直接访问Node.js API，只能通过暴露的接口通信
contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * 发送消息到主进程
   * @param {string} channel - 消息通道名称
   * @param {*} data - 要发送的数据，可以是任意类型
   */
  sendMessage: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  
  /**
   * 监听来自主进程的消息
   * @param {string} channel - 消息通道名称
   * @param {Function} callback - 消息回调函数，接收主进程发送的数据
   */
  onMessage: (channel, callback) => {
    ipcRenderer.on(channel, (event, ...args) => callback(...args));
  }
});

