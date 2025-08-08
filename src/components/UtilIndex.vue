<template>
  <div class="util-index-page">
    <TopMenu />
    <div class="main-container">
      <div class="hero-section">
        <div class="title">云胡个人站</div>
        <div class="subtitle">I'm not bitter anymore. I'm syrupy sweet</div>
      </div>
      <div class="content-container">
        <el-row :gutter="24">
          <el-col :span="6"></el-col>
          <el-col :span="12">
            <!-- 云胡矩阵卡片 -->
            <el-card class="tool-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <i class="el-icon-connection"></i>
                  <span>云胡矩阵</span>
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
                  进入矩阵
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
            <el-card class="tool-card" shadow="hover">
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
              </div>
            </el-card>
          </el-col>
          <el-col :span="6"></el-col>
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
    path: "/yunhuMatrix",
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
</script>

<style scoped>
.util-index-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 主容器样式 */
.main-container {
  flex: 1;
  overflow-y: auto;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px 0;
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
}

/* 工具卡片样式 */
.tool-card {
  margin-bottom: 30px;
  border-radius: 16px;
  border: none;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.tool-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

.tool-card:last-child {
  margin-bottom: 50px;
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
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  padding: 10px 0;
}

/* 工具按钮样式 */
.tool-button {
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
  .title {
    font-size: 2rem;
  }
  
  .subtitle {
    font-size: 1rem;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .tool-button {
    min-width: 100%;
  }
  
  .content-container {
    padding: 0 15px;
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
