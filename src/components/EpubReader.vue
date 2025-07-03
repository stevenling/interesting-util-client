<template>
  <div class="epub-reader">
    <TopMenu></TopMenu>
    
    <div class="reader-container">
      <!-- 文件上传区域 -->
      <div v-if="!book" class="upload-section">
        <div class="upload-card">
          <h2>EPUB 在线阅读器</h2>
          <p>上传您的EPUB文件开始阅读</p>
          
          <el-upload
            class="upload-area"
            drag
            accept=".epub"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileChange"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                只能上传 epub 文件
              </div>
            </template>
          </el-upload>
        </div>
      </div>

      <!-- 阅读器区域 -->
      <div v-else class="reading-section">
        <!-- 主要内容区域 -->
        <div class="content-area">
          <!-- 目录侧边栏 -->
          <div v-if="showToc" class="toc-sidebar">
            <h4>目录</h4>
            <div class="toc-list">
              <div
                v-for="(item, index) in toc"
                :key="index"
                class="toc-item"
                :class="{ active: currentChapter === item.href }"
                @click="goToChapter(item.href)"
              >
                {{ item.label }}
              </div>
            </div>
          </div>

          <!-- 设置侧边栏 -->
          <div v-if="showSettings" class="settings-sidebar">
            <h4>阅读设置</h4>
            
            <!-- 字体设置 -->
            <div class="setting-group">
              <label>字体：</label>
              <el-select v-model="fontFamily" @change="updateFontFamily" size="small">
                <el-option
                  v-for="font in fontOptions"
                  :key="font.value"
                  :label="font.label"
                  :value="font.value"
                />
              </el-select>
            </div>
            
            <!-- 字体大小设置 -->
            <div class="setting-group">
              <label>字体大小：</label>
              <div class="font-size-controls">
                <el-button @click="decreaseFontSize" size="small">A-</el-button>
                <span class="font-size-display">{{ fontSize }}px</span>
                <el-button @click="increaseFontSize" size="small">A+</el-button>
              </div>
            </div>
            
            <!-- 背景设置 -->
            <div class="setting-group">
              <label>背景：</label>
              <el-select v-model="backgroundColor" @change="updateBackground" size="small">
                <el-option
                  v-for="bg in backgroundOptions"
                  :key="bg.value"
                  :label="bg.label"
                  :value="bg.value"
                />
              </el-select>
            </div>
          </div>

          <!-- 阅读区域 -->
          <div class="reader-view" ref="readerView">
            <div ref="viewerElement" class="epub-viewer"></div>
            
            <!-- 选中文字tooltip面板 -->
            <div v-if="selectedText" class="tooltip-panel" :style="tooltipStyle">
              <div class="tooltip-content">
                <el-button @click="clearSelection" size="small" class="tooltip-close-btn" circle plain>
                  <el-icon><close /></el-icon>
                </el-button>
                <div class="selected-text-preview">{{ selectedText }}</div>
                <div class="tooltip-actions">
                  <el-button @click="addHighlight" type="primary" size="small">
                    <el-icon><edit /></el-icon>
                    添加划线
                  </el-button>
                  <el-button @click="exportSelectedText" type="success" size="small">
                    <el-icon><picture /></el-icon>
                    导出图片
                  </el-button>
                </div>
              </div>
              <div class="tooltip-arrow"></div>
            </div>
          </div>

          <!-- 右侧工具栏 -->
          <div class="right-toolbar">
            <!-- 书籍信息 -->
            <div class="book-info">
              <h3>{{ bookTitle }}</h3>
              <p v-if="bookAuthor">作者: {{ bookAuthor }}</p>
            </div>
            
            <!-- 页码信息 -->
            <div class="page-info">
              <span>{{ currentPage }} / {{ totalPages }}</span>
            </div>
            
            <!-- 控制按钮 -->
            <div class="controls">
              <el-button @click="prevPage" :disabled="currentPage <= 1" size="small">
                <el-icon><arrow-left /></el-icon>
                上一页
              </el-button>
              
              <el-button @click="nextPage" :disabled="currentPage >= totalPages" size="small">
                下一页
                <el-icon><arrow-right /></el-icon>
              </el-button>
              
              <el-button @click="showToc = !showToc" size="small">
                <el-icon><menu /></el-icon>
                目录
              </el-button>
              
              <el-button @click="showSettings = !showSettings" size="small">
                <el-icon><setting /></el-icon>
                设置
              </el-button>
              
              <el-button @click="showHighlightPanel = !showHighlightPanel" size="small">
                <el-icon><edit /></el-icon>
                划线
              </el-button>
              
              <el-button @click="resetReader" size="small">
                <el-icon><refresh /></el-icon>
                重新上传
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="showExportImageDialog" title="图片预览" width="480px" center>
      <div style="display: flex;">
        <!-- 图片预览区 -->
        <div style="flex: 1; min-width: 0; display: flex; align-items: center; justify-content: center;">
          <div style="height: 700px; overflow-y: auto; width: 100%; display: flex; align-items: center; justify-content: center;">
            <img
              :src="exportImageUrl"
              style="width: 420px; height: auto; border-radius: 8px; user-select: auto; cursor: pointer;"
              alt="导出图片预览"
              draggable="true"
            />
          </div>
        </div>
        <!-- 设置面板 -->
        <div style="width: 100px; margin-left: 12px; display: flex; flex-direction: column; gap: 12px; height: 100%; box-sizing: border-box;">
          <el-select v-model="exportFont" placeholder="字体" size="small">
            <el-option v-for="font in fontOptions" :key="font.value" :label="font.label" :value="font.value" />
          </el-select>
          <div style="display: flex; align-items: center; gap: 4px;">
            <el-button @click="exportFontSize = Math.max(12, exportFontSize - 2); generateExportPreview();" size="small">A-</el-button>
            <span style="min-width: 32px; text-align: center;">{{ exportFontSize }}px</span>
            <el-button @click="exportFontSize = Math.min(36, exportFontSize + 2); generateExportPreview();" size="small">A+</el-button>
          </div>
          <el-select v-model="exportBg" placeholder="背景" size="small">
            <el-option v-for="bg in backgroundOptions" :key="bg.value" :label="bg.label" :value="bg.value" />
          </el-select>
          <el-color-picker v-model="exportFontColor" size="small" />
        </div>
      </div>
      <template #footer>
        <el-button @click="showExportImageDialog = false">关闭</el-button>
        <el-button type="primary" @click="downloadExportImage">下载图片</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onUnmounted, nextTick, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled, ArrowLeft, ArrowRight, Refresh, Setting, Edit, Picture, Close } from '@element-plus/icons-vue'
