<template>
  <div class="markdown-reader">
    <TopMenu></TopMenu>
    
    <div class="reader-container">
      <!-- 文件上传区域 -->
      <div v-if="!markdownContent" class="upload-section">
        <div class="upload-card">
          <h2>Markdown 阅读器</h2>
          <p>上传您的 Markdown 文件开始阅读</p>
          
          <el-upload
            class="upload-area"
            drag
            accept=".md,.markdown"
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
                只能上传 .md 或 .markdown 文件
              </div>
            </template>
          </el-upload>
        </div>
      </div>

      <!-- 阅读区域 -->
      <div v-else class="reading-section">
        <div class="toolbar">
          <el-button @click="handleBack" type="info" plain>
            <el-icon><arrow-left /></el-icon>
            返回
          </el-button>
          <el-button @click="handleExportPDF" type="primary">
            <el-icon><document /></el-icon>
            导出 PDF
          </el-button>
          <span class="filename">{{ fileName }}</span>
        </div>
        
        <div class="content-area" ref="contentArea">
          <div 
            class="markdown-content" 
            v-html="renderedContent"
            ref="markdownContentRef"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { UploadFilled, ArrowLeft, Document } from '@element-plus/icons-vue';
import TopMenu from './TopMenu.vue';
import { marked } from 'marked';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const markdownContent = ref('');
const fileName = ref('');
const contentArea = ref(null);
const markdownContentRef = ref(null);

// 配置 marked 选项
marked.setOptions({
  breaks: true,
  gfm: true,
});

// 渲染后的 HTML 内容
const renderedContent = computed(() => {
  if (!markdownContent.value) return '';
  try {
    return marked(markdownContent.value);
  } catch (error) {
    console.error('Markdown 解析错误:', error);
    ElMessage.error('Markdown 解析失败');
    return '';
  }
});

/**
 * 处理文件上传
 */
const handleFileChange = (file) => {
  const fileObj = file.raw;
  if (!fileObj) return;
  
  // 检查文件类型
  const validTypes = ['text/markdown', 'text/x-markdown'];
  const validExtensions = ['.md', '.markdown'];
  const fileNameLower = fileObj.name.toLowerCase();
  const isValidExtension = validExtensions.some(ext => fileNameLower.endsWith(ext));
  
  if (!isValidExtension && !validTypes.includes(fileObj.type)) {
    ElMessage.error('请上传 .md 或 .markdown 文件');
    return;
  }
  
  fileName.value = fileObj.name;
  
  // 读取文件内容
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      markdownContent.value = e.target.result;
      ElMessage.success('文件加载成功');
    } catch (error) {
      console.error('文件读取错误:', error);
      ElMessage.error('文件读取失败');
    }
  };
  reader.onerror = () => {
    ElMessage.error('文件读取失败');
  };
  reader.readAsText(fileObj, 'UTF-8');
};

/**
 * 返回上传页面
 */
const handleBack = () => {
  markdownContent.value = '';
  fileName.value = '';
};

/**
 * 导出 PDF
 */
const handleExportPDF = async () => {
  if (!markdownContentRef.value) {
    ElMessage.error('没有可导出的内容');
    return;
  }
  
  try {
    ElMessage.info('正在生成 PDF，请稍候...');
    
    // 页面边距设置（mm）
    const margin = {
      top: 20,
      bottom: 20,
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
    
    // 设置固定宽度，确保内容不会超出
    markdownContentRef.value.style.width = `${contentWidthPx}px`;
    markdownContentRef.value.style.maxWidth = `${contentWidthPx}px`;
    markdownContentRef.value.style.boxSizing = 'border-box';
    markdownContentRef.value.style.margin = '0 auto';
    
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
    
    // 计算每页可容纳的内容高度
    const pageContentHeight = contentHeight;
    let remainingHeight = imgHeightInMm;
    let yPosition = margin.top;
    
    // 添加第一页内容
    if (remainingHeight <= pageContentHeight) {
      // 内容可以在一页内显示
      pdf.addImage(imgData, 'PNG', margin.left, yPosition, imgWidthInMm, imgHeightInMm);
    } else {
      // 内容需要分页
      let sourceY = 0;
      let sourceHeight = imgHeight;
      
      while (remainingHeight > 0) {
        // 计算当前页可以显示的内容高度
        const currentPageHeight = Math.min(remainingHeight, pageContentHeight);
        const currentPageHeightPx = (currentPageHeight / imgHeightInMm) * imgHeight;
        
        // 创建临时canvas来裁剪当前页的内容
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = imgWidth;
        pageCanvas.height = currentPageHeightPx;
        const pageCtx = pageCanvas.getContext('2d');
        
        // 从原图中裁剪当前页的内容
        pageCtx.drawImage(
          canvas,
          0, sourceY, imgWidth, currentPageHeightPx,  // 源图像区域
          0, 0, imgWidth, currentPageHeightPx          // 目标canvas区域
        );
        
        const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
        const pageImgHeightInMm = currentPageHeight;
        
        // 如果不是第一页，添加新页面
        if (yPosition !== margin.top) {
          pdf.addPage();
          yPosition = margin.top;
        }
        
        // 添加当前页内容
        pdf.addImage(
          pageImgData,
          'PNG',
          margin.left,
          yPosition,
          imgWidthInMm,
          pageImgHeightInMm
        );
        
        // 更新位置
        sourceY += currentPageHeightPx;
        remainingHeight -= currentPageHeight;
        yPosition += pageImgHeightInMm;
      }
    }
    
    // 下载 PDF
    const pdfFileName = fileName.value.replace(/\.(md|markdown)$/i, '') || 'markdown-document';
    pdf.save(`${pdfFileName}.pdf`);
    
    ElMessage.success('PDF 导出成功');
  } catch (error) {
    console.error('PDF 导出错误:', error);
    ElMessage.error('PDF 导出失败，请重试');
  }
};

onMounted(() => {
  document.querySelector('body').setAttribute('style', 'background: #EBEDF0');
});
</script>

<style scoped>
.markdown-reader {
  min-height: 100vh;
  background: #EBEDF0;
}

.reader-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 上传区域样式 */
.upload-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 100px);
}

.upload-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.upload-card h2 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 24px;
}

.upload-card p {
  margin: 0 0 30px 0;
  color: #666;
  font-size: 14px;
}

.upload-area {
  width: 100%;
}

:deep(.el-upload) {
  width: 100%;
}

:deep(.el-upload-dragger) {
  width: 100%;
  padding: 40px 20px;
}

:deep(.el-icon--upload) {
  font-size: 48px;
  color: #409eff;
  margin-bottom: 16px;
}

:deep(.el-upload__text) {
  color: #606266;
  font-size: 14px;
}

:deep(.el-upload__text em) {
  color: #409eff;
  font-style: normal;
}

:deep(.el-upload__tip) {
  color: #909399;
  font-size: 12px;
  margin-top: 10px;
}

/* 阅读区域样式 */
.reading-section {
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

.filename {
  margin-left: auto;
  color: #606266;
  font-size: 14px;
  font-weight: 500;
}

.content-area {
  padding: 40px;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  background: #ffffff;
}

.markdown-content {
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.8;
  color: #2c3e50;
  font-size: 16px;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* Markdown 内容样式 */
:deep(.markdown-content) {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
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
  .reader-container {
    padding: 10px;
  }
  
  .upload-card {
    padding: 20px;
  }
  
  .content-area {
    padding: 20px;
  }
  
  .toolbar {
    flex-wrap: wrap;
  }
  
  .filename {
    width: 100%;
    margin-left: 0;
    margin-top: 10px;
  }
}
</style>