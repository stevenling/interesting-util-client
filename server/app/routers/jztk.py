"""
驾考题目 HTTP 接口，与前端 src/api/jztk.js 约定一致。

- GET /api/jztk/question/random?subject=1|4&size=10
  返回 Juhe 形：{ "error_code": 0, "reason": "ok", "result": [ ... ] }
- POST /api/jztk/sync  可选同步落库占位；与 VITE_JZTK_SYNC_URL=/api/jztk/sync 对齐
"""

from __future__ import annotations

import logging
import random
from typing import Any

from fastapi import APIRouter, Body, Query

from app.jztk_demo_bank import jztk_pool_for_subject

logger = logging.getLogger(__name__)

# main.include_router(..., prefix="/api") + 本处 prefix → /api/jztk/...
router = APIRouter(prefix="/jztk", tags=["jztk"])


@router.get("/question/random")
def jztk_question_random(
    subject: int = Query(1, description="科目：1=科目一，4=科目四"),
    size: int = Query(10, ge=1, le=500, description="本批题量，与前端 VITE_JZTK_BATCH_SIZE_PARAM 默认 size 一致"),
) -> dict[str, Any]:
    sub = 4 if subject == 4 else 1
    pool = jztk_pool_for_subject(sub)
    if not pool:
        return {"error_code": 1, "reason": "题库为空", "result": []}

    n = min(size, 500)
    if n <= len(pool):
        picked = random.sample(pool, n)
    else:
        picked = random.choices(pool, k=n)

    return {"error_code": 0, "reason": "ok", "result": picked}


@router.post("/sync")
def jztk_sync(payload: dict[str, Any] = Body(...)) -> dict[str, Any]:
    """
    接收前端 POST 的完整拉题 JSON（error_code / result 等），便于日后落库。
    当前仅记录条数并返回成功，不校验 Bearer（与前端可选 VITE_JZTK_SYNC_TOKEN 可后续再加）。
    """
    result = payload.get("result")
    n = len(result) if isinstance(result, list) else 0
    logger.info("jztk sync: received payload keys=%s, result_len=%s", list(payload.keys()), n)
    return {"ok": True, "accepted": n}
