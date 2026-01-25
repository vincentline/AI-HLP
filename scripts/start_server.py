import http.server
import socketserver
import os
import sys
import argparse

# 解析命令行参数
parser = argparse.ArgumentParser(description='AI-HLP 本地测试服务器')
parser.add_argument('-p', '--port', type=int, default=8085, help='服务器端口，默认8085')
parser.add_argument('-d', '--directory', choices=['desktop', 'static', 'figma', 'root'], 
                    help='选择要测试的目录: desktop(apps/desktop-app), static(apps/static-web), figma(apps/figma-plugin), root(项目根目录)')
parser.add_argument('--path', type=str, help='自定义测试路径，相对于项目根目录')
args = parser.parse_args()

# 配置端口
PORT = args.port

# 项目根目录
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(PROJECT_ROOT)

# 选择web根目录
web_root = "."
if args.directory:
    if args.directory == 'desktop':
        web_root = "apps/desktop-app"
    elif args.directory == 'static':
        web_root = "apps/static-web"
    elif args.directory == 'figma':
        web_root = "apps/figma-plugin"
elif args.path:
    web_root = args.path

# 切换到web根目录
os.chdir(web_root)
print(f"Using '{web_root}' as web root.")

class CoopCoepHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # 添加启用 SharedArrayBuffer 所必需的头
        self.send_header("Cross-Origin-Opener-Policy", "same-origin")
        self.send_header("Cross-Origin-Embedder-Policy", "require-corp")
        # 允许跨域访问
        self.send_header("Access-Control-Allow-Origin", "*")
        super().end_headers()

class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

print(f"Starting server...")
print("Enabled headers: COOP: same-origin, COEP: require-corp")

# 尝试绑定端口，如果被占用则自动递增
while True:
    try:
        with ReusableTCPServer(("", PORT), CoopCoepHandler) as httpd:
            print(f"Server started at http://localhost:{PORT}")
            print("Press Ctrl+C to stop")
            httpd.serve_forever()
        break
    except KeyboardInterrupt:
        print("\nServer stopped.")
        break
    except OSError as e:
        # 捕获所有绑定错误，强制尝试下一个端口
        # 常见错误码：98, 10048 (Address already in use), 10013 (Permission denied)
        print(f"Port {PORT} bind failed: {e}")
        print(f"Trying next port {PORT + 1}...")
        PORT += 1