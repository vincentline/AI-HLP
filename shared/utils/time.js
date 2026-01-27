// AI-HLP 时间工具函数
// 模块功能：使用WorldTimeAPI获取准确的北京时间戳
// 关键词：时间戳、北京时间、WorldTimeAPI

/**
 * 获取北京时间戳
 * @returns {Promise<string>} 格式化的北京时间字符串，格式为 [YYYY-MM-DD HH:MM:SS]
 */
async function getBeijingTime() {
  try {
    // 使用WorldTimeAPI获取北京时间
    const response = await fetch('http://worldtimeapi.org/api/timezone/Asia/Shanghai');
    if (!response.ok) {
      throw new Error('获取时间失败');
    }
    
    const data = await response.json();
    const datetime = new Date(data.datetime);
    
    // 格式化时间字符串
    const year = datetime.getFullYear();
    const month = String(datetime.getMonth() + 1).padStart(2, '0');
    const day = String(datetime.getDate()).padStart(2, '0');
    const hours = String(datetime.getHours()).padStart(2, '0');
    const minutes = String(datetime.getMinutes()).padStart(2, '0');
    const seconds = String(datetime.getSeconds()).padStart(2, '0');
    
    return `[${year}-${month}-${day} ${hours}:${minutes}:${seconds}]`;
  } catch (error) {
    // 网络不可用时使用本地时间备选
    console.warn('WorldTimeAPI不可用，使用本地时间:', error.message);
    
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `[${year}-${month}-${day} ${hours}:${minutes}:${seconds}]`;
  }
}

/**
 * 获取当前时间戳（毫秒）
 * @returns {number} 当前时间戳
 */
function getTimestamp() {
  return Date.now();
}

/**
 * 格式化时间戳为本地时间
 * @param {number} timestamp - 时间戳（毫秒）
 * @returns {string} 格式化的时间字符串
 */
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN');
}

module.exports = {
  getBeijingTime,
  getTimestamp,
  formatTimestamp
};