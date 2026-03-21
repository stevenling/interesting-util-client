-- 驾考题目表 — 字段与聚合 jztk/query 返回的 result[] 单项一致
-- 参考：1.json 中 id / question / answer / item1-4 / explains / url
-- 字符集 utf8mb4：题干、解析中可能含 emoji 或特殊符号

CREATE TABLE IF NOT EXISTS jztk_question (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  question_id VARCHAR(32) NOT NULL COMMENT '题库题目ID（对应 JSON 的 id，字符串）',
  question_text TEXT NOT NULL COMMENT '题干（对应 JSON 的 question）',
  answer VARCHAR(8) NOT NULL COMMENT '答案：1-4；判断题为正确/错误对应选项序号',
  item1 VARCHAR(2000) NOT NULL DEFAULT '' COMMENT '选项1',
  item2 VARCHAR(2000) NOT NULL DEFAULT '' COMMENT '选项2',
  item3 VARCHAR(2000) NOT NULL DEFAULT '' COMMENT '选项3（判断题常为空）',
  item4 VARCHAR(2000) NOT NULL DEFAULT '' COMMENT '选项4（判断题常为空）',
  explains TEXT NULL COMMENT '解析（对应 JSON 的 explains，可能含 HTML）',
  image_url VARCHAR(2048) NULL COMMENT '配图 URL（对应 JSON 的 url，无图则为 NULL）',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '首次写入时间',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_jztk_question_id (question_id),
  KEY idx_jztk_question_updated (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='驾考题目（科目等由业务层 subject/model 区分，本表仅存题目本体）';

-- 同步批次/原始响应如需落库，可另建表 jztk_sync_log，本表仅做单题 upsert。

-- 从 1.json 的 successOrderFull.response.result 生成的批量插入（含重复则更新）：
-- 见同目录 jztk_question_insert.sql（执行前请先建表）
