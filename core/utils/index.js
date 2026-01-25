// AI-HLP 工具函数模块
// 模块功能：提供通用工具函数，用于响应格式化、错误处理等
// 模块索引：
//   - formatResponse: 格式化成功响应数据
//   - handleError: 处理错误响应

/**
 * 格式化成功响应数据
 * @param {Object|string|number} data - 原始数据，可以是任意类型
 * @returns {Object} - 格式化后的响应对象
 * @returns {boolean} return.success - 响应状态，固定为true
 * @returns {*} return.data - 原始数据
 * @returns {number} return.timestamp - 响应时间戳
 */
const formatResponse = (data) => {
  return {
    success: true,
    data,
    timestamp: Date.now()
  };
};

/**
 * 处理错误响应
 * @param {Error|string} error - 错误对象或错误信息字符串
 * @returns {Object} - 格式化后的错误响应对象
 * @returns {boolean} return.success - 响应状态，固定为false
 * @returns {string} return.error - 错误信息
 * @returns {number} return.timestamp - 响应时间戳
 */
const handleError = (error) => {
  return {
    success: false,
    error: error instanceof Error ? error.message : error,
    timestamp: Date.now()
  };
};

module.exports = {
  formatResponse,
  handleError
};
