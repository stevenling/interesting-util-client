import os
from pathlib import Path
from urllib.parse import quote_plus

from dotenv import load_dotenv

# server/.env（与 app/ 同级目录 server 下）；不覆盖已在环境里设置的变量
_SERVER_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(_SERVER_ROOT / ".env")


def _resolve_database_url() -> str:
    """
    仅使用 MySQL（驱动 pymysql）。优先级：
    1) DATABASE_URL — 完整 SQLAlchemy URL，如 mysql+pymysql://...
    2) MYSQL_HOST + MYSQL_USER + MYSQL_DATABASE（+ MYSQL_PASSWORD、MYSQL_PORT）
    """
    explicit = os.getenv("DATABASE_URL", "").strip()
    if explicit:
        return explicit

    host = os.getenv("MYSQL_HOST", "").strip()
    user = os.getenv("MYSQL_USER", "").strip()
    password = os.getenv("MYSQL_PASSWORD", "")
    database = os.getenv("MYSQL_DATABASE", "").strip()
    port = os.getenv("MYSQL_PORT", "3306").strip()
    if host and user and database:
        u = quote_plus(user)
        p = quote_plus(password)
        d = quote_plus(database)
        return f"mysql+pymysql://{u}:{p}@{host}:{port}/{d}?charset=utf8mb4"

    raise RuntimeError(
        "未配置 MySQL：请在 server/.env 中填写 MYSQL_* 或 DATABASE_URL，"
        "可参考 server/.env.example；已存在的环境变量不会被 .env 覆盖。"
    )


DATABASE_URL = _resolve_database_url()

AUTH_JWT_SECRET = os.getenv("AUTH_JWT_SECRET", "dev-only-change-me")
AUTH_JWT_ALGORITHM = "HS256"
AUTH_JWT_EXPIRE_MINUTES = int(os.getenv("AUTH_JWT_EXPIRE_MINUTES", "10080"))  # 7 天

# CORS（开发默认 Vite 8080）
_cors = os.getenv("CORS_ORIGINS", "http://localhost:8080,http://127.0.0.1:8080")
CORS_ORIGINS = [o.strip() for o in _cors.split(",") if o.strip()]

# SMTP（与根目录 api/auth/email-register-code.js 一致）
SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
SMTP_FROM = os.getenv("SMTP_FROM", "")
SMTP_SECURE = os.getenv("SMTP_SECURE", "").lower() in ("1", "true", "yes")
SMTP_REGISTER_SUBJECT = os.getenv("SMTP_REGISTER_SUBJECT", "注册验证码")
SMTP_SKIP_SEND = os.getenv("SMTP_SKIP_SEND", "").lower() in ("1", "true", "yes")
