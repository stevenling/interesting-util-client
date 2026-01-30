<template>
  <div class="article-detail">
    

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
        <!-- 文章标题 -->
        <div class="article-title-bar">
          <!-- 返回按钮 -->
          <el-tooltip content="返回" placement="bottom">
            <el-button @click="goBack" type="primary" :icon="ArrowLeft" circle plain></el-button>
          </el-tooltip>
          <span class="article-title-text">{{ articleTitle }}</span>
          <!-- 工具栏切换按钮 -->
          <div class="toolbar-toggle">
            <el-tooltip :content="toolbarVisible ? '隐藏工具栏' : '显示工具栏'" placement="bottom">
              <el-button type="primary" :icon="toolbarVisible ? Hide : View" circle plain @click="toggleToolbar"></el-button>
            </el-tooltip>
          </div>
        </div>

        <div class="content-area" ref="contentArea" :style="[currentBgStyleObject, { marginBottom: '0', paddingBottom: '0' }]" :class="{ 'scrolling': isScrolling }">
          <!-- 工具栏（在文本右侧，垂直居中） -->
          <div class="toolbar-right" :class="{ 'toolbar-hidden': !toolbarVisible }" :style="{ top: toolbarTop + 'px' }">
            <el-tooltip content="导出书摘" placement="left">
              <el-button @click="handleExportBookmark" type="primary" :icon="Picture" circle plain></el-button>
            </el-tooltip>
            <el-tooltip content="设置" placement="left">
              <el-popover
                :placement="isMobile ? 'bottom' : 'left-start'"
                :width="isMobile ? '90vw' : 360"
                trigger="click"
                title="设置"
                popper-class="settings-popover"
              >
                <template #reference>
                  <el-button type="primary" :icon="Setting" circle plain></el-button>
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
          </el-tooltip>
        </div>
        <div 
          class="markdown-content" 
          :class="{ 'dark-theme': isDarkTheme }"
          v-html="renderedContent"
          ref="markdownContentRef"
          :style="{ fontSize: fontSize + 'px', color: currentTextColor, ...getContentStyle() }"
          @mouseup="handleTextSelection"
          @touchend="handleTextSelection"
        ></div>
          
          <!-- 文章导航 -->
          <div class="article-navigation" v-if="prevArticle || nextArticle" :class="{ 'dark-theme-nav': isDarkTheme, 'scrolling': isScrolling }">
            <div class="nav-button prev-article" v-if="prevArticle" @click="goToArticle(prevArticle.id)" :style="navButtonStyle">
              <span class="nav-label">上一篇</span>
              <span class="nav-title">{{ prevArticle.title }}</span>
            </div>
            <div class="nav-button next-article" v-if="nextArticle" @click="goToArticle(nextArticle.id)" :style="navButtonStyle">
              <span class="nav-label">下一篇</span>
              <span class="nav-title">{{ nextArticle.title }}</span>
            </div>
          </div>
          
          <!-- 底部文本 -->
          <div>
            <p class="footer-quote-bottom">When I say the word 'you'<br/>it means a hundred universes</p>
          </div>
          <!-- <div class="footer-quote" :class="{ 'dark-theme-quote': isDarkTheme }">
            <p>When I say the word 'you'<br/>it means a hundred universes.</p>
          </div> -->
        </div>
      </div>
    </div>
    
    <!-- 隐藏的书摘卡片（用于移动端生成图片） -->
    <div v-if="isMobileDevice" class="hidden-bookmark-card-container">
      <div 
        class="bookmark-card hidden-bookmark-card" 
        ref="hiddenBookmarkCardRef"
        :style="bookmarkCardStyle"
      >
        <!-- 日期部分 -->
        <div class="bookmark-date-section">
          <div class="bookmark-day" :style="{ color: bookmarkTextColor, fontFamily: bookmarkFontFamily }">{{ currentDate.day }}</div>
          <div class="bookmark-month-year" :style="{ color: bookmarkTextColor, fontFamily: bookmarkFontFamily }">{{ currentDate.monthYear }}</div>
          <div class="bookmark-weekday" :style="{ color: bookmarkTextColor, fontFamily: bookmarkFontFamily }">{{ currentDate.weekday }}</div>
          <div class="bookmark-separator" :style="{ background: bookmarkTextColor }"></div>
        </div>
        
        <!-- 书摘内容 -->
        <div class="bookmark-quote-section">
          <div class="bookmark-quote-text" :style="{ color: bookmarkTextColor, fontFamily: bookmarkFontFamily }">{{ selectedText }}</div>
        </div>
        
        <!-- 来源信息 -->
        <div class="bookmark-source-section">
          <div class="bookmark-book-title" :style="{ color: bookmarkTextColor, fontFamily: bookmarkFontFamily }">《{{ articleTitle }}》</div>
          <div class="bookmark-author" v-if="articleAuthor" :style="{ color: bookmarkTextColor, fontFamily: bookmarkFontFamily }">{{ articleAuthor }}</div>
        </div>
      </div>
    </div>
    
    <!-- 书摘对话框（桌面端使用） -->
    <el-dialog
      v-model="bookmarkDialogVisible"
      title="导出书摘"
      width="600px"
      :close-on-click-modal="false"
      class="bookmark-dialog"
    >
      <div class="bookmark-preview-container">
        <div 
          class="bookmark-card" 
          ref="bookmarkCardRef"
          :style="bookmarkCardStyle"
        >
          <!-- 左右箭头按钮 -->
          <div class="bookmark-theme-nav">
            <el-button 
              class="theme-nav-btn theme-nav-left"
              :icon="ArrowLeft"
              circle
              @click="switchBookmarkTheme(-1)"
              size="small"
            ></el-button>
            <el-button 
              class="theme-nav-btn theme-nav-right"
              :icon="ArrowRight"
              circle
              @click="switchBookmarkTheme(1)"
              size="small"
            ></el-button>
          </div>
          
          <!-- 日期部分 -->
          <div class="bookmark-date-section">
            <div class="bookmark-day" :style="{ color: bookmarkTextColor, fontFamily: bookmarkFontFamily }">{{ currentDate.day }}</div>
            <div class="bookmark-month-year" :style="{ color: bookmarkTextColor, fontFamily: bookmarkFontFamily }">{{ currentDate.monthYear }}</div>
            <div class="bookmark-weekday" :style="{ color: bookmarkTextColor, fontFamily: bookmarkFontFamily }">{{ currentDate.weekday }}</div>
            <div class="bookmark-separator" :style="{ background: bookmarkTextColor }"></div>
          </div>
          
          <!-- 书摘内容 -->
          <div class="bookmark-quote-section">
            <div class="bookmark-quote-text" :style="{ color: bookmarkTextColor, fontFamily: bookmarkFontFamily }">{{ selectedText }}</div>
          </div>
          
          <!-- 来源信息 -->
          <div class="bookmark-source-section">
            <div class="bookmark-book-title" :style="{ color: bookmarkTextColor, fontFamily: bookmarkFontFamily }">《{{ articleTitle }}》</div>
            <div class="bookmark-author" v-if="articleAuthor" :style="{ color: bookmarkTextColor, fontFamily: bookmarkFontFamily }">{{ articleAuthor }}</div>
          </div>
        </div>
      </div>
      
      <!-- 字体设置 -->
      <div class="bookmark-font-setting">
        <div class="setting-label">字体</div>
        <div class="bookmark-font-buttons">
          <el-button
            v-for="font in bookmarkFontOptions"
            :key="font.value"
            :type="bookmarkCurrentFont === font.value ? 'primary' : 'default'"
            size="small"
            @click="bookmarkCurrentFont = font.value"
            :style="{ fontFamily: font.value }"
            class="font-button"
          >
            {{ font.label }}
          </el-button>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button 
            type="primary" 
            @click="copyBookmarkToClipboard" 
            :loading="generatingBookmark"
            :icon="generatingBookmark ? undefined : CopyDocument"
            size="default"
            class="copy-button"
          >
            {{ generatingBookmark ? '生成中...' : '复制' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 移动端图片预览对话框 -->
    <el-dialog
      v-model="bookmarkImagePreviewVisible"
      title="书摘图片"
      width="90%"
      :close-on-click-modal="true"
      class="bookmark-image-preview-dialog"
    >
      <div class="bookmark-image-preview-container">
        <img 
          v-if="generatedBookmarkImageUrl" 
          :src="generatedBookmarkImageUrl" 
          alt="书摘图片"
          class="bookmark-preview-image"
        />
        <!-- 复制按钮 - 在图片下方，提示文字上方 -->
        <div class="bookmark-button-container">
          <el-button
            type="primary"
            :icon="CopyDocument"
            class="bookmark-copy-button"
            @click.stop="copyBookmarkImageFromPreview"
            :loading="generatingBookmark"
            :disabled="generatingBookmark"
            size="default"
          >
            {{ generatingBookmark ? '复制中...' : '复制图片' }}
          </el-button>
        </div>
        <p class="bookmark-preview-tip">请长按图片进行保存或复制</p>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="bookmarkImagePreviewVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ArrowLeft, Document, Minus, Plus, Setting, Bookmark, CopyDocument, Picture, ArrowDown, ArrowRight, View, Hide } from '@element-plus/icons-vue';
import TopMenu from './TopMenu.vue';
import { marked } from 'marked';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { getArticleById, getAllArticles } from '@/config/articles';
import { getYunhuEssayArticleById, getAllYunhuEssayArticles } from '@/config/yunhu-essay';

const router = useRouter();
const route = useRoute();

const loading = ref(true);
const error = ref('');
const articleContent = ref('');
const articleTitle = ref('');
const contentArea = ref(null);
const markdownContentRef = ref(null);
const exporting = ref(false);
const toolbarVisible = ref(false); // 工具栏显示状态
const manualToolbarControl = ref(false); // 是否手动控制工具栏
const isScrolling = ref(false); // 是否在滚动状态
const toolbarTop = ref(0); // 工具栏垂直位置（像素值）
const isMobile = ref(false); // 是否为移动端
let lastScrollTop = 0; // 上次滚动位置
let scrollTimer = null; // 滚动定时器
let isAtBottom = false; // 是否在底部
const fontSize = ref(20); // 默认字体大小
const currentFont = ref('default'); // 当前字体
const selectedText = ref(''); // 选中的文本
const bookmarkDialogVisible = ref(false); // 书摘对话框显示状态
const bookmarkCardRef = ref(null); // 书摘卡片引用（桌面端使用）
const hiddenBookmarkCardRef = ref(null); // 隐藏的书摘卡片引用（移动端使用）
const generatingBookmark = ref(false); // 生成书摘中
const articleAuthor = ref(''); // 文章作者
const bookmarkCurrentTheme = ref('dark-blue-gradient'); // 书摘当前主题
const bookmarkCurrentFont = ref('"Lantinghei SC", "Lantinghei TC", "Microsoft YaHei", "PingFang SC", sans-serif'); // 书摘当前字体
const bookmarkImagePreviewVisible = ref(false); // 移动端图片预览对话框显示状态
const generatedBookmarkImageUrl = ref(''); // 生成的书摘图片URL

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
const currentBgStyleObject = ref({ backgroundColor: '#ffffff' });
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

// 书摘主题选项（渐变式背景，参考微信读书样式）
const bookmarkThemes = [
  { name: 'white-gradient', label: '白色', bgColor: 'linear-gradient(180deg, #FFFFFF 0%, #F5F5F5 100%)', textColor: '#2c3e50' },
  { name: 'dark-blue-gradient', label: '深蓝', bgColor: 'linear-gradient(180deg, #263270 0%, #1a2347 100%)', textColor: '#D3DFE9' },
  { name: 'blue-gray-gradient', label: '蓝灰', bgColor: 'linear-gradient(180deg, #6A7BAA 0%, #5A6B9A 100%)', textColor: '#FFFFFF' },
  { name: 'pink-beige-gradient', label: '粉米', bgColor: 'linear-gradient(180deg, #FDF5F6 0%, #F8F0F1 100%)', textColor: '#333333' },
  { name: 'light-gray-gradient', label: '浅灰2', bgColor: 'linear-gradient(180deg, #F7F8FA 0%, #F0F1F3 100%)', textColor: '#333333' },
  { name: 'warm-beige-gradient', label: '暖米', bgColor: 'linear-gradient(180deg, #FAF8F5 0%, #F5F3F0 100%)', textColor: '#333333' },
  { name: 'soft-beige-gradient', label: '柔米', bgColor: 'linear-gradient(180deg, #FCFBF8 0%, #F8F7F4 100%)', textColor: '#333333' },
  { name: 'dark-gradient', label: '黑色', bgColor: 'linear-gradient(180deg, #2C2C2C 0%, #000000 100%)', textColor: '#E4D4BC' }
];

// 书摘字体选项
const bookmarkFontOptions = [
  { label: '兰亭黑', value: '"Lantinghei SC", "Lantinghei TC", "Microsoft YaHei", "PingFang SC", sans-serif' },
  { label: '思源宋体', value: '"Source Han Serif SC", "Source Han Serif CN", "Noto Serif SC", "STSong", serif' },
  { label: '仓耳今楷', value: '"TsangerJinKai05", "TsangerJinKai", "KaiTi", "STKaiti", serif' },
  { label: '仓耳云黑', value: '"TsangerYunHei05", "TsangerYunHei", "Microsoft YaHei", "PingFang SC", sans-serif' },
  { label: '方正悠宋', value: '"FZYouSongS", "FZYouSong", "SimSun", "STSong", serif' },
  { label: '仿宋', value: '"FangSong", "STFangsong", "STFangSong", serif' }
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
  const source = route.query.source; // 'yunhu-essay' 表示从 yunhu-essay 文件夹加载

  if (!articleId) {
    error.value = '缺少文章ID';
    loading.value = false;
    return;
  }

  const article = source === 'yunhu-essay'
    ? getYunhuEssayArticleById(articleId)
    : getArticleById(articleId);
  if (!article) {
    error.value = '文章不存在';
    loading.value = false;
    return;
  }

  articleTitle.value = article.title;
  articleAuthor.value = article.author || '';

  try {
    const getBaseUrl = () => {
      if (window.location.pathname.startsWith('/interesting-util-client/')) return '/interesting-util-client/';
      return '/';
    };
    const baseUrl = getBaseUrl();
    let articlePath;
    if (source === 'yunhu-essay') {
      articlePath = `${baseUrl}yunhu-essay/${article.file}`;
    } else {
      articlePath = `${baseUrl}云胡选集/${article.file}`;
    }
    let response = await fetch(articlePath);
    if (!response.ok && source !== 'yunhu-essay') {
      articlePath = `${baseUrl}articles/${article.file}`;
      response = await fetch(articlePath);
    }
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    articleContent.value = text;
    loading.value = false;
    
    // 等待 DOM 更新和内容渲染后滚动到顶部
    await nextTick();
    // 使用 setTimeout 确保内容完全渲染后再滚动
    setTimeout(() => {
      // 滚动 contentArea 到顶部
      if (contentArea.value) {
        contentArea.value.scrollTop = 0;
        // 重新添加滚动监听（如果还没有添加）
        if (!contentArea.value.hasAttribute('data-scroll-listener')) {
          contentArea.value.addEventListener('scroll', handleScroll);
          contentArea.value.setAttribute('data-scroll-listener', 'true');
        }
        // 确保内容区域可以正确计算高度
        nextTick(() => {
          if (contentArea.value) {
            // 强制重新计算布局，确保底部内容可见
            const scrollHeight = contentArea.value.scrollHeight;
            const clientHeight = contentArea.value.clientHeight;
            // 如果内容高度小于容器高度，确保可以滚动到底部
            if (scrollHeight > clientHeight) {
              // 触发一次滚动事件，确保底部内容可见
              requestAnimationFrame(() => {
                if (contentArea.value) {
                  const currentScrollTop = contentArea.value.scrollTop;
                  const maxScrollTop = scrollHeight - clientHeight;
                  // 如果当前不在底部，确保可以滚动到底部
                  if (currentScrollTop < maxScrollTop - 5) {
                    // 不需要自动滚动，只是确保可以滚动
                  }
                }
              });
            }
          }
        });
      }
      // 滚动 window 到顶部
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
      // 如果 detail-container 也需要滚动
      const detailContainer = document.querySelector('.detail-container');
      if (detailContainer) {
        detailContainer.scrollTop = 0;
      }
      // 重置工具栏状态（默认隐藏）
      toolbarVisible.value = false;
      lastScrollTop = 0;
    }, 150);
  } catch (err) {
    console.error('加载文章失败:', err);
    error.value = '文章加载失败，请检查文件是否存在';
    loading.value = false;
    ElMessage.error('文章加载失败');
  }
};

/**
 * 返回文章列表
 * 如果当前文章来自云胡选集（source = yunhu-essay），
 * 则返回时切换到列表页的云胡选集标签（tab = anthology）
 */
const goBack = () => {
  const query = {};
  if (route.query.source === 'yunhu-essay') {
    query.tab = 'anthology';
  }
  router.push({
    path: '/articleList',
    query
  });
};

/**
 * 获取上一篇和下一篇文章（根据 source 使用藏文或云胡选集列表）
 */
const prevArticle = computed(() => {
  const allArticles = route.query.source === 'yunhu-essay'
    ? [...getAllYunhuEssayArticles()].sort((a, b) => new Date(b.date) - new Date(a.date))
    : [...getAllArticles()].sort((a, b) => new Date(b.date) - new Date(a.date));
  const currentArticleId = route.query.id;
  const currentIndex = allArticles.findIndex(a => a.id === currentArticleId);
  if (currentIndex === -1 || currentIndex === 0) return null;
  return allArticles[currentIndex - 1];
});

const nextArticle = computed(() => {
  const allArticles = route.query.source === 'yunhu-essay'
    ? [...getAllYunhuEssayArticles()].sort((a, b) => new Date(b.date) - new Date(a.date))
    : [...getAllArticles()].sort((a, b) => new Date(b.date) - new Date(a.date));
  const currentArticleId = route.query.id;
  const currentIndex = allArticles.findIndex(a => a.id === currentArticleId);
  if (currentIndex === -1 || currentIndex === allArticles.length - 1) return null;
  return allArticles[currentIndex + 1];
});

/**
 * 跳转到指定文章（保持当前 source，云胡选集内上一篇/下一篇仍为云胡选集）
 */
const goToArticle = (articleId) => {
  loading.value = true;
  articleContent.value = '';
  error.value = '';
  if (contentArea.value) contentArea.value.scrollTop = 0;
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  const query = { id: articleId };
  if (route.query.source === 'yunhu-essay') query.source = 'yunhu-essay';
  router.push({ path: '/articleDetail', query });
};

/**
 * 处理文本选择
 */
const handleTextSelection = () => {
  // 使用 setTimeout 确保在移动端选择完成后再获取文本
  setTimeout(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const text = selection.toString().trim();
      selectedText.value = text;
      // 选中文本时自动显示工具栏
      updateToolbarPosition(); // 更新到当前可视区域中心
      toolbarVisible.value = true;
      manualToolbarControl.value = false; // 选中文本时重置手动控制状态
    }
  }, 100);
};

