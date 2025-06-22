<template>
  <div>
    <TopMenu />
    <div class="font-to-image-row-container">
      <div class="font-to-image-left">
        <el-card class="input-card">
          <template #header>
            <div class="input-title">输入你的摘录文字</div>
          </template>
          <el-input
            v-model="inputText"
            type="textarea"
            :rows="20"
            placeholder="请输入你想生成图片的文字"
            class="input-area"
          />
        </el-card>
      </div>
      <div class="font-to-image-right">
        <div class="preview-title">预览效果</div>
        <!-- 背景类型选择 -->
        <el-select v-model="selectedBgType" placeholder="选择背景类型" size="small" style="margin-bottom: 0.7rem; width: 180px;">
          <el-option v-for="item in bgTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <!-- 背景选择 -->
        <el-select v-model="selectedBg" placeholder="选择背景" size="small" style="margin-bottom: 0.7rem; width: 180px;">
          <el-option v-for="item in currentBgOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-select v-model="selectedFont" placeholder="选择字体" size="small" style="margin-bottom: 0.7rem; width: 180px;">
          <el-option v-for="item in fontOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-button type="success" class="copy-btn" @click="copyImage" size="small">复制图片</el-button>
        <div
          ref="imageCardRef"
          class="weixin-card-preview"
          :class="selectedBg"
        >
          <div class="quote-mark">"</div>
          <div class="weixin-card-text" :style="{ color: computedTextColor, fontFamily: selectedFont || undefined }">
            {{ inputText || '这里会显示你的摘录内容' }}
          </div>
          <div class="weixin-card-date" :style="{ color: computedTextColor }">{{ todayStr }}</div>
        </div>
      </div>
    </div>

    <!-- 移动端图片预览弹窗 -->
    <el-dialog v-model="showImagePreview" title="保存图片" width="90%" center>
      <img :src="generatedImageUrl" style="width: 100%; border-radius: 8px;" alt="生成的图片" />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showImagePreview = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
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
  { label: '经典白', value: 'bg-white' },
  { label: '淡雅蓝', value: 'bg-blue' },
  { label: '活力橙', value: 'bg-orange' },
  { label: '淡灰卡片', value: 'bg-light-gray' },
  { label: '雅黑黑', value: 'bg-dark-black' },
  { label: '米黄纸', value: 'bg-milky-paper' },
  { label: '夜间深蓝', value: 'bg-night-blue' },
  { label: '淡粉紫', value: 'bg-light-pink-purple' },
  { label: '知乎白', value: 'bg-zhihu-white' },
  { label: '知乎淡蓝', value: 'bg-zhihu-light-blue' },
  { label: '知乎淡黄', value: 'bg-zhihu-light-yellow' },
  { label: '知乎淡绿', value: 'bg-zhihu-light-green' },
  { label: '知乎淡灰', value: 'bg-zhihu-light-gray' },
  { label: '小红书粉', value: 'bg-xiaohongshu-pink' },
  { label: '小红书紫', value: 'bg-xiaohongshu-purple' },
  { label: '小红书蓝', value: 'bg-xiaohongshu-blue' },
  { label: '小红书绿', value: 'bg-xiaohongshu-green' },
  { label: '小红书橙', value: 'bg-xiaohongshu-orange' }
];

