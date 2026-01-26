#!/usr/bin/env powershell

# 检查任务完成情况脚本
# 用于分析任务完成状态，生成进度报告

param(
    [string]$PlanningDir = ".trae/planning"
)

# 检查规划目录是否存在
if (-not (Test-Path $PlanningDir)) {
    Write-Host "错误: 规划目录不存在: $PlanningDir"
    Write-Host "请先使用 init-session.ps1 初始化会话"
    exit 1
}

# 获取所有会话文件
$sessionFiles = Get-ChildItem -Path $PlanningDir -Filter "session_*.md" | Sort-Object LastWriteTime -Descending

if ($sessionFiles.Count -eq 0) {
    Write-Host "错误: 没有找到会话文件"
    Write-Host "请先使用 init-session.ps1 初始化会话"
    exit 1
}

# 获取最新的会话文件
$latestSessionFile = $sessionFiles[0]
Write-Host "分析会话文件: $($latestSessionFile.Name)"

# 读取会话文件内容
$sessionContent = Get-Content -Path $latestSessionFile.FullName -Encoding UTF8

# 分析任务完成情况
$tasks = @()
$inTaskSection = $false

foreach ($line in $sessionContent) {
    if ($line -match '^## 任务计划$') {
        $inTaskSection = $true
        continue
    }
    
    if ($inTaskSection -and $line -match '^## ') {
        $inTaskSection = $false
        continue
    }
    
    if ($inTaskSection -and $line -match '^- \[(.)\] (.+)$') {
        $status = $matches[1]
        $task = $matches[2]
        $tasks += @{
            Status = $status
            Task = $task
        }
    }
}

# 计算完成情况
$totalTasks = $tasks.Count
$completedTasks = ($tasks | Where-Object { $_.Status -eq 'x' }).Count
$progressPercentage = 0
if ($totalTasks -gt 0) {
    $progressPercentage = [math]::Round(($completedTasks / $totalTasks) * 100, 2)
}

# 生成报告
Write-Host "`n任务完成情况报告"
Write-Host "=" * 50
Write-Host "总任务数: $totalTasks"
Write-Host "已完成: $completedTasks"
Write-Host "进度: $progressPercentage%"
Write-Host "`n详细任务状态:"
Write-Host "-" * 50

foreach ($task in $tasks) {
    $statusSymbol = if ($task.Status -eq 'x') { "✓" } else { "□" }
    Write-Host "$statusSymbol $($task.Task)"
}

# 更新进度文件
$progressFile = "$PlanningDir/progress_$(Get-Date -Format "yyyyMMdd").md"
if (Test-Path $progressFile) {
    $progressContent = Get-Content -Path $progressFile -Encoding UTF8
    $updatedContent = @()
    $inStatusSection = $false
    $currentTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    foreach ($line in $progressContent) {
        if ($line -match '^## 当前状态$') {
            $inStatusSection = $true
            $updatedContent += $line
            $updatedContent += "- 总任务数: $totalTasks"
            $updatedContent += "- 已完成: $completedTasks"
            $updatedContent += "- 进度: $progressPercentage%"
            continue
        }
        
        if ($inStatusSection -and $line -match '^- 总任务数:') {
            continue
        }
        
        if ($inStatusSection -and $line -match '^- 已完成:') {
            continue
        }
        
        if ($inStatusSection -and $line -match '^- 进度:') {
            continue
        }
        
        if ($inStatusSection -and $line -match '^## ') {
            $inStatusSection = $false
        }
        
        if ($line -match '^## 最近更新$') {
            $updatedContent += $line
            $updatedContent += "- [$currentTime] 进度更新: $progressPercentage%"
            continue
        }
        
        if ($line -match '^- \[.*\] 进度更新:') {
            continue
        }
        
        $updatedContent += $line
    }
    
    $updatedContent | Out-File -FilePath $progressFile -Encoding UTF8
    Write-Host "`n已更新进度文件: $($progressFile | Split-Path -Leaf)"
}

Write-Host "`n报告生成完成！"

# 返回完成情况
return @{
    TotalTasks = $totalTasks
    CompletedTasks = $completedTasks
    ProgressPercentage = $progressPercentage
    SessionFile = $latestSessionFile.FullName
}
