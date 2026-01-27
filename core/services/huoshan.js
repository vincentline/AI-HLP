// AI-HLP 火山AI服务实现
// 模块功能：封装火山引擎AI服务的调用逻辑
// 关键词：火山AI、AI服务、API调用

const { AIService } = require('./index');

/**
 * 火山AI服务类
 * 继承自AIService基础类，实现火山引擎AI服务的具体调用逻辑
 */
class HuoshanAIService extends AIService {
  /**
   * 构造函数
   * @param {Object} config - 服务配置参数
   * @param {string} config.apiKey - API密钥
   * @param {string} [config.baseUrl] - 服务基础URL，默认使用火山引擎北京区域
   * @param {string} [config.model] - 模型名称，默认使用doubao-1-5-pro-32k-250115
   */
  constructor(config) {
    super(config);
    this.config = {
      ...config,
      baseUrl: config.baseUrl || 'https://ark.cn-beijing.volces.com/api/v3',
      model: config.model || 'doubao-1-5-pro-32k-250115'
    };
  }

  /**
   * 调用火山AI服务
   * @param {Object} params - 请求参数
   * @param {string} params.prompt - AI提示词
   * @param {string} [params.model] - 模型名称
   * @param {string} [params.systemPrompt] - 系统提示词
   * @returns {Promise<Object>} - 返回AI服务响应
   */
  async call(params) {
    const {
      prompt,
      model = this.config.model,
      systemPrompt = 'You are a helpful assistant.'
    } = params;

    try {
      // 构建请求URL
      const url = `${this.config.baseUrl}/chat/completions`;

      // 构建请求体
      const requestBody = {
        model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      };

      // 发送请求
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      // 检查响应状态
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API请求失败: ${response.status} ${response.statusText} - ${errorText}`);
      }

      // 解析响应
      const responseData = await response.json();

      // 提取AI生成的内容
      const aiContent = responseData.choices?.[0]?.message?.content;
      if (!aiContent) {
        throw new Error('AI响应格式不正确');
      }

      return {
        success: true,
        data: {
          content: aiContent,
          fullResponse: responseData
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 测试API Key有效性
   * @returns {Promise<boolean>} - API Key是否有效
   */
  async testApiKey() {
    try {
      const result = await this.call({
        prompt: '测试API Key有效性',
        systemPrompt: 'You are a helpful assistant.'
      });
      return result.success;
    } catch (error) {
      return false;
    }
  }
}

module.exports = HuoshanAIService;