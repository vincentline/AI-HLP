@echo off

:: Git 推送脚本 - 批处理版本
:: 避免PowerShell编码问题

echo ==== Git 推送 ====

echo.
echo 0. 检查当前分支...
for /f "delims=" %%i in ('git rev-parse --abbrev-ref HEAD 2^>nul') do set currentBranch=%%i
if "%currentBranch%"=="" (
    echo 错误：不在 git 仓库中
    pause
    exit /b 1
)
echo 当前分支: %currentBranch%

if "%currentBranch%" neq "main" (
    echo 警告: 当前不在 main 分支，自动切换到 main 分支
    git checkout main
    if errorlevel 1 (
        echo 切换分支失败
        pause
        exit /b 1
    )
    for /f "delims=" %%i in ('git rev-parse --abbrev-ref HEAD 2^>nul') do set currentBranch=%%i
)

echo.
echo 1. 检查本地修改...
git status --short > git_status.txt 2>&1
if errorlevel 1 (
    echo 运行 git status 失败
    del git_status.txt 2>nul
    pause
    exit /b 1
)

findstr /r "." git_status.txt >nul
if errorlevel 1 (
    echo 没有需要提交的修改
    del git_status.txt 2>nul
    pause
    exit /b 0
)

echo 发现以下修改：
type git_status.txt
del git_status.txt 2>nul

echo.
echo 2. 添加所有修改...
git add -A
if errorlevel 1 (
    echo 添加文件失败
    pause
    exit /b 1
)

echo.
echo 3. 提交更改...
git commit -m "自动更新 - %date% %time%"
if errorlevel 1 (
    echo 提交失败
    pause
    exit /b 1
)

echo.
echo 4. 拉取远程更改...
git pull --no-rebase origin main
echo 拉取完成

echo.
echo 5. 推送到远程...
git push origin main
if errorlevel 1 (
    echo 推送失败
    pause
    exit /b 1
)

echo.
echo ==== 完成！ ====
echo 代码已成功推送到 GitHub
pause
