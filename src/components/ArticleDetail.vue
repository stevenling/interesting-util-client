<template>
  <div class="article-detail">
    <TopMenu></TopMenu>
    
    <div class="detail-container">
      <div v-if="loading" class="loading-section">
        <el-skeleton :rows="10" animated />
      </div>
      
      <div v-else-if="error" class="error-section">
        <el-result
          icon="error"
          title="文章加载失败"
          :sub-title="error"
        >
          <template #extra>
            <el-button type="primary" @click="goBack">返回</el-button>
          </template>
        </el-result>
      </div>
      
      <div v-else-if="articleContent" class="article-section">
        <div class="toolbar">
          <el-button @click="goBack" type="primary" :icon="ArrowLeft" circle plain title="返回"></el-button>
          <el-popover
            placement="bottom-start"
            :width="320"
            trigger="click"
            title="设置"
          >
            <template #reference>
              <el-button type="primary" :icon="Setting" circle plain title="设置"></el-button>
            </template>
            <div class="settings-panel">
              <!-- 字体大小设置 -->
              <div class="setting-section">
                <div class="section-title">字体大小</div>
                <div class="font-size-controls">
                  <el-button @click="decreaseFontSize" type="default" :icon="Minus" circle size="small"></el-button>
                  <span class="font-size-display">{{ fontSize }}px</span>
                  <el-button @click="increaseFontSize" type="default" :icon="Plus" circle size="small"></el-button>
                </div>
              </div>

              <!-- 字体选择 -->
              <div class="setting-section">
                <div class="section-title">字体</div>
                <el-select v-model="currentFont" @change="changeFont" style="width: 100%;">
                  <el-option
                    v-for="font in fontOptions"
                    :key="font.value"
                    :label="font.label"
                    :value="font.value"
                    :style="{ fontFamily: font.value }"
                  />
                </el-select>
              </div>

              <!-- 导出功能 -->
              <div class="setting-section">
                <div class="section-title">导出</div>
                <el-button @click="handleExportPDF" type="primary" :loading="exporting" style="width: 100%;">
                  <el-icon><document /></el-icon>
                  导出PDF
                </el-button>
              </div>

              <!-- 主题设置 -->
              <div class="setting-section">
                <div class="section-title">主题背景</div>
                <div class="theme-options">
                  <div class="theme-category">
                    <div class="category-title">纯色背景</div>
                    <div class="theme-grid">
                      <div 
                        v-for="theme in solidThemes" 
                        :key="theme.name"
                        class="theme-option"
                        :class="{ active: currentTheme === theme.name }"
                        @click="changeTheme(theme.name)"
                        :title="theme.label"
                      >
                        <div class="theme-preview" :style="getPreviewStyle(theme)"></div>
                      </div>
                    </div>
                  </div>
                  <div class="theme-category">
                    <div class="category-title">渐变背景</div>
                    <div class="theme-grid">
                      <div 
                        v-for="theme in gradientThemes" 
                        :key="theme.name"
                        class="theme-option"
                        :class="{ active: currentTheme === theme.name }"
                        @click="changeTheme(theme.name)"
                        :title="theme.label"
                      >
                        <div class="theme-preview" :style="getPreviewStyle(theme)"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-popover>
          <span class="article-title-text">{{ articleTitle }}</span>
        </div>
        
        <div class="content-area" ref="contentArea" :style="currentBgStyle">
          <div 
            class="markdown-content" 
            :class="{ 'dark-theme': isDarkTheme }"
            v-html="renderedContent"
            ref="markdownContentRef"
            :style="{ fontSize: fontSize + 'px', color: currentTextColor, ...getContentStyle() }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ArrowLeft, Document, Minus, Plus, Setting } from '@element-plus/icons-vue';
import TopMenu from './TopMenu.vue';
import { marked } from 'marked';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { getArticleById } from '@/config/articles';

const router = useRouter();
const route = useRoute();

const loading = ref(true);
const error = ref('');
const articleContent = ref('');
const articleTitle = ref('');
const contentArea = ref(null);
const markdownContentRef = ref(null);
const exporting = ref(false);
const fontSize = ref(20); // 默认字体大小
const currentFont = ref('default'); // 当前字体

