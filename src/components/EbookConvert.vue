<template>
  <div class="ebook-convert-page">
    <el-tooltip content="返回小工具集" placement="right">
      <RouterLink to="/utilIndex" class="ebook-back-fab" aria-label="返回小工具集">
        <el-icon :size="18"><ArrowLeft /></el-icon>
      </RouterLink>
    </el-tooltip>

    <div class="main-container">
      <div class="hero-section">
        <div class="title">电子书格式转换</div>
        <div class="subtitle">EPUB 转 PDF（需本地转换服务）</div>
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
            accept=".epub"
            :auto-upload="false"
            :show-file-list="true"
            :limit="1"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :file-list="fileList"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将 EPUB 文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">仅支持 .epub</div>
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
            <el-col :span="24">
              <div
                class="option-item"
                :class="{ disabled: !canEpubToPdf, converting: converting === 'epub2pdf' }"
                @click="convertEpubToPdf"
              >
                <div class="option-label">EPUB → PDF</div>
                <div class="option-desc">本地 Node + Puppeteer；开发时经当前站点 /ebook-convert 代理到 :3001</div>
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
          </el-row>
        </el-card>

        <el-alert
          class="ebook-convert-tip"
          title="使用说明"
          type="info"
          :closable="false"
          show-icon
        >
          请先启动 <code>ebook-convert-server</code>（默认监听 <code>:3001</code>）。开发环境下请求走 <code>/ebook-convert</code> 由 Vite 转发，无需处理 CORS。若仍失败，可在 <code>.env</code> 中设置 <code>VITE_EBOOK_CONVERT_PROXY_TARGET</code>（手机访问 dev 时常需改为电脑局域网 IP）；仅当需要直连时才设 <code>VITE_EBOOK_CONVERT_API</code>（须服务端允许跨域）。
        </el-alert>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { RouterLink } from "vue-router";
import { ElMessage } from "element-plus";
import { UploadFilled, CircleCheckFilled, ArrowLeft } from "@element-plus/icons-vue";

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

const canEpubToPdf = computed(() => sourceType.value === "epub" && sourceFile.value);

function handleFileChange(file) {
  const raw = file.raw;
  const name = (raw && raw.name) || "";
  const isEpub =
    (raw && raw.type === "application/epub+zip") || name.toLowerCase().endsWith(".epub");

  if (!isEpub) {
    ElMessage.warning("请上传 .epub 文件");
    fileList.value = [];
    sourceFile.value = null;
    sourceType.value = null;
    return;
  }
  sourceFile.value = raw;
  sourceType.value = "epub";
  fileList.value = [{ name: raw.name, status: "ready", uid: Date.now(), raw }];
  ElMessage.success(`已选择文件：${raw.name}`);
}

function handleFileRemove() {
  fileList.value = [];
  sourceFile.value = null;
  sourceType.value = null;
}

/**
 * EPUB→PDF 接口地址：
 * - 若设置 VITE_EBOOK_CONVERT_API（完整 URL），则直连（需服务端允许 CORS）
 * - 否则走同源路径 /{base}ebook-convert/convert/epub2pdf，由 Vite 开发代理或线上 Nginx 转发到 :3001
 */
function getEpub2PdfUrl() {
  const fromEnv = (import.meta.env.VITE_EBOOK_CONVERT_API || "").trim();
  if (fromEnv) {
    return `${fromEnv.replace(/\/$/, "")}/convert/epub2pdf`;
  }
  const base = import.meta.env.BASE_URL || "/";
  const root = base.endsWith("/") ? base : `${base}/`;
  return `${root}ebook-convert/convert/epub2pdf`.replace(/([^:])\/{2,}/g, "$1/");
}

function formatFetchError(err) {
  const msg = err && err.message ? String(err.message) : String(err);
  if (msg === "Failed to fetch" || msg.includes("NetworkError") || msg.includes("Load failed")) {
    console.warn(
      "[EbookConvert] 网络错误：请确认 ebook-convert-server 已启动；开发环境应删除 .env 中的 VITE_EBOOK_CONVERT_API 以走 /ebook-convert 代理；手机访问 dev 时设置 VITE_EBOOK_CONVERT_PROXY_TARGET 为电脑局域网 IP。"
    );
    return "无法连接转换服务（请确认 :3001 已启动，并优先使用 Vite 代理而非直连跨域）";
  }
  return msg;
}

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
    const apiUrl = getEpub2PdfUrl();
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
    ElMessage.error("转换失败：" + formatFetchError(e));
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
  background: transparent;
}

.ebook-back-fab {
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 2000;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--site-surface-solid);
  border: 1px solid var(--site-border);
  color: var(--site-heading);
  box-shadow: var(--site-card-shadow);
  text-decoration: none;
  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.15s ease;
}

.ebook-back-fab:hover {
  color: var(--site-accent);
  border-color: var(--site-accent);
  box-shadow: 0 2px 12px rgb(15 23 42 / 0.08);
}

.ebook-back-fab:active {
  transform: scale(0.96);
}

.main-container {
  flex: 1;
  padding: 56px 0 40px;
}

.hero-section {
  text-align: center;
  padding: 24px 20px 16px;
  color: var(--site-heading);
  border-bottom: 1px solid var(--site-border);
}

.title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: var(--site-heading);
  text-shadow: none;
}

.subtitle {
  font-size: 1rem;
  color: var(--site-muted);
  opacity: 1;
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
  border: 1px solid var(--site-border);
  background: var(--site-surface);
  box-shadow: var(--site-card-shadow);
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
  border-color: var(--site-accent);
  background: rgb(37 99 235 / 0.06);
}

.option-item.disabled {
  opacity: 0.7;
}

.option-item.converting {
  border-color: var(--site-accent);
  background: rgb(37 99 235 / 0.1);
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
  border: 1px solid var(--site-border);
  background: var(--site-surface);
  box-shadow: var(--site-card-shadow);
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

.ebook-convert-tip {
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
