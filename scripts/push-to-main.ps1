#!/usr/bin/env pwsh

# 提交到GitHub main分支的脚本
Write-Output "=== 开始提交到GitHub main分支 ==="

# 1. 检查当前分支，如果不是main则切换到main
$currentBranch = git branch --show-current
Write-Output "当前分支: $currentBranch"

if ($currentBranch -ne "main") {
    Write-Output "切换到main分支..."
    git checkout main
    if ($LASTEXITCODE -ne 0) {
        Write-Error "切换分支失败，请检查git状态"
        exit 1
    }
}

# 2. 检查是否有修改
Write-Output "检查是否有修改..."
git status
$status = git status --porcelain

if ($status -eq "") {
    Write-Output "没有修改，直接拉取远程更改"
} else {
    Write-Output "发现修改，准备提交..."
    
    # 3. 添加所有修改
    Write-Output "添加所有修改..."
    git add .
    if ($LASTEXITCODE -ne 0) {
        Write-Error "添加修改失败"
        exit 1
    }
    
    # 4. 让用户输入变更内容
    $commitMsg = Read-Host -Prompt "请输入提交信息（回车跳过则使用默认信息）"
    if ([string]::IsNullOrEmpty($commitMsg)) {
        $commitMsg = "自动提交: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    }
    
    # 5. 提交
    Write-Output "创建提交..."
    git commit -m "$commitMsg"
    if ($LASTEXITCODE -ne 0) {
        Write-Error "提交失败，可能是因为没有需要提交的修改"
        exit 1
    }
}

# 6. 拉取远程更改（必须）
Write-Output "拉取远程main分支的更改..."
git pull origin main
if ($LASTEXITCODE -ne 0) {
    Write-Error "拉取失败，请解决冲突后重试"
    exit 1
}

# 7. 推送
Write-Output "推送本地main分支到远程..."
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Error "推送失败"
    exit 1
}

Write-Output "=== 提交完成 ==="
