<template>
  <div class="ebook-convert-page">
    <TopMenu />
    <div class="main-container">
      <div class="hero-section">
        <div class="title">电子书格式转换</div>
        <div class="subtitle">支持 EPUB、AZW3 与 PDF 之间的转换</div>
      </div>

      <div class="content-container">
        <!-- 转换进度（EPUB→PDF 时显示，置顶便于看到） -->
        <el-card v-if="converting === 'epub2pdf'" class="progress-card progress-card--sticky" shadow="hover">
          <div class="progress-title">正在转换 EPUB → PDF（服务端）</div>
          <el-progress
            :percentage="Math.round(convertProgress)"
            :stroke-width="12"
            :format="() => (convertProgress >= 100 ? '即将下载…' : '上传并转换中…')"
          />
          <div class="progress-time">
            <span>已用时间：{{ formatTime(convertElapsed) }}</span>
          </div>
        </el-card>

        <!-- 文件上传 -->
        <el-card class="upload-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>选择源文件</span>
              <span v-if="sourceFile" class="upload-success-tag">
                <el-icon><circle-check-filled /></el-icon>
                已选择：{{ sourceFile.name }}
              </span>
            </div>
          </template>
          <el-upload
            class="upload-area"
            drag
            accept=".epub,.azw3"
            :auto-upload="false"
            :show-file-list="true"
            :limit="1"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :file-list="fileList"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将 EPUB 或 AZW3 文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">仅支持 .epub、.azw3 文件</div>
            </template>
          </el-upload>
        </el-card>

        <!-- 转换选项 -->
        <el-card class="options-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>选择转换类型</span>
            </div>
          </template>
          <el-row :gutter="[16, 16]">
            <el-col :xs="24" :sm="12">
              <div
                class="option-item"
                :class="{ disabled: !canEpubToPdf, converting: converting === 'epub2pdf' }"
                @click="convertEpubToPdf"
              >
                <div class="option-label">EPUB → PDF</div>
                <div class="option-desc">服务端 Puppeteer 渲染（推荐）</div>
                <el-button
                  type="primary"
                  size="small"
                  :loading="converting === 'epub2pdf'"
                  :disabled="!canEpubToPdf"
                >
                  {{ converting === 'epub2pdf' ? '转换中…' : '转换为 PDF' }}
                </el-button>
              </div>
            </el-col>
            <el-col :xs="24" :sm="12">
              <div
                class="option-item"
                :class="{ disabled: !hasEpubFile }"
                @click="convertEpubToAzw3"
              >
                <div class="option-label">EPUB → AZW3</div>
                <div class="option-desc">需服务端安装 Calibre</div>
                <el-button type="primary" size="small" :disabled="!hasEpubFile">
                  转换为 AZW3
                </el-button>
              </div>
            </el-col>
            <el-col :xs="24" :sm="12">
              <div
                class="option-item"
                :class="{ disabled: !hasAzw3File }"
                @click="convertAzw3ToEpub"
              >
                <div class="option-label">AZW3 → EPUB</div>
                <div class="option-desc">需服务端安装 Calibre</div>
                <el-button type="primary" size="small" :disabled="!hasAzw3File">
                  转换为 EPUB
                </el-button>
              </div>
            </el-col>
            <el-col :xs="24" :sm="12">
              <div
                class="option-item"
                :class="{ disabled: !hasAzw3File }"
                @click="convertAzw3ToPdf"
              >
                <div class="option-label">AZW3 → PDF</div>
                <div class="option-desc">需服务端安装 Calibre</div>
                <el-button type="primary" size="small" :disabled="!hasAzw3File">
                  转换为 PDF
                </el-button>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <!-- AZW3 说明 -->
        <el-alert
          class="azw3-tip"
          title="关于 AZW3 转换"
          type="info"
          :closable="false"
          show-icon
        >
          AZW3 为 Kindle 专有格式，EPUB↔AZW3、AZW3→PDF 需在服务端使用 Calibre 的 ebook-convert 完成。<strong>EPUB 转 PDF</strong> 由本地的 Node.js + Puppeteer 转换服务完成，请先运行 <code>ebook-convert-server</code>（默认 http://localhost:3001）。
        </el-alert>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import { UploadFilled, CircleCheckFilled } from "@element-plus/icons-vue";
import TopMenu from "./TopMenu.vue";

const fileList = ref([]);
const sourceFile = ref(null);
const sourceType = ref(null);
const converting = ref(null);
const convertProgress = ref(0);
const convertElapsed = ref(0);
let convertTimer = null;

function formatTime(seconds) {
  if (seconds == null || isNaN(seconds)) return "0秒";
  const s = Math.floor(seconds);
  if (s < 60) return `${s}秒`;
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return sec > 0 ? `${m}分${sec}秒` : `${m}分`;
}

const hasEpubFile = computed(() => sourceType.value === "epub");
const hasAzw3File = computed(() => sourceType.value === "azw3");
const canEpubToPdf = computed(() => sourceType.value === "epub" && sourceFile.value);