// 主题设置（基于主流阅读网站常用颜色）
const themes = [
  // 纯色背景
  { name: 'white', label: '白色', bgColor: '#ffffff', textColor: '#2c3e50', type: 'solid' }, // 标准白色，最常用
  { name: 'sepia', label: '米色', bgColor: '#FBF0D9', textColor: '#2c3e50', type: 'solid' }, // Kindle Sepia色，暖色调护眼
  { name: 'light-gray', label: '浅灰', bgColor: '#F5F5F5', textColor: '#2c3e50', type: 'solid' }, // 柔和灰色，减少对比度
  { name: 'light-green', label: '护眼绿', bgColor: '#E8F5E9', textColor: '#2c3e50', type: 'solid' }, // 柔和绿色，护眼舒适
  { name: 'light-blue', label: '浅蓝', bgColor: '#E3F2FD', textColor: '#2c3e50', type: 'solid' }, // 微信读书护眼模式
  { name: 'dark', label: '黑色', bgColor: '#1a1a1a', textColor: '#ffffff', type: 'solid' }, // 黑色背景，白色文字
  // 渐变色背景
  { name: 'sky-gradient', label: '天空蓝', bgColor: 'linear-gradient(180deg, #E3F2FD 0%, #BBDEFB 100%)', textColor: '#2c3e50', type: 'gradient' }, // 天空蓝渐变
  { name: 'sunset-gradient', label: '日落', bgColor: 'linear-gradient(180deg, #FFF3E0 0%, #FFE0B2 100%)', textColor: '#2c3e50', type: 'gradient' }, // 日落渐变
  { name: 'forest-gradient', label: '森林绿', bgColor: 'linear-gradient(180deg, #E8F5E9 0%, #C8E6C9 100%)', textColor: '#2c3e50', type: 'gradient' }, // 森林绿渐变
  { name: 'dark-gradient', label: '深邃', bgColor: 'linear-gradient(180deg, #2c2c2c 0%, #1a1a1a 100%)', textColor: '#ffffff', type: 'gradient' }, // 深色渐变
  { name: 'ocean-gradient', label: '海洋', bgColor: 'linear-gradient(180deg, #E0F2F1 0%, #B2DFDB 100%)', textColor: '#2c3e50', type: 'gradient' }, // 海洋渐变
  { name: 'lavender-gradient', label: '紫霞', bgColor: 'linear-gradient(180deg, #F3E5F5 0%, #E1BEE7 100%)', textColor: '#2c3e50', type: 'gradient' } // 紫霞渐变
];

const currentTheme = ref('white');
const currentBgStyle = ref('background-color: #ffffff');
const currentTextColor = ref('#2c3e50');

// 字体选项
const fontOptions = [
  { label: '系统默认', value: 'default' },
  { label: '苹方', value: 'PingFang SC, -apple-system, BlinkMacSystemFont' },
  { label: '微软雅黑', value: 'Microsoft YaHei, sans-serif' },
  { label: '思源黑体', value: 'Source Han Sans CN, sans-serif' },
  { label: '宋体', value: 'SimSun, serif' },
  { label: '楷体', value: 'KaiTi, serif' },
  { label: '仿宋', value: 'FangSong, serif' },
  { label: 'Times New Roman', value: 'Times New Roman, serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' }
];

const currentFontStyle = ref('');

// 配置 marked 选项
marked.setOptions({
  breaks: true,
  gfm: true,
});

// 渲染后的 HTML 内容
const renderedContent = computed(() => {
  if (!articleContent.value) return '';
  try {
    return marked(articleContent.value);
  } catch (error) {
    console.error('Markdown 解析错误:', error);
    ElMessage.error('Markdown 解析失败');
    return '';
  }
});

/**
 * 加载文章内容
 */
const loadArticle = async () => {
  const articleId = route.query.id;
  
  if (!articleId) {
    error.value = '缺少文章ID';
    loading.value = false;
    return;
  }
  
  const article = getArticleById(articleId);
  if (!article) {
    error.value = '文章不存在';
    loading.value = false;
    return;
  }
  
  articleTitle.value = article.title;
  
  try {
    // 从public/articles目录加载md文件
    // 动态获取 base URL 以适配 GitHub Pages 的 base path
    const getBaseUrl = () => {
      // 检查当前路径是否包含 GitHub Pages 的 base path
      if (window.location.pathname.startsWith('/interesting-util-client/')) {
        return '/interesting-util-client/';
      }
      return '/';
    };
    const baseUrl = getBaseUrl();
    const articlePath = `${baseUrl}articles/${article.file}`;
    const response = await fetch(articlePath);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    articleContent.value = text;
    loading.value = false;
  } catch (err) {
    console.error('加载文章失败:', err);
    error.value = '文章加载失败，请检查文件是否存在';
    loading.value = false;
    ElMessage.error('文章加载失败');
  }
};