import TopMenu from './TopMenu.vue'

// 响应式数据
const book = ref(null)
const bookTitle = ref('')
const bookAuthor = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const currentChapter = ref('')
const showToc = ref(false)
const toc = ref([])
const readerView = ref(null)
const viewerElement = ref(null)

// 新增的阅读设置
const fontSize = ref(16)
const fontFamily = ref('Arial')
const backgroundColor = ref('#ffffff')
const showSettings = ref(false)

// 划线功能相关
const highlights = ref([])
const showHighlightPanel = ref(false)
const selectedText = ref('')
const highlightColor = ref('#ffeb3b')
const currentCfiRange = ref('')
const mousePositionX = ref(0)
const mousePositionY = ref(0)

// 浮动面板相关
const tooltipStyle = ref({
  left: '0px',
  top: '0px',
  position: 'absolute'
})

// 背景选项
const backgroundOptions = [
  { label: '白色', value: '#ffffff' },
  { label: '米色', value: '#f5f5dc' },
  { label: '浅灰', value: '#f8f8f8' },
  { label: '浅黄', value: '#fefefe' },
  { label: '护眼绿', value: '#c7edcc' },
  { label: '夜间模式', value: '#2c2c2c' },
  { label: '浅蓝', value: '#eaf4ff' },
  { label: '浅粉', value: '#fff0f6' },
  { label: '浅紫', value: '#f3e8ff' },
  { label: '暗夜蓝', value: '#232946' },
  { label: '暖米黄', value: '#fdf6e3' },
  { label: '暖灰', value: '#ececec' },
  { label: '蓝紫渐变', value: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)' }
]

// 背景色与字体色适配
const backgroundTextColorMap = {
  '#ffffff': '#222',
  '#f5f5dc': '#222',
  '#f8f8f8': '#222',
  '#fefefe': '#222',
  '#c7edcc': '#222',
  '#eaf4ff': '#222',
  '#fff0f6': '#8e4a6b',
  '#f3e8ff': '#6b4a8e',
  '#ececec': '#222',
  '#fdf6e3': '#6b4e16',
  '#2c2c2c': '#fff',
  '#232946': '#fff',
  'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)': '#222'
};
const computedTextColor = computed(() => backgroundTextColorMap[backgroundColor.value] || '#222');

let rendition = null
let bookData = null

