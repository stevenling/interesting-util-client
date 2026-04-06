CREATE DATABASE IF NOT EXISTS interesting_util CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE interesting_util;

-- 与 server/app/models.py User 一致；亦可由 FastAPI 启动时 create_all 自动建表
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  username VARCHAR(64) NOT NULL,
  email VARCHAR(256) NOT NULL,
  hashed_password VARCHAR(256) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '插入时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY uq_users_username (username),
  UNIQUE KEY uq_users_email (email),
  KEY ix_users_username (username),
  KEY ix_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 若 users 表已存在且缺时间字段，可手工执行（按库名改 USE）：
-- ALTER TABLE users
--   ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '插入时间' AFTER hashed_password,
--   ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间' AFTER created_at;

-- Anki .apkg 导入（与 app.models AnkiImportJob / AnkiNote 一致；亦可仅依赖 FastAPI init_db create_all）
CREATE TABLE IF NOT EXISTS anki_import_jobs (
  id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  source_filename VARCHAR(512) NOT NULL,
  deck_hint VARCHAR(256) NULL COMMENT 'decks JSON 首个牌组名',
  anki_schema_ver INT NULL COMMENT 'Anki col.ver',
  note_count INT NOT NULL DEFAULT 0,
  imported_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS anki_notes (
  id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  import_job_id INT NOT NULL,
  anki_nid BIGINT NOT NULL COMMENT 'Anki notes.id',
  guid VARCHAR(36) NOT NULL,
  model_id BIGINT NOT NULL,
  model_name VARCHAR(256) NOT NULL,
  tags TEXT NOT NULL,
  fields_json LONGTEXT NOT NULL COMMENT 'JSON 字段名->内容',
  sfld VARCHAR(1024) NOT NULL DEFAULT '',
  CONSTRAINT fk_anki_notes_job FOREIGN KEY (import_job_id) REFERENCES anki_import_jobs (id) ON DELETE CASCADE,
  UNIQUE KEY uq_anki_note_job_nid (import_job_id, anki_nid),
  KEY ix_anki_notes_job (import_job_id),
  KEY ix_anki_notes_guid (guid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;