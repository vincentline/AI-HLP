// AI-HLP AI模型配置模块
// 模块功能：管理不同AI模型的配置信息，支持模型注册、查询和管理
// 模块索引：
//   - ModelManager: AI模型配置管理类
//   - modelManager: ModelManager的单例实例

/**
 * AI模型配置管理器
 * 用于管理不同AI模型的配置信息，支持模型注册、查询和批量获取
 */
class ModelManager {
  /**
   * 构造函数
   */
  constructor() {
    // 使用Map存储模型配置，提高查找效率
    this.models = new Map();
  }

  /**
   * 注册模型配置
   * @param {string} name - 模型唯一标识符
   * @param {Object} config - 模型配置信息
   * @param {string} config.type - 模型类型（如：text、image、audio）
   * @param {string} config.provider - 模型提供商（如：openai、anthropic）
   * @param {Object} config.params - 模型参数配置
   */
  register(name, config) {
    this.models.set(name, config);
  }

  /**
   * 获取模型配置
   * @param {string} name - 模型唯一标识符
   * @returns {Object} - 模型配置信息
   * @throws {Error} - 当模型配置不存在时抛出错误
   */
  get(name) {
    const config = this.models.get(name);
    if (!config) {
      throw new Error(`Model configuration '${name}' not found`);
    }
    return config;
  }

  /**
   * 获取所有模型配置
   * @returns {Array<Object>} - 所有模型配置列表，每个元素包含模型名称和配置信息
   */
  getAll() {
    // 将Map转换为数组，方便外部使用
    return Array.from(this.models.entries()).map(([name, config]) => ({
      name,
      ...config
    }));
  }
}

// 创建ModelManager的单例实例，方便全局使用
const modelManager = new ModelManager();

module.exports = {
  ModelManager,
  modelManager
};