/**
 * 处理选择变化事件（用于移动端和桌面端）
 */
const handleSelectionChange = () => {
  const selection = window.getSelection();
  if (selection && selection.toString().trim()) {
    const text = selection.toString().trim();
    // 只有当选择的文本发生变化时才更新
    if (text !== selectedText.value) {
      selectedText.value = text;
      // 选中文本时自动显示工具栏
      updateToolbarPosition();
      toolbarVisible.value = true;
      manualToolbarControl.value = false;
    }
  } else {
    // 如果没有选择文本，可以选择隐藏工具栏（可选）
    // toolbarVisible.value = false;
  }
};

/**
 * 更新工具栏位置（根据当前可视区域）
 */
const updateToolbarPosition = () => {
  if (!contentArea.value) return;
  
  const scrollTop = contentArea.value.scrollTop;
  const clientHeight = contentArea.value.clientHeight;
  const scrollHeight = contentArea.value.scrollHeight;
  
  if (scrollHeight === 0 || clientHeight === 0) {
    // 如果内容区域还没有加载完成，使用默认位置
    toolbarTop.value = 0;
    return;
  }
  
  // 计算当前可视区域的中心位置（相对于 content-area 的顶部，单位：像素）
  // scrollTop 是滚动位置，clientHeight / 2 是可视区域的一半
  const centerPosition = scrollTop + clientHeight / 2;
  
  // 直接使用像素值，限制在合理范围内
  // 最小距离顶部 50px，最大距离顶部 (scrollHeight - 50)px
  toolbarTop.value = Math.max(50, Math.min(scrollHeight - 50, centerPosition));
};

