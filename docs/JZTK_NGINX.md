# 驾考刷题王 — Nginx 反向代理（同源、免浏览器跨域）

> **说明**：下文中的**域名、端口、磁盘路径、内网 IP** 仅为配置**示例**，请全部换成你自己的环境（`yunhu.com:9049` 一类名字只是举例，不是固定要求）。

前端打包后只发**相对路径**（常用基址 **`/api`**），由 Nginx 转发到本仓库 FastAPI（默认 **`127.0.0.1:11219`**）或其它后端；浏览器始终只访问**同一站点**，无需在后端配 CORS。

## 前端环境变量（构建时写入）

| 变量 | 生产常见写法 | 说明 |
|------|----------------|------|
| `VITE_JZTK_API_URL` | `/api` | 基址；代码会拼 `VITE_JZTK_API_RANDOM_PATH`（默认 `/jztk/question/random`），即请求 **`/api/jztk/question/random?...`** |
| `VITE_JZTK_SYNC_URL` | `/api/jztk/sync` | 可选；需 Nginx 同样转发 |
| `VITE_JZTK_API_RANDOM_PATH` | 默认 `/jztk/question/random` | 与后端 Controller 路径一致即可 |

`.env.production` 里用 **`/api`** 表示「跟当前页面同源」；用户实际访问的是 **`https://你的域名/...`**，不是某个写死的 URL。

## Nginx 配置思路（后端 **没有** 对外 `/api` 前缀时）

后端真实路径例如 **`/jztk/question/random`**，对外统一走 **`/api/...`**，再用 `rewrite` 去掉 `/api` 后转发到应用端口：

```nginx
server {
    listen 80;   # 或 443 ssl、或其它端口，按你实际来
    server_name your-domain.example;   # 示例：换成你的域名

    location / {
        root /var/www/your-app/dist;    # 示例：换成 dist 真实路径
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 浏览器请求 /api/xxx → 转发到后端 /xxx
    location ^~ /api/ {
        rewrite ^/api/(.*)$ /$1 break;
        proxy_pass http://127.0.0.1:11219/;   # 示例：FastAPI 默认端口；按实际服务地址修改
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

- `proxy_pass` 写成内网地址可减少一次 DNS，**不是必须**，按你运维习惯即可。
- 若后端已自带 **`/api` 前缀**（例如 Spring `context-path=/api`），则**不要**再按上面方式 `rewrite` 掉 `/api`，需与真实路径对齐。

## 请求对应关系（逻辑示意）

| 浏览器（与页面同源） | 经 Nginx 后到后端（示例） |
|----------------------|---------------------------|
| `GET /api/jztk/question/random?subject=1&size=10` | `GET http://后端:端口/jztk/question/random?...` |
| `POST /api/jztk/sync` | `POST http://后端:端口/jztk/sync` |

## 本地开发

`npm run dev` 使用 `vite.config.js` 的 `proxy`，把 `/api` 转到本机或远程（见 `.env.local` / `.env.remote`），思路与生产 Nginx 一致。
