<template>
  <div class="util-index-page">
    <TopMenu />
    <div class="main-container">
      <div class="hero-section">
        <div class="title">云胡个人站</div>
        <div class="subtitle">小砂糖，你是我漫山遍野的喜欢～</div>
      </div>
      <div class="content-container">
        <el-row :gutter="[24, 24]">
          <el-col :xs="0" :sm="0" :md="6" :lg="6"></el-col>
          <el-col :xs="24" :sm="24" :md="12" :lg="12">
            <!-- 云胡矩阵卡片 -->
            <el-card class="tool-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <i class="el-icon-connection"></i>
                  <span>云胡</span>
                </div>
              </template>
              <div class="button-group">
                <el-button 
                  type="primary" 
                  @click="gotoYunhuMatrix"
                  class="tool-button"
                  size="large"
                >
                  <i class="el-icon-grid"></i>
                  云胡矩阵
                </el-button>

                <el-button 
                  type="primary" 
                  @click="gotoMarkdownReader"
                  class="tool-button"
                  size="large"
                >
                  <i class="el-icon-reading"></i>
                  阅读
                </el-button>
              </div>
            </el-card>
            <!-- 程序员工具卡片 -->
            <el-card class="tool-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <i class="el-icon-code"></i>
                  <span>程序员工具</span>
                </div>
              </template>
              <div class="button-group">
                <el-button 
                  type="primary" 
                  @click="gotoJsonFormat"
                  class="tool-button"
                  size="large"
                >
                  <i class="el-icon-document"></i>
                  Json 代码美化
                </el-button>
                <el-button 
                  type="primary" 
                  @click="gotoColorConvert"
                  class="tool-button"
                  size="large"
                >
                  <i class="el-icon-palette"></i>
                  颜色进制转换
                </el-button>
              </div>
            </el-card>
            <!-- 实用工具卡片 -->
            <el-card class="tool-card tool-card--last" shadow="hover">
              <template #header>
                <div class="card-header">
                  <i class="el-icon-magic-stick"></i>
                  <span>实用工具</span>
                </div>
              </template>
              <div class="button-group">
                <el-button 
                  type="primary" 
                  @click="gotoFontToImage"
                  class="tool-button"
                  size="large"
                >
                  <i class="el-icon-picture"></i>
                  生成摘录卡片
                </el-button>
                <el-button 
                  type="primary" 
                  @click="gotoEpubReader"
                  class="tool-button"
                  size="large"
                >
                  <i class="el-icon-reading"></i>
                  EPUB 阅读器
                </el-button>
                <el-button 
                  type="primary" 
                  @click="gotoArticleList"
                  class="tool-button"
                  size="large"
                >
                  <i class="el-icon-document"></i>
                  文章列表
                </el-button>
                <el-button 
                  type="primary" 
                  @click="gotoEbookConvert"
                  class="tool-button"
                  size="large"
                >
                  <i class="el-icon-refresh"></i>
                  电子书格式转换
                </el-button>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="0" :sm="0" :md="6" :lg="6"></el-col>
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
  </div>
</template>

<script setup>
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import TopMenu from "./TopMenu.vue";

const router = useRouter();

/**
 * 转到BMI计算页面
 * 目前功能正在开发中
 */
const gotoCalcBmi = () => {
  ElMessage.error("云胡哥哥正在开发中!");
};

/**
 * 转到天干地支纪年计算页面
 */
const gotoCalcHeavenlyStemsAndEarthlyBranches = () => {
  router.push({
    path: "/heavenlyStemsAndEarthlyBranches",
  });
};

/**
 * 转到字体转图片页面
 */
const gotoFontToImage = () => {
  router.push({
    path: "/gotoFontToImage",
  });
};

/**
 * 转到云胡矩阵页面
 */
const gotoYunhuMatrix = () => {
  router.push({
    path: "/",
  });
};

/**
 * 转到EPUB阅读器页面
 */
const gotoEpubReader = () => {
  router.push({
    path: "/epubReader",
  });
};

/**
 * 转到Json格式化页面
 */