/**
 * 手动切换工具栏显示/隐藏
 */
const toggleToolbar = () => {
  const willShow = !toolbarVisible.value;
  
  if (willShow) {
    // 先计算并设置位置（在显示前计算，确保位置准确）
    updateToolbarPosition();
    // 然后显示工具栏
    toolbarVisible.value = true;
    manualToolbarControl.value = true; // 标记为手动控制
    
    // 使用 nextTick 和 setTimeout 确保 DOM 完全更新后再次精确计算位置
    nextTick(() => {
      setTimeout(() => {
        if (contentArea.value && toolbarVisible.value) {
          updateToolbarPosition();
        }
      }, 50);
    });
  } else {
    toolbarVisible.value = false;
    manualToolbarControl.value = true; // 标记为手动控制
  }
};

/**
 * 处理滚动事件
 */
const handleScroll = () => {
  if (!contentArea.value) return;
  
  const scrollTop = contentArea.value.scrollTop;
  const scrollHeight = contentArea.value.scrollHeight;
  const clientHeight = contentArea.value.clientHeight;
  
  // 设置滚动状态
  isScrolling.value = scrollTop > 10;
  
  // 如果工具栏可见，更新其位置到当前可视区域中心
  if (toolbarVisible.value) {
    // 使用 requestAnimationFrame 优化性能
    requestAnimationFrame(() => {
      updateToolbarPosition();
    });
  }
  
  // 清除之前的定时器
  if (scrollTimer) {
    clearTimeout(scrollTimer);
  }
  
  // 滚动停止后恢复非滚动状态
  scrollTimer = setTimeout(() => {
    isScrolling.value = false;
  }, 150);
  
  // 滑动时隐藏工具栏
  toolbarVisible.value = false;
  
  // 检测是否到达底部（允许一定的误差范围，比如 5px）
  const distanceToBottom = scrollHeight - scrollTop - clientHeight;
  const threshold = 5; // 误差阈值
  
  // 如果已经到底部或接近底部，确保内容完全可见
  if (distanceToBottom <= threshold) {
    // 确保滚动位置正确，让底部内容完全可见
    const targetScrollTop = Math.max(0, scrollHeight - clientHeight);
    if (Math.abs(contentArea.value.scrollTop - targetScrollTop) > threshold) {
      contentArea.value.scrollTop = targetScrollTop;
    }
  }
  
  lastScrollTop = scrollTop;
};

