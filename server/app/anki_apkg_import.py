"""
从 Anki 导出的 .apkg（zip：内嵌 SQLite collection.anki2 / collection.anki21）提取笔记并写入 MySQL。

表结构见 app.models：AnkiImportJob、AnkiNote。

用法（在 server 目录下，已配置 DATABASE_URL / MYSQL_*）：
  PYTHONPATH=. python -m app.anki_apkg_import
  PYTHONPATH=. python -m app.anki_apkg_import /path/to/deck.apkg

默认读取：server/assets/blank.apkg（若不存在会报错）。

也支持**已解压目录**（内含 collection.anki2 / collection.anki21、media 映射、数字媒体文件），例如：
  PYTHONPATH=. python -m app.anki_apkg_import "assets/blank copy"
"""

from __future__ import annotations

import argparse
import json
import logging
import shutil
import sqlite3
import tempfile
import zipfile
from pathlib import Path
from typing import Any

from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import AnkiImportJob, AnkiNote

logger = logging.getLogger(__name__)

FIELD_SEP = "\x1f"
COLLECTION_CANDIDATES = ("collection.anki21", "collection.anki2")


def _server_root() -> Path:
    return Path(__file__).resolve().parent.parent


def default_apkg_path() -> Path:
    return _server_root() / "assets" / "blank.apkg"


def _find_collection_sqlite(extract_dir: Path) -> Path:
    for name in COLLECTION_CANDIDATES:
        p = extract_dir / name
        if p.is_file():
            return p
    raise FileNotFoundError(
        f"包内未找到 {' / '.join(COLLECTION_CANDIDATES)}，可能不是 Anki 2.x 牌组包"
    )


def _parse_models_json(models_raw: str) -> dict[str, Any]:
    data = json.loads(models_raw)
    if not isinstance(data, dict):
        return {}
    return data


def _model_field_names(model: dict[str, Any]) -> list[str]:
    flds = model.get("flds") or []
    if not isinstance(flds, list):
        return []
    ordered = sorted(flds, key=lambda x: int(x.get("ord", 0)))
    out: list[str] = []
    for i, f in enumerate(ordered):
        if isinstance(f, dict) and f.get("name"):
            out.append(str(f["name"]))
        else:
            out.append(f"f{i}")
    return out


def _first_deck_name(decks_raw: str) -> str | None:
    try:
        decks = json.loads(decks_raw)
    except json.JSONDecodeError:
        return None
    if not isinstance(decks, dict) or not decks:
        return None
    # Anki: deck id "1" 常为 Default
    for _did, meta in decks.items():
        if isinstance(meta, dict) and meta.get("name"):
            return str(meta["name"])
    return None


def _read_col_and_notes_from_dir(base: Path) -> tuple[
    dict[int, dict[str, Any]], int | None, str | None, list[tuple]
]:
    """
    从已解压目录读取 Anki 集合库（base 下须有 collection.anki2 / collection.anki21）。
    返回：(mid -> model dict, col.ver, deck_hint, notes 原始列表)
    notes 每行：(id, guid, mid, tags, flds, sfld)
    """
    db_path = _find_collection_sqlite(base)
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    try:
        cur = conn.execute("SELECT ver, models, decks FROM col LIMIT 1")
        row = cur.fetchone()
        if not row:
            raise ValueError("col 表为空，无法读取模型")
        ver = int(row["ver"]) if row["ver"] is not None else None
        models_map: dict[int, dict[str, Any]] = {}
        for mid_str, mobj in _parse_models_json(row["models"]).items():
            try:
                mid = int(mid_str)
            except (TypeError, ValueError):
                continue
            if isinstance(mobj, dict):
                models_map[mid] = mobj
        deck_hint = _first_deck_name(row["decks"] or "{}")
        note_rows = conn.execute(
            "SELECT id, guid, mid, tags, flds, sfld FROM notes"
        ).fetchall()
        parsed = [
            (
                int(r["id"]),
                str(r["guid"]),
                int(r["mid"]),
                str(r["tags"] or ""),
                str(r["flds"] or ""),
                r["sfld"],
            )
            for r in note_rows
        ]
        return models_map, ver, deck_hint, parsed
    finally:
        conn.close()


