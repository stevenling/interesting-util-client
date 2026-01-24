# Vercel 部署指南

## 📋 部署步骤

### 方法一：通过 Vercel 网站（推荐）

1. **访问 Vercel**
   - 打开 [vercel.com](https://vercel.com)
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "Add New Project"
   - 选择你的 GitHub 仓库 `interesting-util-client`
   - Vercel 会自动检测到这是一个 Vue 项目

3. **配置项目**（通常自动配置，无需修改）
   - Framework Preset: Vue.js
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **部署**
   - 点击 "Deploy"
   - 等待构建完成（约 1-2 分钟）
   - 部署成功后，你会得到一个 `xxx.vercel.app` 的网址

### 方法二：通过 Vercel CLI

1. **安装 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署**
   ```bash
   vercel
   ```

4. **生产环境部署**
   ```bash
   vercel --prod
   ```

## 🔧 环境变量配置

如果需要配置环境变量（比如 API 密钥等）：

1. 在 Vercel 项目设置中
2. 进入 "Environment Variables"
3. 添加需要的变量

## 📁 项目结构说明

```
project/
├── api/              # Serverless Functions（Node.js 后端）
│   ├── hello.js     # 示例 API
│   └── articles.js  # 文章相关 API
├── src/             # Vue 前端代码
├── public/           # 静态资源
├── vercel.json      # Vercel 配置文件
└── package.json
```

## 🚀 API 使用示例

部署后，你可以通过以下方式调用 API：

```javascript
// 调用示例 API
fetch('/api/hello')
  .then(res => res.json())
  .then(data => console.log(data));

// 调用文章 API
fetch('/api/articles')
  .then(res => res.json())
  .then(data => console.log(data));
```

## ⚙️ 配置说明

### vercel.json 配置

- `buildCommand`: 构建命令
- `outputDirectory`: 输出目录
- `rewrites`: 路由重写规则（支持 Vue Router 的 history 模式）
- `headers`: 静态资源缓存配置

## 🔄 自动部署

连接 GitHub 后，每次推送代码到主分支，Vercel 会自动：
1. 检测代码变更
2. 运行构建命令
3. 自动部署新版本

## 💡 提示

- Vercel 会自动处理 Vue Router 的路由
- API 路由在 `/api/*` 下自动可用
- 支持自定义域名（在项目设置中配置）
- 免费版有使用限制，但对个人项目通常足够

## 🆚 GitHub Pages vs Vercel

| 特性 | GitHub Pages | Vercel |
|------|--------------|--------|
| 静态网站 | ✅ | ✅ |
| Node.js API | ❌ | ✅ |
| 自动部署 | ✅ | ✅ |
| 自定义域名 | ✅ | ✅ |
| 性能 | 一般 | 更快（全球 CDN） |

## 📝 注意事项

1. **路径配置**: Vercel 部署时，`publicPath` 会自动处理，无需子路径
2. **API 限制**: 免费版有调用次数限制，但通常足够使用
3. **构建时间**: 每次部署会重新构建，通常 1-2 分钟

## 🎯 下一步

部署成功后，你可以：
- 在代码中使用 `/api/*` 调用后端 API
- 添加更多 Serverless Functions
- 配置自定义域名
- 设置环境变量
