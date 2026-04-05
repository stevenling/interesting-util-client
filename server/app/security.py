"""密码哈希（bcrypt）与登录凭证 JWT 签发；密钥与过期时间见 config / .env。"""

from datetime import datetime, timedelta, timezone

import bcrypt
from jose import jwt

from app.config import AUTH_JWT_ALGORITHM, AUTH_JWT_EXPIRE_MINUTES, AUTH_JWT_SECRET


def hash_password(password: str) -> str:
    """注册时对明文密码做 bcrypt（含随机盐），返回可入库的 ASCII 字符串。"""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    """登录时比对明文与库中哈希；哈希格式异常时返回 False，避免抛错打断请求。"""
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except ValueError:
        return False


def create_access_token(subject_username: str) -> str:
    """
    签发 JWT：sub 为用户名，iat/exp 为 UTC 时间；客户端存 localStorage 的 user-token。
    生产环境务必设置强随机 AUTH_JWT_SECRET。
    """
    now = datetime.now(timezone.utc)
    exp = now + timedelta(minutes=AUTH_JWT_EXPIRE_MINUTES)
    payload = {"sub": subject_username, "iat": now, "exp": exp}
    return jwt.encode(payload, AUTH_JWT_SECRET, algorithm=AUTH_JWT_ALGORITHM)
