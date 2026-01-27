// AI-HLP AI服务集成模块
// 模块功能：封装各种AI服务的调用逻辑，提供统一的服务调用接口
// 模块索引：
//   - AIService: AI服务基础类，所有具体AI服务的父类
//   - HuoshanAIService: 火山AI服务实现

/**
 * AI服务基础类
 * 用于封装各种AI服务的通用逻辑，所有具体AI服务类都应继承此类
 */
class AIService {
  /**
   * 构造函数
   * @param {Object} config - 服务配置参数
   * @param {string} config.apiKey - API密钥
   * @param {string} config.baseUrl - 服务基础URL
   */
  constructor(config) {
    this.config = config;
  }

  /**
   * 调用AI服务（抽象方法，子类必须实现）
   * @param {Object} params - 请求参数
   * @param {string} params.prompt - AI提示词
   * @param {string} [params.model] - 模型名称
   * @returns {Promise<Object>} - 返回AI服务响应
   */
  async call(params) {
    throw new Error('call method must be implemented by subclass');
  }
}

// 导入火山AI服务实现
const HuoshanAIService = require('./huoshan');

module.exports = {
  AIService,
  HuoshanAIService
};
