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