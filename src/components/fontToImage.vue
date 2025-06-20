<template>
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
      <el-radio-group v-model="selectedBg" class="bg-radio-group" size="small">
        <el-radio-button
          v-for="item in bgOptions"
          :key="item.value"
          :label="item.value"
        >{{ item.label }}</el-radio-button>
      </el-radio-group>
      <div
        ref="imageCardRef"
        class="weixin-card-preview"
        :class="selectedBg"
      >
        <div class="quote-mark">"</div>
        <div class="weixin-card-text">{{ inputText || '这里会显示你的摘录内容' }}</div>
        <div class="weixin-card-footer-row">
          <div class="weixin-card-date">{{ todayStr }}</div>
          <div class="weixin-card-footer">—— 云胡工具集 · 摘录</div>
        </div>
      </div>
      <el-button type="success" class="copy-btn" @click="copyImage">复制图片</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import html2canvas from 'html2canvas';
import { ElMessage } from 'element-plus';

/**
 * @description 背景选项（丰富微信读书风格）
 */
const bgOptions = [
  { label: '经典白', value: 'bg-white' },
  { label: '淡雅蓝', value: 'bg-blue' },
  { label: '活力橙', value: 'bg-orange' },
  { label: '渐变绿', value: 'bg-gradient-green' },
  { label: '纸张纹理', value: 'bg-paper' },
  { label: '蓝紫渐变', value: 'bg-gradient-bluepurple' },
  { label: '橙粉渐变', value: 'bg-gradient-orange-pink' },
  { label: '青绿渐变', value: 'bg-gradient-cyan-green' },
  { label: '淡灰卡片', value: 'bg-light-gray' },
  { label: '顶部蓝色色带', value: 'bg-top-blue-band' },
  { label: '顶部橙色色带', value: 'bg-top-orange-band' },
  { label: '蓝紫竖向渐变', value: 'bg-v-gradient-bluepurple' },
  { label: '橙粉竖向渐变', value: 'bg-v-gradient-orange-pink' },
  { label: '青绿竖向渐变', value: 'bg-v-gradient-cyan-green' }
];
const selectedBg = ref('bg-white');

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

/**
 * @function exportImage
 * @description 导出预览区为图片
 */
const exportImage = async () => {
  if (!inputText.value.trim()) {
    ElMessage.error('请输入要导出的文字');
    return;
  }
  if (!imageCardRef.value) return;
  try {
    const canvas = await html2canvas(imageCardRef.value, {
      backgroundColor: null,
      useCORS: true,
      scale: 2
    });
    const link = document.createElement('a');
    link.download = 'weixin-read-quote.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    ElMessage.success('图片导出成功');
  } catch (e) {
    ElMessage.error('图片导出失败');
  }
};

/**
 * @function copyImage
 * @description 复制预览区图片到剪贴板
 */
const copyImage = async () => {
  if (!imageCardRef.value) return;
  try {
    const canvas = await html2canvas(imageCardRef.value, {
      backgroundColor: null,
      useCORS: true,
      scale: 2
    });
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
        ElMessage.error('复制图片到剪贴板失败，建议使用最新版 Chrome/Edge 浏览器');
      }
    }, 'image/png');
  } catch (err) {
    ElMessage.error('图片生成失败');
  }
};
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
  justify-content: center;
  margin-bottom: 1.2rem;
  box-sizing: border-box;
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
  color: #222;
  line-height: 1.8;
  margin: 0.5rem 0 1.2rem 0;
  word-break: break-all;
  white-space: pre-wrap;
  min-height: 60px;
  width: 100%;
}
.weixin-card-footer-row {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
.weixin-card-date {
  font-size: 0.98rem;
  color: #222;
  font-family: 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
  opacity: 1;
  margin-left: 0.1rem;
}
.weixin-card-footer {
  align-self: flex-end;
  font-size: 0.98rem;
  color: #222;
  font-family: 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
  margin-top: 0.5rem;
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
</style>
