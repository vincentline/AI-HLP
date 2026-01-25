# 项目信息
- 项目代号：AI-HLP
  - 如果需要用到项目名称，统一使用项目代号
- 项目全称：AI Help me
- GitHub 仓库
   - 项目代码托管在 GitHub 仓库中
   - 仓库名称：AI-HLP
   - 仓库地址：https://github.com/vincentline/AI-HLP

# 项目规则
1. 如需提交变更到 GitHub 时：
   - 在项目目录下执行：`PowerShell.exe -ExecutionPolicy Bypass -File scripts/git-push.ps1`
   - 或右键点击 `scripts/git-push.ps1` 选择"使用PowerShell运行"
2. 当用户要求发布网页时：
  - 如果有未提交的变更，必须先提交到 GitHub，按上面GitHub提交流程提交
  - 如果变更都提交了，把apps/static-web文件夹里的内容复制到gh-pages分支根目录，并提交到GitHub仓库的gh-pages分支
  - 发布时，必须填写发布信息，包括发布内容等
