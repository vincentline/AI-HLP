#!/usr/bin/env pwsh

# Git 推送脚本 - 简化版
# 避免编码问题，使用基本功能

Write-Host "==== Git 推送 ===="

# 检查当前分支
Write-Host "\n0. 检查当前分支..."
$currentBranch = git rev-parse --abbrev-ref HEAD 2>$null
if (-not $currentBranch) {
    Write-Host "错误：不在 git 仓库中"
    exit 1
}
Write-Host "当前分支: $currentBranch"

if ($currentBranch -ne "main") {
    Write-Host "警告: 当前不在 main 分支，自动切换到 main 分支"
    git checkout main 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "切换分支失败"
        exit 1
    }
    $currentBranch = "main"
}

# 检查是否有修改
Write-Host "\n1. 检查本地修改..."
$status = git status --short 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "运行 git status 失败"
    exit 1
}

if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "没有需要提交的修改"
    exit 0
}

Write-Host "发现以下修改："
Write-Host $status

# 添加所有修改
Write-Host "\n2. 添加所有修改..."
git add -A 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "添加文件失败"
    exit 1
}

# 生成提交信息
Write-Host "\n3. 生成提交信息..."
$changedFiles = git status --short 2>&1
$fileList = @()

foreach ($file in $changedFiles) {
    $trimmed = $file.Trim()
    $parts = $trimmed.Split(' ', 2)
    if ($parts.Length -gt 1) {
        $fileList += $parts[1].Trim()
    }
}

if ($fileList.Count -gt 0) {
    $changeDescription = $fileList -join ', '
} else {
    $changeDescription = "未检测到具体文件变更"
}

$commitMsg = "自动更新: $changeDescription - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
Write-Host "提交信息: $commitMsg"

# 提交
Write-Host "\n4. 提交更改..."
git commit -m $commitMsg 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "提交失败"
    exit 1
}

# 拉取远程更改
Write-Host "\n5. 拉取远程更改..."
git pull --no-rebase origin main 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "拉取成功"
} else {
    Write-Host "拉取失败，尝试直接推送"
}

# 推送
Write-Host "\n6. 推送到远程..."
git push origin main 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "\n==== 完成！ ===="
    Write-Host "代码已成功推送到 GitHub"
} else {
    Write-Host "\n推送失败"
    exit 1
}
