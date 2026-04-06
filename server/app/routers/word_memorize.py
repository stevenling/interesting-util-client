"""
背单词：从 MySQL `anki_import_jobs` / `anki_notes` 提供词库列表与词条（供 WordMemorize.vue）。

- GET /api/word-memorize/jobs
- GET /api/word-memorize/jobs/{job_id}/words?limit=&offset=

前端可先 `limit=100&offset=0` 拉首屏，再增大 offset 分段请求，避免长时间阻塞。

大词库（数千条、每条 fields_json 含大量 HTML）若用 Python 整包 json.loads + 全文去标签，会极慢甚至像「卡住」。
MySQL 下优先用 JSON_EXTRACT 只取出常用字段的字符串，再按需做轻量去 HTML；并支持分页与 zh_max 控制释义长度。
"""

from __future__ import annotations

import html
import json
import logging
import re
import time
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, text
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AnkiImportJob, AnkiNote

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/word-memorize", tags=["word-memorize"])

_TAG_RE = re.compile(r"<[^>]+>", re.DOTALL)
_SCRIPT_RE = re.compile(r"<script[^>]*>[\s\S]*?</script>", re.IGNORECASE)

# MySQL：从 JSON 文本中直接取常见 Anki 字段，避免把整段 LONGTEXT 拉回 Python 再 json.loads
_WORDS_MYSQL_SQL = text(
    """
SELECT
  sfld,
  COALESCE(
    JSON_UNQUOTE(JSON_EXTRACT(CAST(fields_json AS JSON), '$."英语单词"')),
    ''
  ) AS v_en,
  COALESCE(
    JSON_UNQUOTE(JSON_EXTRACT(CAST(fields_json AS JSON), '$."英美音标"')),
    ''
  ) AS v_ph,
  COALESCE(
    JSON_UNQUOTE(JSON_EXTRACT(CAST(fields_json AS JSON), '$."中文释义"')),
    ''
  ) AS v_zh,
  COALESCE(
    JSON_UNQUOTE(JSON_EXTRACT(CAST(fields_json AS JSON), '$."Front"')),
    ''
  ) AS v_front,
  COALESCE(
    JSON_UNQUOTE(JSON_EXTRACT(CAST(fields_json AS JSON), '$."Back"')),
    ''
  ) AS v_back
FROM anki_notes
WHERE import_job_id = :job_id
ORDER BY id ASC
LIMIT :lim OFFSET :row_offset
"""
)


def _plain_from_html(raw: str) -> str:
    if not raw:
        return ""
    t = _SCRIPT_RE.sub(" ", raw)
    t = _TAG_RE.sub(" ", t)
    t = html.unescape(t)
    return re.sub(r"\s+", " ", t).strip()


def _maybe_truncate(s: str, zh_max: Optional[int]) -> str:
    if not s or zh_max is None or len(s) <= zh_max:
        return s
    return s[:zh_max].rstrip() + "…"


def _fields_dict(fields_json: str) -> dict[str, Any]:
    try:
        data = json.loads(fields_json)
    except json.JSONDecodeError:
        return {}
    return data if isinstance(data, dict) else {}


def _pick_plain(fields: dict[str, Any], *keys: str) -> str:
    for k in keys:
        if k not in fields:
            continue
        v = fields[k]
        if v is None:
            continue
        s = str(v).strip()
        if s:
            return _plain_from_html(s)
    return ""


def _note_to_word(fields: dict[str, Any], sfld: str) -> dict[str, str]:
    en = _pick_plain(fields, "英语单词", "Word", "word", "Front", "单词")
    if not en and sfld:
        en = _plain_from_html(sfld)
    phonetic = _pick_plain(fields, "英美音标", "音标", "phonetic", "Phonetic", "IPA")
    zh = _pick_plain(fields, "中文释义", "释义", "Back", "meaning", "中文")
    return {"en": en, "phonetic": phonetic, "zh": zh}


