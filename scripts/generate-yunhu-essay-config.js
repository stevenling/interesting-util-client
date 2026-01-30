/**
 * 生成云胡选集配置文件
 * 自动扫描 public/yunhu-essay 目录下的 md 文件，生成配置
 *
 * 使用：node scripts/generate-yunhu-essay-config.js
 * 或：npm run gen:yunhu-essay
 */
const fs = require('fs');
const path = require('path');

const essayDir = path.join(__dirname, '../public/yunhu-essay');
const configFile = path.join(__dirname, '../src/config/yunhu-essay.js');

function parseFileName(filename) {
  const nameWithoutExt = filename.replace(/\.md$/, '');
  const match = nameWithoutExt.match(/^(.+?)《(.+?)》$/);
  if (match) {
    return { title: match[2], author: match[1] };
  }
  return { title: nameWithoutExt, author: null };
}

function extractDescription(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    let startIndex = 0;
    while (startIndex < lines.length && lines[startIndex].trim().startsWith('#')) {
      startIndex++;
    }
    const descriptionLines = lines.slice(startIndex, startIndex + 5)
      .map(line => line.replace(/<[^>]+>/g, '').replace(/[#*_`\[\]()]/g, '').trim())
      .filter(line => line.length > 10)
      .slice(0, 2);
    if (descriptionLines.length > 0) {
      let description = descriptionLines.join(' ').trim();
      if (description.length > 100) description = description.substring(0, 97) + '...';
      return description;
    }
  } catch (e) {
    console.error(`读取文件 ${filePath} 失败:`, e);
  }
  return '暂无描述';
}

function getFileDate(filePath) {
  try {
    return new Date(fs.statSync(filePath).mtime).toISOString().split('T')[0];
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
}

function generateConfig() {
  if (!fs.existsSync(essayDir)) {
    fs.mkdirSync(essayDir, { recursive: true });
    console.log('已创建目录:', essayDir);
  }
  const files = fs.readdirSync(essayDir)
    .filter(file => file.endsWith('.md') && file !== 'README.md');
  console.log(`yunhu-essay 找到 ${files.length} 个文章文件`);

  const list = files.map((filename, index) => {
    const filePath = path.join(essayDir, filename);
    const { title, author } = parseFileName(filename);
    return {
      id: `yunhuEssay${index + 1}`,
      title,
      description: extractDescription(filePath),
      date: getFileDate(filePath),
      ...(author && { author }),
      file: filename
    };
  });
  list.sort((a, b) => new Date(b.date) - new Date(a.date));

  const configContent = `/**
 * 云胡选集配置文件（来自 public/yunhu-essay）
 * 由 scripts/generate-yunhu-essay-config.js 生成
 * 更新请运行: node scripts/generate-yunhu-essay-config.js
 */
export const yunhuEssayArticles = [
${list.map(article => {
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

export const getYunhuEssayArticleById = (id) => {
  return yunhuEssayArticles.find(article => article.id === id);
};

export const getAllYunhuEssayArticles = () => {
  return yunhuEssayArticles;
};
`;
  fs.writeFileSync(configFile, configContent, 'utf-8');
  console.log(`已生成: ${configFile}，共 ${list.length} 篇`);
}

try {
  generateConfig();
} catch (error) {
  console.error('生成云胡选集配置失败:', error);
  process.exit(1);
}
