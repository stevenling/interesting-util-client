"""
认证相关 HTTP 接口，挂载在 main 的 /api 前缀下，完整路径形如 /api/auth/...。

- email-register-code：注册邮箱验证码（发信 / 校验），与前端 authEmailApi 协议一致。
- register：校验验证码后写入用户表并签发 JWT（验证码在此消费，勿与 verify 重复用同一码）。
- login：用户名密码校验通过后签发 JWT。
"""

from __future__ import annotations

import re
from typing import Any

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app import config as app_config
from app.database import get_db
from app.models import User
from app.schemas import LoginRequest, RegisterRequest, TokenResponse
from app.security import create_access_token, hash_password, verify_password
from app.services import email_sender, register_codes

# 最终路径前缀由 main.include_router(..., prefix="/api") 与本处 prefix 拼接得到
router = APIRouter(prefix="/auth", tags=["auth"])

_EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def _err(status: int, message: str) -> JSONResponse:
    """统一错误 JSON，便于前端读取 message 字段。"""
    return JSONResponse(status_code=status, content={"ok": False, "message": message})


@router.post("/email-register-code")
def email_register_code(body: dict[str, Any]) -> JSONResponse:
    """
    与前端 authEmailApi 一致：POST JSON 含 action、email，verify 时另含 code。
    - send：限流后生成 6 位码、写入内存、SMTP 发信（或 SMTP_SKIP_SEND 返回 devCode）。
    - verify：比对内存中的码，成功则删除该邮箱条目（一次性）。
    """
    action = (body.get("action") or "").strip()
    email = register_codes.normalize_email(str(body.get("email") or ""))

    if action == "send":
        if not _EMAIL_RE.match(email):
            return _err(400, "邮箱格式不正确")
        ok, msg = register_codes.can_send(email)
        if not ok:
            return _err(429, msg or "发送过于频繁")
        code = register_codes.generate_code()
        register_codes.store_code(email, code)

        if app_config.SMTP_SKIP_SEND:
            return JSONResponse(
                status_code=200,
                content={"ok": True, "devCode": code},
            )

        sent, err = email_sender.send_register_code(email, code)
        if not sent:
            register_codes.rollback_send_timestamp(email)
            register_codes.discard_code(email)
            status = 503 if err and "未配置" in err else 500
            return _err(status, err or "邮件发送失败")

        return JSONResponse(status_code=200, content={"ok": True})

    if action == "verify":
        code = str(body.get("code") or "").strip()
        if not _EMAIL_RE.match(email) or not re.fullmatch(r"\d{6}", code):
            return _err(400, "邮箱或验证码格式不正确")
        ok, msg = register_codes.pop_verified_code(email, code)
        if not ok:
            return _err(400, msg or "验证码错误")
        return JSONResponse(status_code=200, content={"ok": True})

    return _err(400, "未知操作")


@router.post("/register")
def register_account(body: RegisterRequest, db: Session = Depends(get_db)):
    """
    服务端注册：再次校验并消费邮箱验证码，查重后写入 User，返回 JWT。
    与仅走本地 localStorage 的前端流程不同：此处会 pop 验证码，勿先调 verify 再调本接口。
    """
    email = register_codes.normalize_email(str(body.email))
    u = body.username.strip()
    ok, msg = register_codes.pop_verified_code(email, body.code)
    if not ok:
        return _err(400, msg or "验证码无效")

    if db.scalar(select(User.id).where(User.username == u)):
        return _err(400, "该用户名已被注册")
    if db.scalar(select(User.id).where(User.email == email)):
        return _err(400, "该邮箱已被注册")

    user = User(username=u, email=email, hashed_password=hash_password(body.password))
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(u)
    return TokenResponse(access_token=token, token_type="bearer", username=u)


@router.post("/login")
def login_account(body: LoginRequest, db: Session = Depends(get_db)):
    """按用户名查库，bcrypt 校验密码，成功则签发 JWT。"""
    u = body.username.strip()
    user = db.scalar(select(User).where(User.username == u))
    if not user or not verify_password(body.password, user.hashed_password):
        return _err(401, "用户名或密码错误")

    token = create_access_token(u)
    return TokenResponse(access_token=token, token_type="bearer", username=u)
