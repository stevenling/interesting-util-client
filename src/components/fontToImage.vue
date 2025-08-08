<template>
  <div class="font-to-image-container">
    <TopMenu />
    <div class="main-content">
      <!-- 左侧输入区域 -->
      <div class="input-section">
        <div class="input-card">
          <div class="input-header">
            <h3 class="input-title">文字输入</h3>
            <div class="input-subtitle">输入你想生成图片的文字内容</div>
          </div>
          <el-input
            v-model="inputText"
            type="textarea"
            :rows="18"
            placeholder="在这里输入你的文字..."
            class="input-area"
          />
        </div>
      </div>

      <!-- 右侧控制和预览区域 -->
      <div class="right-section">
        <!-- 控制面板 -->
        <div class="control-panel">
          <div class="control-header">
            <h3 class="control-title">控制面板</h3>
            <div class="control-subtitle">调整图片样式和效果</div>
          </div>
          
          <div class="control-content">
            <div class="control-group">
              <label class="control-label">字体大小</label>
              <div class="font-size-controls">
                <el-button size="small" @click="decreaseFontSize" class="control-btn">A-</el-button>
                <el-button size="small" @click="increaseFontSize" class="control-btn">A+</el-button>
              </div>
            </div>

            <div class="control-group">
              <label class="control-label">背景类型</label>
              <el-select v-model="selectedBgType" placeholder="选择背景类型" size="small" class="control-select">
                <el-option v-for="item in bgTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </div>

            <div class="control-group">
              <label class="control-label">背景样式</label>
              <el-select v-model="selectedBg" placeholder="选择背景" size="small" class="control-select">
                <el-option v-for="item in currentBgOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </div>

            <div class="control-group">
              <label class="control-label">字体</label>
              <el-select v-model="selectedFont" placeholder="选择字体" size="small" class="control-select">
                <el-option v-for="item in fontOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </div>

            <el-button type="primary" class="copy-btn" @click="copyImage" size="small">
              <span class="btn-text">生成图片</span>
            </el-button>
          </div>
        </div>

        <!-- 预览区域 -->
        <div class="preview-area">
          <div class="preview-header">
            <h3 class="preview-title">预览效果</h3>
            <div class="preview-subtitle">实时预览生成的图片</div>
          </div>
          <div
            ref="imageCardRef"
            class="preview-card"
            :class="selectedBg"
          >
            <div class="preview-text" :style="{ color: computedTextColor, fontFamily: selectedFont || undefined, fontSize: previewFontSize + 'rem' }">
              {{ inputText || '这里会显示你的文字内容' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 移动端图片预览弹窗 -->
    <el-dialog v-model="showImagePreview" title="保存图片" width="90%" center class="preview-dialog">
      <img :src="generatedImageUrl" class="preview-image" alt="生成的图片" />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showImagePreview = false" class="dialog-btn">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import html2canvas from 'html2canvas';
import { ElMessage } from 'element-plus';
import TopMenu from './TopMenu.vue';

/**
 * @description 背景选项（丰富微信读书风格）
 */
// 背景类型选项
const bgTypeOptions = [
  { label: '纯色背景', value: 'solid' },
  { label: '渐变背景', value: 'gradient' },
  { label: '格子背景', value: 'grid' },
  { label: '纹理背景', value: 'texture' }
];

// 纯色背景选项
const solidBgOptions = [
  { label: '知乎淡蓝', value: 'bg-zhihu-light-blue' },
  { label: '知乎淡黄', value: 'bg-zhihu-light-yellow' },
  { label: '知乎淡绿', value: 'bg-zhihu-light-green' },
  { label: '知乎淡灰', value: 'bg-zhihu-light-gray' },
  { label: '小红书粉', value: 'bg-xiaohongshu-pink' },
  { label: '小红书紫', value: 'bg-xiaohongshu-purple' },
  { label: '小红书蓝', value: 'bg-xiaohongshu-blue' },
  { label: '小红书绿', value: 'bg-xiaohongshu-green' },
  { label: '小红书橙', value: 'bg-xiaohongshu-orange' },
  { label: '经典白', value: 'bg-white' },
  { label: '淡雅蓝', value: 'bg-blue' },
  { label: '活力橙', value: 'bg-orange' },
  { label: '淡灰卡片', value: 'bg-light-gray' },
  { label: '雅黑黑', value: 'bg-dark-black' },
  { label: '米黄纸', value: 'bg-milky-paper' },
  { label: '夜间深蓝', value: 'bg-night-blue' },
  { label: '淡粉紫', value: 'bg-light-pink-purple' },
  { label: '知乎白', value: 'bg-zhihu-white' }
];

// 渐变背景选项
const gradientBgOptions = [
  { label: '渐变绿', value: 'bg-gradient-green' },
  { label: '柔紫蓝', value: 'bg-gradient-soft-purple-blue' },
  { label: '柔绿黄', value: 'bg-gradient-soft-green-yellow' },
  { label: '柔米白', value: 'bg-gradient-soft-milky' },
  { label: '蓝紫渐变', value: 'bg-gradient-bluepurple' },
  { label: '知乎蓝白渐变', value: 'bg-zhihu-blue-white-gradient' },
  { label: '小红书粉紫渐变', value: 'bg-xiaohongshu-pink-purple' },
  { label: '小红书蓝粉渐变', value: 'bg-xiaohongshu-blue-pink' },
  { label: '橙粉渐变', value: 'bg-gradient-orange-pink' },
  { label: '青绿渐变', value: 'bg-gradient-cyan-green' },
  { label: '蓝紫竖向渐变', value: 'bg-v-gradient-bluepurple' },
  { label: '橙粉竖向渐变', value: 'bg-v-gradient-orange-pink' },
  { label: '青绿竖向渐变', value: 'bg-v-gradient-cyan-green' },
  { label: '柔和青蓝', value: 'bg-gradient-soft-cyan-blue' },
  { label: '柔粉橙黄', value: 'bg-gradient-soft-pink-orange' },
  { label: '日落渐变', value: 'bg-gradient-sunset' },
  { label: '海洋渐变', value: 'bg-gradient-ocean' },
  { label: '森林渐变', value: 'bg-gradient-forest' },
  { label: '星空渐变', value: 'bg-gradient-starry' },
  { label: '彩虹渐变', value: 'bg-gradient-rainbow' },
  { label: '极光渐变', value: 'bg-gradient-aurora' },
  { label: '沙漠渐变', value: 'bg-gradient-desert' },
  { label: '樱花渐变', value: 'bg-gradient-cherry' },
  { label: '薄荷渐变', value: 'bg-gradient-mint' },
  { label: '薰衣草渐变', value: 'bg-gradient-lavender' },
  { label: '珊瑚渐变', value: 'bg-gradient-coral' },
  { label: '薄荷蓝渐变', value: 'bg-gradient-mintblue' },
  { label: '晨曦渐变', value: 'bg-gradient-sunrise' },
  { label: '暮色渐变', value: 'bg-gradient-twilight' },
  { label: '奶油渐变', value: 'bg-gradient-cream' },
];

// 格子背景选项
const gridBgOptions = [
  { label: '格子白', value: 'bg-grid-white' },
  { label: '格子蓝', value: 'bg-grid-blue' },
  { label: '格子粉', value: 'bg-grid-pink' },
  { label: '格子灰', value: 'bg-grid-gray' },
  { label: '格子绿', value: 'bg-grid-green' },
];

// 纹理背景选项
const textureBgOptions = [
  { label: '纸张纹理', value: 'bg-paper' },
  { label: '小红书大理石', value: 'bg-xiaohongshu-marble' },
  { label: '小红书纸张', value: 'bg-xiaohongshu-paper' },
  { label: '点状纹理', value: 'bg-dot-texture' },
  { label: '纸张纹理2', value: 'bg-paper2' },
  { label: '斜线纹理', value: 'bg-diagonal-line' },
];

const selectedBgType = ref('solid');
const selectedBg = ref('bg-white');

// 根据选择的背景类型获取对应的背景选项
const currentBgOptions = computed(() => {
  switch (selectedBgType.value) {
    case 'solid':
      return solidBgOptions;
    case 'gradient':
      return gradientBgOptions;
    case 'grid':
      return gridBgOptions;
    case 'texture':
      return textureBgOptions;
    default:
      return solidBgOptions;
  }
});

// 监听背景类型变化，重置背景选择
watch(selectedBgType, (newType) => {
  switch (newType) {
    case 'solid':
      selectedBg.value = 'bg-white';
      break;
    case 'gradient':
      selectedBg.value = 'bg-gradient-green';
      break;
    case 'grid':
      selectedBg.value = 'bg-grid-white';
      break;
    case 'texture':
      selectedBg.value = 'bg-paper';
      break;
  }
});

/**
 * @description 用户输入的文字
 * @type {import('vue').Ref<string>}
 */
const inputText = ref('');

/**
 * @description 预览卡片的 DOM 引用
 * @type {import('vue').Ref<HTMLElement | null>}
 */
const imageCardRef = ref(null);



// 用于移动端图片预览
const showImagePreview = ref(false);
const generatedImageUrl = ref('');

const previewFontSize = ref(1.18); // rem，初始和原来一样

const increaseFontSize = () => {
  previewFontSize.value = Math.min(previewFontSize.value + 0.1, 3);
};
const decreaseFontSize = () => {
  previewFontSize.value = Math.max(previewFontSize.value - 0.1, 0.6);
};

/**
 * @function copyImage
 * @description 复制预览区图片到剪贴板
 */
const copyImage = async () => {
  if (!imageCardRef.value) return;
  // 保存原样式
  const card = imageCardRef.value;
  const originalMaxHeight = card.style.maxHeight;
  const originalOverflowY = card.style.overflowY;

  // 展开内容，确保截图全部内容
  card.style.maxHeight = 'none';
  card.style.overflowY = 'visible';

  try {
    const canvas = await html2canvas(card, {
      backgroundColor: '#ffffff',
      useCORS: true,
      scale: 3,
      allowTaint: false,
      foreignObjectRendering: false,
      logging: false, // 在调试时可以设为 true
      imageTimeout: 0,
      removeContainer: true
    });

    // 检测是否为移动设备
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
      // 移动端：显示图片让用户手动保存
      generatedImageUrl.value = canvas.toDataURL('image/png', 1.0);
      showImagePreview.value = true;
      ElMessage.info('请长按图片进行保存或复制');
    } else {
      // 桌面端：尝试写入剪贴板
      canvas.toBlob(async (blob) => {
        if (!blob) {
          ElMessage.error('图片生成失败');
          return;
        }
        try {
          await navigator.clipboard.write([
            new window.ClipboardItem({ 'image/png': blob })
          ]);
          ElMessage.success('图片已复制到剪贴板，可直接粘贴');
        } catch (err) {
          console.error('复制失败:', err);
          ElMessage.error('复制图片到剪贴板失败，可能是浏览器不支持或权限问题');
        }
      }, 'image/png', 1.0);
    }
  } catch (err) {
    console.error('截图失败:', err);
    ElMessage.error('图片生成失败');
  } finally {
    // 恢复原样式
    card.style.maxHeight = originalMaxHeight;
    card.style.overflowY = originalOverflowY;
  }
};

/**
 * @description 字体选项
 */
const fontOptions = [
  // 设计感字体优先
  { label: 'Fira Sans', value: '"Fira Sans", Arial, sans-serif' },
  { label: 'Lobster', value: 'Lobster, cursive' },
  { label: 'Pacifico', value: 'Pacifico, cursive' },
  { label: 'Montserrat', value: 'Montserrat, Arial, sans-serif' },
  { label: 'Oswald', value: 'Oswald, Arial, sans-serif' },
  { label: '站酷快乐体', value: '"ZCOOL KuaiLe", "站酷快乐体", cursive' },
  { label: '站酷庆科黄油体', value: '"ZCOOL QingKe HuangYou", "站酷庆科黄油体", cursive' },
  // 其他常用字体
  { label: '默认', value: '' },
  { label: '微软雅黑', value: '"Microsoft YaHei", sans-serif' },
  { label: '思源黑体', value: '"Source Han Sans", "Noto Sans SC", sans-serif' },
  { label: '楷体', value: 'KaiTi, "楷体", serif' },
  { label: '仿宋', value: 'FangSong, "仿宋", serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Serif', value: 'serif' },
  { label: 'Monospace', value: 'monospace' },
  { label: '黑体', value: 'SimHei, "黑体", sans-serif' },
  { label: '宋体', value: 'SimSun, "宋体", serif' },
  { label: '华文中宋', value: 'STZhongsong, "华文中宋", serif' },
  { label: '华文仿宋', value: 'STFangsong, "华文仿宋", serif' },
  { label: '华文楷体', value: 'STKaiti, "华文楷体", serif' },
  { label: '华文细黑', value: 'STXihei, "华文细黑", sans-serif' },
  { label: '苹方', value: 'PingFang SC, "苹方", sans-serif' },
  { label: '等线', value: 'DengXian, "等线", sans-serif' },
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Courier New', value: '"Courier New", Courier, monospace' },
];
const selectedFont = ref('KaiTi, "楷体", serif');

// 背景与字体颜色搭配
const bgTextColorMap = {
  // 浅色背景，深色字体
  'bg-white': '#222',
  'bg-blue': '#1a237e',
  'bg-orange': '#a35a00',
  'bg-light-gray': '#222',
  'bg-milky-paper': '#6b4e16',
  'bg-light-pink-purple': '#7c4d8a',
  'bg-zhihu-white': '#222',
  'bg-zhihu-light-blue': '#225488',
  'bg-zhihu-light-yellow': '#b89b4b',
  'bg-zhihu-light-green': '#3a7a3a',
  'bg-zhihu-light-gray': '#444',
  'bg-xiaohongshu-pink': '#8e4a6b',
  'bg-xiaohongshu-purple': '#6b4a8e',
  'bg-xiaohongshu-blue': '#225488',
  'bg-xiaohongshu-green': '#2d5a2d',
  'bg-xiaohongshu-orange': '#a35a00',
  'bg-xiaohongshu-marble': '#4a4a4a',
  'bg-xiaohongshu-paper': '#6b4e16',
  'bg-grid-white': '#222',
  'bg-grid-blue': '#1a237e',
  'bg-grid-pink': '#8e4a6b',
  'bg-grid-gray': '#444',
  'bg-grid-green': '#2d5a2d',
  // 深色背景，浅色字体
  'bg-dark-black': '#fff',
  'bg-night-blue': '#e0e6f6',
  // 纸张/纹理
  'bg-paper': '#6b4e16',
  'bg-paper2': '#6b4e16',
  'bg-dot-texture': '#4a4a4a',
  'bg-diagonal-line': '#4a4a4a',
  // 渐变背景优化
  'bg-gradient-green': '#1a4d2e',
  'bg-gradient-bluepurple': '#fff',
  'bg-gradient-orange-pink': '#a35a00', // 橙粉渐变，深橙色
  'bg-gradient-cyan-green': '#1a4d2e',
  'bg-v-gradient-bluepurple': '#fff',
  'bg-v-gradient-orange-pink': '#a35a00',
  'bg-v-gradient-cyan-green': '#1a4d2e',
  'bg-gradient-soft-cyan-blue': '#227488',
  'bg-gradient-soft-pink-orange': '#b87a4b',
  'bg-gradient-soft-purple-blue': '#5a6a8e',
  'bg-gradient-soft-green-yellow': '#6b8e23',
  'bg-gradient-soft-milky': '#7c6f57',
  'bg-zhihu-blue-white-gradient': '#225488',
  'bg-xiaohongshu-pink-purple': '#8e4a6b',
  'bg-xiaohongshu-blue-pink': '#225488',
  // 新增美观渐变优化
  'bg-gradient-sunset': '#fff', // 日落渐变，白色
  'bg-gradient-ocean': '#fff', // 海洋渐变，白色
  'bg-gradient-forest': '#fff', // 森林渐变，白色
  'bg-gradient-starry': '#fff', // 星空渐变，白色
  'bg-gradient-rainbow': '#fff', // 彩虹渐变，白色
  'bg-gradient-aurora': '#227488', // 极光渐变，深蓝绿色
  'bg-gradient-desert': '#8e6b4a', // 沙漠渐变，深棕色
  'bg-gradient-cherry': '#8e4a6b', // 樱花渐变，深粉色
  'bg-gradient-mint': '#2d5a2d', // 薄荷渐变，深绿色
  'bg-gradient-lavender': '#fff', // 薰衣草渐变，白色
  'bg-gradient-coral': '#fff', // 珊瑚渐变，白色
  'bg-gradient-mintblue': '#227488', // 薄荷蓝渐变，深蓝绿色
  'bg-gradient-sunrise': '#a35a00', // 晨曦渐变，深橙色
  'bg-gradient-twilight': '#fff', // 暮色渐变，白色
  'bg-gradient-cream': '#a35a00', // 奶油渐变，深橙色
};
const computedTextColor = computed(() => bgTextColorMap[selectedBg.value] || '#222');
</script>

<style scoped>
.font-to-image-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.main-content {
  display: flex;
  gap: 30px;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  align-items: flex-start;
  justify-content: center;
  min-height: calc(100vh - 100px);
}

.input-section {
  flex: 1;
  display: flex;
  justify-content: center;
}

.input-card {
  width: 100%;
  max-width: 450px;
  height: 650px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.input-area {
  flex: 1;
  padding: 20px 25px;
  font-size: 1rem;
  line-height: 1.6;
  color: #333;
  border: none;
  resize: none;
  outline: none;
  box-sizing: border-box;
  background: transparent;
}

.right-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 650px;
}

.input-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.input-header {
  padding: 20px 25px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
}

.input-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: white;
}

