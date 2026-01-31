# 电子书转换服务（Node.js + Puppeteer）

EPUB → PDF 转换，使用真实浏览器渲染，支持复杂 CSS、字体与分页。

## 安装与运行

```bash
cd ebook-convert-server
npm install
npm start
```

默认端口 `3001`，可通过环境变量 `PORT` 修改。

## API

- **POST** `/convert/epub2pdf`  
  - 请求：`multipart/form-data`，字段名 `epub`，文件为 `.epub`  
  - 响应：PDF 文件流，`Content-Disposition: attachment`

- **GET** `/health`  
  - 响应：`{ "status": "ok" }`

## 前端配置

前端需配置转换服务地址（如 `http://localhost:3001`），未配置时 EPUB 转 PDF 会提示“请先启动转换服务”。

环境变量示例（Vue CLI / Vite）：

- `VUE_APP_EBOOK_CONVERT_API=http://localhost:3001`  
  或  
- `VITE_EBOOK_CONVERT_API=http://localhost:3001`

## 部署说明

Puppeteer 需在具备 Chromium 的环境中运行，不适合 Vercel 等无头 Serverless。建议部署到：

- 本地开发：`npm start` 后前端指向 `http://localhost:3001`
- VPS / 自建服务器：安装 Node.js 与依赖后运行 `npm start`，并用 Nginx 反向代理或直接暴露端口