const MAX_EPUB_SIZE = 4.5 * 1024 * 1024; // 约4.5MB，留出base64膨胀空间

// 新增用于导出图片的文本
const selectedTextForExport = ref('');
const exportFontSize = ref(fontSize.value);

// 安全的 ArrayBuffer 转 base64 工具函数
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// 自动加载本地存储的epub书籍
const loadBookFromLocal = () => {
  const base64 = localStorage.getItem('epub-book-base64');
  if (base64) {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    loadBook(bytes.buffer);
  }
};

onMounted(() => {
  loadBookFromLocal();
});

// 处理文件上传
const handleFileChange = (file) => {
  if (file.raw.type !== 'application/epub+zip' && !file.raw.name.endsWith('.epub')) {
    ElMessage.error('请上传有效的EPUB文件')
    return
  }
  if (file.raw.size > MAX_EPUB_SIZE) {
    ElMessage.error('文件过大，无法自动保存到本地。请上传小于4.5MB的EPUB文件。');
    // 仍然可以正常阅读，但不存localStorage
    const reader = new FileReader();
    reader.onload = (e) => {
      loadBook(e.target.result);
    };
    reader.readAsArrayBuffer(file.raw);
    return;
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    const arrayBuffer = e.target.result;
    // 存储到 localStorage
    const base64 = arrayBufferToBase64(arrayBuffer);
    try {
      localStorage.setItem('epub-book-base64', base64);
    } catch (e) {
      ElMessage.warning('文件过大，未能保存到本地，下次需重新上传。');
    }
    loadBook(arrayBuffer);
  }
  reader.readAsArrayBuffer(file.raw)
}

// 加载EPUB书籍
const loadBook = async (arrayBuffer) => {
  try {
    console.log('开始加载EPUB文件...')
    
    // 清理之前的实例
    if (rendition) {
      rendition.destroy()
      rendition = null
    }
    
    // 动态导入epubjs
    console.log('导入epubjs...')
    const ePub = await import('epubjs')
    console.log('epubjs导入成功:', ePub)
    
    const Book = ePub.default || ePub.Book || ePub
    console.log('使用Book构造函数:', Book)
    
    console.log('创建Book实例...')
    bookData = new Book(arrayBuffer)
    console.log('Book实例创建成功')
    
    console.log('等待Book ready...')
    await bookData.ready
    console.log('Book ready完成')
    
    // 获取书籍信息
    console.log('获取书籍信息...')
    const metadata = await bookData.loaded.metadata
    bookTitle.value = metadata.title || '未知标题'
    bookAuthor.value = metadata.creator || ''
    console.log('书籍信息:', metadata)
    
    // 获取目录
    console.log('获取目录...')
    const tocData = await bookData.loaded.navigation
    toc.value = tocData.toc || []
    console.log('目录数据:', tocData)
    
    // 先设置book状态，这会触发Vue的响应式更新和DOM渲染
    console.log('设置book状态...')
    book.value = bookData
    console.log('book状态已设置:', book.value)
    
    // 等待Vue DOM更新完成，确保阅读区域被渲染
    console.log('等待DOM更新...')
    await nextTick()
    console.log('DOM更新完成')
    
    // 再次等待一下，确保DOM完全渲染
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // 检查viewer元素
    console.log('检查viewer元素:', viewerElement.value)
    console.log('viewerElement类型:', typeof viewerElement.value)
    console.log('viewerElement是否为HTMLElement:', viewerElement.value instanceof HTMLElement)
    
    if (!viewerElement.value) {
      throw new Error('Viewer element not found - DOM可能还没有完全渲染')
    }
    
    // 清空viewer元素
    viewerElement.value.innerHTML = ''
    console.log('viewer元素已清空')
    
    // 初始化渲染器
    console.log('初始化渲染器...')
    rendition = bookData.renderTo(viewerElement.value, {
      width: '100%',
      height: '100%',
      flow: 'scrolled-doc',
      manager: 'continuous'
    })
    
    // 初始化主题设置
    rendition.themes.default({
      'body': {
        'font-family': fontFamily.value,
        'font-size': `${fontSize.value}px`,
        'background-color': backgroundColor.value
      },
      'p': {
        'font-family': fontFamily.value,
        'font-size': `${fontSize.value}px`
      },
      'div': {
        'font-family': fontFamily.value,
        'font-size': `${fontSize.value}px`
      },
      'span': {
        'font-family': fontFamily.value,
        'font-size': `${fontSize.value}px`
      }
    })
    
    // 强制重新渲染
    // 注册背景主题
    rendition.themes.register('background', backgroundColor.value)
    rendition.themes.select('background', backgroundColor.value)
    
    console.log('显示内容...')
    await rendition.display()
    
    // 应用初始样式
    setTimeout(() => {
      applyStyles()
    }, 200)
    
    // 设置页面监听
    updatePageInfo()
    
    // 设置文本选择功能
    setupTextSelection()
    
    // 获取总页数
    const spine = await bookData.spine
    totalPages.value = spine.length
    
    // 初始化页码为1
    currentPage.value = 1
    console.log('初始化页码:', currentPage.value, '总页数:', totalPages.value)
    
    // 确保文本选择功能在DOM完全准备好后设置
    setTimeout(() => {
      setupTextSelection()
    }, 500)
    
    ElMessage.success('书籍加载成功！')
    
  } catch (error) {
    console.error('加载书籍失败:', error)
    console.error('错误堆栈:', error.stack)
    ElMessage.error(`加载书籍失败: ${error.message}`)
    
    // 清理失败的实例
    if (rendition) {
      rendition.destroy()
      rendition = null
    }
    bookData = null
  }
}

