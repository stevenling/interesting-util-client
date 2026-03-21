# 驾考刷题王 — Spring Boot 落库对接说明

前端每次从第三方接口成功拉取题目后，会把**完整 JSON 响应**原样 `POST` 到你配置的 `VITE_JZTK_SYNC_URL`，便于你在服务端写入数据库。

若**未配置** `VITE_JZTK_SYNC_URL`，则不会请求后端，改为由浏览器**自动下载**一个 `jztk-response-*.json` 文件到用户本机「下载」目录（网页无法直接写入项目源码目录，这是浏览器安全限制）。

若**已配置** `VITE_JZTK_SYNC_URL` 且仍希望每次拉题后**同时**保存本机 JSON 备份，在前端环境变量中设置 **`VITE_JZTK_ALSO_DOWNLOAD=true`**（或 `1`）。

## 请求约定

- **Method**: `POST`
- **URL**: 由环境变量 `VITE_JZTK_SYNC_URL` 指定，例如：`https://your-api.example.com/api/jztk/sync`
- **Header**:
  - `Content-Type: application/json`
  - 若配置了 `VITE_JZTK_SYNC_TOKEN`，会附带：`Authorization: Bearer <token>`
- **Body**（与第三方接口返回一致）:

```json
{
  "error_code": 0,
  "reason": "ok",
  "result": [
    {
      "id": 12,
      "question": "这个标志是何含义？",
      "answer": "4",
      "item1": "前方40米减速",
      "item2": "最低时速40公里",
      "item3": "限制40吨轴重",
      "item4": "限制最高时速40公里",
      "explains": "……",
      "url": "http://images.juheapi.com/jztk/c1c2subject1/12.jpg"
    }
  ]
}
```

## 数据库表（MySQL）

与 `result[]` 单项对应的建表脚本见：**[sql/jztk_question_mysql.sql](sql/jztk_question_mysql.sql)**  
- JSON 字段 `id` → 表字段 `question_id`（唯一，便于 upsert）  
- `question` → `question_text`  
- `url` → `image_url`

## Spring Boot 示例（Controller 骨架）

```java
@PostMapping("/api/jztk/sync")
public ResponseEntity<?> sync(@RequestBody JztkApiResponse body) {
    if (body.getErrorCode() != 0 || body.getResult() == null) {
        return ResponseEntity.badRequest().build();
    }
    for (JztkQuestion q : body.getResult()) {
        // upsert by id，避免重复插入
        jztkQuestionRepository.save(mapToEntity(q));
    }
    return ResponseEntity.ok().build();
}
```

## CORS

若前端与 API 不同域，请在 Spring Boot 配置允许前端来源（如 `https://xxx.vercel.app`）对 `POST /api/jztk/sync` 的跨域。

## 安全建议

- 第三方驾考 API 的 **key** 建议只放在**后端**或网关，由 Spring Boot 代理拉题；前端只调你自己的域名。
- 同步接口建议加 **鉴权**（与 `VITE_JZTK_SYNC_TOKEN` 对应校验）或仅内网可访问。
