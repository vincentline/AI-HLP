// AI-HLP 提示词模板模块
// 模块功能：管理AI提示词模板，支持模板注册、渲染和复用
// 模块索引：
//   - PromptManager: 提示词模板管理类
//   - promptManager: PromptManager的单例实例

/**
 * 提示词模板管理器
 * 用于管理和渲染AI提示词模板，支持模板注册和参数化渲染
 */
class PromptManager {
  /**
   * 构造函数
   */
  constructor() {
    // 使用Map存储提示词模板，提高查找效率
    this.prompts = new Map();
  }

  /**
   * 注册提示词模板
   * @param {string} key - 模板唯一标识符
   * @param {string} template - 提示词模板，支持{{变量名}}格式的占位符
   */
  register(key, template) {
    this.prompts.set(key, template);
  }

  /**
   * 获取并渲染提示词模板
   * @param {string} key - 模板唯一标识符
   * @param {Object} data - 模板渲染数据，用于替换模板中的占位符
   * @returns {string} - 渲染后的完整提示词
   * @throws {Error} - 当模板不存在时抛出错误
   */
  get(key, data = {}) {
    const template = this.prompts.get(key);
    if (!template) {
      throw new Error(`Prompt template '${key}' not found`);
    }
    
    // 使用正则表达式替换模板中的占位符
    // 支持{{变量名}}格式的占位符，如："你好{{name}}，今天是{{date}}"
    return template.replace(/{{(\w+)}}/g, (_, name) => {
      return data[name] || '';
    });
  }
}

// 创建PromptManager的单例实例，方便全局使用
const promptManager = new PromptManager();

module.exports = {
  PromptManager,
  promptManager
};