// 翻页功能
const prevPage = () => {
  console.log('点击上一页，当前页码:', currentPage.value)
  if (rendition && currentPage.value > 1) {
    rendition.prev()
    // 手动更新页码
    setTimeout(() => {
      currentPage.value = Math.max(1, currentPage.value - 1)
      console.log('上一页后页码:', currentPage.value)
    }, 100)
  } else {
    console.log('上一页按钮被禁用，当前页码:', currentPage.value)
  }
}

const nextPage = () => {
  console.log('点击下一页，当前页码:', currentPage.value, '总页数:', totalPages.value)
  if (rendition && currentPage.value < totalPages.value) {
    rendition.next()
    // 手动更新页码
    setTimeout(() => {
      currentPage.value = Math.min(totalPages.value, currentPage.value + 1)
      console.log('下一页后页码:', currentPage.value)
    }, 100)
  } else {
    console.log('下一页按钮被禁用，当前页码:', currentPage.value, '总页数:', totalPages.value)
  }
}

// 跳转到指定章节
const goToChapter = (href) => {
  if (rendition) {
    rendition.display(href)
    showToc.value = false
    // 重置页码为1而不是0
    currentPage.value = 1
  }
}

// 监听页面变化并更新页码
const updatePageInfo = () => {
  if (rendition) {
    rendition.on('relocated', (location) => {
      console.log('页面变化:', location)
      // 确保页码至少为1
      if (location && location.start && location.start.location) {
        const pageNum = location.start.location
        currentPage.value = pageNum > 0 ? pageNum : 1
        console.log('relocated事件更新页码为:', currentPage.value)
      } else {
        // 如果没有有效的页码信息，保持当前页码或设为1
        currentPage.value = Math.max(1, currentPage.value)
        console.log('relocated事件使用默认页码:', currentPage.value)
      }
    })
    
    // 监听翻页事件
    rendition.on('rendered', (section) => {
      console.log('页面渲染完成:', section)
      // 确保页码不为0
      if (currentPage.value <= 0) {
        currentPage.value = 1
        console.log('rendered事件修正页码为:', currentPage.value)
      }
    })
    
    // 初始化页码
    setTimeout(() => {
      if (currentPage.value <= 0) {
        currentPage.value = 1
        console.log('初始化修正页码为:', currentPage.value)
      }
    }, 200)
  }
}

// 修改 applyStyles 使字体色自动适配
const applyStyles = () => {
  if (rendition && viewerElement.value) {
    const iframe = viewerElement.value.querySelector('iframe')
    if (iframe && iframe.contentDocument) {
      const existingStyles = iframe.contentDocument.querySelectorAll('style[data-epub-reader]')
      existingStyles.forEach(style => style.remove())
      const style = iframe.contentDocument.createElement('style')
      style.setAttribute('data-epub-reader', 'true')
      style.textContent = `
        body {
          background-color: ${backgroundColor.value} !important;
          font-family: ${fontFamily.value} !important;
          font-size: ${fontSize.value}px !important;
          line-height: 1.6 !important;
          color: ${computedTextColor.value} !important;
        }
        p, div, span, h1, h2, h3, h4, h5, h6 {
          font-family: ${fontFamily.value} !important;
          font-size: ${fontSize.value}px !important;
          color: ${computedTextColor.value} !important;
        }
        * {
          font-family: ${fontFamily.value} !important;
        }
      `
      iframe.contentDocument.head.appendChild(style)
    }
  }
}

