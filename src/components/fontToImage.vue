<template>
  <div class="font-to-image-container">
    <TopMenu />
    <header class="page-heading">
      <div class="page-heading-inner">
        <div class="page-heading-text">
          <h1 class="page-title">摘录卡片</h1>
          <p class="page-desc">
            输入文字，右侧同步预览；顶部图标可复制或下载图片；「样式设置」调整字号、背景与字体
          </p>
        </div>
        <div class="page-heading-actions">
          <el-button size="default" class="page-action-btn" @click="openStylePanel">样式设置</el-button>
          <el-tooltip content="复制到剪贴板" placement="bottom">
            <el-button
              circle
              class="page-icon-btn"
              aria-label="复制到剪贴板"
              @click="copyImage"
            >
              <el-icon :size="18"><CopyDocument /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="下载图片" placement="bottom">
            <el-button
              circle
              type="primary"
              class="page-icon-btn page-icon-btn--primary"
              aria-label="下载图片"
              @click="downloadImage"
            >
              <el-icon :size="18"><Download /></el-icon>
            </el-button>
          </el-tooltip>
          <RouterLink to="/utilIndex" class="page-back-link">← 工具列表</RouterLink>
        </div>
      </div>
    </header>

    <div class="main-content">
      <div class="input-section">
        <div class="input-card">
          <div class="input-header">
            <span class="card-header-accent" aria-hidden="true" />
            <div class="card-header-text">
              <h3 class="input-title">文字输入</h3>
              <p class="input-subtitle">与右侧预览区域等高，导出与预览一致</p>
            </div>
          </div>
          <div class="input-body">
            <el-input
              v-model="inputText"
              type="textarea"
              :autosize="false"
              placeholder="输入或粘贴摘录、金句…"
              class="input-area-el"
            />
          </div>
        </div>
      </div>

      <div class="right-section">
        <div class="preview-area">
          <div class="preview-header">
            <span class="card-header-accent" aria-hidden="true" />
            <div class="card-header-text">
              <h3 class="preview-title">实时预览</h3>
              <p class="preview-subtitle">生成后将尝试复制到剪贴板；失败时可长按图片保存</p>
            </div>
          </div>
          <div class="preview-body">
            <div
              ref="imageCardRef"
              class="preview-card"
              :class="[selectedBg, { 'preview-card--empty': !inputText.trim() }]"
            >
              <div
                class="preview-text"
                :style="{
                  color: computedTextColor,
                  fontFamily: selectedFont || undefined,
                  fontSize: previewFontSize + 'rem',
                }"
              >
                {{ inputText || '预览区域：输入文字后即显示效果' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 样式设置：默认隐藏，点击后遮罩 + 面板 -->
    <Teleport to="body">
      <Transition name="style-overlay">
        <div
          v-show="showStylePanel"
          class="style-overlay-root"
          role="dialog"
          aria-modal="true"
          aria-labelledby="style-panel-title"
        >
          <div class="style-mask-bg" @click="closeStylePanel" />
          <div class="style-drawer-center">
            <div class="style-drawer" @click.stop>
              <div class="style-drawer-header">
                <div class="style-drawer-title-wrap">
                  <span class="style-drawer-accent" aria-hidden="true" />
                  <div>
                    <h2 id="style-panel-title" class="style-drawer-title">样式设置</h2>
                    <p class="style-drawer-sub">字号、背景与字体</p>
                  </div>
                </div>
                <el-button text type="primary" class="style-drawer-close" @click="closeStylePanel">关闭</el-button>
              </div>
              <div class="control-content style-drawer-body">
                <div class="control-stack">
                  <label class="control-label">字体大小</label>
                  <div class="font-size-row">
                    <el-button size="small" class="control-btn" @click="decreaseFontSize">A−</el-button>
                    <span class="font-size-pill">{{ previewFontSize.toFixed(1) }} rem</span>
                    <el-button size="small" class="control-btn" @click="increaseFontSize">A+</el-button>
                  </div>
                </div>

                <el-divider class="control-divider" />

                <p class="control-section-label">外观</p>
                <div class="control-stack">
                  <label class="control-label">背景类型</label>
                  <el-select
                    v-model="selectedBgType"
                    placeholder="选择背景类型"
                    size="default"
                    class="control-select control-select--full"
                    :popper-class="styleSelectPopperClass"
                  >
                    <el-option
                      v-for="item in bgTypeOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </div>
                <div class="control-stack">
                  <label class="control-label">背景样式</label>
                  <el-select
                    v-model="selectedBg"
                    placeholder="选择背景"
                    size="default"
                    class="control-select control-select--full"
                    filterable
                    :popper-class="styleSelectPopperClass"
                  >
                    <el-option
                      v-for="item in currentBgOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </div>
                <div class="control-stack">
                  <label class="control-label">字体</label>
                  <el-select
                    v-model="selectedFont"
                    placeholder="选择字体"
                    size="default"
                    class="control-select control-select--full"
                    :popper-class="styleSelectPopperClass"
                  >
                    <el-option
                      v-for="item in fontOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </div>

                <div class="drawer-export-row">
                  <el-tooltip content="复制到剪贴板" placement="top">
                    <el-button
                      circle
                      type="primary"
                      class="drawer-icon-btn"
                      aria-label="复制到剪贴板"
                      @click="onCopyFromPanel"
                    >
                      <el-icon :size="20"><CopyDocument /></el-icon>
                    </el-button>
                  </el-tooltip>
                  <el-tooltip content="下载图片" placement="top">
                    <el-button
                      circle
                      class="drawer-icon-btn drawer-icon-btn--outline"
                      aria-label="下载图片"
                      @click="onDownloadFromPanel"
                    >
                      <el-icon :size="20"><Download /></el-icon>
                    </el-button>
                  </el-tooltip>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

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
import { ref, computed, watch, onMounted, onUnmounted, onBeforeUnmount } from 'vue';
import { RouterLink } from 'vue-router';
import html2canvas from 'html2canvas';
import { ElMessage } from 'element-plus';
import { CopyDocument, Download } from '@element-plus/icons-vue';
import TopMenu from './TopMenu.vue';

// 用于移动端 / 桌面弹窗预览图片
const showImagePreview = ref(false);
const generatedImageUrl = ref('');

/** 样式设置浮层（默认关闭，点击后遮罩展示） */
const showStylePanel = ref(false);

/** el-select 下拉 teleport 到 body 时 z-index 需高于 .style-overlay-root(3100) */
const styleSelectPopperClass = 'font-to-image-style-select-popper';

function openStylePanel() {
  showStylePanel.value = true;
}

function closeStylePanel() {
  showStylePanel.value = false;
}

function onStylePanelEsc(e) {
  if (e.key === 'Escape') {
    closeStylePanel();
  }
}

watch(showStylePanel, (open) => {
  if (open) {
    document.addEventListener('keydown', onStylePanelEsc);
  } else {
    document.removeEventListener('keydown', onStylePanelEsc);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onStylePanelEsc);
});

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
 * 将预览卡片渲染为 canvas（展开高度以便截全）
 * @returns {Promise<HTMLCanvasElement | null>}
 */
async function captureCardToCanvas() {
  if (!imageCardRef.value) return null;
  const card = imageCardRef.value;
  const originalMaxHeight = card.style.maxHeight;
  const originalOverflowY = card.style.overflowY;
  card.style.maxHeight = 'none';
  card.style.overflowY = 'visible';
  try {
    return await html2canvas(card, {
      backgroundColor: '#ffffff',
      useCORS: true,
      scale: 3,
      allowTaint: false,
      foreignObjectRendering: false,
      logging: false,
      imageTimeout: 0,
      removeContainer: true,
    });
  } catch (err) {
    const msg = err?.message || err?.name || String(err);
    console.error('截图失败:', err);
    ElMessage.error(`图片生成失败：${msg}`);
    return null;
  } finally {
    card.style.maxHeight = originalMaxHeight;
    card.style.overflowY = originalOverflowY;
  }
}

/**
 * @description 复制预览区图片到剪贴板
 */
const copyImage = async () => {
  const canvas = await captureCardToCanvas();
  if (!canvas) return;

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  if (isMobile) {
    generatedImageUrl.value = canvas.toDataURL('image/png', 1.0);
    showImagePreview.value = true;
    ElMessage.info('请长按图片进行保存或复制');
    return;
  }

  canvas.toBlob(async (blob) => {
    if (!blob) {
      ElMessage.error('图片生成失败');
      return;
    }
    try {
      await navigator.clipboard.write([new window.ClipboardItem({ 'image/png': blob })]);
      ElMessage.success('图片已复制到剪贴板，可直接粘贴');
    } catch (err) {
      const msg = err?.message || err?.name || String(err);
      console.warn('剪贴板写入失败:', err);
      generatedImageUrl.value = URL.createObjectURL(blob);
      showImagePreview.value = true;
      ElMessage.warning({
        message: `无法写入剪贴板（${msg}），请在弹出的图片上右键「复制图像」或「图片另存为」`,
        duration: 5000,
      });
    }
  }, 'image/png', 1.0);
};

/**
 * @description 下载预览区截图为 PNG
 */
const downloadImage = async () => {
  const canvas = await captureCardToCanvas();
  if (!canvas) return;

  canvas.toBlob(
    (blob) => {
      if (!blob) {
        ElMessage.error('图片生成失败');
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const t = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      a.download = `摘录卡片-${t.getFullYear()}${pad(t.getMonth() + 1)}${pad(t.getDate())}-${pad(t.getHours())}${pad(t.getMinutes())}${pad(t.getSeconds())}.png`;
      a.href = url;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      ElMessage.success('已下载图片');
    },
    'image/png',
    1.0
  );
};

async function onCopyFromPanel() {
  await copyImage();
  closeStylePanel();
}

async function onDownloadFromPanel() {
  await downloadImage();
  closeStylePanel();
}

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
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0 20px 16px;
  background: var(--site-bg);
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    sans-serif;
}

.page-heading {
  flex-shrink: 0;
  padding: 12px 0 14px;
  border-bottom: 1px solid var(--site-border);
  margin-bottom: 4px;
}

.page-heading-inner {
  max-width: 1360px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px 20px;
}

.page-title {
  margin: 0 0 4px;
  font-size: 1.35rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--site-heading);
}

.page-desc {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--site-muted);
}

