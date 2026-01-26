# Git 安全推送脚本 - 简化版
# 避免使用 Set-Location 命令，解决中文路径编码问题
# 忽略 Git 关于行尾换行符的警告

# 临时禁用整个脚本的错误停止
$ErrorActionPreference = 'Continue'

Write-Host "==== Git 安全推送 ====" -ForegroundColor Cyan

# 0. 检查当前分支
Write-Host "`n0. 检查当前分支..." -ForegroundColor Yellow
$currentBranch = git rev-parse --abbrev-ref HEAD 2>$null
if (-not $currentBranch) {
    Write-Host "错误：不在 git 仓库中" -ForegroundColor Red
    exit 1
}
Write-Host "当前分支: $currentBranch" -ForegroundColor Green

if ($currentBranch -ne "main") {
    Write-Host "警告: 当前不在 main 分支，自动切换到 main 分支" -ForegroundColor Red
    git checkout main 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "切换分支失败" -ForegroundColor Red
        exit 1
    }
    $currentBranch = "main"
}

# 1. 检查是否有修改
Write-Host "`n1. 检查本地修改..." -ForegroundColor Yellow
$status = git status --short 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "运行 git status 失败" -ForegroundColor Red
    exit 1
}

if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "没有需要提交的修改" -ForegroundColor Green
    exit 0
}

Write-Host "发现以下修改：" -ForegroundColor Green
Write-Host $status

# 2. 添加所有修改
Write-Host "`n2. 添加所有修改..." -ForegroundColor Yellow
# 通过将 stderr 重定向到 stdout 并过滤掉警告来忽略行尾换行符警告
git add -A 2>&1 | ForEach-Object { $_ } | Where-Object { $_ -notmatch 'warning:.*LF will be replaced by CRLF' } | Out-Null
# 手动检查退出代码
if ($LASTEXITCODE -ne 0) {
    Write-Host "添加文件失败" -ForegroundColor Red
    exit 1
}

# 3. 生成提交信息，自动填写变更内容
Write-Host "`n3. 生成提交信息..." -ForegroundColor Yellow

# 获取变更的文件列表
$changedFiles = git status --short 2>&1
$fileList = @()

foreach ($file in $changedFiles) {
    $trimmed = $file.Trim()
    $parts = $trimmed.Split(' ', 2)
    if ($parts.Length -gt 1) {
        $fileList += $parts[1].Trim()
    }
}

# 生成变更内容描述
if ($fileList.Count -gt 0) {
    $changeDescription = $fileList -join ', '
} else {
    $changeDescription = "未检测到具体文件变更"
}

# 生成完整提交信息
$commitMsg = "自动更新: $changeDescription - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
Write-Host "提交信息: $commitMsg" -ForegroundColor Green

# 4. 提交
Write-Host "`n4. 提交更改..." -ForegroundColor Yellow
git commit -m $commitMsg 2>&1 | ForEach-Object { $_ } | Where-Object { $_ -notmatch 'warning:.*LF will be replaced by CRLF' } | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "提交失败" -ForegroundColor Red
    exit 1
}

# 5. 拉取远程更改（带重试）
Write-Host "`n5. 拉取远程更改..." -ForegroundColor Yellow
$pullSuccess = $false
for ($i = 0; $i -lt 3; $i++) {
    git pull --no-rebase origin main 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $pullSuccess = $true
        Write-Host "拉取成功" -ForegroundColor Green
        break
    }
    Write-Host "第 $($i+1) 次拉取失败，2秒后重试..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
}

# 6. 推送
Write-Host "`n6. 推送到远程..." -ForegroundColor Yellow
git push origin main 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "`n==== 完成！ ====" -ForegroundColor Green
    Write-Host "代码已成功推送到 GitHub" -ForegroundColor Green
} else {
    Write-Host "`n推送失败" -ForegroundColor Red
    exit 1
}