const gotoJsonFormat = () => {
  router.push({
    path: "/JsonFormat",
  });
};

/**
 * 转到颜色进制转换页面
 */
const gotoColorConvert = () => {
  router.push({
    path: "/ColorConvert",
  });
};

/**
 * 转到Markdown阅读器页面
 */
const gotoMarkdownReader = () => {
  router.push({
    path: "/markdownReader",
  });
};

/**
 * 转到文章列表页面
 */
const gotoArticleList = () => {
  router.push({
    path: "/articleList",
  });
};

/**
 * 转到电子书格式转换页面
 */
const gotoEbookConvert = () => {
  router.push({
    path: "/ebookConvert",
  });
};
</script>

<style scoped>
.util-index-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 主容器样式 */
.main-container {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px 0;
  padding-bottom: 24px;
}

/* 英雄区域样式 */
.hero-section {
  text-align: center;
  padding: 30px 20px 20px;
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
  padding-bottom: 24px;
}

/* 工具卡片样式 */
.tool-card {
  margin-bottom: 30px;
  margin-left: 0;
  margin-right: 0;
  border-radius: 16px;
  border: none;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  width: 100%;
  box-sizing: border-box;
}

.tool-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

.tool-card:last-child,
.tool-card--last {
  margin-bottom: 48px;
}

/* 卡片头部样式 */
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

/* 按钮组样式 */
.button-group {
  display: flex !important;
  flex-wrap: wrap;
  justify-content: flex-start !important;
  align-content: flex-start !important;
  align-items: flex-start;
  gap: 15px;
  padding: 10px 0;
  width: 100% !important;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  direction: ltr;
  margin: 0;
}

.tool-card :deep(.el-card__body) {
  display: block;
  text-align: left;
  width: 100%;
}

.tool-card :deep(.el-card__body > *) {
  margin-left: 0 !important;
  margin-right: auto !important;
}

/* 工具按钮样式 */
.tool-button {
  flex: 0 0 auto;
  min-width: 160px;
  margin-left: 0;
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

.tool-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}

.tool-button i {
  font-size: 1.2rem;
}

/* 页脚样式 */
.footer {
  background: rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
  padding: 20px 0;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .main-container {
    padding: 10px 0;
    overflow-y: auto;
  }
  
  .hero-section {
    padding: 20px 15px 15px;
  }
  
  .title {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  
  .subtitle {
    font-size: 0.9rem;
  }
  
  .content-container {
    padding: 0 10px;
  }
  
  .tool-card {
    margin-bottom: 20px;
    border-radius: 12px;
  }
  
  .tool-card:last-child,
  .tool-card--last {
    margin-bottom: 40px;
  }
  
  .card-header {
    font-size: 1rem;
  }
  
  .card-header i {
    font-size: 1.2rem;
  }
  
  .button-group {
    flex-direction: column;
    gap: 10px;
  }
  
  .tool-button {
    min-width: 100%;
    height: 45px;
    font-size: 0.95rem;
  }
  
  .tool-button i {
    font-size: 1rem;
  }
  
  .footer {
    padding: 15px 0;
  }
  
  .icp-link {
    font-size: 0.85rem;
  }
}

/* 小屏手机优化 */
@media (max-width: 480px) {
  .hero-section {
    padding: 15px 10px 10px;
  }
  
  .title {
    font-size: 1.5rem;
  }
  
  .subtitle {
    font-size: 0.85rem;
  }
  
  .content-container {
    padding: 0 8px;
  }
  
  .tool-card {
    margin-bottom: 15px;
    border-radius: 10px;
  }
  
  .card-header {
    font-size: 0.95rem;
    gap: 8px;
  }
  
  .button-group {
    gap: 8px;
    padding: 8px 0;
  }
  
  .tool-button {
    height: 42px;
    font-size: 0.9rem;
    border-radius: 10px;
  }
}

/* 动画效果 */
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

.tool-card {
  animation: fadeInUp 0.6s ease-out;
}

.tool-card:nth-child(2) {
  animation-delay: 0.2s;
}
</style>
