<template>
  <div class="article-list">
    <TopMenu></TopMenu>
    
    <div class="scrollable-content">
      <div class="list-container">
        <div class="header-section">
          <h1>云胡收藏文章集</h1>
          <p>献给七纱，你是唯一的月亮呀～</p>
          <div class="search-section">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索文章..."
              clearable
              class="search-input"
            >
              <template #prefix>
                <el-icon><search /></el-icon>
              </template>
            </el-input>
            <span v-if="searchKeyword" class="search-result-count">
              找到 {{ filteredArticles.length }} 篇文章
            </span>
          </div>
        </div>
        
        <div class="articles-container">
          <el-card 
            v-for="article in filteredArticles" 
            :key="article.id"
            class="article-card"
            shadow="hover"
            @click="goToArticle(article.id)"
          >
            <div class="article-card-content">
              <h3 class="article-title">{{ article.title }}</h3>
              <p class="article-description">{{ article.description }}</p>
              <div class="article-meta">
                <div class="meta-left">
                  <span class="article-date">{{ article.date }}</span>
                  <span class="article-stats" v-if="articleStats[article.id]">
                    <span class="word-count">
                      <el-icon class="stat-icon"><document /></el-icon>
                      <span>{{ articleStats[article.id].wordCount }} 字</span>
                    </span>
                    <span class="reading-time">
                      <el-icon class="stat-icon"><clock /></el-icon>
                      <span>{{ articleStats[article.id].readingTime }} 分钟</span>
                    </span>
                  </span>
                </div>
                <span class="article-author" v-if="article.author">{{ article.author }}</span>
              </div>
            </div>
          </el-card>
          
          <el-empty 
            v-if="filteredArticles.length === 0 && !searchKeyword" 
            description="暂无文章"
          ></el-empty>
          <el-empty 
            v-if="filteredArticles.length === 0 && searchKeyword" 
            description="未找到相关文章"
          >
            <el-button @click="clearSearch" type="primary">清空搜索</el-button>
          </el-empty>
        </div>
        
        <!-- 底部文字 -->
        <div class="footer-text">
          <p>山与山不相见，人和人会重逢。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Search, Document, Clock } from '@element-plus/icons-vue';
import TopMenu from './TopMenu.vue';
import { getAllArticles } from '@/config/articles';

const router = useRouter();
const articles = ref([]);
const searchKeyword = ref('');
const articleStats = ref({}); // 存储文章统计信息

/**
 * 按日期倒序排序的文章列表（最新的在前）
 */
const sortedArticles = computed(() => {
  return [...articles.value].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    // 倒序排序：日期越新越靠前
    return dateB - dateA;
  });
});

/**
 * 过滤后的文章列表
 */
const filteredArticles = computed(() => {
  const articlesToFilter = sortedArticles.value;
  
  if (!searchKeyword.value.trim()) {
    return articlesToFilter;
  }
  
  const keyword = searchKeyword.value.trim().toLowerCase();
  return articlesToFilter.filter(article => 
    article.title.toLowerCase().includes(keyword) ||
    (article.description && article.description.toLowerCase().includes(keyword)) ||
    (article.author && article.author.toLowerCase().includes(keyword))
  );
});

/**
 * 跳转到文章详情页
 */
const goToArticle = (articleId) => {
  router.push({
    path: '/articleDetail',
    query: {
      id: articleId
    }
  });
};

/**
 * 清空搜索
 */
const clearSearch = () => {
  searchKeyword.value = '';
};

/**
 * 计算文章字数（去除Markdown语法和HTML标签）
 */