/**
 * 生成书摘图片（提取的公共函数）
 */
const generateBookmarkImage = async () => {
  if (!selectedText.value) {
    ElMessage.warning('请先选中要导出的文本');
    return null;
  }
  
  // 检测是否为移动设备，选择对应的卡片引用
  const isMobileDeviceValue = isMobileDevice.value;
  const cardRef = isMobileDeviceValue ? hiddenBookmarkCardRef.value : bookmarkCardRef.value;
  
  if (!cardRef) {
    ElMessage.error('书摘卡片未准备好');
    return null;
  }
  
  generatingBookmark.value = true;
  
  try {
    // 使用 html2canvas 生成图片
    const theme = bookmarkThemes.find(t => t.name === bookmarkCurrentTheme.value);
    const bgColor = theme ? theme.bgColor : 'linear-gradient(180deg, #FBF0D9 0%, #F5E6C8 100%)';
    
    ElMessage.info('正在生成图片...');
    
    const canvas = await html2canvas(cardRef, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: null, // 渐变背景不能使用backgroundColor
      onclone: (clonedDoc) => {
        // 确保克隆的文档中样式正确应用
        const clonedCard = clonedDoc.querySelector('.bookmark-card');
        if (clonedCard) {
          clonedCard.style.background = bgColor;
        }
      }
    });
    
    return canvas;
  } catch (err) {
    console.error('生成书摘失败:', err);
    ElMessage.error('生成书摘失败，请重试');
    generatingBookmark.value = false;
    return null;
  }
};

/**
 * 导出书摘
 */
const handleExportBookmark = async () => {
  try {
    // 再次检查选中的文本（移动端可能选择状态丢失）
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      selectedText.value = selection.toString().trim();
    }
    
    if (!selectedText.value) {
      ElMessage.warning('请先选中要导出的文本');
      return;
    }
    
    // 检测是否为移动设备（使用统一的判断逻辑）
    const isMobileDeviceValue = isMobileDevice.value;
    
    console.log('导出书摘 - 设备检测:', { isMobileDevice: isMobileDeviceValue, isMobile: isMobile.value, selectedText: selectedText.value });
    
    if (isMobileDeviceValue) {
      // 移动端：直接生成图片并显示预览对话框
      // 等待 DOM 更新，确保隐藏的书摘卡片已渲染
      await nextTick();
      
      // 再次等待，确保隐藏卡片完全渲染
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // 检查隐藏卡片是否存在
      if (!hiddenBookmarkCardRef.value) {
        console.error('隐藏卡片不存在', { isMobile: isMobile.value, detectMobile: detectMobile() });
        ElMessage.error('书摘卡片未准备好，请重试');
        return;
      }
      
      console.log('开始生成图片...');
      
      // 生成图片
      const canvas = await generateBookmarkImage();
      
      if (canvas) {
        // 移动端：显示图片预览对话框
        generatedBookmarkImageUrl.value = canvas.toDataURL('image/png', 1.0);
        bookmarkImagePreviewVisible.value = true;
        generatingBookmark.value = false;
        console.log('图片生成成功，显示预览对话框');
      } else {
        console.error('生成图片失败，canvas 为 null');
        ElMessage.error('生成图片失败，请重试');
        generatingBookmark.value = false;
      }
    } else {
      // 桌面端：显示书摘设置对话框
      bookmarkDialogVisible.value = true;
    }
  } catch (error) {
    console.error('导出书摘出错:', error);
    ElMessage.error('导出书摘时发生错误：' + (error.message || '未知错误'));
    generatingBookmark.value = false;
  }
};

