# AI-Protocol-Hub 使用指南

本指南详细说明如何将 AI-Protocol-Hub 作为子模块添加到目标项目中，以及如何使用双向同步脚本进行代码同步。

## 目录

1. [添加子模块](#添加子模块)
2. [克隆包含子模块的仓库](#克隆包含子模块的仓库)
3. [更新子模块](#更新子模块)
4. [双向同步](#双向同步)
5. [同步脚本使用](#同步脚本使用)
6. [常见问题](#常见问题)
7. [最佳实践](#最佳实践)

## 添加子模块

### 方法 1: 使用安装脚本（推荐）

在目标项目的根目录执行以下命令：

```bash
# 下载安装脚本
curl -O https://raw.githubusercontent.com/vincentline/AI-PH/main/install_submodule.py

# 执行安装脚本
python install_submodule.py

# 提交更改
git commit -m "添加 AI-Protocol-Hub 子模块"
git push
```

### 方法 2: 使用 Git 命令

在目标项目的根目录执行以下命令：

```bash
# 添加 AI-Protocol-Hub 作为子模块
git submodule add https://github.com/vincentline/AI-PH ai_protocol_hub

# 克隆子模块
git submodule update --init --remote ai_protocol_hub

# 创建必要的文件夹和文件
mkdir -p ai_protocol_hub/skill_specs

# 提交更改
git commit -m "添加 AI-Protocol-Hub 子模块"
git push
```

### 验证子模块添加成功

执行以下命令验证子模块是否添加成功：

```bash
# 查看子模块状态
git submodule status

# 输出示例:
# 1234567890abcdef1234567890abcdef12345678 ai_protocol_hub (v1.0.0)

# 检查目录结构
ls -la ai_protocol_hub/

# 输出示例中应包含以下内容:
# core_rules/     # 核心规则和协议文档
# scripts/        # 功能脚本
# skill_specs/    # 技能拓展规范
# README.md       # 项目说明文档
# USAGE_GUIDE.md  # 详细使用指南
```

## 克隆包含子模块的仓库

### 方法 1: 直接克隆并初始化子模块

```bash
# 克隆仓库并初始化子模块
git clone --recursive <目标项目仓库URL>
```

### 方法 2: 先克隆仓库，再初始化子模块

```bash
# 克隆仓库
git clone <目标项目仓库URL>

# 进入仓库目录
cd <目标项目目录>

# 初始化并更新子模块
git submodule update --init --recursive
```

## 更新子模块

### 从主仓库拉取最新版本

#### 方法 1: 使用 Git 命令

```bash
# 在目标项目根目录执行
git submodule update --remote ai_protocol_hub

# 提交更新
git commit -m "更新 AI-Protocol-Hub 子模块"
git push
```

#### 方法 2: 使用同步脚本

```bash
# 在目标项目根目录执行
python ai_protocol_hub/scripts/sync_ai_protocol_hub.py --pull

# 提交更新
git commit -m "更新 AI-Protocol-Hub 子模块"
git push
```

### 切换子模块到特定版本

```bash
# 进入子模块目录
cd ai_protocol_hub

# 切换到特定分支
git checkout <分支名>

# 或者切换到特定标签
git checkout <标签名>

# 或者切换到特定提交
git checkout <提交哈希>

# 返回主项目目录
cd ..

# 提交更改
git commit -m "切换 AI-Protocol-Hub 子模块到特定版本"
git push
```

## 双向同步

### 从目标项目推送更新到主仓库

#### 方法 1: 使用 Git 命令

```bash
# 进入子模块目录
cd ai_protocol_hub

# 修改文件
# ... 进行必要的修改 ...

# 提交修改到子模块仓库
git add .
git commit -m "在目标项目中更新 AI-Protocol-Hub"
git push origin <当前分支>

# 返回主项目目录
cd ..

# 更新子模块引用
git commit -m "更新 AI-Protocol-Hub 子模块引用"
git push
```

#### 方法 2: 使用同步脚本

```bash
# 在目标项目根目录执行
python ai_protocol_hub/scripts/sync_ai_protocol_hub.py --push --message "更新说明"

# 更新子模块引用
git commit -m "更新 AI-Protocol-Hub 子模块引用"
git push
```

### 在主仓库中接收更新

```bash
# 在 AI-Protocol-Hub 主仓库中
cd AI-Protocol-Hub

git checkout main
# 或其他目标分支（如 master）

git merge <推送的分支>
# 解决冲突（如果有）

git commit -m "合并来自目标项目的更新"
git push origin main
# 或其他目标分支
```

## 同步脚本使用

### 脚本功能

AI-Protocol-Hub 提供以下功能脚本：

#### 1. `sync_ai_protocol_hub.py` - 双向同步脚本

- **`--pull`**：从主仓库拉取更新到目标项目
- **`--push`**：从目标项目推送更新到主仓库
- **`--source`**：指定主仓库URL（默认：https://github.com/vincentline/AI-PH）
- **`--target`**：指定目标项目中的子模块路径（默认：./ai_protocol_hub）
- **`--message`**：推送时的提交信息
- **`--verbose`**：启用详细日志

#### 2. `install_submodule.py` - 子模块安装脚本

- **功能**：自动添加并配置 AI-Protocol-Hub 子模块
- **特性**：
  - 添加并克隆子模块
  - 检查并创建 skill_specs 文件夹
  - 检查并创建 INDEX.md 文件（如果不存在）
  - 检查并创建 UPDATE_LOG.md 文件（如果不存在）

#### 3. `git-push.py` - Git 推送脚本

- **功能**：简化 Git 代码推送流程
- **特性**：
  - 支持在 main 或 master 分支上操作
  - 自动生成提交信息
  - 自动拉取远程更新
  - 自动推送到远程仓库

#### 4. `GET_TIME.py` - 时间戳生成脚本

- **功能**：获取北京时间戳
- **特性**：
  - 格式：`[YYYY-MM-DD HH:MM:SS]`
  - 依赖：仅使用标准库
  - 错误处理：网络不可用时使用本地时间备选

#### 5. `start_server.py` - 本地服务器脚本

- **功能**：启动本地 HTTP 服务器
- **特性**：
  - 支持 COOP/COEP 头（用于 SharedArrayBuffer）
  - 支持跨域访问
  - 自动尝试下一个可用端口

### 使用示例

#### 1. 双向同步脚本 (sync_ai_protocol_hub.py)

##### 从主仓库拉取更新

```bash
# 使用默认路径
python ai_protocol_hub/scripts/sync_ai_protocol_hub.py --pull

# 使用自定义路径
python ai_protocol_hub/scripts/sync_ai_protocol_hub.py --pull --source "https://github.com/vincentline/AI-PH" --target "./ai_protocol_hub"

# 启用详细日志
python ai_protocol_hub/scripts/sync_ai_protocol_hub.py --pull --verbose
```

##### 向主仓库推送更新

```bash
# 带提交信息
python ai_protocol_hub/scripts/sync_ai_protocol_hub.py --push --message "添加新功能"

# 自动生成提交信息
python ai_protocol_hub/scripts/sync_ai_protocol_hub.py --push

# 使用自定义路径
python ai_protocol_hub/scripts/sync_ai_protocol_hub.py --push --message "更新说明" --target "./ai_protocol_hub"
```

#### 2. 子模块安装脚本 (install_submodule.py)

```bash
# 下载并执行安装脚本
curl -O https://raw.githubusercontent.com/vincentline/AI-PH/main/install_submodule.py
python install_submodule.py

# 或直接从子模块中执行（如果已存在）
python ai_protocol_hub/scripts/install_submodule.py
```

#### 3. Git 推送脚本 (git-push.py)

```bash
# 执行推送脚本
python ai_protocol_hub/scripts/git-push.py

# 该脚本会自动：
# 1. 检查当前分支（支持 main 或 master）
# 2. 检查并添加本地修改
# 3. 自动生成提交信息
# 4. 拉取远程更新
# 5. 推送到远程仓库
```

#### 4. 时间戳生成脚本 (GET_TIME.py)

```bash
# 执行时间戳生成脚本
python ai_protocol_hub/scripts/GET_TIME.py

# 输出示例:
# 使用本地时间转换：[2026-01-31 23:59:59]
# [2026-01-31 23:59:59]

# 在其他脚本中使用
import subprocess

time_stamp = subprocess.check_output(['python', 'ai_protocol_hub/scripts/GET_TIME.py'], universal_newlines=True).strip()
print(f"当前时间戳: {time_stamp}")
```

### 脚本安装

所有脚本都已包含在 AI-Protocol-Hub 子模块中，您可以直接使用：

```bash
# 使用子模块中的脚本
python ai_protocol_hub/scripts/<脚本名称>.py
```

或者，您可以将常用脚本复制到目标项目的合适位置：

```bash
# 复制脚本到目标项目根目录
cp ai_protocol_hub/scripts/<脚本名称>.py .

# 执行脚本
python <脚本名称>.py
```

#### 系统要求

- Python 3.6 或更高版本
- Git 2.0 或更高版本
- Windows、macOS 或 Linux 操作系统

## 常见问题

### 1. 子模块初始化失败

**问题**：执行 `git submodule update --init` 时失败

**解决方案**：

```bash
# 检查子模块状态
git submodule status

# 重新初始化子模块
git submodule deinit -f ai_protocol_hub
git submodule update --init --remote ai_protocol_hub
```

### 2. 推送失败

**问题**：执行 `git push` 时失败

**可能原因**：
- 没有主仓库的推送权限
- 网络连接问题
- 存在未解决的冲突

**解决方案**：
- 检查是否有主仓库的推送权限
- 检查网络连接是否正常
- 解决所有未解决的冲突后再推送

### 3. 同步脚本执行失败

**问题**：执行 `sync_ai_protocol_hub.py` 时失败

**可能原因**：
- Python 版本不兼容
- 目标路径不是有效的 Git 仓库
- 权限问题

**解决方案**：
- 确保使用 Python 3.6 或更高版本
- 确保目标路径是有效的 Git 仓库
- 查看详细日志获取错误信息：
  ```bash
  python ai_protocol_hub/scripts/sync_ai_protocol_hub.py --pull --verbose
  ```

### 4. 子模块路径变更

**问题**：修改了子模块的路径后，其他项目无法正常更新

**解决方案**：
- 更新所有引用该子模块的项目中的子模块路径
- 或者使用相对路径引用子模块

## 最佳实践

### 1. 代码审查

- 使用 Pull Request 流程进行代码审查，确保代码质量
- 至少有一名其他开发者审核代码变更
- 审核重点包括：代码风格、功能正确性、安全性

### 2. 版本管理

- 使用 Git 标签标记重要版本，便于回滚和参考
- 遵循语义化版本规范（Semantic Versioning）
- 维护详细的变更日志，记录重要修改

### 3. 分支管理

- **主分支（main）**：首选稳定版本分支，用于发布
- **主分支（master）**：兼容旧项目的稳定版本分支
- **开发分支（develop）**：集成新功能
- **特性分支（feature/*）**：开发特定功能
- **修复分支（fix/*）**：修复特定问题

**注意**：新项目建议使用 `main` 分支作为默认分支，旧项目可以继续使用 `master` 分支。`git-push.py` 脚本支持在两个分支上操作。

### 4. 同步策略

- **定期同步**：建议每周至少同步一次，减少冲突积累
- **批量更新**：将相关修改集中在一起同步，减少提交次数
- **冲突解决**：优先保留核心功能，确保系统稳定性

### 5. 文档维护

- 定期更新使用指南和API文档
- 记录重要的设计决策和实现细节
- 为复杂功能提供详细的使用示例

### 6. 测试策略

- 在同步前运行测试，确保代码质量
- 为核心功能编写单元测试
- 进行集成测试，确保子模块与目标项目正常集成

## 故障排除

### 子模块相关命令

```bash
# 查看子模块状态
git submodule status

# 初始化子模块
git submodule update --init

# 更新子模块到最新版本
git submodule update --remote

# 拉取所有子模块的更新
git submodule update --remote --recursive

# 进入子模块目录并切换分支
cd ai_protocol_hub
git checkout <分支名>
cd ..
git commit -m "更新子模块分支"

# 删除子模块
git submodule deinit -f ai_protocol_hub
rm -rf .git/modules/ai_protocol_hub
rm -rf ai_protocol_hub
git rm -f ai_protocol_hub
```

### 同步脚本故障排除

#### 1. 通用故障排除

```bash
# 检查脚本是否可执行
chmod +x ai_protocol_hub/scripts/*.py

# 检查 Python 版本
python --version

# 检查 Git 版本
git --version

# 检查目标路径是否为 Git 仓库
cd ai_protocol_hub
git status
cd ..
```

#### 2. 双向同步脚本故障排除

```bash
# 启用详细日志获取错误信息
python ai_protocol_hub/scripts/sync_ai_protocol_hub.py --pull --verbose

# 手动执行同步操作
cd ai_protocol_hub
git fetch origin
git merge origin/main  # 或 origin/master
cd ..
git commit -m "更新子模块"
```

#### 3. 子模块安装脚本故障排除

```bash
# 检查网络连接
ping github.com

# 检查 Git 权限
git config --list

# 手动执行安装步骤
git submodule add https://github.com/vincentline/AI-PH ai_protocol_hub
git submodule update --init --remote ai_protocol_hub
mkdir -p ai_protocol_hub/skill_specs
```

#### 4. 时间戳生成脚本故障排除

```bash
# 测试时间戳生成
python ai_protocol_hub/scripts/GET_TIME.py

# 检查网络连接（用于 WorldTimeAPI）
ping worldtimeapi.org
```

## 联系我们

如果您在使用 AI-Protocol-Hub 过程中遇到任何问题，请通过以下方式联系我们：

- 项目链接：https://github.com/vincentline/AI-PH
- 提交 Issue：https://github.com/vincentline/AI-PH/issues

---

© 2026 AI-Protocol-Hub