const calculateWordCount = (content) => {
  if (!content) return 0;
  
  // 移除HTML标签
  let text = content.replace(/<[^>]+>/g, '');
  
  // 移除Markdown语法
  text = text
    .replace(/^#+\s+/gm, '') // 标题
    .replace(/\*\*([^*]+)\*\*/g, '$1') // 粗体
    .replace(/\*([^*]+)\*/g, '$1') // 斜体
    .replace(/\[([^\]]+)\]\([^(]+\)/g, '$1') // 链接
    .replace(/!\[([^\]]*)\]\([^(]+\)/g, '') // 图片
    .replace(/`([^`]+)`/g, '$1') // 行内代码
    .replace(/```[\s\S]*?```/g, '') // 代码块
    .replace(/^\s*[-*+]\s+/gm, '') // 列表
    .replace(/^\s*\d+\.\s+/gm, '') // 有序列表
    .replace(/^>\s+/gm, '') // 引用
    .replace(/---+/g, '') // 分割线
    .replace(/\n+/g, ' ') // 换行符
    .trim();
  
  // 计算中文字符数（中文字符算1个字，其他字符也算1个）
  return text.length;
};

/**
 * 估算阅读时间（按每分钟225字计算）
 */
const estimateReadingTime = (wordCount) => {
  const wordsPerMinute = 225;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return minutes || 1; // 至少1分钟
};

/**
 * 加载文章统计信息
 */
const loadArticleStats = async () => {
  const stats = {};
  
  // 并行加载所有文章内容
  // 动态获取 base URL 以适配 GitHub Pages 的 base path
  const getBaseUrl = () => {
    // 检查当前路径是否包含 GitHub Pages 的 base path
    if (window.location.pathname.startsWith('/interesting-util-client/')) {
      return '/interesting-util-client/';
    }
    return '/';
  };
  const baseUrl = getBaseUrl();
  const promises = articles.value.map(async (article) => {
    try {
      const articlePath = `${baseUrl}articles/${article.file}`;
      const response = await fetch(articlePath);
      if (response.ok) {
        const content = await response.text();
        const wordCount = calculateWordCount(content);
        const readingTime = estimateReadingTime(wordCount);
        stats[article.id] = { wordCount, readingTime };
      }
    } catch (error) {
      console.error(`加载文章 ${article.title} 统计信息失败:`, error);
    }
  });
  
  await Promise.all(promises);
  articleStats.value = stats;
};

onMounted(async () => {
  articles.value = getAllArticles();
  document.querySelector('body').setAttribute('style', 'background: #EBEDF0');
  // 异步加载文章统计信息
  loadArticleStats();
});
</script>

<style scoped>
.article-list {
  width: 100%;
  height: 100vh;
  background: #EBEDF0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.scrollable-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  padding-bottom: 40px;
}

.header-section {
  text-align: center;
  margin-bottom: 40px;
  padding: 30px 0;
}

.header-section h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin: 0 0 30px 0;
  font-weight: bold;
}

.header-section p {
  font-size: 1.1rem;
  color: #666;
  margin: 0;
}

.search-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  max-width: 500px;
  margin: 15px auto 0 auto;
}

.search-input {
  width: 100%;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.search-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.search-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.search-result-count {
  font-size: 0.9rem;
  color: #909399;
  font-weight: 500;
}

.articles-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.article-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  border: none;
  background: white;
}

.article-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.article-card-content {
  padding: 10px;
}

.article-title {
  font-size: 1.3rem;
  color: #2c3e50;
  margin: 0 0 12px 0;
  font-weight: 600;
  line-height: 1.4;
}

.article-description {
  font-size: 0.95rem;
  color: #666;
  margin: 0 0 15px 0;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: #999;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.meta-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.article-date {
  color: #909399;
}

.article-stats {
  display: flex;
  gap: 16px;
  font-size: 0.8rem;
  color: #909399;
}

.word-count,
.reading-time {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.stat-icon {
  font-size: 0.9em;
  color: #909399;
}

.article-author {
  color: #409eff;
  font-weight: 500;
}

.footer-text {
  text-align: center;
  padding: 40px 20px;
  margin-top: 40px;
  border-top: 1px solid #e4e7ed;
}

.footer-text p {
  margin: 0;
  font-size: 16px;
  color: #909399;
  font-style: italic;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-section h1 {
    font-size: 2rem;
  }
  
  .articles-container {
    grid-template-columns: 1fr;
  }
  
  .list-container {
    padding: 10px;
  }
}
</style>
