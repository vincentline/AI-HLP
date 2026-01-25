// AI-HLP 静态网页应用脚本
// 模块功能：处理静态网页应用的前端逻辑，包括用户交互和AI响应展示
// 技术栈：原生JavaScript

/**
 * 初始化应用
 * 绑定DOM元素事件，设置应用初始状态
 */
function init() {
  // 获取DOM元素
  const input = document.getElementById('input');
  const submit = document.getElementById('submit');
  const output = document.getElementById('output');

  // 绑定发送按钮点击事件
  submit.addEventListener('click', handleSubmit);

  // 支持Ctrl+Enter快捷键发送
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  });

  /**
   * 处理表单提交
   * 1. 获取用户输入
   * 2. 验证输入内容
   * 3. 显示加载状态
   * 4. 调用AI核心功能（当前为模拟）
   * 5. 显示响应结果
   */
  function handleSubmit() {
    const prompt = input.value.trim();
    
    // 验证输入不为空
    if (!prompt) {
      alert('请输入内容');
      return;
    }

    // 显示加载状态
    output.textContent = '正在思考...';
    
    // 模拟AI响应
    // 后续将替换为真实的核心AI功能调用
    setTimeout(() => {
      output.textContent = `AI 响应：你输入了 "${prompt}"。\n\n这是一个静态网页应用的示例，后续将接入核心AI功能。`;
    }, 1000);
  }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', init);
