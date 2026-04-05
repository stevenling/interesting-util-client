# 云胡工具集 (interesting-util-client)

> 一个简洁实用的在线工具集合，为你解决日常开发和生活小需求

**🌐 在线体验：** [https://stevenling.github.io/interesting-util-client/](https://stevenling.github.io/interesting-util-client/)

---

## 📦 工具列表

### 🛠️ 开发工具

| 工具名称 | 说明 | 文档 |
|---------|------|------|
| **JSON 格式化** | JSON 美化、验证、下载、复制，支持语法高亮 | [查看文档](docs/JsonFormat.md) |
| **颜色进制转换** | RGB/HEX 双向转换，支持多种 RGB 格式识别，带取色器 | [查看文档](docs/ColorConvert.md) |
| **文本格式化** | 文本大小写转换、去除空行、压缩空格等 | - |
| **Markdown 阅读器** | 实时预览 Markdown 内容 | - |

### 📱 生活工具

| 工具名称 | 说明 | 文档 |
|---------|------|------|
| **摘录卡片生成** | 将文字转为精美卡片图片，支持多种背景和字体 | [查看文档](docs/fontToImage.md) |
| **天干地支查询** | 阳历转农历，查询天干地支纪年 | [查看文档](docs/HeavenlyStemsAndEarthlyBranches.md) |
| **距离节假日倒计时** | 计算距离下一个节假日还有多少天 | - |

### 📚 阅读工具

| 工具名称 | 说明 | 文档 |
|---------|------|------|
| **EPUB 在线阅读** | 在线读取 EPUB 电子书，支持目录跳转 | [查看文档](docs/EpubReader.md) |
| **电子书转换** | EPUB 格式转换工具 | - |

### 📖 文章系统

- **云胡随笔**：个人文章阅读系统
- **文章列表/详情**：支持 Markdown 文章展示

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 `http://localhost:5173` 预览

### 构建生产版本

```bash
npm run build
```

构建产物在 `dist/` 目录

### 预览生产构建

```bash
npm run preview
```

---

## 📁 项目结构

```
interesting-util-client/
├── src/
│   ├── components/          # 工具组件
│   │   ├── JsonFormat.vue          # JSON 格式化
│   │   ├── ColorConvert.vue        # 颜色转换
│   │   ├── fontToImage.vue         # 摘录卡片
│   │   ├── EpubReader.vue          # EPUB 阅读器
│   │   ├── HeavenlyStemsAndEarthlyBranches.vue  # 天干地支
│   │   ├── BetweenNowToHoliday.vue # 节假日倒计时
│   │   ├── TextFormat.vue          # 文本格式化
│   │   ├── MarkdownReader.vue      # Markdown 阅读
│   │   └── ...
│   ├── router/              # 路由配置
│   ├── config/              # 配置文件
│   ├── assets/              # 静态资源
│   ├── App.vue              # 根组件
│   └── main.js              # 入口文件
├── docs/                    # 工具文档
├── scripts/                 # 脚本工具
├── public/                  # 公共资源
├── api/                     # API 服务
└── ebook-convert-server/   # 电子书转换服务
```

---

## 🧪 测试

```bash
# 运行单元测试
npm run test:unit

# 代码检查
npm run lint

# Markdown 文档检查
npm run lint:md
```

---

## 📦 部署

### GitHub Pages（自动部署）

项目已配置 GitHub Actions，推送到 `main` 分支后自动部署到 GitHub Pages。

### Vercel 部署

1. 在 Vercel 导入项目
2. 构建配置：
   - Build Command: `npm run build`
   - Output Directory: `dist`

详细部署文档：[VERCEL_DEPLOY.md](VERCEL_DEPLOY.md)

### 手动部署到服务器

```bash
npm run push
```

会自动构建并 scp 到配置的服务器

### 驾考刷题王（接口 + Spring Boot 落库）

1. 复制 `.env.example` 为 `.env.local`，配置：
   - **`VITE_JZTK_API_URL`**：拉题基址。生产若用 **Nginx 反代**，写 **`/api`**（与站点同源），代码会拼 `/jztk/question/random`；开发直连可写完整 `http(s)://...`。**部署与 Nginx 示例见 [`docs/JZTK_NGINX.md`](docs/JZTK_NGINX.md)**。
   - **`VITE_JZTK_SYNC_URL`**（可选）：拉题成功后 `POST` 完整 JSON 落库；同源反代时写 **`/api/jztk/sync`**（或你后端实际路径）。
2. 工具入口：**Nyx Tools → 驾考刷题王**：主页选科目 **`/jztk`**，刷题 **`/jztk/practice?subject=1|4`**（前端请求会带对应 `subject` 查询参数）。错题练习：`/jztk/practice?subject=1&mode=wrong`。答对/答错统计、错题本、收藏存 **localStorage**（按科目分 key）。
3. 后端约定见：`docs/JZTK_SPRING_BOOT.md`；**Nginx 同源反代见：`docs/JZTK_NGINX.md`**

---

## 🎨 技术栈

- **框架：** Vue 3.5 + Vite 6
- **UI 库：** Element Plus
- **路由：** Vue Router 4
- **代码高亮：** Highlight.js
- **PDF 处理：** pdfjs-dist
- **电子书：** epubjs
- **图片生成：** html2canvas + jspdf
- **压缩处理：** jszip
- **日期处理：** dayjs / moment
- **视频播放：** DPlayer
- **Markdown：** marked
- **测试：** Jest + Vue Test Utils
- **代码质量：** ESLint + Prettier + Husky + lint-staged

---

## 📝 NPM 脚本说明

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本（自动生成 404.html 和 .nojekyll） |
| `npm run preview` | 预览生产构建 |
| `npm run test:unit` | 运行单元测试 |
| `npm run lint` | ESLint 代码检查 |
| `npm run lint:md` | Markdown 文档检查 |
| `npm run push` | 构建并部署到服务器 |
| `npm run gen` | 生成文章配置 |
| `npm run gen:yunhu-essay` | 生成云胡随笔配置 |
| `npm run copy-collection` | 复制文章到合集 |

---

## 📄 许可证

MIT License

---

## 🙋 反馈与建议

如有问题或建议，欢迎提 Issue 或联系开发者。

**开发者：** 云胡 (Steven)  
**GitHub：** [stevenling](https://github.com/stevenling)

---

_✨ 持续更新中，更多实用工具敬请期待..._