function handleFileChange(file) {
  const raw = file.raw;
  const name = (raw && raw.name) || "";
  const isEpub =
    (raw && raw.type === "application/epub+zip") || name.toLowerCase().endsWith(".epub");
  const isAzw3 =
    (raw && raw.name && raw.name.toLowerCase().endsWith(".azw3")) ||
    (raw && raw.type && raw.type.indexOf("octet-stream") >= 0 && raw.name && raw.name.toLowerCase().endsWith(".azw3"));

  if (!isEpub && !isAzw3) {
    ElMessage.warning("请上传 .epub 或 .azw3 文件");
    fileList.value = [];
    sourceFile.value = null;
    sourceType.value = null;
    return;
  }
  sourceFile.value = raw;
  sourceType.value = isEpub ? "epub" : "azw3";
  fileList.value = [{ name: raw.name, status: "ready", uid: Date.now(), raw }];
  ElMessage.success(`已选择文件：${raw.name}`);
}

function handleFileRemove() {
  fileList.value = [];
  sourceFile.value = null;
  sourceType.value = null;
}

function convertEpubToAzw3() {
  if (!hasEpubFile.value) return;
  ElMessage.info("AZW3 转换需服务端安装 Calibre（ebook-convert），暂不支持在浏览器中完成。");
}

function convertAzw3ToEpub() {
  if (!hasAzw3File.value) return;
  ElMessage.info("AZW3 转换需服务端安装 Calibre（ebook-convert），暂不支持在浏览器中完成。");
}

function convertAzw3ToPdf() {
  if (!hasAzw3File.value) return;
  ElMessage.info("AZW3 转换需服务端安装 Calibre（ebook-convert），暂不支持在浏览器中完成。");
}

const ebookConvertApiBase = typeof process !== "undefined" && process.env && process.env.VUE_APP_EBOOK_CONVERT_API != null
  ? process.env.VUE_APP_EBOOK_CONVERT_API
  : "http://localhost:3001";

async function convertEpubToPdf() {
  if (!canEpubToPdf.value || !sourceFile.value) return;
  converting.value = "epub2pdf";
  convertProgress.value = 0;
  convertElapsed.value = 0;
  const startTime = Date.now();
  if (convertTimer) clearInterval(convertTimer);
  convertTimer = setInterval(() => {
    convertElapsed.value = (Date.now() - startTime) / 1000;
  }, 500);
  try {
    const apiUrl = `${ebookConvertApiBase.replace(/\/$/, "")}/convert/epub2pdf`;
    convertProgress.value = 20;
    const form = new FormData();
    form.append("epub", sourceFile.value);
    convertProgress.value = 40;
    const res = await fetch(apiUrl, {
      method: "POST",
      body: form,
    });
    convertProgress.value = 90;
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || res.statusText || "转换失败");
    }
    const pdfBlob = await res.blob();
    convertProgress.value = 100;
    const disposition = res.headers.get("Content-Disposition");
    let name = sourceFile.value.name.replace(/\.epub$/i, "") || "converted";
    if (disposition) {
      const m = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i) || disposition.match(/filename=["']?([^"';]+)["']?/i);
      if (m && m[1]) name = decodeURIComponent(m[1].replace(/\.pdf$/i, "") || name);
    }
    downloadBlob(pdfBlob, name.endsWith(".pdf") ? name : `${name}.pdf`);
    ElMessage.success("EPUB 已转换为 PDF，已开始下载。");
  } catch (e) {
    console.error("epub to pdf error:", e);
    ElMessage.error("转换失败：" + (e && e.message ? e.message : String(e)));
  } finally {
    converting.value = null;
    if (convertTimer) {
      clearInterval(convertTimer);
      convertTimer = null;
    }
  }
}

function downloadBlob(blob, filename) {
  const safeBlob =
    blob instanceof Blob
      ? blob
      : new Blob([blob], { type: "application/pdf" });
  const url = URL.createObjectURL(safeBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

</script>

<style scoped>
.ebook-convert-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.main-container {
  flex: 1;
  padding: 20px 0 40px;
}

.hero-section {
  text-align: center;
  padding: 24px 20px 16px;
  color: white;
}

.title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.subtitle {
  font-size: 1rem;
  opacity: 0.9;
}

.content-container {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 16px;
}

.upload-card,
.options-card {
  margin-bottom: 20px;
  border-radius: 12px;
  border: none;
  background: rgba(255, 255, 255, 0.95);
}

.card-header {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.upload-success-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--el-color-success);
}

.upload-success-tag .el-icon {
  font-size: 1.1rem;
}

.upload-area {
  width: 100%;
}

.upload-area :deep(.el-upload-dragger) {
  width: 100%;
}

.option-item {
  padding: 16px;
  border-radius: 12px;
  background: #f7f8fa;
  border: 1px solid #e8e8e8;
  transition: all 0.2s;
}

.option-item:hover:not(.disabled) {
  border-color: #667eea;
  background: #f0f2ff;
}

.option-item.disabled {
  opacity: 0.7;
}

.option-item.converting {
  border-color: #667eea;
  background: #e8ebff;
}

.option-label {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.option-desc {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 12px;
}

.progress-card {
  margin-bottom: 20px;
  border-radius: 12px;
  border: none;
  background: rgba(255, 255, 255, 0.95);
}

.progress-card--sticky {
  position: sticky;
  top: 12px;
  z-index: 10;
}

.progress-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
}

.progress-time {
  margin-top: 12px;
  font-size: 0.9rem;
  color: #666;
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.progress-time-hint {
  color: #999;
}

.azw3-tip {
  margin-top: 16px;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .title {
    font-size: 1.5rem;
  }
  .subtitle {
    font-size: 0.9rem;
  }
}
</style>