// 字体设置函数
const updateFontFamily = () => {
  if (rendition) {
    console.log('更新字体:', fontFamily.value)
    
    // 保存当前阅读位置
    const currentLocation = rendition.location
    
    // 更新主题设置
    rendition.themes.default({
      'body': {
        'font-family': fontFamily.value,
        'font-size': `${fontSize.value}px`,
        'background-color': backgroundColor.value
      },
      'p': {
        'font-family': fontFamily.value,
        'font-size': `${fontSize.value}px`
      },
      'div': {
        'font-family': fontFamily.value,
        'font-size': `${fontSize.value}px`
      },
      'span': {
        'font-family': fontFamily.value,
        'font-size': `${fontSize.value}px`
      }
    })
    
    // 强制重新渲染
    rendition.themes.select('default')
    
    // 如果有保存的位置，恢复到该位置
    if (currentLocation) {
      rendition.display(currentLocation.start.href)
    }
    
    // 应用样式
    setTimeout(() => {
      applyStyles()
    }, 100)
  }
}

const increaseFontSize = () => {
  if (fontSize.value < 24) {
    fontSize.value += 2
    console.log('增加字体大小到:', fontSize.value)
    updateFontSize()
  }
}

const decreaseFontSize = () => {
  if (fontSize.value > 12) {
    fontSize.value -= 2
    console.log('减少字体大小到:', fontSize.value)
    updateFontSize()
  }
}

const updateFontSize = () => {
  if (rendition) {
    console.log('更新字体大小:', fontSize.value)
    
    // 保存当前阅读位置
    const currentLocation = rendition.location
    
    // 更新主题设置
    rendition.themes.default({
      'body': {
        'font-family': fontFamily.value,
        'font-size': `${fontSize.value}px`,
        'background-color': backgroundColor.value
      },
      'p': {
        'font-family': fontFamily.value,
        'font-size': `${fontSize.value}px`
      },
      'div': {
        'font-family': fontFamily.value,
        'font-size': `${fontSize.value}px`
      },
      'span': {
        'font-family': fontFamily.value,
        'font-size': `${fontSize.value}px`
      }
    })
    
    // 强制重新渲染
    rendition.themes.select('default')
    
    // 如果有保存的位置，恢复到该位置
    if (currentLocation) {
      rendition.display(currentLocation.start.href)
    }
    
    // 应用样式
    setTimeout(() => {
      applyStyles()
    }, 100)
  }
}

// 背景设置函数
const updateBackground = () => {
  if (rendition) {
    console.log('更新背景:', backgroundColor.value)
    
    // 保存当前阅读位置
    const currentLocation = rendition.location
    
    // 更新主题设置
    rendition.themes.default({
      'body': {
        'font-family': fontFamily.value,
        'font-size': `${fontSize.value}px`,
        'background-color': backgroundColor.value
      },
      'p': {
        'font-family': fontFamily.value,
        'font-size': `${fontSize.value}px`
      },
      'div': {
        'font-family': fontFamily.value,
        'font-size': `${fontSize.value}px`
      },
      'span': {
        'font-family': fontFamily.value,
        'font-size': `${fontSize.value}px`
      }
    })
    
    // 强制重新渲染
    rendition.themes.select('default')
    
    // 同时更新阅读器背景
    if (viewerElement.value) {
      viewerElement.value.style.backgroundColor = backgroundColor.value
    }
    
    // 如果有保存的位置，恢复到该位置
    if (currentLocation) {
      rendition.display(currentLocation.start.href)
    }
    
    // 应用样式
    setTimeout(() => {
      applyStyles()
    }, 100)
  }
}