def _read_anki_collection(source: Path) -> tuple[
    dict[int, dict[str, Any]], int | None, str | None, list[tuple]
]:
    """
    读取 Anki 数据：source 为 .apkg 文件时先解压到临时目录；为目录时直接读其中 SQLite。
    """
    if source.is_dir():
        return _read_col_and_notes_from_dir(source.resolve())
    if not source.is_file():
        raise FileNotFoundError(f"路径不存在或不是文件/目录: {source}")
    if not zipfile.is_zipfile(source):
        raise ValueError(f"不是 zip 格式的 apkg: {source}")
    tmp = tempfile.mkdtemp(prefix="apkg_extract_")
    try:
        with zipfile.ZipFile(source, "r") as zf:
            zf.extractall(tmp)
        return _read_col_and_notes_from_dir(Path(tmp))
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def _flds_to_json(
    flds: str, mid: int, models_map: dict[int, dict[str, Any]]
) -> tuple[str, str]:
    """返回 (model_name, fields_json)。"""
    model = models_map.get(mid) or {}
    name = str(model.get("name") or "unknown")
    names = _model_field_names(model)
    parts = flds.split(FIELD_SEP)
    if not names:
        obj = {f"f{i}": v for i, v in enumerate(parts)}
    else:
        obj = {}
        for i, fn in enumerate(names):
            obj[fn] = parts[i] if i < len(parts) else ""
        if len(parts) > len(names):
            obj["_extra"] = FIELD_SEP.join(parts[len(names) :])
    return name, json.dumps(obj, ensure_ascii=False)


def import_apkg_to_db(source: Path, db: Session) -> AnkiImportJob:
    """
    将 Anki 包导入 MySQL。source 可为 .apkg 文件，或已解压目录（含 collection.anki2/anki21）。
    仅写入批次元数据与笔记字段（AnkiNote）；不复制 MP3 等媒体二进制。
    """
    if not source.exists():
        raise FileNotFoundError(f"路径不存在: {source}")
    if not source.is_file() and not source.is_dir():
        raise FileNotFoundError(f"需要 apkg 文件或已解压目录: {source}")

    models_map, ver, deck_hint, note_rows = _read_anki_collection(source.resolve())

    label = source.name
    job = AnkiImportJob(
        source_filename=label,
        deck_hint=deck_hint,
        anki_schema_ver=ver,
        note_count=0,
    )
    db.add(job)
    db.flush()

    batch: list[AnkiNote] = []
    chunk = 400
    for nid, guid, mid, tags, flds, sfld in note_rows:
        model_name, fields_json = _flds_to_json(flds, mid, models_map)
        sfld_str = "" if sfld is None else str(sfld)
        batch.append(
            AnkiNote(
                import_job_id=job.id,
                anki_nid=nid,
                guid=guid,
                model_id=mid,
                model_name=model_name,
                tags=tags.strip(),
                fields_json=fields_json,
                sfld=sfld_str[:1024],
            )
        )
        if len(batch) >= chunk:
            db.add_all(batch)
            db.flush()
            batch.clear()
    if batch:
        db.add_all(batch)

    job.note_count = len(note_rows)
    db.commit()
    db.refresh(job)
    logger.info(
        "已导入 apkg=%s job_id=%s notes=%s deck_hint=%s",
        label,
        job.id,
        job.note_count,
        deck_hint,
    )
    return job


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    parser = argparse.ArgumentParser(
        description="导入 Anki .apkg 或已解压目录到 MySQL（笔记入 anki_notes）"
    )
    parser.add_argument(
        "source",
        nargs="?",
        default=None,
        help=f".apkg 或解压目录路径，默认 {default_apkg_path()}",
    )
    args = parser.parse_args()
    path = Path(args.source) if args.source else default_apkg_path()
    if not path.exists():
        raise SystemExit(
            f"路径不存在: {path}\n请传入 .apkg 或已解压目录（含 collection.anki2），"
            f"或使用默认 {default_apkg_path()}。"
        )
    session = SessionLocal()
    try:
        job = import_apkg_to_db(path, session)
        print(
            f"OK import_job_id={job.id} notes={job.note_count} "
            f"deck_hint={job.deck_hint!r} schema_ver={job.anki_schema_ver}"
        )
    except Exception as e:
        session.rollback()
        logger.exception("导入失败")
        raise SystemExit(1) from e
    finally:
        session.close()


if __name__ == "__main__":
    main()
