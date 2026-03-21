<template>
  <div class="font-to-image-container">
    <TopMenu />
    <div class="main-content">
      <!-- 左侧：文本输入 + 样式设置 -->
      <div class="input-section">
        <div class="input-card">
          <div class="input-header">
            <h3 class="input-title">文字输入</h3>
            <div class="input-subtitle">输入摘录或金句，右侧实时预览</div>
          </div>
          <el-input
            v-model="inputText"
            type="textarea"
            :rows="18"
            placeholder="输入或粘贴文字，选择背景与字体后点击「生成图片」即可复制或保存"
            class="input-area"
          />
        </div>

        <!-- 控制面板（样式设置） -->
        <div class="control-panel">
          <div class="control-header">
            <h3 class="control-title">样式设置</h3>
            <div class="control-subtitle">字体、背景与字号</div>
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

            <el-button type="primary" class="copy-btn" @click="copyImage" size="default">
              <span class="btn-text">生成图片</span>
            </el-button>
          </div>
        </div>
      </div>

      <!-- 右侧：预览区域 -->
      <div class="right-section">
        <div class="preview-area">
          <div class="preview-header">
            <h3 class="preview-title">预览</h3>
            <div class="preview-subtitle">生成后可直接复制或保存</div>
          </div>
          <div
            ref="imageCardRef"
            class="preview-card"
            :class="[selectedBg, { 'preview-card--empty': !inputText.trim() }]"
          >
            <div class="preview-text" :style="{ color: computedTextColor, fontFamily: selectedFont || undefined, fontSize: previewFontSize + 'rem' }">
              {{ inputText || '此处将显示你的文字' }}
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
          <el-button @click="closeImagePreview" class="dialog-btn">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import html2canvas from 'html2canvas';
import { ElMessage } from 'element-plus';
import TopMenu from './TopMenu.vue';

// 用于移动端 / 桌面弹窗预览图片
const showImagePreview = ref(false);
const generatedImageUrl = ref('');

// 单屏页：进入时禁止 body 滚动，离开时恢复，避免「能滑一点点」
onMounted(() => {
  document.body.style.overflow = 'hidden';
});
onUnmounted(() => {
  document.body.style.overflow = '';
});

/** 关闭图片预览弹窗，并释放 blob URL */
function closeImagePreview() {
  if (generatedImageUrl.value && generatedImageUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(generatedImageUrl.value);
  }
  generatedImageUrl.value = '';
  showImagePreview.value = false;
}

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

// 弹窗关闭时释放 blob URL，避免内存泄漏
watch(showImagePreview, (visible) => {
  if (!visible && generatedImageUrl.value && generatedImageUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(generatedImageUrl.value);
    generatedImageUrl.value = '';
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



// 用于移动端图片预览（缩放字号）
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
      // 桌面端：尝试写入剪贴板；失败时弹出图片供右键保存/复制
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
          const msg = err?.message || err?.name || String(err);
          console.warn('剪贴板写入失败:', err);
          generatedImageUrl.value = URL.createObjectURL(blob);
          showImagePreview.value = true;
          ElMessage.warning({
            message: `无法写入剪贴板（${msg}），请在弹出的图片上右键「复制图像」或「图片另存为」`,
            duration: 5000
          });
        }
      }, 'image/png', 1.0);
    }
  } catch (err) {
    const msg = err?.message || err?.name || String(err);
    console.error('截图失败:', err);
    ElMessage.error(`图片生成失败：${msg}`);
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
/* 单屏布局：禁止整页滚动，内容全部在一屏内 */
.font-to-image-container {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(160deg, #f0f4f8 0%, #e2e8f0 50%, #cbd5e1 100%);
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 主内容区：左右分栏，占满剩余高度，不超出视口 */
.main-content {
  display: flex;
  gap: 32px;
  width: 100%;
  max-width: 1360px;
  margin: 0 auto;
  align-items: stretch;
  justify-content: center;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.input-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  min-height: 0;
}

.input-card {
  width: 100%;
  max-width: 460px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04);
  border-radius: 20px;
  overflow: hidden;
  transition: box-shadow 0.25s ease, transform 0.25s ease;
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
  gap: 16px;
  min-height: 0;
  max-width: 460px;
}

.input-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04);
}

.input-header {
  padding: 22px 24px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  text-align: center;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
}

.input-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 6px 0;
  letter-spacing: 0.02em;
}

.input-subtitle {
  font-size: 0.85rem;
  opacity: 0.92;
  color: rgba(255, 255, 255, 0.95);
}



.input-area:focus {
  background: rgba(255, 255, 255, 0.05);
}

.control-panel {
  width: 100%;
  flex-shrink: 0;
  min-height: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.25s ease, transform 0.25s ease;
  overflow: visible;
}

.control-content {
  flex: 1;
  padding: 18px 22px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: visible;
}

.control-panel:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04);
}

.control-header {
  padding: 20px 24px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  text-align: center;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
}

.control-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 6px 0;
  letter-spacing: 0.02em;
}

.control-subtitle {
  font-size: 0.85rem;
  opacity: 0.92;
  color: rgba(255, 255, 255, 0.95);
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
  color: #475569;
  font-weight: 500;
  min-width: 72px;
  line-height: 1.4;
}

.font-size-controls {
  display: flex;
  gap: 6px;
}

.control-btn {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  color: white;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.control-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.control-select {
  width: 100%;
  max-width: 160px;
  min-width: 140px;
}

.control-select :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 8px;
  padding: 6px 10px;
  min-height: 32px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.control-select :deep(.el-input__wrapper:hover) {
  border-color: rgba(99, 102, 241, 0.4);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.12);
}

.copy-btn {
  width: 100%;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  color: white;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 12px 20px;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 8px;
  min-height: 44px;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
}

.copy-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.45);
}

.copy-btn:active {
  transform: translateY(0);
}

.copy-btn .btn-text {
  margin-left: 8px;
}

.preview-area {
  width: 100%;
  flex: 1;
  min-height: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.25s ease, transform 0.25s ease;
}

.preview-area:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04);
}

.preview-header {
  padding: 20px 24px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  text-align: center;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
}

.preview-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 6px 0;
  letter-spacing: 0.02em;
}

.preview-subtitle {
  font-size: 0.85rem;
  opacity: 0.92;
  color: rgba(255, 255, 255, 0.95);
}

.preview-card {
  flex: 1;
  min-height: 0;
  padding: 22px;
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
  margin: 14px;
  border-radius: 14px;
  transition: opacity 0.2s ease;
}

.preview-card--empty .preview-text {
  color: #94a3b8 !important;
  font-style: italic;
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
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
}

.preview-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
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
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  color: white;
  font-weight: 600;
  padding: 10px 24px;
  border-radius: 10px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.preview-dialog .dialog-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
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
    padding: 12px 16px;
  }
  
  .main-content {
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  
  .input-section, .right-section {
    width: 100%;
    max-width: 600px;
    min-height: 0;
  }
  
  .input-card {
    max-height: 100%;
    max-width: 100%;
  }
  
  .right-section {
    order: 1;
  }
  
  .input-section {
    order: 2;
  }
  
  .control-panel, .preview-area {
    max-width: 100%;
  }
  
  .preview-area {
    min-height: 120px;
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
