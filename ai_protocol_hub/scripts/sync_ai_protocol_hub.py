#!/usr/bin/env python3
"""
AI-Protocol-Hub 双向同步脚本

功能：
- 从主仓库拉取更新到目标项目
- 从目标项目推送更新到主仓库
- 支持子模块的版本控制
- 处理各种异常情况
- 提供详细的操作日志

使用方法：
1. 从主仓库拉取更新：
   python sync_ai_protocol_hub.py --pull

2. 向主仓库推送更新：
   python sync_ai_protocol_hub.py --push --message "更新说明"

3. 自定义路径：
   python sync_ai_protocol_hub.py --pull --source "https://github.com/vincentline/AI-PH" --target "./ai_protocol_hub"
"""

import os
import sys
import subprocess
import argparse
import logging
from datetime import datetime

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)


def run_cmd(cmd, cwd=None, shell=True):
    """
    运行命令并返回结果
    
    参数：
        cmd: 要执行的命令
        cwd: 命令执行的工作目录
        shell: 是否使用shell执行
    
    返回：
        tuple: (returncode, stdout, stderr)
    """
    try:
        logger.debug(f"执行命令: {cmd} (cwd: {cwd})")
        result = subprocess.run(
            cmd, 
            shell=shell, 
            capture_output=True, 
            text=True, 
            encoding='utf-8',
            cwd=cwd
        )
        if result.returncode != 0:
            logger.warning(f"命令执行失败: {cmd}")
            logger.warning(f"错误输出: {result.stderr}")
        return result.returncode, result.stdout.strip(), result.stderr.strip()
    except Exception as e:
        logger.error(f"执行命令时发生异常: {str(e)}")
        return 1, "", str(e)


def check_git_repo(path):
    """
    检查指定路径是否为Git仓库
    
    参数：
        path: 要检查的路径
    
    返回：
        bool: 是否为Git仓库
    """
    if not os.path.exists(path):
        logger.error(f"路径不存在: {path}")
        return False
    
    code, stdout, stderr = run_cmd("git rev-parse --is-inside-work-tree", cwd=path)
    return code == 0 and stdout == "true"


def pull_from_main_repo(source, target):
    """
    从主仓库拉取更新到目标项目
    
    参数：
        source: 主仓库URL
        target: 目标项目中的子模块路径
    
    返回：
        bool: 操作是否成功
    """
    logger.info(f"开始从主仓库拉取更新: {source} -> {target}")
    
    # 检查目标路径是否存在
    if not os.path.exists(target):
        logger.error(f"目标路径不存在: {target}")
        return False
    
    # 检查目标路径是否为Git仓库
    if not check_git_repo(target):
        logger.error(f"目标路径不是Git仓库: {target}")
        return False
    
    # 拉取远程更新
    logger.info("拉取远程更新...")
    code, stdout, stderr = run_cmd("git fetch origin", cwd=target)
    if code != 0:
        logger.error("拉取远程更新失败")
        return False
    
    # 检查当前分支
    code, stdout, stderr = run_cmd("git rev-parse --abbrev-ref HEAD", cwd=target)
    if code != 0:
        logger.error("获取当前分支失败")
        return False
    current_branch = stdout
    logger.info(f"当前分支: {current_branch}")
    
    # 合并远程更新
    logger.info(f"合并远程更新到分支 {current_branch}...")
    code, stdout, stderr = run_cmd(f"git merge origin/{current_branch}", cwd=target)
    if code != 0:
        logger.error("合并远程更新失败，可能存在冲突")
        logger.info("请手动解决冲突后重新运行脚本")
        return False
    
    logger.info("从主仓库拉取更新成功")
    return True


def push_to_main_repo(source, target, message):
    """
    从目标项目推送更新到主仓库
    
    参数：
        source: 主仓库URL
        target: 目标项目中的子模块路径
        message: 提交信息
    
    返回：
        bool: 操作是否成功
    """
    logger.info(f"开始向主仓库推送更新: {target} -> {source}")
    
    # 检查目标路径是否存在
    if not os.path.exists(target):
        logger.error(f"目标路径不存在: {target}")
        return False
    
    # 检查目标路径是否为Git仓库
    if not check_git_repo(target):
        logger.error(f"目标路径不是Git仓库: {target}")
        return False
    
    # 检查是否有未提交的更改
    code, stdout, stderr = run_cmd("git status --porcelain", cwd=target)
    if code != 0:
        logger.error("检查Git状态失败")
        return False
    
    if not stdout:
        logger.info("没有未提交的更改，无需推送")
        return True
    
    logger.info("发现未提交的更改:")
    logger.info(stdout)
    
    # 添加所有更改
    logger.info("添加所有更改...")
    code, stdout, stderr = run_cmd("git add .", cwd=target)
    if code != 0:
        logger.error("添加更改失败")
        return False
    
    # 提交更改
    logger.info("提交更改...")
    commit_message = message or f"更新 AI-Protocol-Hub ({datetime.now().strftime('%Y-%m-%d %H:%M:%S')})"
    code, stdout, stderr = run_cmd(f"git commit -m \"{commit_message}\"", cwd=target)
    if code != 0:
        logger.error("提交更改失败")
        return False
    
    # 推送更改到远程仓库
    logger.info("推送更改到远程仓库...")
    code, stdout, stderr = run_cmd("git push origin", cwd=target)
    if code != 0:
        logger.error("推送更改失败")
        return False
    
    logger.info("向主仓库推送更新成功")
    return True


def main():
    """
    脚本主函数
    """
    parser = argparse.ArgumentParser(description='AI-Protocol-Hub 双向同步脚本')
    
    # 操作类型
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--pull', action='store_true', help='从主仓库拉取更新')
    group.add_argument('--push', action='store_true', help='向主仓库推送更新')
    
    # 路径参数
    parser.add_argument('--source', 
                        default='https://github.com/vincentline/AI-PH', 
                        help='主仓库URL (默认: https://github.com/vincentline/AI-PH)')
    parser.add_argument('--target', 
                        default='./ai_protocol_hub', 
                        help='目标项目中的子模块路径 (默认: ./ai_protocol_hub)')
    
    # 推送参数
    parser.add_argument('--message', 
                        help='推送时的提交信息')
    
    # 日志参数
    parser.add_argument('--verbose', 
                        action='store_true', 
                        help='启用详细日志')
    
    args = parser.parse_args()
    
    # 启用详细日志
    if args.verbose:
        logger.setLevel(logging.DEBUG)
    
    # 转换为绝对路径
    target = os.path.abspath(args.target)
    
    # 执行操作
    success = False
    if args.pull:
        success = pull_from_main_repo(args.source, target)
    elif args.push:
        success = push_to_main_repo(args.source, target, args.message)
    
    # 输出结果
    if success:
        logger.info("操作执行成功!")
        return 0
    else:
        logger.error("操作执行失败!")
        return 1


if __name__ == "__main__":
    sys.exit(main())
