# Vercel 部署问题排查

## 🔍 页面空白问题排查

### 1. 检查构建日志

在 Vercel 项目页面：
1. 点击 "Deployments"
2. 选择最新的部署
3. 查看 "Build Logs"
4. 检查是否有错误

### 2. 检查路径配置

✅ **已修复**：`vue.config.js` 已更新，Vercel 会自动使用根路径 `/`

### 3. 检查构建输出

确保 `dist` 目录包含：
- `index.html`
- `assets/` 文件夹
- 其他静态文件

### 4. 常见问题

#### 问题 A：静态资源 404
**解决**：已通过 `vue.config.js` 修复路径问题

#### 问题 B：路由不工作
**解决**：`vercel.json` 已配置路由重写规则

#### 问题 C：API 不工作
**检查**：
- 确保 `api/` 目录在项目根目录
- 访问 `/api/hello` 测试

## 🔄 重新部署

修改配置后，需要重新部署：

### 方法一：自动部署（推荐）
1. 提交代码到 GitHub
2. Vercel 会自动检测并重新部署

### 方法二：手动触发
1. 在 Vercel 项目页面
2. 点击 "Redeploy"
3. 选择最新的 commit

## ✅ 检查清单

部署后检查：

- [ ] 构建成功（无错误）
- [ ] 可以访问首页
- [ ] 静态资源加载正常（CSS、JS）
- [ ] 路由跳转正常
- [ ] API 可以访问（`/api/hello`）

## 🐛 调试步骤

1. **查看浏览器控制台**
   - 按 F12 打开开发者工具
   - 查看 Console 是否有错误
   - 查看 Network 标签，检查资源加载

2. **检查 Vercel 日志**
   - 项目页面 → Functions → 查看日志

3. **测试 API**
   - 访问 `https://your-project.vercel.app/api/hello`
   - 应该返回 JSON 数据

## 📝 关于 GitHub Actions

**不需要 GitHub Actions！**

Vercel 会自动：
- 监听 GitHub 推送
- 自动构建
- 自动部署

GitHub Actions 是用于 GitHub Pages 的，Vercel 有自己的部署系统。

## 🚀 快速修复

如果页面还是空白：

1. **提交当前修改**
   ```bash
   git add .
   git commit -m "fix: 修复 Vercel 部署路径问题"
   git push
   ```

2. **等待 Vercel 自动重新部署**（约 1-2 分钟）

3. **清除浏览器缓存后重新访问**

## 💡 提示

- Vercel 部署后会自动生成预览 URL
- 可以查看部署日志了解详情
- 支持回滚到之前的版本
