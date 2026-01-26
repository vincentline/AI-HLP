#!/usr/bin/env powershell

# 初始化规划会话脚本
# 用于启动新的规划会话，创建必要的目录和文件

param(
    [string]$ProjectName = "默认项目",
    [string]$Goal = "默认目标"
)

# 获取当前时间
$currentTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# 创建规划目录
$planningDir = ".trae/planning"
if (-not (Test-Path $planningDir)) {
    New-Item -ItemType Directory -Path $planningDir -Force | Out-Null
    Write-Host "创建规划目录: $planningDir"
}

# 创建会话文件
$sessionFile = "$planningDir/session_$(Get-Date -Format "yyyyMMdd_HHmmss").md"
$sessionContent = @"
# 规划会话

## 项目信息
- 项目名称: $ProjectName
- 目标: $Goal
- 开始时间: $currentTime
- 状态: 进行中

## 任务计划
- [ ] 待添加任务

## 进度更新
- [$currentTime] 会话初始化完成

## 备注

"@

$sessionContent | Out-File -FilePath $sessionFile -Encoding UTF8
Write-Host "创建会话文件: $sessionFile"

# 创建进度跟踪文件
$progressFile = "$planningDir/progress_$(Get-Date -Format "yyyyMMdd").md"
if (-not (Test-Path $progressFile)) {
    $progressContent = @"
# 进度跟踪

## 当前状态
- 总任务数: 0
- 已完成: 0
- 进度: 0%

## 最近更新
- [$currentTime] 进度跟踪初始化

## 待办事项

## 已完成事项

"@
    $progressContent | Out-File -FilePath $progressFile -Encoding UTF8
    Write-Host "创建进度跟踪文件: $progressFile"
}

Write-Host "会话初始化完成！"
Write-Host "项目: $ProjectName"
Write-Host "目标: $Goal"
Write-Host "开始时间: $currentTime"

# 返回会话信息
return @{
    ProjectName = $ProjectName
    Goal = $Goal
    StartTime = $currentTime
    SessionFile = $sessionFile
    ProgressFile = $progressFile
}
