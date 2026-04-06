<template>
  <div
    class="matrix-root relative h-screen max-h-screen overflow-hidden flex flex-col text-slate-900 dark:text-neutral-100"
  >
    <div
      class="pointer-events-none fixed inset-0 -z-10 matrix-bg-base"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none fixed -top-32 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full matrix-blob matrix-blob-a blur-3xl opacity-90"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none fixed top-[28%] -right-24 h-[28rem] w-[28rem] rounded-full matrix-blob matrix-blob-b blur-3xl opacity-80"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none fixed bottom-0 left-0 h-[22rem] w-[22rem] rounded-full matrix-blob matrix-blob-c blur-3xl opacity-70"
      aria-hidden="true"
    />

    <div class="relative flex-1 min-h-0 min-w-0 flex flex-col">
      <div class="flex-1 min-h-0 min-w-0 flex flex-col px-4 sm:px-6 py-3 sm:py-4">
        <div class="max-w-6xl mx-auto w-full flex-1 min-h-0 flex flex-col">
          <RouterLink
            to="/utilIndex"
            class="mb-2 shrink-0 inline-block text-sm text-slate-500 hover:text-slate-800 dark:text-neutral-500 dark:hover:text-neutral-200 transition-colors duration-300"
          >
            ← 
          </RouterLink>

          <div
            class="matrix-tool-panel overflow-hidden flex flex-col flex-1 min-h-0"
          >
            <header
              class="matrix-tool-panel-header shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 py-3 sm:py-4"
            >
              <div>
                <p
                  class="text-[0.6875rem] sm:text-xs font-medium tracking-[0.22em] uppercase text-slate-500 dark:text-neutral-500 mb-1"
                >
                  Utilities
                </p>
                <h1
                  class="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white"
                >
                  Json 代码美化
                </h1>
              </div>
            <el-tooltip content="下载" placement="bottom">
              <el-button
                circle
                class="json-btn json-btn-solid json-btn-icon shrink-0"
                data-testid="json-format-download"
                aria-label="下载"
                @click="clickDownload"
              >
                <el-icon :size="18"><Download /></el-icon>
              </el-button>
            </el-tooltip>
          </header>

          <div class="p-3 sm:p-4 flex-1 flex flex-col min-h-0 overflow-hidden">
            <el-row :gutter="0" class="content-row flex-1 min-h-0">
              <el-col :xs="24" :sm="24" :md="24" :lg="12" class="el-input-content">
                <div class="json-title">
                  <span>待格式</span>
                  <el-tooltip content="清空" placement="bottom">
                    <el-button
                      circle
                      plain
                      class="json-btn json-btn-line json-btn-icon"
                      data-testid="json-format-clear"
                      aria-label="清空"
                      @click="clickClear"
                    >
                      <el-icon :size="18"><Delete /></el-icon>
                    </el-button>
                  </el-tooltip>
                </div>
                <el-input
                  v-model="currentJson.oldJson"
                  type="textarea"
                  placeholder="请输入 JSON"
                  class="el-input-class"
                />
                <p
                  v-if="parseError"
                  class="json-parse-error"
                  data-testid="json-format-parse-error"
                  role="alert"
                  aria-live="polite"
                >
                  {{ parseError }}
                </p>
              </el-col>

              <el-col :xs="24" :sm="24" :md="24" :lg="12" class="el-input-content">
                <div class="json-title">
                  <span>格式化后</span>
                  <el-tooltip content="复制" placement="bottom">
                    <el-button
                      circle
                      plain
                      class="json-btn json-btn-line json-btn-line--accent json-btn-icon"
                      data-testid="json-format-copy"
                      aria-label="复制"
                      @click="clickCopy"
                    >
                      <el-icon :size="18"><CopyDocument /></el-icon>
                    </el-button>
                  </el-tooltip>
                </div>
                <highlightjs
                  language="json"
                  :code="currentJson.formatJson"
                  class="highlight-json"
                />
              </el-col>
            </el-row>
          </div>
        </div>
      </div>
    </div>

      <footer
        class="matrix-footer shrink-0 relative border-t border-black/[0.06] dark:border-white/[0.08] py-6 px-6"
      >
        <div class="text-center">
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            class="text-[13px] text-slate-500 hover:text-slate-800 dark:text-neutral-500 dark:hover:text-neutral-200 transition-colors duration-300"
          >
            闽ICP备2023011581号
          </a>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { watch, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import '../../styles/matrix-page.css'
import { ElMessage } from 'element-plus'
import { CopyDocument, Delete, Download } from '@element-plus/icons-vue'
import moment from 'moment'
import useClipboard from 'vue-clipboard3'

const JSON_FORMAT_SPACE = 4

const currentJson = reactive({ oldJson: '', formatJson: '' })
/** 解析失败时在左栏展示，避免反复 Toast */
const parseError = ref('')

const { toClipboard } = useClipboard()

/**
 * 防抖：在 delay 毫秒内若再次调用，则重置计时，只执行「最后一次」触发后的那次 fn。
 * 用于输入框 JSON：避免每个字符都 parse，减轻主线程压力与界面抖动。
 */
function debounce(fn, delay) {
  let timer = null
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

watch(
  () => currentJson.oldJson,
  debounce((newValue) => {
    if (typeof newValue === 'string' && newValue.trim() !== '') {
      try {
        const jsonObj = JSON.parse(newValue)
        parseError.value = ''
        currentJson.formatJson = JSON.stringify(jsonObj, null, JSON_FORMAT_SPACE)
      } catch (e) {
        currentJson.formatJson = ''
        const msg = e instanceof Error ? e.message : String(e)
        parseError.value = msg.trim() || 'JSON 解析失败'
      }
    } else {
      parseError.value = ''
      currentJson.formatJson = ''
    }
  }, 300)
)

function clickDownload() {
  if (!currentJson.formatJson) {
    ElMessage.error('下载空 Json 没有意义')
    return
  }
  const eleLink = document.createElement('a')
  const fileName = moment().format('YYYY-MM-DD-hh-mm-ss')
  eleLink.download = `${fileName}.json`
  eleLink.style.display = 'none'
  const blob = new Blob([currentJson.formatJson], { type: 'text/json' })
  eleLink.href = URL.createObjectURL(blob)
  document.body.appendChild(eleLink)
  eleLink.click()
  document.body.removeChild(eleLink)
  if (typeof URL.revokeObjectURL === 'function') {
    URL.revokeObjectURL(eleLink.href)
  }
}

function clickClear() {
  if (!currentJson.oldJson) {
    ElMessage.info('已经清空了，没必要再次清空')
    return
  }
  parseError.value = ''
  currentJson.formatJson = ''
  currentJson.oldJson = ''
}

async function clickCopy() {
  if (!currentJson.formatJson) {
    ElMessage.error('无法复制空的 json ')
    return
  }
  try {
    await toClipboard(currentJson.formatJson)
    ElMessage.success('复制成功')
  } catch (e) {
    console.error(e)
    ElMessage.error('复制格式化后的 json 到剪贴板失败')
  }
}
</script>

<style scoped>
.content-row {
  display: flex;
  flex-grow: 1;
  min-height: 0;
  /* 两列之间 / 上下堆叠时 的外间距（替代 gutter，避免与 flex 布局冲突） */
  gap: 1.25rem;
}

.content-row :deep(.el-input-content) {
  min-width: 0;
}

@media (min-width: 1024px) {
  .content-row {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .content-row :deep(.el-input-content) {
    flex: 1 1 calc((100% - 1.25rem) / 2) !important;
    max-width: calc((100% - 1.25rem) / 2) !important;
  }
}

@media (max-width: 1023px) {
  .content-row {
    flex-direction: column;
    flex-wrap: nowrap;
  }

  .content-row :deep(.el-input-content) {
    flex: 1 1 0 !important;
    max-width: 100% !important;
    min-height: 0 !important;
  }
}

.el-input-content {
  font-size: 1.05rem;
  background: rgb(255 255 255 / 0.45);
  border-radius: 0.75rem;
  padding: 0.75rem;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid rgb(0 0 0 / 0.06);
}

@media (prefers-color-scheme: dark) {
  .el-input-content {
    background: rgb(0 0 0 / 0.2);
    border-color: rgb(255 255 255 / 0.08);
  }
}

.json-title {
  font-size: 0.8125rem;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgb(100 116 139);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  flex-shrink: 0;
}

@media (prefers-color-scheme: dark) {
  .json-title {
    color: rgb(163 163 163);
  }
}

/* 按钮：仅黑白灰蓝，冷淡克制 */
.json-btn.el-button {
  font-weight: 500;
  border-radius: 0.375rem;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.json-btn-icon.el-button.is-circle {
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
}

.json-btn-solid.el-button {
  background-color: rgb(51 65 85);
  border-color: rgb(51 65 85);
  color: rgb(248 250 252);
}

.json-btn-solid.el-button:hover {
  background-color: rgb(71 85 105);
  border-color: rgb(71 85 105);
  color: rgb(255 255 255);
}

.json-btn-solid.el-button:focus-visible {
  outline: 2px solid rgb(100 116 139);
  outline-offset: 1px;
}

@media (prefers-color-scheme: dark) {
  .json-btn-solid.el-button {
    background-color: rgb(71 85 105);
    border-color: rgb(100 116 139);
    color: rgb(244 244 245);
  }

  .json-btn-solid.el-button:hover {
    background-color: rgb(100 116 139);
    border-color: rgb(148 163 184);
    color: rgb(255 255 255);
  }
}

.json-btn-line.el-button.is-plain {
  --el-button-hover-text-color: rgb(39 39 42);
  --el-button-hover-bg-color: rgb(244 244 245);
  --el-button-hover-border-color: rgb(161 161 170);
  background-color: rgb(255 255 255);
  border-color: rgb(212 212 216);
  color: rgb(63 63 70);
}

.json-btn-line.el-button.is-plain:hover {
  color: rgb(39 39 42);
  border-color: rgb(161 161 170);
  background-color: rgb(244 244 245);
}

@media (prefers-color-scheme: dark) {
  .json-btn-line.el-button.is-plain {
    --el-button-hover-text-color: rgb(250 250 250);
    --el-button-hover-bg-color: rgb(39 39 42);
    --el-button-hover-border-color: rgb(113 113 122);
    background-color: rgb(24 24 27);
    border-color: rgb(63 63 70);
    color: rgb(212 212 216);
  }

  .json-btn-line.el-button.is-plain:hover {
    color: rgb(250 250 250);
    border-color: rgb(113 113 122);
    background-color: rgb(39 39 42);
  }
}

.json-btn-line--accent.el-button.is-plain {
  border-color: rgb(148 163 184);
  color: rgb(51 65 85);
}

.json-btn-line--accent.el-button.is-plain:hover {
  border-color: rgb(100 116 139);
  color: rgb(30 41 59);
  background-color: rgb(241 245 249);
}

@media (prefers-color-scheme: dark) {
  .json-btn-line--accent.el-button.is-plain {
    border-color: rgb(100 116 139);
    color: rgb(203 213 225);
  }

  .json-btn-line--accent.el-button.is-plain:hover {
    border-color: rgb(148 163 184);
    color: rgb(248 250 252);
    background-color: rgb(30 41 59);
  }
}

.el-input-class {
  font-size: 0.98rem;
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.el-input-class :deep(.el-textarea) {
  flex: 1 1 0;
  min-height: 0;
}

.el-input-class :deep(.el-textarea__inner) {
  height: 100% !important;
  min-height: 0 !important;
  resize: none;
  background: rgb(255 255 255);
  border-radius: 0.5rem;
  border: 1px solid rgb(228 228 231);
  color: rgb(39 39 42);
  box-shadow: none;
}

.json-parse-error {
  flex-shrink: 0;
  margin: 0.5rem 0 0;
  padding: 0.5rem 0.625rem;
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  line-height: 1.45;
  word-break: break-word;
  color: rgb(185 28 28);
  background: rgb(254 242 242);
  border: 1px solid rgb(254 202 202);
}

@media (prefers-color-scheme: dark) {
  .json-parse-error {
    color: rgb(252 165 165);
    background: rgb(69 10 10 / 0.35);
    border-color: rgb(127 29 29 / 0.6);
  }
}

@media (prefers-color-scheme: dark) {
  .el-input-class :deep(.el-textarea__inner) {
    background: rgb(24 24 27);
    border-color: rgb(63 63 70);
    color: rgb(244 244 245);
  }
}

.highlight-json {
  text-align: left;
  font-size: 0.95rem;
  background: rgb(255 255 255);
  border-radius: 0.5rem;
  border: 1px solid rgb(228 228 231);
  flex: 1 1 0;
  min-height: 0;
  padding: 0.5rem;
  overflow: auto;
}

@media (prefers-color-scheme: dark) {
  .highlight-json {
    background: rgb(24 24 27);
    border-color: rgb(63 63 70);
  }

  .highlight-json :deep(pre),
  .highlight-json :deep(code) {
    background: transparent !important;
  }
}

</style>