/**
 * 切换书摘主题
 * @param {number} direction - 1: 下一个主题, -1: 上一个主题
 */
const switchBookmarkTheme = (direction) => {
  const currentIndex = bookmarkThemes.findIndex(t => t.name === bookmarkCurrentTheme.value);
  let newIndex = currentIndex + direction;
  
  // 循环切换
  if (newIndex < 0) {
    newIndex = bookmarkThemes.length - 1;
  } else if (newIndex >= bookmarkThemes.length) {
    newIndex = 0;
  }
  
  bookmarkCurrentTheme.value = bookmarkThemes[newIndex].name;
};

/**
 * 检测是否为移动设备
 */
const detectMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// 计算属性：判断是否为移动设备（用于隐藏卡片渲染）
const isMobileDevice = computed(() => {
  return detectMobile() || isMobile.value;
});

/**
 * 复制书摘图片到剪贴板（桌面端使用）
 */
const copyBookmarkToClipboard = async () => {
  try {
    // 生成图片
    const canvas = await generateBookmarkImage();
    
    if (!canvas) {
      return;
    }
    
    // 桌面端：尝试复制到剪贴板
    const isMobileDeviceValue = isMobileDevice.value;
    
    if (!isMobileDeviceValue) {
      // 桌面端：尝试复制到剪贴板
      canvas.toBlob(async (blob) => {
        if (!blob) {
          ElMessage.error('生成图片失败，请重试');
          generatingBookmark.value = false;
          return;
        }
        
        try {
          // 使用 Clipboard API 复制到剪贴板
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob
            })
          ]);
          
          ElMessage.success({
            message: '书摘图片已复制到剪贴板，可直接粘贴使用',
            duration: 3000
          });
          
          // 延迟关闭对话框，让用户看到成功提示
          setTimeout(() => {
            bookmarkDialogVisible.value = false;
          }, 500);
        } catch (clipboardErr) {
          // 如果 Clipboard API 不支持，尝试降级方案
          console.warn('Clipboard API 不支持，使用降级方案:', clipboardErr);
          
          // 降级方案：创建临时链接下载
          const imgData = canvas.toDataURL('image/png', 1.0);
          const link = document.createElement('a');
          link.download = `书摘-${articleTitle.value}-${new Date().getTime()}.png`;
          link.href = imgData;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          ElMessage.info({
            message: '已下载书摘图片（浏览器不支持直接复制到剪贴板）',
            duration: 3000
          });
          
          setTimeout(() => {
            bookmarkDialogVisible.value = false;
          }, 500);
        } finally {
          generatingBookmark.value = false;
        }
      }, 'image/png', 1.0);
    }
  } catch (err) {
    console.error('生成书摘失败:', err);
    ElMessage.error('生成书摘失败，请重试');
    generatingBookmark.value = false;
  }
};

/**
 * 从预览对话框复制图片到剪贴板（移动端）
 */
const copyBookmarkImageFromPreview = async (event) => {
  // 阻止事件冒泡，防止触发其他逻辑
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  
  if (!generatedBookmarkImageUrl.value) {
    ElMessage.warning('图片未准备好');
    return;
  }
  
  // 如果正在生成中，直接返回，避免重复调用
  if (generatingBookmark.value) {
    return;
  }
  
  generatingBookmark.value = true;
  
  try {
    // 将 base64 数据 URL 转换为 Blob
    const response = await fetch(generatedBookmarkImageUrl.value);
    const blob = await response.blob();
    
    try {
      // 使用 Clipboard API 复制到剪贴板
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob
        })
      ]);
      
      ElMessage.success({
        message: '书摘图片已复制到剪贴板',
        duration: 2000
      });
    } catch (clipboardErr) {
      // 如果 Clipboard API 不支持，提示用户手动保存
      console.warn('Clipboard API 不支持:', clipboardErr);
      ElMessage.info('请长按图片进行保存或复制');
    }
  } catch (err) {
    console.error('复制图片失败:', err);
    ElMessage.error('复制失败，请长按图片进行保存');
  } finally {
    generatingBookmark.value = false;
  }
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

// 获取导航按钮的背景样式（与主题背景色相同）
const navButtonStyle = computed(() => {
  return currentBgStyle.value;
});

// 判断是否为深色主题
const isDarkTheme = computed(() => currentTheme.value === 'dark' || currentTheme.value === 'dark-gradient');

// 获取当前日期
const currentDate = computed(() => {
  const now = new Date();
  const day = now.getDate();
  const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 
                   'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const month = months[now.getMonth()];
  const year = now.getFullYear();
  const weekday = weekdays[now.getDay()];
  
  return {
    day: day.toString(),
    monthYear: `${month} ${year}`,
    weekday: weekday
  };
});

// 书摘卡片样式
const bookmarkCardStyle = computed(() => {
  const theme = bookmarkThemes.find(t => t.name === bookmarkCurrentTheme.value);
  if (!theme) return { background: 'linear-gradient(180deg, #FBF0D9 0%, #F5E6C8 100%)' };
  return {
    background: theme.bgColor
  };
});

// 书摘文字颜色
const bookmarkTextColor = computed(() => {
  const theme = bookmarkThemes.find(t => t.name === bookmarkCurrentTheme.value);
  return theme ? theme.textColor : '#2c3e50';
});

// 书摘字体
const bookmarkFontFamily = computed(() => {
  if (bookmarkCurrentFont.value === 'default') {
    return 'PingFang SC, -apple-system, BlinkMacSystemFont, Microsoft YaHei, sans-serif';
  }
  const font = bookmarkFontOptions.find(f => f.value === bookmarkCurrentFont.value);
  return font ? font.value : 'PingFang SC, -apple-system, BlinkMacSystemFont, Microsoft YaHei, sans-serif';
});

