# API 使用说明

## 📡 API 端点

### 1. `/api/hello` - 测试 API

**GET 请求**
```javascript
fetch('/api/hello')
  .then(res => res.json())
  .then(data => console.log(data));
```

**响应示例**
```json
{
  "message": "Hello from Vercel Serverless Function!",
  "timestamp": "2026-01-24T12:00:00.000Z",
  "method": "GET"
}
```

### 2. `/api/articles` - 文章相关 API

**GET 请求 - 获取文章列表**
```javascript
fetch('/api/articles')
  .then(res => res.json())
  .then(data => console.log(data));
```

**GET 请求 - 获取单个文章**
```javascript
fetch('/api/articles?id=article1')
  .then(res => res.json())
  .then(data => console.log(data));
```

**POST 请求 - 保存数据（如收藏）**
```javascript
fetch('/api/articles', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    articleId: 'article1',
    action: 'favorite',
    userId: 'user123'
  })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

## 🔧 扩展 API

你可以根据需要添加更多 API：

### 示例：用户收藏 API

创建 `api/favorites.js`:
```javascript
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'GET') {
    // 获取用户收藏列表
    res.json({ favorites: [] });
  } else if (req.method === 'POST') {
    // 添加收藏
    res.json({ success: true });
  }
}
```

### 示例：文章评论 API

创建 `api/comments.js`:
```javascript
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'GET') {
    // 获取评论
    res.json({ comments: [] });
  } else if (req.method === 'POST') {
    // 添加评论
    res.json({ success: true });
  }
}
```

## 💾 数据存储

Vercel Serverless Functions 是无状态的，如果需要持久化数据，可以：

1. **使用数据库**
   - MongoDB Atlas（免费）
   - Supabase（免费）
   - PlanetScale（免费）
   - Vercel Postgres

2. **使用 Vercel KV**（键值存储）
   - Vercel 提供的 Redis 服务

3. **使用文件系统**（不推荐，因为函数是无状态的）

## 📝 注意事项

- API 函数必须导出 `default` 函数
- 函数会在每次请求时执行（冷启动）
- 免费版有执行时间限制（10秒）
- 支持异步操作（async/await）
