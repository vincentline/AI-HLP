// AI-HLP Figma插件主逻辑
// 模块功能：处理Figma插件的核心逻辑，包括UI显示、消息通信和设计生成
// 技术栈：TypeScript、Figma Plugin API

// 导入Figma插件类型定义
// @ts-ignore - Figma插件API在Figma环境中可用，TypeScript编译时会忽略

// 显示插件UI界面
figma.showUI(__html__);

// 监听来自UI的消息
figma.ui.onmessage = (msg: any) => {
  // 处理生成设计请求
  if (msg.type === 'generate') {
    // 调用AI核心功能生成设计
    generateDesign(msg.prompt);
  }
  
  // 处理关闭插件请求
  if (msg.type === 'close') {
    figma.closePlugin();
  }
};

/**
 * 生成设计
 * @param {string} prompt - AI提示词，用于指导设计生成
 */
async function generateDesign(prompt: string) {
  // 模拟设计生成过程
  // 后续将替换为真实的核心AI功能调用，生成更复杂的设计元素
  
  // 创建一个简单的矩形作为示例
  const rect = figma.createRectangle();
  
  // 设置矩形位置为视口中心
  rect.x = figma.viewport.center.x - 50;
  rect.y = figma.viewport.center.y - 50;
  
  // 设置矩形大小
  rect.resize(100, 100);
  
  // 设置矩形填充颜色
  rect.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 1 } }];
  
  // 向UI发送生成结果
  figma.ui.postMessage({ 
    type: 'generated', 
    message: `已生成设计：${prompt}` 
  });
}
