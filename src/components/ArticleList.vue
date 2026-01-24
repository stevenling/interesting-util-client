<template>
  <div class="article-list">
    <TopMenu></TopMenu>
    
    <div class="scrollable-content">
      <div class="list-container">
        <div class="header-section">
          <h1>文章列表</h1>
        </div>
        
        <div class="articles-container">
          <el-card 
            v-for="article in articles" 
            :key="article.id"
            class="article-card"
            shadow="hover"
            @click="goToArticle(article.id)"
          >
            <div class="article-card-content">
              <h3 class="article-title">{{ article.title }}</h3>
              <p class="article-description">{{ article.description }}</p>
              <div class="article-meta">
                <span class="article-date">{{ article.date }}</span>
                <span class="article-author" v-if="article.author">{{ article.author }}</span>
              </div>
            </div>
          </el-card>
          
          <el-empty v-if="articles.length === 0" description="暂无文章"></el-empty>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import TopMenu from './TopMenu.vue';
import { getAllArticles } from '@/config/articles';

const router = useRouter();
const articles = ref([]);

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

onMounted(() => {
  articles.value = getAllArticles();
  document.querySelector('body').setAttribute('style', 'background: #EBEDF0');
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
  margin: 0 0 10px 0;
  font-weight: bold;
}

.header-section p {
  font-size: 1.1rem;
  color: #666;
  margin: 0;
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

.article-date {
  color: #909399;
}

.article-author {
  color: #409eff;
  font-weight: 500;
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