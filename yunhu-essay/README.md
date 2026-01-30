# 云胡选集

此文件夹存放文章内容的 Markdown 文件（.md）。

- 文章列表配置由 `src/config/articles.js` 定义（可由 `npm run gen` 从 `public/articles` 生成）。
- 详情页会优先从此文件夹加载对应文件名的 md 并渲染；若不存在则回退到 `public/articles`。

可将 `public/articles` 下的 md 文件复制到此目录，或通过脚本同步。
