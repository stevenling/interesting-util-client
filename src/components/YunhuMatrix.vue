<template>
  <TopMenu></TopMenu>
  
  <div class="matrix-container">
    <div class="hero-section">
      <div class="title">云胡矩阵</div>
      <div class="subtitle">Welcome to the Matrix</div>
    </div>

    <div class="content-container">
      <el-row :gutter="24">
        <el-col :span="6"></el-col>
        <el-col :span="12">
          <el-card class="matrix-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <i class="el-icon-connection"></i>
                <span>矩阵入口</span>
              </div>
            </template>
            <div class="button-grid">
              <el-button 
                type="primary" 
                @click="openLink('https://stevenling.github.io/yunhu-love-essay-doc/')"
                class="matrix-button"
                size="large"
              >
                <i class="el-icon-link"></i>
                云胡的收藏
              </el-button>

              <el-button 
                type="success" 
                @click="openLink('https://stevenling.github.io/yunhu-blog/')"
                class="matrix-button"
                size="large"
              >
                <i class="el-icon-document"></i>
                博客
              </el-button>

              <el-button 
                type="warning" 
                @click="openLink('https://twitter.com/yunhu')"
                class="matrix-button"
                size="large"
              >
                <i class="el-icon-chat-dot-round"></i>
                Twitter
              </el-button>

              <el-button 
                type="info" 
                @click="openLink('https://linkedin.com/in/yunhu')"
                class="matrix-button"
                size="large"
              >
                <i class="el-icon-user"></i>
                LinkedIn
              </el-button>

              <el-button 
                type="danger" 
                @click="openLink('https://youtube.com/@yunhu')"
                class="matrix-button"
                size="large"
              >
                <i class="el-icon-video-play"></i>
                YouTube
              </el-button>

              <el-button 
                type="primary" 
                @click="openLink('https://bilibili.com/space/yunhu')"
                class="matrix-button"
                size="large"
              >
                <i class="el-icon-video-camera"></i>
                Bilibili
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>

  <footer class="footer">
    <div class="footer-content">
      <a href="https://beian.miit.gov.cn/" target="_blank" class="icp-link">
        闽ICP备2023011581号
      </a>
    </div>
  </footer>
</template>

<script setup>
import { ElMessage } from "element-plus";
import TopMenu from "./TopMenu.vue";

/**
 * 打开外部链接
 * @param {string} url - 要打开的链接
 */
function openLink(url) {
  try {
    window.open(url, '_blank');
    ElMessage.success('正在打开链接...');
  } catch (error) {
    ElMessage.error('打开链接失败');
  }
}
</script>

<style scoped>
/* 主容器样式 - 与UtilIndex保持一致 */
.matrix-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px 0;
}

/* 英雄区域样式 - 与UtilIndex保持一致 */
.hero-section {
  text-align: center;
  padding: 60px 20px 40px;
  color: white;
}

.title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  font-family: 'Monotype Corsiva', cursive;
}

.subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  font-weight: 300;
}

/* 内容容器样式 */
.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 矩阵卡片样式 - 与UtilIndex工具卡片保持一致 */
.matrix-card {
  margin-bottom: 30px;
  border-radius: 16px;
  border: none;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.matrix-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

/* 卡片头部样式 - 与UtilIndex保持一致 */
.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
}

.card-header i {
  font-size: 1.4rem;
  color: #667eea;
}

/* 按钮网格样式 */
.button-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  padding: 10px 0;
}

/* 矩阵按钮样式 - 与UtilIndex工具按钮保持一致 */
.matrix-button {
  flex: 0 1 auto;
  min-width: 160px;
  height: 50px;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.matrix-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}

.matrix-button i {
  font-size: 1.2rem;
}

/* 页脚样式 - 与UtilIndex保持一致 */
.footer {
  background: rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
  padding: 20px 0;
  margin-top: 40px;
}

.footer-content {
  text-align: center;
}

.icp-link {
  color: rgba(255,255,255,0.8);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.icp-link:hover {
  color: white;
  text-decoration: underline;
}

/* 响应式设计 - 与UtilIndex保持一致 */
@media (max-width: 768px) {
  .title {
    font-size: 2rem;
  }
  
  .subtitle {
    font-size: 1rem;
  }
  
  .button-grid {
    flex-direction: column;
  }
  
  .matrix-button {
    min-width: 100%;
  }
  
  .content-container {
    padding: 0 15px;
  }
}

/* 动画效果 - 与UtilIndex保持一致 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.matrix-card {
  animation: fadeInUp 0.6s ease-out;
}
</style> 