// 划线功能
const setupTextSelection = () => {
  console.log('设置文本选择功能')
  
  if (rendition) {
    // 使用epub.js的selected事件
    rendition.on('selected', async function (cfiRange) {
      console.log('epub.js selected事件触发:', cfiRange)
      
      try {
        // 保存当前CFI范围
        currentCfiRange.value = cfiRange
        
        // 获取选中文本
        const range = await bookData.getRange(cfiRange)
        if (range) {
          const selectedTextContent = range.toString().trim()
          console.log('选中的文本:', selectedTextContent)
          
          if (selectedTextContent) {
            selectedText.value = selectedTextContent
            showTooltipAtSelection();
          }
        }
      } catch (error) {
        console.error('获取选中文本失败:', error)
      }
    })
  }
  
  // 保留原有的全局监听作为备用
  document.addEventListener('selectionchange', () => {
    console.log('选择变化事件触发')
    const selection = window.getSelection()
    console.log('当前选择对象:', selection)
    
    if (selection && selection.toString().trim()) {
      const selectedTextContent = selection.toString().trim()
      console.log('选中的文本:', selectedTextContent)
      selectedText.value = selectedTextContent
      showTooltipAtSelection();
    }
  })
  
  // 监听鼠标事件作为备用
  document.addEventListener('mouseup', (event) => {
    console.log('鼠标抬起事件')
    
    // 更新鼠标位置
    mousePositionX.value = event.screenX
    mousePositionY.value = event.screenY
    
    setTimeout(() => {
      const selection = window.getSelection()
      if (selection && selection.toString().trim()) {
        const selectedTextContent = selection.toString().trim()
        console.log('鼠标选择文本:', selectedTextContent)
        selectedText.value = selectedTextContent
        showTooltipAtSelection();
      }
    }, 100)
  })
  
  // 添加鼠标移动监听来更新位置
  document.addEventListener('mousemove', (event) => {
    mousePositionX.value = event.screenX
    mousePositionY.value = event.screenY
  })
}

// 清除选择
const clearSelection = () => {
  selectedText.value = ''
  currentCfiRange.value = ''
  if (window.getSelection) {
    window.getSelection().removeAllRanges()
  }
}

// 修改导出图片时的字体色
const showExportImageDialog = ref(false);
const exportImageUrl = ref('');
// 导出图片自定义设置
const exportBg = ref(backgroundColor.value);
const exportFont = ref(fontFamily.value);
const exportFontColor = ref(computedTextColor.value);

const downloadExportImage = () => {
  if (exportImageUrl.value) {
    const link = document.createElement('a');
    link.download = `选中文本_${new Date().getTime()}.png`;
    link.href = exportImageUrl.value;
    link.click();
  }
};

// 监听导出对话框打开时同步主设置，并隐藏tooltip
watch(showExportImageDialog, (val) => {
  if (val) {
    exportBg.value = backgroundColor.value;
    exportFont.value = fontFamily.value;
    exportFontColor.value = computedTextColor.value;
    // 重新生成图片预览
    generateExportPreview();
  }
});

// 监听导出设置变化实时预览
watch([exportBg, exportFont, exportFontColor, exportFontSize, selectedTextForExport], () => {
  if (showExportImageDialog.value) {
    generateExportPreview();
  }
});

// 生成图片预览
const generateExportPreview = async () => {
  if (!selectedTextForExport.value) return;
  const html2canvas = await import('html2canvas');
  const scale = 3;
  const width = 420;
  const imageContainer = document.createElement('div');
  imageContainer.style.cssText = `
    position: fixed;
    top: -9999px;
    left: -9999px;
    width: ${width}px;
    height: 700px;
    padding: 2.2rem 1.5rem 1.5rem 1.5rem;
    background: linear-gradient(135deg, #f6fce9 0%, #e8f5e9 100%);
    border-radius: 18px;
    box-shadow: 0 4px 24px 0 rgba(0,0,0,0.10), 0 1.5px 4px 0 rgba(0,0,0,0.03);
    font-family: 'FZKai-Z03', '楷体', 'STKaiti', '仿宋', serif;
    font-size: ${exportFontSize.value}px;
    color: #7ca05b;
    line-height: 2.2;
    text-align: left;
    z-index: -1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    position: relative;
    box-sizing: border-box;
    overflow: hidden;
  `;
  // 顶部淡雅SVG装饰（如引号）
  const deco = document.createElement('div');
  deco.innerHTML = `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><text x="0" y="28" font-size="32" fill="#e6e6e6" font-family="serif">"</text></svg>`;
  deco.style.cssText = `
    position: absolute;
    top: 1.1rem;
    left: 1.2rem;
    width: 36px;
    height: 36px;
    opacity: 1;
    pointer-events: none;
  `;
  imageContainer.appendChild(deco);
  // 正文内容
  const textElement = document.createElement('div');
  textElement.style.cssText = `
    margin: 0.5rem 0 0.7rem 0;
    font-weight: 500;
    word-break: break-all;
    white-space: pre-wrap;
    min-height: 120px;
    width: 100%;
    text-align: left;
    flex: 1;
  `;
  textElement.textContent = selectedTextForExport.value;
  // 日期
  const timestampElement = document.createElement('div');
  timestampElement.style.cssText = `
    font-size: 0.98rem;
    font-family: 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
    opacity: 0.85;
    margin-left: 0.1rem;
    margin-bottom: 0.2rem;
    text-align: right;
    align-self: flex-end;
    width: 100%;
    margin-top: 1rem;
    color: #7ca05b;
  `;
  timestampElement.textContent = new Date().toISOString().slice(0, 10);
  imageContainer.appendChild(textElement);
  imageContainer.appendChild(timestampElement);
  document.body.appendChild(imageContainer);
  const realWidth = imageContainer.offsetWidth;
  const realHeight = imageContainer.offsetHeight;
  const canvas = await html2canvas.default(imageContainer, {
    scale,
    backgroundColor: null,
    width: realWidth,
    height: realHeight
  });
  document.body.removeChild(imageContainer);
  exportImageUrl.value = canvas.toDataURL();
};

