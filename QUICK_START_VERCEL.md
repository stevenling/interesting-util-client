# 🚀 Vercel 快速部署指南

## 5 分钟快速部署

### 第一步：准备代码
✅ 已完成！项目已配置好 Vercel 支持

### 第二步：部署到 Vercel

#### 方式 A：通过网站（最简单）

1. 访问 https://vercel.com
2. 点击 "Sign Up" 使用 GitHub 登录
3. 点击 "Add New Project"
4. 选择你的仓库 `interesting-util-client`
5. 点击 "Deploy"（配置已自动检测，无需修改）
6. 等待 1-2 分钟，部署完成！

#### 方式 B：通过命令行

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录
vercel login

# 3. 在项目目录下部署
cd /Users/yunhu/git/interesting-util-client
vercel

# 4. 生产环境部署
vercel --prod
```

### 第三步：测试 API

部署完成后，访问：
- 网站：`https://your-project.vercel.app`
- API 测试：`https://your-project.vercel.app/api/hello`

## 📁 已创建的文件

- ✅ `vercel.json` - Vercel 配置文件
- ✅ `api/hello.js` - 示例 API
- ✅ `api/articles.js` - 文章 API 示例
- ✅ `api/README.md` - API 使用文档

## 🎯 下一步

1. **部署项目**（按照上面的步骤）
2. **测试 API**（访问 `/api/hello`）
3. **在前端使用 API**（参考 `api/README.md`）

## 💡 提示

- 每次推送到 GitHub，Vercel 会自动重新部署
- API 路由在 `/api/*` 下自动可用
- 支持自定义域名（在 Vercel 项目设置中配置）

## ❓ 常见问题

**Q: 部署后 API 不工作？**
A: 确保 `api/` 目录在项目根目录，函数导出 `default`

**Q: 如何查看日志？**
A: 在 Vercel 项目页面点击 "Functions" 标签查看

**Q: 如何添加环境变量？**
A: 在 Vercel 项目设置 → Environment Variables 中添加

## 📚 更多资源

- [Vercel 文档](https://vercel.com/docs)
- [Serverless Functions 文档](https://vercel.com/docs/functions)
- 查看 `VERCEL_DEPLOY.md` 获取详细说明
