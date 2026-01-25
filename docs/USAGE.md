# AI-HLP 项目使用手册

## 项目概述

AI-HLP 是一个集成多种 AI 应用功能的混合项目，包含静态网页、Figma 插件、桌面应用等多种形式，共享核心 AI 功能。

## 目录结构

### 1. 核心功能目录 (core/)

**用途**：存放所有应用共享的核心 AI 功能模块

| 子目录/文件 | 用途 | 应用场景 |
|------------|------|----------|
| `core/services/` | AI 服务集成 | 封装各种 AI 服务的调用逻辑，如 OpenAI、Anthropic 等 |
| `core/utils/` | 工具函数 | 提供通用工具函数，如响应格式化、错误处理、数据转换等 |
| `core/prompts/` | 提示词模板 | 管理 AI 提示词模板，支持模板渲染和复用 |
| `core/models/` | AI 模型配置 | 管理不同 AI 模型的配置信息，如参数设置、模型类型等 |

**使用示例**：
```javascript
// 在任何应用中引入核心 AI 功能
const aiCore = require('../../core');
const response = await aiCore.services.aiService.call({ prompt: '你好' });
```

### 2. 应用目录 (apps/)

**用途**：存放不同类型的 AI 应用实例

#### 2.1 静态网页应用 (apps/static-web/)

**用途**：简单的 HTML/CSS/JS 页面，直接在浏览器中运行

**技术栈**：HTML5、CSS3、原生 JavaScript

**应用场景**：
- 快速原型开发
- 无需后端的简单 AI 应用
- 本地运行的 AI 工具

**使用方法**：
直接在浏览器中打开 `index.html` 文件即可运行

#### 2.2 Figma 插件 (apps/figma-plugin/)

**用途**：集成到 Figma 中的 AI 辅助设计工具

**技术栈**：TypeScript、Figma Plugin API

**应用场景**：
- AI 辅助设计生成
- 设计系统自动化
- 设计资产智能化管理

**使用方法**：
1. 打开 Figma 桌面端
2. 点击 "插件" > "开发" > "导入插件"
3. 选择 `apps/figma-plugin` 目录
4. 在 Figma 中使用快捷键或通过插件菜单调用

#### 2.3 桌面应用 (apps/desktop-app/)

**用途**：基于 Electron 的跨平台桌面应用

**技术栈**：Electron、HTML/CSS/JavaScript

**应用场景**：
- 需要系统级访问权限的 AI 应用
- 复杂的 AI 工作流
- 离线运行的 AI 工具

**使用方法**：
```bash
# 安装依赖
npm install
# 启动应用
npm start
# 打包应用
npm run build
```

### 3. 共享资源目录 (shared/)

**用途**：存放所有应用共享的资源和组件

| 子目录 | 用途 | 应用场景 |
|--------|------|----------|
| `shared/components/` | 共享组件 | 可在多个应用中复用的 UI 组件 |
| `shared/styles/` | 共享样式 | 统一的设计系统和样式规范 |
| `shared/assets/` | 共享资源文件 | 图片、图标、字体等静态资源 |

**使用示例**：
```javascript
// 在应用中引入共享组件
const SharedButton = require('../../shared/components/Button');
```

### 4. 文档目录 (docs/)

**用途**：存放项目文档

| 文件 | 用途 |
|------|------|
| `README.md` | 项目概述和快速开始指南 |
| `USAGE.md` | 详细使用手册（本文档） |
| `API.md` | API 接口文档 |
| `CONTRIBUTING.md` | 贡献指南 |

### 5. 脚本目录 (scripts/)

**用途**：存放项目构建、部署、测试等自动化脚本

| 脚本类型 | 用途 |
|----------|------|
| 构建脚本 | 编译、打包应用 |
| 测试脚本 | 运行自动化测试 |
| 部署脚本 | 部署应用到服务器 |
| 开发脚本 | 辅助开发流程 |

## 应用开发流程

### 1. 核心功能开发

1. 在 `core/` 目录下创建或修改对应的功能模块
2. 确保功能模块的可复用性和通用性
3. 添加详细的文档和测试用例

### 2. 应用开发

1. 选择合适的应用类型目录（`static-web/`、`figma-plugin/`、`desktop-app/`）
2. 创建或修改应用代码
3. 引入核心 AI 功能模块
4. 测试应用功能
5. 构建和部署

### 3. 共享资源开发

1. 在 `shared/` 目录下创建共享资源
2. 确保资源的通用性和兼容性
3. 添加资源说明文档

## 代码规范

### 1. 命名规范

- 文件/模块前缀：使用 `AI-HLP` 作为项目级命名空间或前缀
- 变量命名：驼峰命名法 (`camelCase`)
- 函数命名：动词开头 (`handleSubmit`, `generateContent`)
- 类命名：大驼峰命名法 (`AIService`, `PromptManager`)
- 常量命名：全大写 + 下划线 (`API_KEY`, `MAX_RETRY_COUNT`)

### 2. 注释规范

- 所有代码必须包含中文注释
- 文件头部必须有模块说明
- 函数/方法必须有参数和返回值注释
- 复杂逻辑必须有实现细节注释

### 3. 缩进规范

- 使用 2 个空格缩进
- 禁止使用 Tab 字符
- 保持缩进一致性

## 部署和发布

### 1. 静态网页应用

- 直接部署 HTML/CSS/JS 文件到任何静态文件服务器
- 支持 GitHub Pages、Vercel、Netlify 等平台

### 2. Figma 插件

- 打包插件：`npm run build`
- 上传到 Figma Plugin Store
- 或作为私有插件分享

### 3. 桌面应用

- 打包应用：`npm run build`
- 生成对应平台的安装包（Windows: .exe, macOS: .dmg, Linux: .AppImage）
- 分发安装包给用户

## 维护和更新

### 1. 核心功能更新

1. 修改 `core/` 目录下的对应模块
2. 运行测试确保功能正常
3. 更新相关文档

### 2. 应用更新

1. 修改对应应用目录下的代码
2. 测试应用功能
3. 构建和重新部署

### 3. 依赖更新

- 定期更新项目依赖：`npm update`
- 确保依赖兼容性
- 测试更新后的功能

## 故障排除

### 常见问题

1. **AI 服务调用失败**
   - 检查 API 密钥配置
   - 检查网络连接
   - 查看错误日志

2. **应用无法启动**
   - 检查依赖是否安装完整：`npm install`
   - 查看控制台错误信息
   - 检查配置文件是否正确

3. **Figma 插件无法加载**
   - 检查 manifest.json 配置
   - 确保 TypeScript 编译通过：`npm run build`
   - 查看 Figma 开发者控制台

## 贡献指南

1. Fork 项目仓库
2. 创建特性分支：`git checkout -b feature/xxx`
3. 提交更改：`git commit -m '添加 xxx 功能'`
4. 推送到分支：`git push origin feature/xxx`
5. 提交 Pull Request

## 许可证

MIT License