const exportSelectedText = async () => {
  if (selectedText.value) {
    selectedTextForExport.value = selectedText.value;
    showExportImageDialog.value = true;
    selectedText.value = ''; // 关闭tooltip
    ElMessage.success('图片已生成，可预览和下载');
  }
};

// 添加划线
const addHighlight = () => {
  if (selectedText.value) {
    const highlight = {
      text: selectedText.value,
      color: highlightColor.value,
      timestamp: new Date().toLocaleString(),
      id: `highlight_${Date.now()}`,
      cfiRange: currentCfiRange.value // 保存CFI范围
    }
    highlights.value.push(highlight)
    
    // 如果有CFI范围，使用epub.js的annotations API添加高亮
    if (currentCfiRange.value && rendition) {
      try {
        rendition.annotations.add('highlight', currentCfiRange.value, {
          color: highlightColor.value
        })
        console.log('添加epub.js高亮:', currentCfiRange.value)
      } catch (error) {
        console.error('添加epub.js高亮失败:', error)
      }
    }
    
    // 清空选中文本
    selectedText.value = ''
    currentCfiRange.value = ''
    
    // 清除当前选择
    if (window.getSelection) {
      window.getSelection().removeAllRanges()
    }
    
    ElMessage.success('划线添加成功！')
  }
}

// 重置阅读器
const resetReader = () => {
  if (rendition) {
    rendition.destroy()
    rendition = null
  }
  
  // 清空viewer元素
  if (viewerElement.value) {
    viewerElement.value.innerHTML = ''
  }
  
  book.value = null
  bookTitle.value = ''
  bookAuthor.value = ''
  currentPage.value = 1
  totalPages.value = 1
  currentChapter.value = ''
  showToc.value = false
  toc.value = []
  bookData = null
  // 清除本地存储的epub
  localStorage.removeItem('epub-book-base64');
}

// 组件卸载时清理
onUnmounted(() => {
  if (rendition) {
    rendition.destroy()
  }
})

// 优化tooltip位置：优先显示在选区下方，空间不足时显示在上方，始终以.reader-view为基准
const showTooltipAtSelection = async () => {
  await nextTick();
  const selection = window.getSelection();
  const tooltipEl = document.querySelector('.tooltip-panel');
  const readerViewEl = document.querySelector('.reader-view');
  if (selection && selection.rangeCount > 0 && tooltipEl && readerViewEl) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const readerRect = readerViewEl.getBoundingClientRect();
    const tooltipWidth = tooltipEl.offsetWidth || 320;
    const tooltipHeight = tooltipEl.offsetHeight || 48;
    const padding = 12;
    // 水平居中于选区
    let left = rect.left + rect.width / 2 - tooltipWidth / 2 - readerRect.left;
    // 判断下方空间是否足够
    const spaceBelow = readerRect.bottom - rect.bottom;
    let top;
    if (spaceBelow > tooltipHeight + padding) {
      // 下方空间足够，显示在下方
      top = rect.bottom - readerRect.top + padding;
    } else {
      // 否则显示在上方
      top = rect.top - readerRect.top - tooltipHeight - padding;
    }
    // 边界处理
    left = Math.max(8, Math.min(left, readerRect.width - tooltipWidth - 8));
    top = Math.max(8, Math.min(top, readerRect.height - tooltipHeight - 8));
    tooltipStyle.value = {
      left: `${left}px`,
      top: `${top}px`,
      position: 'absolute'
    };
  }
};
</script>

<style scoped>
.epub-reader {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

/* 确保TopMenu有固定高度 */
.epub-reader :deep(.el-menu) {
  height: 60px;
  line-height: 60px;
}

.epub-reader :deep(.el-menu-item) {
  height: 60px;
  line-height: 60px;
}

.epub-reader :deep(.el-row) {
  height: 60px;
}

.epub-reader :deep(.el-col) {
  height: 60px;
}

.reader-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  margin: 0;
  padding: 0;
}