// 渐变背景选项
const gradientBgOptions = [
  { label: '渐变绿', value: 'bg-gradient-green' },
  { label: '蓝紫渐变', value: 'bg-gradient-bluepurple' },
  { label: '橙粉渐变', value: 'bg-gradient-orange-pink' },
  { label: '青绿渐变', value: 'bg-gradient-cyan-green' },
  { label: '蓝紫竖向渐变', value: 'bg-v-gradient-bluepurple' },
  { label: '橙粉竖向渐变', value: 'bg-v-gradient-orange-pink' },
  { label: '青绿竖向渐变', value: 'bg-v-gradient-cyan-green' },
  { label: '柔和青蓝', value: 'bg-gradient-soft-cyan-blue' },
  { label: '柔粉橙黄', value: 'bg-gradient-soft-pink-orange' },
  { label: '柔紫蓝', value: 'bg-gradient-soft-purple-blue' },
  { label: '柔绿黄', value: 'bg-gradient-soft-green-yellow' },
  { label: '柔米白', value: 'bg-gradient-soft-milky' },
  { label: '知乎蓝白渐变', value: 'bg-zhihu-blue-white-gradient' },
  { label: '小红书粉紫渐变', value: 'bg-xiaohongshu-pink-purple' },
  { label: '小红书蓝粉渐变', value: 'bg-xiaohongshu-blue-pink' },
  { label: '日落渐变', value: 'bg-gradient-sunset' },
  { label: '海洋渐变', value: 'bg-gradient-ocean' },
  { label: '森林渐变', value: 'bg-gradient-forest' },
  { label: '星空渐变', value: 'bg-gradient-starry' },
  { label: '彩虹渐变', value: 'bg-gradient-rainbow' },
  { label: '极光渐变', value: 'bg-gradient-aurora' },
  { label: '沙漠渐变', value: 'bg-gradient-desert' },
  { label: '樱花渐变', value: 'bg-gradient-cherry' },
  { label: '薄荷渐变', value: 'bg-gradient-mint' },
  { label: '薰衣草渐变', value: 'bg-gradient-lavender' }
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
  { label: '小红书纸张', value: 'bg-xiaohongshu-paper' }
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

/**
 * @description 获取当前日期字符串，格式为YYYY-MM-DD
 */
function getTodayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
const todayStr = getTodayStr();

// 用于移动端图片预览
const showImagePreview = ref(false);
const generatedImageUrl = ref('');

/**
 * @function copyImage
 * @description 复制预览区图片到剪贴板
 */
const copyImage = async () => {
  if (!imageCardRef.value) return;
  try {
    const canvas = await html2canvas(imageCardRef.value, {
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
  }
};

/**
 * @description 字体选项
 */
const fontOptions = [
  { label: '默认', value: '' },
  { label: '微软雅黑', value: '"Microsoft YaHei", sans-serif' },
  { label: '思源黑体', value: '"Source Han Sans", "Noto Sans SC", sans-serif' },
  { label: '楷体', value: 'KaiTi, "楷体", serif' },
  { label: '仿宋', value: 'FangSong, "仿宋", serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Serif', value: 'serif' },
  { label: 'Monospace', value: 'monospace' }
];
const selectedFont = ref('');

// 背景与字体颜色搭配
const bgTextColorMap = {
  'bg-white': '#222',
  'bg-blue': '#222',
  'bg-orange': '#a35a00',
  'bg-gradient-green': '#1a4d2e',
  'bg-paper': '#6b4e16',
  'bg-gradient-bluepurple': '#fff',
  'bg-gradient-orange-pink': '#fff',
  'bg-gradient-cyan-green': '#1a4d2e',
  'bg-light-gray': '#222',
  'bg-top-blue-band': '#222',
  'bg-top-orange-band': '#a35a00',
  'bg-v-gradient-bluepurple': '#fff',
  'bg-v-gradient-orange-pink': '#fff',
  'bg-v-gradient-cyan-green': '#1a4d2e',
  'bg-dark-black': '#fff',
  'bg-milky-paper': '#6b4e16',
  'bg-night-blue': '#e0e6f6',
  'bg-light-pink-purple': '#7c4d8a',
  // 新增浅色系渐变字体色
  'bg-gradient-soft-cyan-blue': '#227488',
  'bg-gradient-soft-pink-orange': '#b87a4b',
  'bg-gradient-soft-purple-blue': '#5a6a8e',
  'bg-gradient-soft-green-yellow': '#6b8e23',
  'bg-gradient-soft-milky': '#7c6f57',
  // 新增知乎风格字体色
  'bg-zhihu-white': '#222',
  'bg-zhihu-light-blue': '#225488',
  'bg-zhihu-light-yellow': '#b89b4b',
  'bg-zhihu-light-green': '#3a7a3a',
  'bg-zhihu-light-gray': '#444',
  'bg-zhihu-blue-white-gradient': '#225488',
  // 新增小红书风格字体色
  'bg-xiaohongshu-pink': '#8e4a6b',
  'bg-xiaohongshu-purple': '#6b4a8e',
  'bg-xiaohongshu-blue': '#4a6b8e',
  'bg-xiaohongshu-green': '#4a8e6b',
  'bg-xiaohongshu-orange': '#8e6b4a',
  'bg-xiaohongshu-pink-purple': '#fff',
  'bg-xiaohongshu-blue-pink': '#fff',
  'bg-xiaohongshu-marble': '#4a4a4a',
  'bg-xiaohongshu-paper': '#6b4e16',
  // 新增格子背景字体色
  'bg-grid-white': '#222',
  'bg-grid-blue': '#1a4d8e',
  'bg-grid-pink': '#8e4a6b',
  'bg-grid-gray': '#444',
  'bg-grid-green': '#2d5a2d',
  // 新增更多渐变背景字体色
  'bg-gradient-sunset': '#fff',
  'bg-gradient-ocean': '#fff',
  'bg-gradient-forest': '#fff',
  'bg-gradient-starry': '#fff',
  'bg-gradient-rainbow': '#fff',
  'bg-gradient-aurora': '#fff',
  'bg-gradient-desert': '#8e6b4a',
  'bg-gradient-cherry': '#fff',
  'bg-gradient-mint': '#2d5a2d',
  'bg-gradient-lavender': '#6b4a8e'
};
const computedTextColor = computed(() => bgTextColorMap[selectedBg.value] || '#222');
</script>

<style scoped>
.font-to-image-row-container {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  gap: 2.5rem;
  max-width: 900px;
  margin: 2.5rem auto;
  width: 100%;
}
.font-to-image-left, .font-to-image-right {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.input-card {
  width: 100%;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  border-radius: 14px;
  min-height: 500px;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
}
.input-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d8cf0;
}
.input-area {
  margin-bottom: 0.5rem;
  min-height: 420px;
  height: 100%;
}
.preview-title {
  font-size: 1rem;
  color: #888;
  margin-bottom: 0.7rem;
  margin-top: 0.5rem;
  text-align: left;
}
.weixin-card-preview {
  width: 100%;
  min-height: 180px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.10), 0 1.5px 4px 0 rgba(0,0,0,0.03);
  padding: 2.2rem 1.5rem 1.5rem 1.5rem;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.2rem;
  box-sizing: border-box;
  border: 1px solid rgba(0,0,0,0.08);
  overflow: hidden;
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
.weixin-card-text {
  font-size: 1.18rem;
  line-height: 1.8;
  margin: 0.5rem 0 0.7rem 0;
  word-break: break-all;
  white-space: pre-wrap;
  min-height: 60px;
  width: 100%;
  transition: color 0.2s;
  flex: 1;
}
.weixin-card-date {
  font-size: 0.98rem;
  font-family: 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
  opacity: 0.85;
  margin-left: 0.1rem;
  margin-bottom: 0.2rem;
  text-align: right;
  align-self: flex-end;
  width: 100%;
  margin-top: 1rem;
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
@media (max-width: 900px) {
  .font-to-image-row-container {
    flex-direction: column;
    gap: 1.5rem;
    max-width: 98vw;
    margin: 1.2rem auto;
  }
  .font-to-image-left, .font-to-image-right {
    width: 100%;
  }
  .weixin-card-preview {
    min-height: 120px;
    padding: 1.2rem 0.7rem 1rem 0.7rem;
  }
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
.bg-zhihu-light-gray {
  background: #f5f5f7 !important;
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
</style>
