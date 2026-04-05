"""
Pydantic 请求/响应模型：FastAPI 用其解析 JSON、校验字段，非法请求在进路由前返回 422。
"""

from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    """POST /api/auth/register 的 JSON 体；与前端服务端注册流程一致。"""

    username: str = Field(..., min_length=2, max_length=64)
    password: str = Field(..., min_length=6, max_length=128)
    email: EmailStr
    code: str = Field(..., min_length=6, max_length=6, pattern=r"^\d{6}$")


class LoginRequest(BaseModel):
    """POST /api/auth/login 的 JSON 体。"""

    username: str = Field(..., min_length=1, max_length=64)
    password: str = Field(..., min_length=1, max_length=128)


class TokenResponse(BaseModel):
    """注册/登录成功时返回；access_token 为 JWT，前端写入 localStorage user-token。"""

    access_token: str
    token_type: str = "bearer"
    username: str
