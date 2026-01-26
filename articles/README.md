# 文章目录说明

这个目录用于存放文章的 Markdown 文件。

## 如何添加新文章

1. 将你的 Markdown 文件（.md 格式）放在这个目录下
2. 在 `src/config/articles.js` 文件中添加文章配置：

```javascript
{
  id: 'article3',           // 唯一ID
  title: '文章标题',        // 文章标题
  description: '文章描述',   // 文章描述（显示在列表页）
  date: '2024-01-03',       // 发布日期
  author: '作者名',          // 作者（可选）
  file: 'article3.md'       // 文件名（必须与public/articles目录下的文件名一致）
}
```

3. 保存后刷新页面即可看到新文章

## 注意事项

- 文件名必须与配置文件中的 `file` 字段一致
- 文章 ID 必须唯一
- 支持标准 Markdown 语法
- 文章详情页支持导出 PDF 功能