.page-back-link {
  font-size: 0.875rem;
  color: var(--site-muted);
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.15s ease;
}

.page-back-link:hover {
  color: var(--site-accent);
}

.page-heading-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.page-icon-btn.el-button.is-circle {
  width: 40px;
  height: 40px;
  padding: 0;
  border: 1px solid var(--site-border);
  background: var(--site-surface-solid);
  color: var(--site-heading);
}

.page-icon-btn.el-button.is-circle:hover {
  border-color: rgb(37 99 235 / 0.45);
  color: var(--site-accent);
  background: var(--site-surface);
}

.page-icon-btn--primary.el-button.is-circle {
  border-color: transparent;
  box-shadow: 0 4px 12px rgb(37 99 235 / 0.28);
}

.main-content {
  display: flex;
  gap: 24px;
  width: 100%;
  max-width: 1360px;
  margin: 0 auto;
  align-items: stretch;
  justify-content: center;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 12px 12px 16px;
  box-sizing: border-box;
}

.input-section,
.right-section {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
}

.input-card,
.preview-area {
  width: 100%;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.input-card {
  flex: 1;
  min-height: 0;
  margin: 0 10px;
  background: var(--site-surface);
  border: 1px solid var(--site-border);
  box-shadow: var(--site-card-shadow);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.2s ease;
}

.input-card:hover {
  box-shadow: 0 4px 20px rgb(15 23 42 / 0.08);
}

.preview-area {
  margin: 0 10px;
  background: var(--site-surface);
  border: 1px solid var(--site-border);
  border-radius: 16px;
  box-shadow: var(--site-card-shadow);
  overflow: hidden;
  transition: box-shadow 0.2s ease;
}

.preview-area:hover {
  box-shadow: 0 4px 20px rgb(15 23 42 / 0.08);
}

.input-header,
.preview-header {
  display: flex;
  align-items: stretch;
  flex-shrink: 0;
  background: var(--site-surface-solid);
  border-bottom: 1px solid var(--site-border);
}

.card-header-accent {
  width: 4px;
  flex-shrink: 0;
  background: var(--site-accent);
}

.card-header-text {
  flex: 1;
  padding: 14px 16px 14px 14px;
  text-align: left;
  min-width: 0;
}

.input-title,
.preview-title {
  font-size: 1.05rem;
  font-weight: 600;
  margin: 0 0 4px;
  color: var(--site-heading);
  letter-spacing: -0.01em;
}

.input-subtitle,
.preview-subtitle {
  font-size: 0.8125rem;
  line-height: 1.45;
  margin: 0;
  color: var(--site-muted);
}

.input-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 12px 14px 14px;
}