/**
 * 返回文章列表
 */
const goBack = () => {
  router.push({
    path: '/articleList'
  });
};

/**
 * 增大字体
 */
const increaseFontSize = () => {
  if (fontSize.value < 32) {
    fontSize.value += 2;
    // 保存到 localStorage
    localStorage.setItem('articleFontSize', fontSize.value.toString());
  }
};

/**
 * 减小字体
 */
const decreaseFontSize = () => {
  if (fontSize.value > 12) {
    fontSize.value -= 2;
    // 保存到 localStorage
    localStorage.setItem('articleFontSize', fontSize.value.toString());
  }
};

// 计算纯色和渐变主题
const solidThemes = computed(() => themes.filter(t => t.type === 'solid'));
const gradientThemes = computed(() => themes.filter(t => t.type === 'gradient'));

// 判断是否为深色主题
const isDarkTheme = computed(() => currentTheme.value === 'dark' || currentTheme.value === 'dark-gradient');

/**
 * 获取预览样式
 */
const getPreviewStyle = (theme) => {
  if (theme.type === 'gradient') {
    return {
      background: theme.bgColor
    };
  } else {
    return {
      backgroundColor: theme.bgColor
    };
  }
};

/**
 * 获取内容样式（包括字体）
 */
const getContentStyle = () => {
  const styles = {};
  if (currentFont.value !== 'default') {
    const font = fontOptions.find(f => f.value === currentFont.value);
    if (font) {
      styles.fontFamily = font.value;
    }
  }
  return styles;
};

/**
 * 切换主题
 */
const changeTheme = (themeName) => {
  currentTheme.value = themeName;
  const theme = themes.find(t => t.name === themeName);
  if (theme) {
    if (theme.type === 'gradient') {
      currentBgStyle.value = `background: ${theme.bgColor}`;
    } else {
      currentBgStyle.value = `background-color: ${theme.bgColor}`;
    }
    // 设置文字颜色
    currentTextColor.value = theme.textColor;
    // 保存到localStorage
    localStorage.setItem('articleTheme', themeName);
  }
};

/**
 * 切换字体
 */
const changeFont = (fontValue) => {
  currentFont.value = fontValue;
  const font = fontOptions.find(f => f.value === fontValue);
  if (font) {
    if (fontValue === 'default') {
      currentFontStyle.value = '';
    } else {
      currentFontStyle.value = `font-family: ${font.value};`;
    }
    // 保存到localStorage
    localStorage.setItem('articleFont', fontValue);
  }
};

/**
 * 初始化主题
 */
const initTheme = () => {
  const savedTheme = localStorage.getItem('articleTheme');
  if (savedTheme && themes.find(t => t.name === savedTheme)) {
    changeTheme(savedTheme);
  } else {
    // 默认使用白色主题
    changeTheme('white');
  }
};

/**
 * 初始化字体大小
 */
const initFontSize = () => {
  const savedFontSize = localStorage.getItem('articleFontSize');
  if (savedFontSize) {
    const size = parseInt(savedFontSize, 10);
    // 确保字体大小在合理范围内
    if (size >= 12 && size <= 32) {
      fontSize.value = size;
    }
  }
};

/**
 * 初始化字体
 */
const initFont = () => {
  const savedFont = localStorage.getItem('articleFont');
  if (savedFont) {
    changeFont(savedFont);
  } else {
    // 默认使用系统字体
    changeFont('default');
  }
};

/**
 * 导出 PDF
 */
