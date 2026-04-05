#!/usr/bin/env bash
# 在服务器上部署/更新 FastAPI 后端：创建 .venv、pip 安装依赖。
# 仅在已安装 systemd 单元（默认 nyx-api.service）时执行 restart；不会单独拉起 uvicorn。
# 首次部署请复制 nyx-api.service.example 到 /etc/systemd/system/ 后 enable --now。
#
# 用法：
#   chmod +x deploy.sh
#   ./deploy.sh
#
# 环境变量（可选）：
#   PYTHON=python3.11     创建 venv 用的解释器
#   NYX_API_SERVICE=nyx-api   systemd 单元名（不含 .service）
#   NYX_API_PORT=11219        健康检查与手动启动示例中的端口（需与 systemd / uvicorn 一致）
#   SKIP_SYSTEMD_RESTART=1    不尝试 systemctl restart
#
# Debian/Ubuntu 若提示 ensurepip 不可用，需先: apt install -y python3-venv
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

PYTHON="${PYTHON:-python3}"
VENV="$ROOT/.venv"
PIP="$VENV/bin/pip"
PY="$VENV/bin/python"
SERVICE="${NYX_API_SERVICE:-nyx-api}"
PORT="${NYX_API_PORT:-11219}"

die() { echo "错误: $*" >&2; exit 1; }

command -v "$PYTHON" >/dev/null 2>&1 || die "未找到 $PYTHON，请先安装 Python 3.9+"

if [[ -x "$VENV/bin/pip" ]]; then
  :
elif [[ -d "$VENV" ]]; then
  echo ">>> 删除不完整 .venv 并重建"
  rm -rf "$VENV"
fi

if [[ ! -x "$VENV/bin/pip" ]]; then
  echo ">>> 创建虚拟环境: $VENV"
  if ! "$PYTHON" -m venv "$VENV"; then
    pyver="$("$PYTHON" -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")' 2>/dev/null || echo '3')"
    die "创建 venv 失败（ensurepip 不可用）。请执行: apt install -y python3-venv  或 apt install -y python${pyver}-venv  然后: rm -rf \"$VENV\" && ./deploy.sh"
  fi
fi

echo ">>> 安装/更新 pip 与 requirements.txt"
"$PIP" install -U pip
"$PIP" install -r "$ROOT/requirements.txt"

if [[ ! -f "$ROOT/.env" ]]; then
  echo ">>> 警告: 未找到 .env。请执行: cp .env.example .env 并填写 MySQL、AUTH_JWT_SECRET、CORS_ORIGINS 等" >&2
fi

if [[ "${SKIP_SYSTEMD_RESTART:-0}" == "1" ]]; then
  echo ">>> 已跳过 systemd 重启 (SKIP_SYSTEMD_RESTART=1)"
elif command -v systemctl >/dev/null 2>&1 && systemctl cat "${SERVICE}.service" &>/dev/null; then
  echo ">>> 重启 systemd 服务: ${SERVICE}.service"
  if systemctl restart "$SERVICE" 2>/dev/null; then
    systemctl --no-pager -l status "$SERVICE" || true
  elif sudo -n systemctl restart "$SERVICE" 2>/dev/null; then
    sudo -n systemctl --no-pager -l status "$SERVICE" || true
  else
    echo ">>> 无法无密码执行 systemctl，请手动: sudo systemctl restart $SERVICE"
  fi
else
  echo ">>> 未检测到 /etc/systemd/system/${SERVICE}.service — deploy.sh 只装了依赖，没有启动进程。"
  echo "    因此 127.0.0.1:${PORT} 无监听时 Nginx /api 会 502。请任选其一："
  echo "    [常驻] sudo cp \"$ROOT/nyx-api.service.example\" /etc/systemd/system/${SERVICE}.service"
  echo "          sudo nano /etc/systemd/system/${SERVICE}.service   # 核对路径、User、端口 ${PORT}"
  echo "          sudo systemctl daemon-reload && sudo systemctl enable --now ${SERVICE}"
  echo "    [调试] cd \"$ROOT\" && .venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port $PORT"
fi

echo ">>> 完成。确认接口: curl -sS http://127.0.0.1:${PORT}/api/health （应返回 JSON；000/拒绝连接说明服务未起）"