// 获取书摘主题预览样式
const getBookmarkPreviewStyle = (theme) => {
  return {
    background: theme.bgColor
  };
};

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
      currentBgStyleObject.value = { background: theme.bgColor };
    } else {
      currentBgStyle.value = `background-color: ${theme.bgColor}`;
      currentBgStyleObject.value = { backgroundColor: theme.bgColor };
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
    currentBgStyleObject.value = { backgroundColor: '#ffffff' };
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
 * 初始化书摘主题
 */
const initBookmarkTheme = () => {
  const savedTheme = localStorage.getItem('bookmarkTheme');
  if (savedTheme && bookmarkThemes.find(t => t.name === savedTheme)) {
    bookmarkCurrentTheme.value = savedTheme;
  } else {
    // 默认使用深蓝渐变主题
    bookmarkCurrentTheme.value = 'dark-blue-gradient';
  }
};

/**
 * 初始化书摘字体
 */
const initBookmarkFont = () => {
  const savedFont = localStorage.getItem('bookmarkFont');
  if (savedFont && bookmarkFontOptions.find(f => f.value === savedFont)) {
    bookmarkCurrentFont.value = savedFont;
  } else {
    // 默认使用兰亭黑
    bookmarkCurrentFont.value = '"Lantinghei SC", "Lantinghei TC", "Microsoft YaHei", "PingFang SC", sans-serif';
  }
};

// 监听书摘主题变化，保存到 localStorage
watch(bookmarkCurrentTheme, (newTheme) => {
  localStorage.setItem('bookmarkTheme', newTheme);
});

// 监听书摘字体变化，保存到 localStorage
watch(bookmarkCurrentFont, (newFont) => {
  localStorage.setItem('bookmarkFont', newFont);
});

// 监听路由变化，重新加载文章
watch(
  () => [route.query.id, route.query.source],
  ([newId, newSource], [oldId, oldSource]) => {
    if (newId && (newId !== oldId || newSource !== oldSource)) {
      loadArticle();
    }
  }
);

/**
 * 键盘事件处理函数
 */
const handleBookmarkKeyboard = (event) => {
  // 只在对话框打开时处理键盘事件
  if (!bookmarkDialogVisible.value) return;
  
  // 左箭头键：切换到上一个主题
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    switchBookmarkTheme(-1);
  }
  // 右箭头键：切换到下一个主题
  else if (event.key === 'ArrowRight') {
    event.preventDefault();
    switchBookmarkTheme(1);
  }
};

// 监听书摘对话框的显示状态，添加/移除键盘事件监听
watch(bookmarkDialogVisible, (isVisible) => {
  if (isVisible) {
    // 对话框打开时，添加键盘事件监听
    window.addEventListener('keydown', handleBookmarkKeyboard);
  } else {
    // 对话框关闭时，移除键盘事件监听
    window.removeEventListener('keydown', handleBookmarkKeyboard);
  }
});

// 组件卸载时确保移除事件监听
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleBookmarkKeyboard);
});

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

// 窗口大小变化处理函数
const handleResize = () => {
  isMobile.value = window.innerWidth <= 768;
};

onMounted(() => {
  document.querySelector('body').setAttribute('style', 'background: #EBEDF0');
  // 检测移动端
  isMobile.value = window.innerWidth <= 768;
  // 移动端设置默认字体大小为16px
  if (isMobile.value) {
    const html = document.documentElement;
    html.style.fontSize = '16px';
  }
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize);
  
  initTheme();
  initFontSize();
  initFont();
  initBookmarkTheme();
  initBookmarkFont();
  loadArticle();
  
  // 等待内容区域加载后添加滚动监听
  nextTick(() => {
    if (contentArea.value && !contentArea.value.hasAttribute('data-scroll-listener')) {
      contentArea.value.addEventListener('scroll', handleScroll);
      contentArea.value.setAttribute('data-scroll-listener', 'true');
      // 初始化工具栏位置
      updateToolbarPosition();
      
      // 确保内容加载后底部内容可见
      // 使用 requestAnimationFrame 确保 DOM 完全渲染
      requestAnimationFrame(() => {
        if (contentArea.value) {
          const scrollHeight = contentArea.value.scrollHeight;
          const clientHeight = contentArea.value.clientHeight;
          // 如果内容高度大于容器高度，确保可以滚动到底部看到所有内容
          if (scrollHeight > clientHeight) {
            // 触发一次布局重新计算
            void contentArea.value.offsetHeight;
            // 确保滚动到底部时能看到所有内容
            const maxScrollTop = scrollHeight - clientHeight;
            // 不自动滚动，只是确保可以滚动到底部
          }
        }
      });
    }
  });
  
  // 添加全局选择变化监听（用于移动端和桌面端）
  document.addEventListener('selectionchange', handleSelectionChange);
});

// 组件卸载时移除滚动监听和窗口大小监听
onBeforeUnmount(() => {
  if (contentArea.value) {
    contentArea.value.removeEventListener('scroll', handleScroll);
    contentArea.value.removeAttribute('data-scroll-listener');
  }
  // 清除滚动定时器
  if (scrollTimer) {
    clearTimeout(scrollTimer);
  }
  // 移除窗口大小监听
  window.removeEventListener('resize', handleResize);
  // 移除选择变化监听
  document.removeEventListener('selectionchange', handleSelectionChange);
});
</script>

<style scoped>
/* 重置全局样式对底部边距的影响 */
:deep(body),
:deep(html),
:deep(#app) {
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
}

.article-detail {
  min-height: 100vh;
  background: #EBEDF0;
  overflow-x: hidden;
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
}

.detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 20px 0 20px !important;
  overflow-x: hidden;
  margin-bottom: 0 !important;
  height: 100vh;
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
  overflow-x: hidden;
  position: relative;
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
  height: 100vh;
}

.toolbar-toggle {
  display: flex;
  align-items: center;
}

.toolbar-right {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  padding: 0;
  background: transparent;
  position: absolute;
  right: 20px;
  transform: translateY(-50%);
  z-index: 100;
  transition: top 0.2s ease, right 0.3s ease, transform 0.3s ease, opacity 0.3s ease, visibility 0.3s ease;
  opacity: 1;
  visibility: visible;
}

.toolbar-right > * {
  margin-left: 0 !important;
  margin-right: auto !important;
  align-self: flex-start;
}

.toolbar-right.toolbar-hidden {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  /* 不使用 translateX，避免产生横向滚动条 */
  /* 使用 right 负值来隐藏，但保持在容器内 */
  right: -100px;
  transform: translateY(-50%);
}

.article-title-bar {
  padding: 15px 20px;
  border-bottom: 1px solid #e4e7ed;
  background: #f5f7fa;
  position: sticky;
  top: 0;
  z-index: 99;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.article-title-text {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  text-align: left;
  flex: 1;
  margin: 0;
}

.font-size-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.settings-panel {
  max-height: 600px;
  overflow-y: auto;
  padding-right: 4px;
}

.settings-panel::-webkit-scrollbar {
  width: 6px;
}

.settings-panel::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.settings-panel::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.settings-panel::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
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
  padding: 40px 40px 0 40px !important;
  height: 90vh;
  max-height: 90vh;
  overflow-y: auto;
  overflow-x: hidden;
  background: #ffffff;
  transition: background-color 0.3s ease, padding-bottom 0.3s ease, height 0.3s ease;
  overscroll-behavior-y: none;
  position: relative;
  margin: 0 !important;
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
  box-sizing: border-box;
  min-height: 0;
}