.input-subtitle {
  font-size: 0.9rem;
  opacity: 0.9;
  color: rgba(255, 255, 255, 0.9);
}



.input-area:focus {
  background: rgba(255, 255, 255, 0.05);
}

.control-panel {
  width: 100%;
  max-width: 450px;
  height: 290px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  overflow: visible;
}

.control-content {
  flex: 1;
  padding: 15px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: visible;
}

.control-panel:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.control-header {
  padding: 20px 25px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
}

.control-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: white;
}

.control-subtitle {
  font-size: 0.9rem;
  opacity: 0.9;
  color: rgba(255, 255, 255, 0.9);
}

.control-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 2px 0;
}

.control-label {
  font-size: 0.9rem;
  color: #555;
  font-weight: 500;
  min-width: 75px;
  line-height: 1.3;
}

.font-size-controls {
  display: flex;
  gap: 6px;
}

.control-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.control-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.control-select {
  width: 100%;
  max-width: 160px;
  min-width: 140px;
}

.control-select :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 4px;
  padding: 4px 8px;
  min-height: 28px;
  transition: all 0.3s ease;
}

.control-select :deep(.el-input__wrapper:hover) {
  border-color: rgba(102, 126, 234, 0.5);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.copy-btn {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 4px;
  min-height: 32px;
}

.copy-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.copy-btn:active {
  transform: translateY(0);
}

.copy-btn .btn-text {
  margin-left: 8px;
}

.preview-area {
  width: 100%;
  max-width: 450px;
  height: 320px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.preview-area:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.preview-header {
  padding: 20px 25px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
}

.preview-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
  color: white;
}

.preview-subtitle {
  font-size: 0.9rem;
  opacity: 0.9;
  color: rgba(255, 255, 255, 0.9);
}

.preview-card {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  position: relative;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  box-sizing: border-box;
  overflow-y: auto;
  margin: 15px;
}

.preview-text {
  font-size: 1.18rem;
  line-height: 1.8;
  margin: 0;
  word-break: break-all;
  white-space: pre-wrap;
  min-height: 120px;
  width: 100%;
  transition: color 0.2s;
  flex: 1;
  text-align: left;
}

.quote-mark {
  position: absolute;
  top: 1.1rem;
  left: 1.2rem;
  font-size: 2.5rem;
  color: #e6e6e6;
  font-family: serif;
  user-select: none;
  pointer-events: none;
}

.date-below {
  margin-top: 0.2rem;
  margin-bottom: 0.7rem;
  text-align: left;
  display: none;
}

.weixin-card-footer {
  align-self: flex-end;
  font-size: 0.98rem;
  color: #222;
  font-family: 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
  margin-top: 0.2rem;
  opacity: 0.7;
}

.preview-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.preview-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 25px;
}

