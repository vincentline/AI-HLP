# AI 混合应用项目

这是一个集成多种 AI 应用功能的混合项目，包含静态网页、Figma 插件、桌面应用等多种形式，共享核心 AI 功能。

## 项目代号：AI-HLP
  - 如果需要用到项目名称，统一使用项目代号
  
## 项目全称：AI Help me

## 目录结构

```
ai-mixed-app/
├── core/                    # 核心 AI 功能模块
│   ├── services/            # AI 服务集成
│   ├── utils/               # 工具函数
│   ├── prompts/             # 提示词模板
│   └── models/              # AI 模型配置
├── apps/                    # 应用集合
│   ├── static-web/          # 静态网页应用
│   │   └── tools/           # 静态页小工具目录
│   ├── figma-plugin/        # Figma 插件
│   └── desktop-app/         # 桌面应用
├── shared/                  # 共享资源
│   ├── components/          # 共享组件
│   ├── styles/              # 共享样式
│   └── assets/              # 共享资源文件
├── docs/                    # 文档
├── scripts/                 # 脚本工具
├── package.json             # 项目配置
└── README.md                # 项目说明
```

## 核心功能

- AI 服务集成
- 提示词管理
- 模型配置
- 共享组件库

## 应用类型

1. **静态网页应用** - 简单的 HTML/CSS/JS 页面，调用 AI 核心功能
2. **Figma 插件** - 集成到 Figma 中的 AI 辅助设计工具
3. **桌面应用** - 基于 Electron 或 Tauri 的跨平台桌面应用

## 开发流程

1. 安装依赖：`npm install`
2. 查看各应用的具体开发说明
3. 开发收尾流程：参考 `DEVELOPMENT_FLOW.md` 文件

## 许可证

MIT