/* 确保 content-area 内部所有元素没有底部边距 */
.content-area > * {
  margin-bottom: 0 !important;
}

.content-area > *:last-child {
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
}

/* 确保 content-area 本身没有额外的底部空间 */
.content-area::after {
  content: '';
  display: none;
  height: 0;
  margin: 0;
  padding: 0;
}

.content-area.scrolling {
  padding-bottom: 0 !important;
}

.content-area.toolbar-hidden {
  height: 100vh;
  padding-bottom: 0 !important;
}

.content-area.scrolling.toolbar-hidden {
  padding-bottom: 0 !important;
}

.markdown-content {
  max-width: 800px;
  margin: 0 auto;
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
  line-height: 1.8;
  color: #2c3e50;
  word-wrap: break-word;
  overflow-wrap: break-word;
  transition: font-size 0.2s ease;
}

.article-navigation {
  max-width: 800px;
  margin: 10px auto 0 auto !important;
  padding: 10px 20px 0 20px !important;
  border-top: 1px solid #e4e7ed;
  display: flex;
  justify-content: center;
  gap: 20px;
  transition: margin-bottom 0.3s ease, padding-bottom 0.3s ease;
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
}

.article-navigation.scrolling {
  margin-bottom: 0;
  padding-bottom: 0;
}

.content-area.toolbar-hidden .article-navigation {
  margin-bottom: 0;
  padding-bottom: 0;
}

.content-area.toolbar-hidden.scrolling .article-navigation {
  margin-bottom: 0;
  padding-bottom: 0;
}

.footer-quote {
  max-width: 800px;
  margin: 60px auto 0 auto !important;
  padding: 0 !important;
  text-align: center;
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
  height: auto;
  min-height: auto;
}

.footer-quote p {
  margin: 0 !important;
  padding: 0 !important;
  font-size: 16px;
  color: #909399;
  font-style: italic;
  line-height: 1.6;
}

.content-area.scrolling .footer-quote {
  margin-top: 5px !important;
  margin-bottom: 0 !important;
  padding: 0 !important;
}

.content-area.toolbar-hidden .footer-quote {
  margin-top: 5px !important;
  margin-bottom: 0 !important;
  padding: 0 !important;
}

.content-area.toolbar-hidden.scrolling .footer-quote {
  margin-top: 3px !important;
  margin-bottom: 0 !important;
  padding: 0 !important;
}

.footer-quote-bottom {
  align-items: center;
  justify-content: center;
  margin-top: 30px;
  margin-bottom: 30px;
  padding: 0;
  font-size: 16px;
  color: #909399;
  font-style: italic;
  line-height: 1.6;
  text-align: center;
}

/* 深色主题下的底部文本 */
.footer-quote.dark-theme-quote p {
  color: rgba(255, 255, 255, 0.7);
  margin-top: 30px;
}

.nav-button {
  width: 280px;
  padding: 16px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.nav-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: rgba(0, 0, 0, 0.25);
}

/* 深色主题下的按钮边框 */
.article-navigation.dark-theme-nav .nav-button {
  border-color: rgba(255, 255, 255, 0.2);
}

.article-navigation.dark-theme-nav .nav-button:hover {
  border-color: rgba(255, 255, 255, 0.35);
}

.nav-button.prev-article {
  text-align: left;
}

.nav-button.next-article {
  text-align: right;
}

.nav-label {
  font-size: 14px;
  color: #909399;
  font-weight: 500;
}

.nav-title {
  font-size: 16px;
  color: #409eff;
  font-weight: 600;
  line-height: 1.5;
}

