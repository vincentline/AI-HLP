#!/usr/bin/env python3
"""
Git 推送脚本 - Python 版本
避免编码问题，使用基本功能
"""

import subprocess
import sys
import os
from datetime import datetime

def run_cmd(cmd, cwd=None):
    """运行命令并返回结果"""
    try:
        result = subprocess.run(
            cmd, 
            shell=True, 
            capture_output=True, 
            text=True, 
            cwd=cwd
        )
        return result.returncode, result.stdout.strip(), result.stderr.strip()
    except Exception as e:
        return 1, "", str(e)

def main():
    print("==== Git 推送 ====\n")
    
    # 检查当前分支
    print("0. 检查当前分支...")
    code, stdout, stderr = run_cmd("git rev-parse --abbrev-ref HEAD")
    if code != 0:
        print(f"错误：不在 git 仓库中: {stderr}")
        return 1
    current_branch = stdout
    print(f"当前分支: {current_branch}")
    
    # 切换到 main 分支
    if current_branch != "main":
        print("警告: 当前不在 main 分支，自动切换到 main 分支")
        code, stdout, stderr = run_cmd("git checkout main")
        if code != 0:
            print(f"切换分支失败: {stderr}")
            return 1
        current_branch = "main"
    
    # 检查是否有修改
    print("\n1. 检查本地修改...")
    code, stdout, stderr = run_cmd("git status --short")
    if code != 0:
        print(f"运行 git status 失败: {stderr}")
        return 1
    
    if not stdout:
        print("没有需要提交的修改")
        return 0
    
    print("发现以下修改：")
    print(stdout)
    
    # 添加所有修改
    print("\n2. 添加所有修改...")
    code, stdout, stderr = run_cmd("git add -A")
    if code != 0:
        print(f"添加文件失败: {stderr}")
        return 1
    
    # 提交
    print("\n3. 提交更改...")
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    commit_msg = f"自动更新 - {timestamp}"
    code, stdout, stderr = run_cmd(f"git commit -m \"{commit_msg}\"")
    if code != 0:
        print(f"提交失败: {stderr}")
        return 1
    
    # 拉取远程更改
    print("\n4. 拉取远程更改...")
    code, stdout, stderr = run_cmd("git pull --no-rebase origin main")
    if code != 0:
        print(f"拉取失败，尝试直接推送: {stderr}")
    else:
        print("拉取成功")
    
    # 推送
    print("\n5. 推送到远程...")
    code, stdout, stderr = run_cmd("git push origin main")
    if code != 0:
        print(f"推送失败: {stderr}")
        return 1
    
    print("\n==== 完成！ ====")
    print("代码已成功推送到 GitHub")
    return 0

if __name__ == "__main__":
    sys.exit(main())