.preview-dialog :deep(.el-dialog__title) {
  color: white;
  font-weight: 600;
  font-size: 1.2rem;
}

.preview-dialog :deep(.el-dialog__body) {
  padding: 25px;
  background: #f8f9fa;
}

.preview-dialog :deep(.el-dialog__footer) {
  background: #f8f9fa;
  border-top: 1px solid #eee;
  padding: 20px 25px;
}

.preview-dialog .dialog-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.preview-dialog .dialog-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.preview-image {
  width: 100%;
  border-radius: 12px;
  display: block;
  margin: 0 auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.bg-radio-group {
  margin-bottom: 0.7rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.bg-white {
  background: #fff !important;
}
.bg-blue {
  background: #eaf4ff !important;
}
.bg-orange {
  background: linear-gradient(135deg, #ffe0b2 0%, #ffd180 100%) !important;
}
.bg-gradient-green {
  background: linear-gradient(135deg, #e0ffe8 0%, #b2ffd9 100%) !important;
}
.bg-paper {
  background: #fdf6e3 !important;
  background-image: repeating-linear-gradient(0deg, #f5e9d7, #f5e9d7 2px, transparent 2px, transparent 24px) !important;
}
.bg-gradient-bluepurple {
  background: linear-gradient(135deg, #6a85f1 0%, #b892f6 100%) !important;
}
.bg-gradient-orange-pink {
  background: linear-gradient(135deg, #ffb86c 0%, #ff7eb3 100%) !important;
}
.bg-gradient-cyan-green {
  background: linear-gradient(135deg, #7fffd4 0%, #7ed6df 100%) !important;
}
.bg-light-gray {
  background: #f7f7fa !important;
}
.bg-top-blue-band {
  background: #fff !important;
  position: relative;
}
.bg-top-blue-band::before {
  content: '';
  display: block;
  position: absolute;
  left: 0; top: 0; right: 0;
  height: 18px;
  background: linear-gradient(90deg, #6a85f1 0%, #b892f6 100%);
  border-radius: 18px 18px 0 0;
}
.bg-top-orange-band {
  background: #fff !important;
  position: relative;
}
.bg-top-orange-band::before {
  content: '';
  display: block;
  position: absolute;
  left: 0; top: 0; right: 0;
  height: 18px;
  background: linear-gradient(90deg, #ffb86c 0%, #ff7eb3 100%);
  border-radius: 18px 18px 0 0;
}
.bg-v-gradient-bluepurple {
  background: linear-gradient(180deg, #6a85f1 0%, #b892f6 100%) !important;
}
.bg-v-gradient-orange-pink {
  background: linear-gradient(180deg, #ffb86c 0%, #ff7eb3 100%) !important;
}
.bg-v-gradient-cyan-green {
  background: linear-gradient(180deg, #7fffd4 0%, #7ed6df 100%) !important;
}
.bg-dark-black {
  background: #222 !important;
  color: #fff !important;
}
.bg-milky-paper {
  background: #f9f6ec !important;
  background-image: repeating-linear-gradient(0deg, #f3ecd7, #f3ecd7 2px, transparent 2px, transparent 24px) !important;
}
.bg-night-blue {
  background: #1a2236 !important;
  color: #e0e6f6 !important;
}
.bg-light-pink-purple {
  background: linear-gradient(135deg, #fbeffb 0%, #e0c3fc 100%) !important;
}
/* 新增浅色系渐变背景样式 */
.bg-gradient-soft-cyan-blue {
  background: linear-gradient(135deg, #e0f7fa 0%, #e1f5fe 100%) !important;
}
.bg-gradient-soft-pink-orange {
  background: linear-gradient(135deg, #fffde4 0%, #ffe9e4 100%) !important;
}
.bg-gradient-soft-purple-blue {
  background: linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%) !important;
}
.bg-gradient-soft-green-yellow {
  background: linear-gradient(135deg, #f0fff3 0%, #f9fbe7 100%) !important;
}
.bg-gradient-soft-milky {
  background: linear-gradient(135deg, #fdf6e3 0%, #f5f7fa 100%) !important;
}
/* 新增知乎风格背景样式 */
.bg-zhihu-white {
  background: #f6f7fa !important;
}
.bg-zhihu-light-blue {
  background: #eaf2fb !important;
}
.bg-zhihu-light-yellow {
  background: #fffbe6 !important;
}
.bg-zhihu-light-green {
  background: #e8f5e9 !important;
}
.bg-zhihu-blue-white-gradient {
  background: linear-gradient(135deg, #eaf2fb 0%, #f6f7fa 100%) !important;
}
/* 新增小红书风格背景样式 */
.bg-xiaohongshu-pink {
  background: #ffeef2 !important;
}
.bg-xiaohongshu-purple {
  background: #f0e6ff !important;
}
.bg-xiaohongshu-blue {
  background: #e6f3ff !important;
}
.bg-xiaohongshu-green {
  background: #e6fff0 !important;
}
.bg-xiaohongshu-orange {
  background: #fff4e6 !important;
}
.bg-xiaohongshu-pink-purple {
  background: linear-gradient(135deg, #ffeef2 0%, #f0e6ff 100%) !important;
}
.bg-xiaohongshu-blue-pink {
  background: linear-gradient(135deg, #e6f3ff 0%, #ffeef2 100%) !important;
}
.bg-xiaohongshu-marble {
  background: #f8f8f8 !important;
  background-image: 
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%) !important;
}
.bg-xiaohongshu-paper {
  background: #faf9f6 !important;
  background-image: 
    repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px) !important;
}
.copy-btn {
  width: 100px;
  margin-bottom: 0.7rem;
  align-self: flex-end;
}
/* 新增格子背景样式 */
.bg-grid-white {
  background: #fff !important;
  background-image: 
    linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px) !important;
  background-size: 20px 20px !important;
}
.bg-grid-blue {
  background: #e6f3ff !important;
  background-image: 
    linear-gradient(rgba(74, 107, 142, 0.2) 1px, transparent 1px),
    linear-gradient(90deg, rgba(74, 107, 142, 0.2) 1px, transparent 1px) !important;
  background-size: 20px 20px !important;
}
.bg-grid-pink {
  background: #ffeef2 !important;
  background-image: 
    linear-gradient(rgba(142, 74, 107, 0.2) 1px, transparent 1px),
    linear-gradient(90deg, rgba(142, 74, 107, 0.2) 1px, transparent 1px) !important;
  background-size: 20px 20px !important;
}
.bg-grid-gray {
  background: #f5f5f7 !important;
  background-image: 
    linear-gradient(rgba(68, 68, 68, 0.2) 1px, transparent 1px),
    linear-gradient(90deg, rgba(68, 68, 68, 0.2) 1px, transparent 1px) !important;
  background-size: 20px 20px !important;
}
.bg-grid-green {
  background: #e6fff0 !important;
  background-image: 
    linear-gradient(rgba(45, 90, 45, 0.2) 1px, transparent 1px),
    linear-gradient(90deg, rgba(45, 90, 45, 0.2) 1px, transparent 1px) !important;
  background-size: 20px 20px !important;
}
/* 新增更多渐变背景样式 */
.bg-gradient-sunset {
  background: linear-gradient(135deg, #ff6b6b 0%, #ffd93d 50%, #ff8e53 100%) !important;
}
.bg-gradient-ocean {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}
.bg-gradient-forest {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%) !important;
}
.bg-gradient-starry {
  background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%) !important;
}
.bg-gradient-rainbow {
  background: linear-gradient(135deg, #ff0000 0%, #ff8000 14%, #ffff00 28%, #00ff00 42%, #0080ff 57%, #8000ff 71%, #ff0080 85%, #ff0000 100%) !important;
}
.bg-gradient-aurora {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%) !important;
}
.bg-gradient-desert {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important;
}
.bg-gradient-cherry {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%) !important;
}
.bg-gradient-mint {
  background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%) !important;
}
.bg-gradient-lavender {
  background: linear-gradient(135deg, #a8caba 0%, #5d4e75 100%) !important;
}
/* 新增美观渐变和纹理样式 */
.bg-gradient-coral {
  background: linear-gradient(135deg, #ff9966 0%, #ff5e62 100%) !important;
}
.bg-gradient-mintblue {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%) !important;
}
.bg-gradient-sunrise {
  background: linear-gradient(135deg, #fbc2eb 0%, #fcd6a1 100%) !important;
}
.bg-gradient-twilight {
  background: linear-gradient(135deg, #355c7d 0%, #6c5b7b 50%, #c06c84 100%) !important;
}
.bg-gradient-cream {
  background: linear-gradient(135deg, #fffde4 0%, #fff1eb 100%) !important;
}
.bg-dot-texture {
  background: #fff !important;
  background-image: radial-gradient(#e0e0e0 1px, transparent 1px), radial-gradient(#e0e0e0 1px, transparent 1px) !important;
  background-size: 20px 20px;
  background-position: 0 0, 10px 10px;
}
.bg-paper2 {
  background: #f7f3e9 !important;
  background-image: repeating-linear-gradient(0deg, #ede7d9, #ede7d9 2px, transparent 2px, transparent 24px), repeating-linear-gradient(90deg, #ede7d9, #ede7d9 2px, transparent 2px, transparent 24px) !important;
}
.bg-diagonal-line {
  background: #fff !important;
  background-image: repeating-linear-gradient(45deg, #e0e0e0 0, #e0e0e0 1px, transparent 1px, transparent 20px) !important;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-content {
    max-width: 1000px;
    gap: 25px;
  }
  
  .input-card, .control-panel, .preview-area {
    max-width: 350px;
  }
}

@media (max-width: 900px) {
  .font-to-image-container {
    padding: 15px;
  }
  
  .main-content {
    flex-direction: column;
    align-items: center;
    gap: 20px;
    min-height: auto;
    padding: 20px 0;
  }
  
  .input-section, .right-section {
    width: 100%;
    max-width: 600px;
  }
  
  .input-card {
    height: auto;
    min-height: 500px;
    max-width: 100%;
  }
  
  .right-section {
    height: auto;
    order: 1;
  }
  
  .input-section {
    order: 2;
  }
  
  .control-panel, .preview-area {
    max-width: 100%;
    height: auto;
  }
  
  .control-panel {
    min-height: 240px;
  }
  
  .preview-area {
    min-height: 300px;
  }
}

@media (max-width: 600px) {
  .font-to-image-container {
    padding: 10px;
  }
  
  .main-content {
    gap: 15px;
  }
  
  .input-card, .preview-area, .control-panel {
    border-radius: 12px;
  }
  
  .input-header, .control-header, .preview-header {
    padding: 15px 20px;
  }
  
  .input-area, .preview-card {
    padding: 15px 20px;
  }
  
  .control-content {
    padding: 15px 20px;
  }
  
  .control-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .control-select {
    max-width: 100%;
  }
}
</style>
