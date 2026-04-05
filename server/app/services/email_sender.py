from __future__ import annotations

import logging
import smtplib
from email.mime.text import MIMEText
from typing import Optional, Tuple

from app import config

logger = logging.getLogger(__name__)


def send_register_code(to_email: str, code: str) -> Tuple[bool, Optional[str]]:
    """返回 (成功, 错误信息)。"""
    if config.SMTP_SKIP_SEND:
        logger.warning("[SMTP_SKIP_SEND] 跳过发信，验证码: %s -> %s", to_email, code)
        return True, None

    if not all([config.SMTP_HOST, config.SMTP_USER, config.SMTP_PASS, config.SMTP_FROM]):
        return False, "邮件服务未配置，请在服务端设置 SMTP_* 环境变量"

    body = (
        f"嗨～这边是 Nyx，刚给你生成了一串注册验证码：{code}\n\n"
        "趁热填进注册页吧，10 分钟内有效；过期就得再点一次「获取验证码」。\n\n"
        "若你根本没在注册——八成是邮差送错门牌了，忽略这封即可。\n\n"
        "—— Nyx"
    )
    msg = MIMEText(body, "plain", "utf-8")
    msg["Subject"] = config.SMTP_REGISTER_SUBJECT
    msg["From"] = config.SMTP_FROM
    msg["To"] = to_email

    try:
        if config.SMTP_SECURE or config.SMTP_PORT == 465:
            with smtplib.SMTP_SSL(config.SMTP_HOST, config.SMTP_PORT, timeout=30) as smtp:
                smtp.login(config.SMTP_USER, config.SMTP_PASS)
                smtp.sendmail(config.SMTP_FROM, [to_email], msg.as_string())
        else:
            with smtplib.SMTP(config.SMTP_HOST, config.SMTP_PORT, timeout=30) as smtp:
                smtp.starttls()
                smtp.login(config.SMTP_USER, config.SMTP_PASS)
                smtp.sendmail(config.SMTP_FROM, [to_email], msg.as_string())
    except OSError as e:
        logger.exception("sendmail")
        return False, "邮件发送失败，请稍后重试"
    return True, None