const handleExportPDF = async () => {
  if (!markdownContentRef.value) {
    ElMessage.error('没有可导出的内容');
    return;
  }
  
  exporting.value = true;
  
  try {
    ElMessage.info('正在生成 PDF，请稍候...');
    
    // 页面边距设置（mm） - 增加底部边距以防止文字截断
    const margin = {
      top: 20,
      bottom: 35, // 增加底部边距
      left: 20,
      right: 20
    };
    
    const scale = 2; // html2canvas的缩放比例
    
    // A4 纸张尺寸 (mm)
    const pdfWidth = 210;
    const pdfHeight = 297;
    const contentWidth = pdfWidth - margin.left - margin.right;
    const contentHeight = pdfHeight - margin.top - margin.bottom;
    
    // 计算内容区域的像素宽度（96 DPI）
    const mmToPx = 96 / 25.4; // 1mm = 3.7795px (96 DPI)
    const contentWidthPx = Math.floor(contentWidth * mmToPx);
    
    // 临时设置内容宽度以确保PDF排版正确
    const originalWidth = markdownContentRef.value.style.width;
    const originalMaxWidth = markdownContentRef.value.style.maxWidth;
    const originalPadding = markdownContentRef.value.style.padding;
    const originalPageBreak = markdownContentRef.value.style.pageBreakInside;
    
    // 设置固定宽度和分页样式，确保内容不会超出且不会分割文字
    markdownContentRef.value.style.width = `${contentWidthPx}px`;
    markdownContentRef.value.style.maxWidth = `${contentWidthPx}px`;
    markdownContentRef.value.style.boxSizing = 'border-box';
    markdownContentRef.value.style.margin = '0 auto';
    markdownContentRef.value.style.pageBreakInside = 'avoid';
    
    // 添加分页相关的CSS样式
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .markdown-content p, .markdown-content h1, .markdown-content h2, 
      .markdown-content h3, .markdown-content h4, .markdown-content h5, 
      .markdown-content h6, .markdown-content blockquote, 
      .markdown-content pre, .markdown-content table {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      .markdown-content h1, .markdown-content h2, .markdown-content h3 {
        page-break-after: avoid;
        break-after: avoid;
      }
    `;
    document.head.appendChild(styleElement);
    
    // 等待样式应用
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 使用 html2canvas 将内容转换为图片
    // 不设置width参数，让html2canvas根据元素实际宽度自动计算
    const canvas = await html2canvas(markdownContentRef.value, {
      scale: scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });
    
    // 恢复原始样式
    markdownContentRef.value.style.width = originalWidth;
    markdownContentRef.value.style.maxWidth = originalMaxWidth;
    markdownContentRef.value.style.padding = originalPadding;
    markdownContentRef.value.style.boxSizing = '';
    markdownContentRef.value.style.margin = '';
    markdownContentRef.value.style.pageBreakInside = originalPageBreak || '';
    
    // 移除临时添加的样式
    document.head.removeChild(styleElement);
    
    const imgData = canvas.toDataURL('image/png', 1.0);
    const imgWidth = canvas.width; // 实际canvas宽度 = contentWidthPx * scale
    const imgHeight = canvas.height; // 实际canvas高度
    
    // 计算图片在PDF中的尺寸（保持宽高比）
    // canvas的实际宽度是 contentWidthPx * scale，所以需要除以scale得到原始宽度
    const actualContentWidthPx = imgWidth / scale;
    const actualContentHeightPx = imgHeight / scale;
    
    // 转换为mm（96 DPI）
    const imgWidthInMm = (actualContentWidthPx / mmToPx);
    const imgHeightInMm = (actualContentHeightPx / mmToPx);
    
    // 创建 PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // 使用非常保守的分页策略，避免任何文字截断
    const veryStaticSafePageHeight = contentHeight * 0.75; // 只使用75%的页面高度，预留25%作为安全缓冲
    const veryStaticSafePageHeightPx = Math.floor((veryStaticSafePageHeight / imgHeightInMm) * imgHeight);
    
    // 添加基于行高的智能检测
    const estimatedLineHeight = Math.ceil(fontSize.value * 1.8 * scale); // 估算行高（考虑line-height 1.8）
    const safetyBuffer = estimatedLineHeight * 3; // 额外预留3行的安全空间
    const finalSafePageHeightPx = Math.max(veryStaticSafePageHeightPx - safetyBuffer, Math.floor(veryStaticSafePageHeightPx * 0.8));
    
    let remainingHeight = imgHeightInMm;
    let yPosition = margin.top;
    
    // 添加第一页内容
    if (remainingHeight <= veryStaticSafePageHeight) {
      // 内容可以在一页内显示
      pdf.addImage(imgData, 'PNG', margin.left, yPosition, imgWidthInMm, imgHeightInMm);
    } else {
      // 内容需要分页 - 使用最保守的策略
      let sourceY = 0;
      let pageCount = 0;
      
      while (sourceY < imgHeight) {
        // 计算当前页可以显示的内容高度
        const remainingPx = imgHeight - sourceY;
        let currentPageHeightPx;
        
        if (remainingPx <= finalSafePageHeightPx) {
          // 剩余内容可以放在一页内
          currentPageHeightPx = remainingPx;
        } else {
          // 使用最保守的高度
          currentPageHeightPx = finalSafePageHeightPx;
          
          // 如果剩余内容不多，直接放在下一页
          if (remainingPx < finalSafePageHeightPx * 1.2) {
            currentPageHeightPx = Math.floor(finalSafePageHeightPx * 0.6); // 更保守地分页
          }
        }
        
        // 创建当前页的canvas
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = imgWidth;
        pageCanvas.height = currentPageHeightPx;
        const pageCtx = pageCanvas.getContext('2d');
        
        // 填充白色背景
        pageCtx.fillStyle = '#ffffff';
        pageCtx.fillRect(0, 0, imgWidth, currentPageHeightPx);
        
        // 从原图中裁剪当前页的内容
        pageCtx.drawImage(
          canvas,
          0, sourceY, imgWidth, currentPageHeightPx,
          0, 0, imgWidth, currentPageHeightPx
        );
        
        const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
        
        // 如果不是第一页，添加新页面
        if (pageCount > 0) {
          pdf.addPage();
        }
        
        // 计算在PDF中的尺寸
        const pageImgHeightInMm = (currentPageHeightPx / scale) / mmToPx;
        
        // 添加当前页内容到PDF
        pdf.addImage(
          pageImgData,
          'PNG',
          margin.left,
          margin.top,
          imgWidthInMm,
          pageImgHeightInMm
        );
        
        // 更新位置
        sourceY += currentPageHeightPx;
        pageCount++;
        
        // 防止无限循环
        if (pageCount > 100) {
          console.warn('PDF页面数量过多，停止分页');
          break;
        }
      }
    }
    
    // 下载 PDF
    const pdfFileName = articleTitle.value || 'article';
    pdf.save(`${pdfFileName}.pdf`);
    
    ElMessage.success('PDF 导出成功');
  } catch (err) {
    console.error('PDF 导出错误:', err);
    ElMessage.error('PDF 导出失败，请重试');
  } finally {
    exporting.value = false;
  }
};

onMounted(() => {
  document.querySelector('body').setAttribute('style', 'background: #EBEDF0');
  initTheme();
  initFontSize();
  initFont();
  loadArticle();
});
</script>

<style scoped>
.article-detail {
  min-height: 100vh;
  background: #EBEDF0;
}

.detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.loading-section,
.error-section {
  background: white;
  border-radius: 12px;
  padding: 40px;
  margin-top: 20px;
}

.article-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 20px;
  border-bottom: 1px solid #e4e7ed;
  background: #f5f7fa;
}

.font-size-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.settings-panel {
  max-height: 500px;
  overflow-y: auto;
}

.setting-section {
  margin-bottom: 20px;
}

.setting-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid #f0f0f0;
}

.font-size-display {
  min-width: 50px;
  text-align: center;
  color: #606266;
  font-size: 14px;
  font-weight: 500;
}

.theme-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.theme-category {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.category-title {
  font-size: 12px;
  color: #909399;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  padding: 4px 0;
  border-bottom: 1px solid #f0f0f0;
}

.theme-option {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.theme-option:hover {
  background-color: #f5f7fa;
}

.theme-option.active {
  background-color: #e6f7ff;
}

.theme-preview {
  width: 40px;
  height: 30px;
  border-radius: 4px;
  border: 2px solid #e4e7ed;
  flex-shrink: 0;
}

.theme-option.active .theme-preview {
  border-color: #409eff;
}

.theme-name {
  font-size: 14px;
  color: #606266;
}

.article-title-text {
  margin-left: auto;
  color: #606266;
  font-size: 16px;
  font-weight: 600;
}

.content-area {
  padding: 40px;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  background: #ffffff;
  transition: background-color 0.3s ease;
}

.markdown-content {
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.8;
  color: #2c3e50;
  word-wrap: break-word;
  overflow-wrap: break-word;
  transition: font-size 0.2s ease;
}

/* Markdown 内容样式 */
:deep(.markdown-content) {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

/* 深色主题样式 */
:deep(.markdown-content.dark-theme h1),
:deep(.markdown-content.dark-theme h2) {
  border-color: #444;
}

:deep(.markdown-content.dark-theme blockquote) {
  color: #ccc;
  border-color: #555;
}

:deep(.markdown-content.dark-theme code) {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}

:deep(.markdown-content.dark-theme pre) {
  background-color: #2d2d2d;
}

:deep(.markdown-content.dark-theme pre code) {
  background-color: transparent;
  color: #fff;
}

:deep(.markdown-content.dark-theme table th),
:deep(.markdown-content.dark-theme table td) {
  border-color: #555;
}

:deep(.markdown-content.dark-theme table th) {
  background-color: #333;
}

:deep(.markdown-content.dark-theme table tr) {
  background-color: #1a1a1a;
  border-color: #555;
}

:deep(.markdown-content.dark-theme table tr:nth-child(2n)) {
  background-color: #2a2a2a;
}

:deep(.markdown-content.dark-theme hr) {
  background-color: #555;
}

:deep(.markdown-content.dark-theme a) {
  color: #66b3ff;
}

:deep(.markdown-content h1) {
  font-size: 2em;
  margin-top: 0.67em;
  margin-bottom: 0.67em;
  font-weight: bold;
  border-bottom: 2px solid #eaecef;
  padding-bottom: 0.3em;
}

:deep(.markdown-content h2) {
  font-size: 1.5em;
  margin-top: 0.83em;
  margin-bottom: 0.83em;
  font-weight: bold;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
}

:deep(.markdown-content h3) {
  font-size: 1.25em;
  margin-top: 1em;
  margin-bottom: 1em;
  font-weight: bold;
}

:deep(.markdown-content h4) {
  font-size: 1em;
  margin-top: 1.33em;
  margin-bottom: 1.33em;
  font-weight: bold;
}

:deep(.markdown-content h5) {
  font-size: 0.83em;
  margin-top: 1.67em;
  margin-bottom: 1.67em;
  font-weight: bold;
}

:deep(.markdown-content h6) {
  font-size: 0.67em;
  margin-top: 2.33em;
  margin-bottom: 2.33em;
  font-weight: bold;
}

:deep(.markdown-content p) {
  margin-top: 0;
  margin-bottom: 16px;
}

:deep(.markdown-content ul),
:deep(.markdown-content ol) {
  margin-top: 0;
  margin-bottom: 16px;
  padding-left: 2em;
}

:deep(.markdown-content li) {
  margin-top: 0.25em;
  margin-bottom: 0.25em;
}

:deep(.markdown-content blockquote) {
  margin: 0;
  padding: 0 1em;
  color: #6a737d;
  border-left: 0.25em solid #dfe2e5;
}

:deep(.markdown-content code) {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(27, 31, 35, 0.05);
  border-radius: 3px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
}

:deep(.markdown-content pre) {
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: #f6f8fa;
  border-radius: 6px;
  margin-bottom: 16px;
}

:deep(.markdown-content pre code) {
  display: inline;
  max-width: auto;
  padding: 0;
  margin: 0;
  overflow: visible;
  line-height: inherit;
  word-wrap: normal;
  background-color: transparent;
  border: 0;
}

:deep(.markdown-content table) {
  border-spacing: 0;
  border-collapse: collapse;
  margin-top: 0;
  margin-bottom: 16px;
  width: 100%;
}

:deep(.markdown-content table th),
:deep(.markdown-content table td) {
  padding: 6px 13px;
  border: 1px solid #dfe2e5;
}

:deep(.markdown-content table th) {
  font-weight: 600;
  background-color: #f6f8fa;
}

:deep(.markdown-content table tr) {
  background-color: #fff;
  border-top: 1px solid #c6cbd1;
}

:deep(.markdown-content table tr:nth-child(2n)) {
  background-color: #f6f8fa;
}

:deep(.markdown-content a) {
  color: #0366d6;
  text-decoration: none;
}

:deep(.markdown-content a:hover) {
  text-decoration: underline;
}

:deep(.markdown-content img) {
  max-width: 100%;
  height: auto;
  margin: 16px 0;
  border-radius: 4px;
}

:deep(.markdown-content hr) {
  height: 0.25em;
  padding: 0;
  margin: 24px 0;
  background-color: #e1e4e8;
  border: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .detail-container {
    padding: 10px;
  }
  
  .content-area {
    padding: 20px;
  }
  
  .toolbar {
    flex-wrap: wrap;
  }
  
  .font-size-controls {
    margin-left: 0;
    border-left: none;
    border-right: none;
    padding: 0 5px;
  }
  
  .article-title-text {
    width: 100%;
    margin-left: 0;
    margin-top: 10px;
  }
}
</style>