.input-area-el {
  flex: 1;
  min-height: 0;
  width: 100%;
}

.input-area-el :deep(.el-textarea) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.input-area-el :deep(.el-textarea__inner) {
  flex: 1;
  min-height: 0;
  height: 100% !important;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: var(--site-heading);
  border: 1px solid var(--site-border);
  background: var(--site-surface-solid);
  box-shadow: none;
  resize: none;
}

.input-area-el :deep(.el-textarea__inner:focus) {
  border-color: rgb(37 99 235 / 0.45);
  box-shadow: 0 0 0 1px rgb(37 99 235 / 0.12);
}

.control-content {
  padding: 12px 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.control-divider {
  margin: 12px 0;
}

.control-section-label {
  margin: 0 0 8px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--site-muted);
}

.control-stack {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
}

.control-stack:last-of-type {
  margin-bottom: 4px;
}

.control-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--site-heading);
  line-height: 1.3;
}

.font-size-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.font-size-pill {
  min-width: 4.75rem;
  text-align: center;
  font-variant-numeric: tabular-nums;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--site-heading);
  padding: 7px 12px;
  border-radius: 999px;
  background: rgb(37 99 235 / 0.09);
  border: 1px solid rgb(37 99 235 / 0.2);
}

.control-btn {
  min-width: 40px;
  font-weight: 600;
}