/* 上传区域样式 */
.upload-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  overflow: hidden;
  min-height: 0;
  margin: 0;
}

.upload-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  max-width: 500px;
  width: 100%;
}

.upload-card h2 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 1.8rem;
}

.upload-card p {
  color: #666;
  margin-bottom: 30px;
}

.upload-area {
  width: 100%;
}

/* 阅读区域样式 */
.reading-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  overflow: hidden;
  min-height: 0;
  margin: 0;
  padding: 0;
}

.content-area {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
  margin: 0;
  padding: 0;
}

.toc-sidebar {
  width: 250px;
  background: white;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
  padding: 20px;
  flex-shrink: 0;
  margin: 0;
}

.settings-sidebar {
  width: 250px;
  background: white;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
  padding: 20px;
  flex-shrink: 0;
  margin: 0;
}

.highlight-sidebar {
  width: 250px;
  background: white;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
  padding: 20px;
  flex-shrink: 0;
  margin: 0;
}

.settings-sidebar h4,
.highlight-sidebar h4 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.setting-group {
  margin-bottom: 20px;
}

.setting-group label {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
  font-weight: 500;
  font-size: 0.9rem;
}

.selected-text {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 6px;
  font-size: 0.9rem;
  line-height: 1.4;
  color: #333;
  margin-bottom: 10px;
  word-break: break-word;
}

.highlights-list {
  max-height: 300px;
  overflow-y: auto;
}

.highlight-item {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 10px;
  border-left: 4px solid #667eea;
}

.highlight-text {
  font-size: 0.9rem;
  line-height: 1.4;
  color: #333;
  margin-bottom: 8px;
  word-break: break-word;
}

.highlight-actions {
  display: flex;
  gap: 8px;
}

.highlight-actions .el-button {
  flex: 1;
  font-size: 0.8rem;
}

.font-size-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.font-size-display {
  min-width: 50px;
  text-align: center;
  font-weight: 500;
  color: #2c3e50;
}

.toc-sidebar h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.toc-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toc-item {
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  color: #555;
}

.toc-item:hover {
  background: #f0f0f0;
  color: #2c3e50;
}

.toc-item.active {
  background: #667eea;
  color: white;
}

.reader-view {
  flex: 1;
  overflow: hidden;
  position: relative;
  min-height: 0;
  margin: 0 auto;
  padding: 0;
  max-width: 700px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.08);
}

.epub-viewer {
  width: 100%;
  height: 100%;
  background: white;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

/* 右侧工具栏样式 */
.right-toolbar {
  width: 200px;
  background: white;
  border-left: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  box-shadow: -2px 0 4px rgba(0,0,0,0.1);
  flex-shrink: 0;
  margin: 0;
  padding: 20px 15px;
  gap: 20px;
}

.book-info h3 {
  margin: 0 0 5px 0;
  color: #2c3e50;
  font-size: 1.1rem;
  text-align: center;
}

.book-info p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
  text-align: center;
}

.page-info {
  font-weight: 500;
  color: #2c3e50;
  min-width: 80px;
  text-align: center;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 6px;
}

.controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.controls .el-button {
  width: 100%;
  margin-bottom: 5px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .reader-container {
    flex-direction: column;
  }
  
  .upload-card {
    padding: 30px 20px;
  }
}

/* tooltip面板样式 */
.tooltip-panel {
  position: absolute;
  z-index: 10000;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  border: 1px solid #e0e0e0;
  min-width: 280px;
  max-width: 400px;
  animation: tooltipFadeIn 0.2s ease-out;
  padding: 0;
  overflow: visible;
}

.tooltip-content {
  padding: 20px 18px 16px 18px;
  position: relative;
  border-radius: 12px;
  background: linear-gradient(135deg, #f8fafc 0%, #f3f6fa 100%);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.tooltip-close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  background: transparent;
  border: none;
  color: #888;
  transition: color 0.2s;
}

.tooltip-close-btn:hover {
  color: #f56c6c;
  background: #f9ecec;
}

.selected-text-preview {
  background: #f5f5f5;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 1rem;
  line-height: 1.5;
  color: #333;
  margin-bottom: 16px;
  word-break: break-word;
  max-height: 90px;
  overflow-y: auto;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}

.tooltip-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: flex-end;
}

.tooltip-actions .el-button {
  flex: 1;
  font-size: 0.92rem;
}

.tooltip-arrow {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid #f3f6fa;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.08));
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 