.nav-button:hover .nav-title {
  color: #66b1ff;
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

/* 书摘相关样式 */
/* 书摘对话框半透明背景 */
:deep(.el-dialog) {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

:deep(.el-dialog__body) {
  background: transparent;
}

.bookmark-preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: rgba(245, 245, 245, 0.3);
}

/* 隐藏的书摘卡片容器（移动端用于生成图片） */
.hidden-bookmark-card-container {
  position: absolute;
  left: -9999px;
  top: -9999px;
  width: 500px;
  height: 400px;
  overflow: hidden;
  visibility: hidden;
  pointer-events: none;
}

.hidden-bookmark-card {
  width: 500px;
  min-height: 400px;
  background: #FBF0D9;
  padding: 60px 50px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}

.bookmark-card {
  width: 500px;
  min-height: 400px;
  background: #FBF0D9;
  padding: 60px 50px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}

.bookmark-theme-nav {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  pointer-events: none;
  z-index: 10;
}

.theme-nav-btn {
  pointer-events: auto;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.theme-nav-btn:hover {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transform: scale(1.1);
}

.theme-nav-left {
  margin-left: -30px;
}

.theme-nav-right {
  margin-right: -30px;
}

.copy-button {
  width: auto;
  min-width: 120px;
  margin: 0 auto;
  display: block;
}

.bookmark-font-setting {
  margin-top: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.bookmark-font-setting .setting-label {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  text-align: left;
}

.bookmark-font-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  align-items: stretch;
  width: 100%;
  margin: 0;
  padding: 0;
}

.bookmark-font-buttons .font-button {
  font-size: 13px;
  transition: all 0.3s ease;
  width: 100% !important;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 8px;
  margin: 0 !important;
  box-sizing: border-box;
  flex: 1;
}

.bookmark-font-buttons .font-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.bookmark-date-section {
  text-align: center;
  margin-bottom: 40px;
}

.bookmark-day {
  font-size: 100px;
  font-weight: 900;
  color: #2c3e50;
  line-height: 1;
  margin-bottom: 10px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
}

.bookmark-month-year {
  font-size: 22px;
  font-weight: 600;
  color: #2c3e50;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 8px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
}

.bookmark-weekday {
  font-size: 18px;
  font-weight: 400;
  color: #606266;
  margin-bottom: 20px;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.bookmark-separator {
  width: 40px;
  height: 2px;
  background: #606266;
  margin: 0 auto;
}

.bookmark-quote-section {
  flex: 1;
  display: flex;
  align-items: center;
  margin: 40px 0;
}

.bookmark-quote-text {
  font-size: 20px;
  line-height: 2.0;
  color: #2c3e50;
  text-align: left;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.bookmark-source-section {
  text-align: center;
  margin-top: 40px;
}

.bookmark-book-title {
  font-size: 18px;
  font-weight: 400;
  color: #606266;
  margin-bottom: 8px;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.bookmark-author {
  font-size: 18px;
  font-weight: 400;
  color: #606266;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding-top: 10px;
}

.dialog-footer .el-button {
  font-weight: 500;
}

.dialog-footer .el-button--primary {
  flex: none;
}

.dialog-footer .el-button--primary {
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
  transition: all 0.3s ease;
}

.dialog-footer .el-button--primary:hover {
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  transform: translateY(-1px);
}

.dialog-footer .el-button--primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.2);
}

.bookmark-template-content {
  margin-top: 20px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bookmark-settings {
  margin-top: 0;
}

.bookmark-setting-item {
  margin-bottom: 20px;
}

.bookmark-setting-item:last-child {
  margin-bottom: 0;
}

.setting-label {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.bookmark-theme-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.bookmark-theme-option {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.bookmark-theme-option:hover {
  background-color: #f5f7fa;
}

.bookmark-theme-option.active {
  background-color: #e6f7ff;
}

.bookmark-theme-preview {
  width: 30px;
  height: 30px;
  border-radius: 4px;
  border: 2px solid #e4e7ed;
  flex-shrink: 0;
}

.bookmark-theme-option.active .bookmark-theme-preview {
  border-color: #409eff;
}

/* 响应式设计 */
/* 设置对话框移动端样式 */
:deep(.settings-popover) {
  max-width: 90vw !important;
}

@media (max-width: 768px) {
  :deep(.settings-popover) {
    width: 90vw !important;
    max-width: 90vw !important;
  }
  
  .detail-container {
    padding: 10px 10px 0 10px;
    margin-bottom: 0;
  }
  
  .content-area {
    padding: 20px 20px 0 20px !important;
    margin-bottom: 0 !important;
    padding-bottom: 0 !important;
  }
  
  .article-navigation {
    flex-direction: column;
    margin-top: 20px;
    margin-bottom: 0;
    padding: 12px 15px 3px 15px;
    gap: 15px;
  }
  
  .nav-button {
    width: calc(100% - 30px);
    max-width: 100%;
    padding: 14px 16px;
  }
  
  .nav-button.next-article {
    text-align: left;
  }
  
  .toolbar-toggle {
    top: 80px;
    right: 10px;
  }
  
  .toolbar-right {
    top: 50px;
    right: 10px;
    padding: 0;
    gap: 8px;
  }
  
  
  .article-title-bar {
    padding: 12px 15px;
  }
  
  .article-title-text {
    font-size: 16px;
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
  
  /* 书摘对话框移动端样式 */
  :deep(.el-dialog) {
    width: 95% !important;
    max-width: 95% !important;
    margin: 0 auto !important;
  }
  
  :deep(.el-dialog__body) {
    padding: 15px !important;
    max-height: 70vh;
    overflow-y: auto;
  }
  
  .bookmark-preview-container {
    padding: 10px;
    background: rgba(245, 245, 245, 0.3);
  }
  
  .bookmark-card {
    width: 100%;
    min-height: 300px;
    padding: 30px 20px;
  }
  
  .bookmark-day {
    font-size: 60px;
    margin-bottom: 8px;
  }
  
  .bookmark-month-year {
    font-size: 16px;
    margin-bottom: 6px;
  }
  
  .bookmark-weekday {
    font-size: 14px;
    margin-bottom: 15px;
  }
  
  .bookmark-separator {
    width: 30px;
    margin-bottom: 20px;
  }
  
  .bookmark-quote-section {
    margin: 20px 0;
  }
  
  .bookmark-quote-text {
    font-size: 16px;
    line-height: 1.8;
  }
  
  .bookmark-source-section {
    margin-top: 20px;
  }
  
  .bookmark-book-title {
    font-size: 16px;
    margin-bottom: 6px;
  }
  
  .bookmark-author {
    font-size: 14px;
  }
  
  .bookmark-font-setting {
    margin-top: 15px;
    padding: 12px;
  }
  
  .bookmark-font-setting .setting-label {
    font-size: 13px;
    margin-bottom: 10px;
  }
  
  .bookmark-font-buttons {
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
  }
  
  .bookmark-font-buttons .font-button {
    font-size: 12px;
    min-height: 32px;
    padding: 8px 6px;
  }
  
  .theme-nav-left {
    margin-left: -20px;
  }
  
  .theme-nav-right {
    margin-right: -20px;
  }
  
  .bookmark-image-preview-dialog {
    :deep(.el-dialog) {
      width: 90% !important;
      max-width: 90% !important;
    }
  }
  
  .bookmark-preview-image {
    max-width: 100%;
    height: auto;
  }
}

/* 移动端图片预览样式 */
.bookmark-image-preview-container {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: flex-start !important;
  padding: 20px !important;
  background: #f5f5f5 !important;
  border-radius: 8px !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

.bookmark-preview-image {
  max-width: 100% !important;
  width: auto !important;
  height: auto !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  user-select: none !important;
  -webkit-user-select: none !important;
  -webkit-touch-callout: default !important;
  display: block !important;
  margin: 0 auto !important;
  order: 1 !important;
}

/* 按钮容器 - 在图片下方，提示文字上方 */
.bookmark-button-container {
  display: flex !important;
  justify-content: flex-end !important;
  align-items: center !important;
  width: 100% !important;
  margin-top: 15px !important;
  margin-bottom: 10px !important;
  padding: 0 !important;
  order: 2 !important;
  flex-shrink: 0 !important;
}

/* 复制按钮样式 */
.bookmark-button-container :deep(.bookmark-copy-button),
.bookmark-copy-button {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
  transition: all 0.3s ease !important;
  margin-left: auto !important;
  margin-right: 0 !important;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}

.bookmark-button-container :deep(.bookmark-copy-button:hover),
.bookmark-copy-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4) !important;
}

.bookmark-button-container :deep(.bookmark-copy-button:active),
.bookmark-copy-button:active {
  transform: translateY(0);
}

.bookmark-preview-tip {
  margin-top: 10px !important;
  margin-bottom: 0 !important;
  font-size: 14px !important;
  color: #909399 !important;
  text-align: center !important;
  line-height: 1.6 !important;
  width: 100% !important;
  order: 3 !important;
  flex-shrink: 0 !important;
}

@media (max-width: 768px) {
  .bookmark-image-preview-container {
    padding: 15px !important;
  }
  
  .bookmark-button-container {
    margin-top: 12px !important;
    margin-bottom: 8px !important;
  }
  
  .bookmark-preview-tip {
    font-size: 13px !important;
    margin-top: 8px !important;
  }
}
</style>