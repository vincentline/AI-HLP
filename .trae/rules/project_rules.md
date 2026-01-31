# 项目信息
- 项目代号：AI-HLP
  - 如果需要用到项目名称，统一使用项目代号
- 项目全称：AI Help me
- GitHub 仓库
   - 项目代码托管在 GitHub 仓库中
   - 仓库名称：AI-HLP
   - 仓库地址：https://github.com/vincentline/AI-HLP

# 项目规则
1. 本地测试服务器使用方法：
   - 基本用法：`python scripts/start_server.py`
   - 选择测试目录：`python scripts/start_server.py -d <目录>`
     - desktop: 测试桌面应用 (apps/desktop-app)
     - static: 测试静态网页 (apps/static-web)
     - figma: 测试Figma插件 (apps/figma-plugin)
     - root: 项目根目录
   - 自定义端口：`python scripts/start_server.py -p <端口>`
   - 自定义路径：`python scripts/start_server.py --path <路径>`
   - 查看帮助：`python scripts/start_server.py --help`

