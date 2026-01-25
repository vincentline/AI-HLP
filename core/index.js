// AI-HLP 核心功能入口
// 模块功能：统一导出所有核心AI功能模块
// 模块索引：
//   - services: AI服务集成模块
//   - utils: 工具函数模块
//   - prompts: 提示词模板模块
//   - models: AI模型配置模块

module.exports = {
  services: require('./services'),
  utils: require('./utils'),
  prompts: require('./prompts'),
  models: require('./models')
};
