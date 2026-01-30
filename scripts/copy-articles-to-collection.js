/**
 * 将 public/articles 下的 md 文件复制到 public/云胡选集
 * 用于从「云胡选集」文件夹加载并渲染文章内容
 *
 * 使用：node scripts/copy-articles-to-collection.js
 */
const fs = require('fs');
const path = require('path');

const articlesDir = path.join(__dirname, '../public/articles');
const collectionDir = path.join(__dirname, '../public/云胡选集');

if (!fs.existsSync(articlesDir)) {
  console.error('源目录不存在:', articlesDir);
  process.exit(1);
}

if (!fs.existsSync(collectionDir)) {
  fs.mkdirSync(collectionDir, { recursive: true });
  console.log('已创建目录:', collectionDir);
}

const files = fs.readdirSync(articlesDir).filter((f) => f.endsWith('.md') && f !== 'README.md');
let count = 0;
for (const file of files) {
  const src = path.join(articlesDir, file);
  const dest = path.join(collectionDir, file);
  fs.copyFileSync(src, dest);
  count++;
}
console.log(`已将 ${count} 个 md 文件复制到 云胡选集`);