def _word_from_mysql_row(
    row: Any, zh_max: Optional[int]
) -> Optional[dict[str, str]]:
    sfld = str(row.sfld or "")
    en = (
        _plain_from_html(str(row.v_en or ""))
        or _plain_from_html(str(row.v_front or ""))
        or _plain_from_html(sfld)
    )
    phonetic = _plain_from_html(str(row.v_ph or ""))
    zh = _plain_from_html(str(row.v_zh or "")) or _plain_from_html(
        str(row.v_back or "")
    )
    zh = _maybe_truncate(zh, zh_max)
    if not en and not zh:
        return None
    return {"en": en, "phonetic": phonetic, "zh": zh}


def _list_words_python(
    db: Session,
    job_id: int,
    limit: int,
    offset: int,
    zh_max: Optional[int],
) -> tuple[list[dict[str, str]], int]:
    q = (
        select(AnkiNote.id, AnkiNote.fields_json, AnkiNote.sfld)
        .where(AnkiNote.import_job_id == job_id)
        .order_by(AnkiNote.id.asc())
        .offset(offset)
        .limit(limit)
    )
    rows = db.execute(q).all()
    words: list[dict[str, str]] = []
    for _nid, fj, sfld in rows:
        fields = _fields_dict(fj)
        w = _note_to_word(fields, sfld or "")
        if w["en"] or w["zh"]:
            w["zh"] = _maybe_truncate(w["zh"], zh_max)
            words.append(w)
    return words, len(rows)


def _list_words_mysql(
    db: Session,
    job_id: int,
    limit: int,
    offset: int,
    zh_max: Optional[int],
) -> tuple[list[dict[str, str]], int]:
    rows = db.execute(
        _WORDS_MYSQL_SQL,
        {"job_id": job_id, "lim": limit, "row_offset": offset},
    ).all()
    words: list[dict[str, str]] = []
    for row in rows:
        w = _word_from_mysql_row(row, zh_max)
        if w:
            words.append(w)
    return words, len(rows)


@router.get("/jobs")
def list_anki_jobs(db: Session = Depends(get_db)) -> dict[str, Any]:
    rows = db.scalars(
        select(AnkiImportJob).order_by(AnkiImportJob.id.desc())
    ).all()
    return {
        "jobs": [
            {
                "id": j.id,
                "source_filename": j.source_filename,
                "deck_hint": j.deck_hint,
                "note_count": j.note_count,
                "imported_at": j.imported_at.isoformat() if j.imported_at else None,
            }
            for j in rows
        ]
    }


@router.get("/jobs/{job_id}/words")
def list_words_for_job(
    job_id: int,
    db: Session = Depends(get_db),
    limit: int = Query(100, ge=1, le=1000, description="每批从 anki_notes 扫描的行数"),
    offset: int = Query(0, ge=0),
    zh_max: Optional[int] = Query(
        4000,
        ge=0,
        le=100_000,
        description="释义去 HTML 后的最大字符数；0=不截断；默认 4000 减轻大词库响应体积",
    ),
) -> dict[str, Any]:
    job = db.get(AnkiImportJob, job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="import job 不存在")

    dialect = db.get_bind().dialect.name
    t0 = time.perf_counter()
    eff_zh_max = None if zh_max == 0 else zh_max

    try:
        if dialect == "mysql":
            words, scanned = _list_words_mysql(db, job_id, limit, offset, eff_zh_max)
        else:
            words, scanned = _list_words_python(
                db, job_id, limit, offset, eff_zh_max
            )
    except Exception:
        logger.exception(
            "word-memorize MySQL JSON 路径失败，回退 Python 解析 job_id=%s", job_id
        )
        words, scanned = _list_words_python(
            db, job_id, limit, offset, eff_zh_max
        )

    elapsed = time.perf_counter() - t0
    logger.info(
        "word-memorize words job_id=%s offset=%s limit=%s scanned=%s out=%s dialect=%s %.2fs",
        job_id,
        offset,
        limit,
        scanned,
        len(words),
        dialect,
        elapsed,
    )

    return {
        "job_id": job.id,
        "source_filename": job.source_filename,
        "deck_hint": job.deck_hint,
        "offset": offset,
        "limit": limit,
        "scanned": scanned,
        "returned": len(words),
        "words": words,
    }