.control-select--full {
  width: 100%;
  max-width: 100%;
}

.control-select :deep(.el-input__wrapper) {
  border-radius: 10px;
  border: 1px solid var(--site-border);
  background: var(--site-surface-solid);
  box-shadow: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.control-select :deep(.el-input__wrapper:hover) {
  border-color: rgb(37 99 235 / 0.35);
}

.control-select :deep(.el-input__wrapper.is-focus) {
  border-color: var(--site-accent);
  box-shadow: 0 0 0 1px rgb(37 99 235 / 0.15);
}

.drawer-export-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 18px;
  padding-top: 4px;
}

.drawer-icon-btn.el-button.is-circle {
  width: 44px;
  height: 44px;
  padding: 0;
}

.drawer-icon-btn--outline.el-button.is-circle {
  border: 1px solid var(--site-border);
  background: var(--site-surface-solid);
  color: var(--site-heading);
}

.drawer-icon-btn--outline.el-button.is-circle:hover {
  border-color: rgb(37 99 235 / 0.45);
  color: var(--site-accent);
}

.preview-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 12px 14px 14px;
  box-sizing: border-box;
}

.preview-card {
  flex: 1;
  min-height: 0;
  margin: 0;
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
  border-radius: 12px;
  outline: 1px solid rgb(15 23 42 / 0.06);
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
  min-height: 0;
  width: 100%;
  transition: color 0.2s;
  flex: 1;
  text-align: left;
}

/* 样式设置：全屏遮罩 + 居中面板 */
.style-overlay-root {
  position: fixed;
  inset: 0;
  z-index: 3100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right))
    max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
}

.style-mask-bg {
  position: absolute;
  inset: 0;
  background: rgb(15 23 42 / 0.48);
  backdrop-filter: blur(4px);
  cursor: pointer;
}

.style-drawer-center {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 440px;
  max-height: min(88vh, 720px);
  display: flex;
  align-items: stretch;
  justify-content: center;
  pointer-events: none;
}

