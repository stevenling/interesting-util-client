"""SQLAlchemy ORM 模型；表结构由 Base.metadata 在 init_db 时 create_all 同步到 MySQL。"""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from sqlalchemy import (
    BigInteger,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.mysql import LONGTEXT
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    """所有模型的声明基类，供 database.init_db 扫描建表。"""

    pass


class User(Base):
    """注册用户；密码仅存 bcrypt 哈希，不存明文。"""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(256), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(256))
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class AnkiImportJob(Base):
    """
    一次 .apkg 导入批次（来源文件 + 统计）。
    deck_hint：包内 decks JSON 中首个牌组名，便于展示。
    """

    __tablename__ = "anki_import_jobs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    source_filename: Mapped[str] = mapped_column(String(512), nullable=False)
    deck_hint: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)
    anki_schema_ver: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    note_count: Mapped[int] = mapped_column(default=0, nullable=False)
    imported_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )

    notes: Mapped[List["AnkiNote"]] = relationship(
        "AnkiNote", back_populates="import_job", cascade="all, delete-orphan"
    )


class AnkiNote(Base):
    """
    Anki 笔记行：与 Anki SQLite `notes` 表对应（按模型把 flds 拆成 JSON）。
    同一 apkg 内 anki_nid 唯一；跨批次可重复（不同 import_job_id）。
    """

    __tablename__ = "anki_notes"
    __table_args__ = (
        UniqueConstraint("import_job_id", "anki_nid", name="uq_anki_note_job_nid"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    import_job_id: Mapped[int] = mapped_column(
        ForeignKey("anki_import_jobs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    anki_nid: Mapped[int] = mapped_column(BigInteger, nullable=False)
    guid: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    model_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    model_name: Mapped[str] = mapped_column(String(256), nullable=False)
    tags: Mapped[str] = mapped_column(Text, nullable=False, default="")
    # JSON：字段名 -> 文本；Anki 卡片常含大量 HTML，需 LONGTEXT（非默认 TEXT 64KB 上限）
    fields_json: Mapped[str] = mapped_column(LONGTEXT, nullable=False)
    sfld: Mapped[str] = mapped_column(String(1024), nullable=False, default="")

    import_job: Mapped["AnkiImportJob"] = relationship(
        "AnkiImportJob", back_populates="notes"
    )
