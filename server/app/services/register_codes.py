"""
注册邮箱验证码的内存存储（按规范化邮箱索引）。

注意：进程内 dict，多 worker / 多机部署不共享；生产高可用应换 Redis 等。
邮件正文里的「10 分钟」应与 TTL_SEC 保持一致。
"""

from __future__ import annotations

import random
import time
from dataclasses import dataclass
from typing import Optional, Tuple

# 验证码自写入起有效时长（秒），与 email_sender 文案中的「10 分钟」应对齐
TTL_SEC = 10 * 60
# 同一邮箱两次「发送验证码」的最小间隔（秒）
RESEND_SEC = 60


@dataclass
class _CodeRow:
    """某邮箱当前有效的验证码及其 Unix 过期时间。"""

    code: str
    exp: float


# 规范化邮箱 -> 当前验证码记录
_codes: dict[str, _CodeRow] = {}
# 规范化邮箱 -> 上次成功发起 send 的时间戳（用于限流）
_last_send: dict[str, float] = {}


def normalize_email(s: str) -> str:
    """统一小写、去首尾空格，用作 dict 键避免大小写重复。"""
    return (s or "").strip().lower()


def generate_code() -> str:
    """6 位数字字符串，范围 100000–999999。"""
    return str(random.randint(100000, 999999))


def can_send(email: str) -> Tuple[bool, Optional[str]]:
    """距离上次发送不足 RESEND_SEC 则拒绝，返回 (False, 提示文案)。"""
    e = normalize_email(email)
    now = time.time()
    last = _last_send.get(e, 0)
    if now - last < RESEND_SEC:
        return False, "发送过于频繁，请稍后再试"
    return True, None


def store_code(email: str, code: str) -> None:
    """写入验证码并刷新该邮箱的发送时间戳（send 成功路径调用）。"""
    e = normalize_email(email)
    _codes[e] = _CodeRow(code=code, exp=time.time() + TTL_SEC)
    _last_send[e] = time.time()


def pop_verified_code(email: str, code: str) -> Tuple[bool, Optional[str]]:
    """
    比对邮箱下的验证码；成功则删除该条目（一次性），返回 (True, None)。
    过期或不存在、或数字不对则返回 (False, 错误提示)。
    """
    e = normalize_email(email)
    c = (code or "").strip()
    row = _codes.get(e)
    if not row or time.time() > row.exp:
        _codes.pop(e, None)
        return False, "验证码无效或已过期"
    if row.code != c:
        return False, "验证码错误"
    del _codes[e]
    return True, None


def rollback_send_timestamp(email: str) -> None:
    """SMTP 发信失败时撤销「上次发送时间」，便于用户立即重试 send（不占用 60s 限流）。"""
    e = normalize_email(email)
    _last_send.pop(e, None)


def discard_code(email: str) -> None:
    """发信失败等场景下丢弃已生成但未成功送达的验证码。"""
    _codes.pop(normalize_email(email), None)