.style-drawer {
  pointer-events: auto;
  cursor: default;
  width: 100%;
  display: flex;
  flex-direction: column;
  max-height: min(88vh, 720px);
  background: var(--site-surface);
  border: 1px solid var(--site-border);
  border-radius: 16px;
  box-shadow: 0 24px 48px rgb(15 23 42 / 0.2);
  overflow: hidden;
}

.style-drawer-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 14px 12px;
  border-bottom: 1px solid var(--site-border);
  background: var(--site-surface-solid);
  flex-shrink: 0;
}

.style-drawer-title-wrap {
  display: flex;
  align-items: stretch;
  gap: 0;
  min-width: 0;
}

.style-drawer-accent {
  width: 4px;
  flex-shrink: 0;
  background: var(--site-accent);
  border-radius: 2px;
  margin-right: 10px;
}

.style-drawer-title {
  margin: 0 0 4px;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--site-heading);
  letter-spacing: -0.01em;
}

.style-drawer-sub {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--site-muted);
  line-height: 1.45;
}

.style-drawer-close {
  flex-shrink: 0;
}

.style-drawer-body {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  -webkit-overflow-scrolling: touch;
}

.style-overlay-enter-active,
.style-overlay-leave-active {
  transition: opacity 0.22s ease;
}

.style-overlay-enter-active .style-drawer,
.style-overlay-leave-active .style-drawer {
  transition: transform 0.22s ease, opacity 0.22s ease;
}

.style-overlay-enter-from,
.style-overlay-leave-to {
  opacity: 0;
}

.style-overlay-enter-from .style-drawer,
.style-overlay-leave-to .style-drawer {
  opacity: 0;
  transform: scale(0.96) translateY(8px);
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
  background: var(--site-surface-solid);
  color: var(--site-heading);
  padding: 20px 25px;
  border-bottom: 1px solid var(--site-border);
}

.preview-dialog :deep(.el-dialog__title) {
  color: var(--site-heading);
  font-weight: 600;
  font-size: 1.2rem;
}

.preview-dialog :deep(.el-dialog__body) {
  padding: 25px;
  background: var(--site-bg);
}

.preview-dialog :deep(.el-dialog__footer) {
  background: var(--site-bg);
  border-top: 1px solid var(--site-border);
  padding: 20px 25px;
}

.preview-dialog .dialog-btn {
  background: var(--site-accent);
  border: none;
  color: white;
  font-weight: 600;
  padding: 10px 24px;
  border-radius: 10px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.preview-dialog .dialog-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgb(37 99 235 / 0.35);
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
    gap: 20px;
  }
}

@media (max-width: 900px) {
  .font-to-image-container {
    padding: 12px 16px;
  }

  .main-content {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .input-section,
  .right-section {
    width: 100%;
    max-width: 640px;
    margin-left: auto;
    margin-right: auto;
    flex: 1 1 0;
    min-height: 0;
  }

  .input-card,
  .preview-area {
    flex: 1 1 0;
    min-height: 200px;
    margin: 0 8px;
  }

  .right-section {
    order: 1;
  }

  .input-section {
    order: 2;
  }
}

@media (max-width: 600px) {
  .font-to-image-container {
    padding: 8px 12px 12px;
  }

  .page-heading {
    padding: 8px 0 10px;
  }

  .page-title {
    font-size: 1.2rem;
  }

  .main-content {
    gap: 12px;
    padding: 8px 6px 12px;
  }

  .input-card,
  .preview-area {
    margin: 0 6px;
    border-radius: 12px;
  }

  .card-header-text {
    padding: 12px 12px 12px 10px;
  }

  .input-body {
    padding: 10px 12px 12px;
  }

  .preview-card {
    margin: 10px;
    padding: 16px;
  }

  .control-content {
    padding: 10px 12px 12px;
  }

  .control-select {
    max-width: 100%;
  }
}
</style>

<!-- 下拉挂在 body 上，scoped 选不中；z-index 须高于 .style-overlay-root -->
<style>
.font-to-image-style-select-popper {
  z-index: 5000 !important;
}
</style>
