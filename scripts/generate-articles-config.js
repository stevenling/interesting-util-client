const fs = require('fs');
const path = require('path');

/**
 * 生成文章配置文件
 * 自动扫描 public/articles 目录下的 md 文件，生成配置
 */

const articlesDir = path.join(__dirname, '../public/articles');
const configFile = path.join(__dirname, '../src/config/articles.js');

/**
 * 从文件名解析标题和作者
 * 支持格式：
 * - 刘勃《商鞅黑洞》.md -> { title: '商鞅黑洞', author: '刘勃' }
 * - 期末考试.md -> { title: '期末考试', author: null }
 */
function parseFileName(filename) {
  const nameWithoutExt = filename.replace(/\.md$/, '');
  
  // 匹配格式：作者《标题》
  const match = nameWithoutExt.match(/^(.+?)《(.+?)》$/);
  if (match) {
    return {
      title: match[2],
      author: match[1]
    };
  }
  
  // 如果没有作者信息，文件名就是标题
  return {
    title: nameWithoutExt,
    author: null
  };
}

/**
 * 从文件内容提取描述
 * 读取前几行，提取第一段有意义的内容作为描述
 */
function extractDescription(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    
    // 跳过标题行（以#开头的）
    let startIndex = 0;
    while (startIndex < lines.length && lines[startIndex].trim().startsWith('#')) {
      startIndex++;
    }
    
    // 获取前3-5行非空内容
    const descriptionLines = lines.slice(startIndex, startIndex + 5)
      .map(line => {
        // 移除HTML标签和Markdown格式
        return line
          .replace(/<[^>]+>/g, '') // 移除HTML标签
          .replace(/[#*_`\[\]()]/g, '') // 移除Markdown符号
          .trim();
      })
      .filter(line => line.length > 10) // 过滤太短的行
      .slice(0, 2); // 只取前2行
    
    if (descriptionLines.length > 0) {
      // 合并为描述，最多100个字符
      let description = descriptionLines.join(' ').trim();
      if (description.length > 100) {
        description = description.substring(0, 97) + '...';
      }
      return description;
    }
    
    return '暂无描述';
  } catch (error) {
    console.error(`读取文件 ${filePath} 失败:`, error);
    return '暂无描述';
  }
}

/**
 * 生成文章ID（基于文件名）
 * 使用 article + 序号的方式，更规范
 */
function generateId(index) {
  return `article${index + 1}`;
}

/**
 * 获取文件的修改时间作为日期
 */
function getFileDate(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const date = new Date(stats.mtime);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD格式
  } catch (error) {
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * 主函数：生成配置文件
 */
function generateConfig() {
  console.log('开始扫描文章文件...');
  
  // 读取 articles 目录
  const files = fs.readdirSync(articlesDir)
    .filter(file => file.endsWith('.md') && file !== 'README.md');
  
  console.log(`找到 ${files.length} 个文章文件`);
  
  // 生成文章配置
  const articles = files.map((filename, index) => {
    const filePath = path.join(articlesDir, filename);
    const { title, author } = parseFileName(filename);
    const description = extractDescription(filePath);
    const date = getFileDate(filePath);
    const id = generateId(index);
    
    console.log(`处理: ${filename} -> ${title}${author ? ` (${author})` : ''}`);
    
    return {
      id,
      title,
      description,
      date,
      ...(author && { author }),
      file: filename
    };
  });
  
  // 按日期倒序排序（最新的在前）
  articles.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // 生成配置文件内容
  const configContent = `/**
 * 文章配置文件
 * 此文件由 scripts/generate-articles-config.js 自动生成
 * 请勿手动修改，如需更新请运行: node scripts/generate-articles-config.js
 */
export const articles = [
${articles.map(article => {
  const lines = [
    `  {`,
    `    id: '${article.id}',`,
    `    title: '${article.title}',`,
    `    description: '${article.description}',`,
    `    date: '${article.date}',`,
    ...(article.author ? [`    author: '${article.author}',`] : []),
    `    file: '${article.file}'`,
    `  }`
  ];
  return lines.join('\n');
}).join(',\n')}
];

/**
 * 根据ID获取文章配置
 */
export const getArticleById = (id) => {
  return articles.find(article => article.id === id);
};

/**
 * 获取所有文章列表
 */
export const getAllArticles = () => {
  return articles;
};
`;
  
  // 写入配置文件
  fs.writeFileSync(configFile, configContent, 'utf-8');
  console.log(`\n配置文件已生成: ${configFile}`);
  console.log(`共生成 ${articles.length} 篇文章配置`);
}

// 运行脚本
try {
  generateConfig();
} catch (error) {
  console.error('生成配置文件失败:', error);
  process.exit(1);
}