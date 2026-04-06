-- 若 anki_notes 曾用旧 ORM（fields_json 为 TEXT）建表，导入大体量 HTML 笔记会报 Data too long。
-- 在 MySQL 执行一次即可：
USE interesting_util;

ALTER TABLE anki_notes
  MODIFY COLUMN fields_json LONGTEXT NOT NULL COMMENT 'JSON 字段名->内容';
