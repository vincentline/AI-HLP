# AI-HLP 项目功能索引

## 项目概述

AI-HLP 是一个集成多种 AI 应用功能的混合项目，包含静态网页、Figma 插件、桌面应用等多种形式，共享核心 AI 功能。

## 功能索引

### 1. 核心功能模块 (core/)

| 文件路径 | 功能描述 | 关键词 |
|---------|---------|--------|
| `core/index.js` | 核心 AI 功能入口，统一导出所有模块 | 核心入口、模块导出 |
| `core/services/index.js` | AI 服务集成基础类，封装 AI 服务调用逻辑 | AI 服务、服务集成、基础类 |
| `core/utils/index.js` | 通用工具函数，包括响应格式化和错误处理 | 工具函数、响应格式化、错误处理 |
| `core/prompts/index.js` | 提示词模板管理，支持模板注册和渲染 | 提示词、模板管理、模板渲染 |
| `core/models/index.js` | AI 模型配置管理，支持模型注册和查询 | 模型配置、模型管理、AI 模型 |

### 2. 应用模块 (apps/)

#### 2.1 静态网页应用 (apps/static-web/)

| 文件路径 | 功能描述 | 关键词 |
|---------|---------|--------|
| `apps/static-web/index.html` | 静态网页应用的 HTML 结构 | 静态网页、HTML 结构 |
| `apps/static-web/style.css` | 静态网页应用的样式设计 | 样式设计、CSS |
| `apps/static-web/script.js` | 静态网页应用的交互逻辑 | 交互逻辑、JavaScript |
| `apps/static-web/tools/` | 静态页小工具目录，存放各种独立的静态小工具 | 静态小工具、独立工具、小工具集合 |

#### 2.2 Figma 插件 (apps/figma-plugin/)

| 文件路径 | 功能描述 | 关键词 |
|---------|---------|--------|
| `apps/figma-plugin/manifest.json` | Figma 插件配置文件 | Figma 插件、配置文件 |
| `apps/figma-plugin/package.json` | Figma 插件依赖和脚本配置 | 依赖配置、脚本配置 |
| `apps/figma-plugin/tsconfig.json` | TypeScript 编译配置 | TypeScript、编译配置 |
| `apps/figma-plugin/src/main.ts` | Figma 插件主逻辑 | 主逻辑、TypeScript |
| `apps/figma-plugin/src/ui.html` | Figma 插件 UI 界面 | UI 界面、HTML |

#### 2.3 桌面应用 (apps/desktop-app/)

| 文件路径 | 功能描述 | 关键词 |
|---------|---------|--------|
| `apps/desktop-app/package.json` | 桌面应用依赖和脚本配置 | 依赖配置、脚本配置 |
| `apps/desktop-app/main.js` | Electron 主进程逻辑 | 主进程、Electron |
| `apps/desktop-app/preload.js` | 预加载脚本，安全访问 Node.js API | 预加载脚本、安全 API |
| `apps/desktop-app/index.html` | 桌面应用 HTML 界面 | UI 界面、HTML |

### 3. 共享资源 (shared/)

| 目录/文件路径 | 功能描述 | 关键词 |
|---------|---------|--------|
| `shared/components/` | 共享 UI 组件 | 共享组件、UI 组件 |
| `shared/styles/` | 共享样式文件 | 共享样式、CSS |
| `shared/assets/` | 共享资源文件 | 共享资源、图片、图标 |
| `shared/utils/` | 共享工具函数 | 工具函数、共享、通用 |
| `shared/utils/time.js` | 时间工具函数，使用WorldTimeAPI获取准确的北京时间戳 | 时间戳、北京时间、WorldTimeAPI |

### 4. 文档和脚本 (docs/, scripts/)

| 文件/目录路径 | 功能描述 | 关键词 |
|--------------|---------|--------|
| `DEVELOPMENT_FLOW.md` | 项目开发流程文档，包含收尾流程 | 开发流程、收尾流程 |
| `UPDATE_LOG.md` | 项目更新日志，记录每次修改操作 | 更新日志、修改记录 |
| `CODE_STYLE.md` | 项目代码规范文档，包含缩进、命名、组织等规范 | 代码规范、命名规范、缩进规范 |
| `GET_TIME.md` | 项目获取时间的方法指南，包含北京时间获取命令 | 时间获取、北京时间、时间戳 |
| `docs/USAGE.md` | 项目使用手册 | 使用手册、文档 |
| `docs/FIGMA_PLUGIN_PRODUCT_DOC.md` | Figma 自动命名插件产品文档，详细梳理了产品概述、核心功能、用户流程、技术实现等内容 | Figma 插件、自动命名、产品文档 |
| `docs/` | 项目文档目录 | 文档、指南 |
| `scripts/` | 项目脚本工具 | 脚本、工具 |
| `scripts/git-push.py` | Git 推送 Python 脚本，避免 PowerShell 编码问题 | Git 推送、Python 脚本、编码问题 |

## 使用说明

1. **按关键词查找**：通过关键词列可以快速定位相关功能
2. **按模块查找**：根据模块分类查找相关功能
3. **按文件路径查找**：直接通过文件路径定位具体文件

## 维护指南

- 新增功能时，请在对应模块下添加索引条目
- 修改功能时，请及时更新索引描述
- 删除功能时，请同步删除对应的索引条目

## 版本信息

- 索引版本：1.0.0
- 最后更新：[2026-01-27 16:00:00]
- 适用项目版本：v1.0.0
