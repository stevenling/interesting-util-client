<template>
  <div
    class="json-format-page min-h-screen flex flex-col bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100"
  >
    <div class="flex-1 min-w-0 px-4 sm:px-6 py-6 sm:py-8">
      <div class="max-w-6xl mx-auto">
        <RouterLink
          to="/utilIndex"
          class="mb-5 inline-block text-sm text-zinc-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-slate-300 transition-colors"
        >
          ← 工具列表
        </RouterLink>

        <div
          class="rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/85 shadow-sm overflow-hidden flex flex-col min-h-[calc(100vh-3rem)]"
        >
          <header
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 py-4 border-b border-zinc-200/90 dark:border-zinc-800"
          >
            <h1
              class="text-2xl font-semibold tracking-tight text-zinc-800 dark:text-zinc-50 border-l-2 border-slate-500 dark:border-slate-400 pl-3"
            >
              Json 格式化
            </h1>
            <el-button
              class="json-btn json-btn-solid shrink-0"
              data-testid="json-format-download"
              @click="clickDownload"
            >
              下载
            </el-button>
          </header>

          <div class="p-4 sm:p-5 flex-1 flex flex-col min-h-0">
            <el-row :gutter="24" class="content-row flex-1 min-h-0">
              <el-col :xs="24" :sm="24" :md="24" :lg="12" class="el-input-content">
                <div class="json-title">
                  <span>待格式化 Json</span>
                  <el-button plain class="json-btn json-btn-line" data-testid="json-format-clear" @click="clickClear">
                    清空
                  </el-button>
                </div>
                <el-input
                  v-model="currentJson.oldJson"
                  type="textarea"
                  placeholder="请输入待格式化 JSON 字符串"
                  class="el-input-class"
                />
              </el-col>

              <el-col :xs="24" :sm="24" :md="24" :lg="12" class="el-input-content">
                <div class="json-title">
                  <span>格式化后的 Json</span>
                  <el-button
                    plain
                    class="json-btn json-btn-line json-btn-line--accent"
                    data-testid="json-format-copy"
                    @click="clickCopy"
                  >
                    复制到剪贴板
                  </el-button>
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
  </div>
</template>

<script setup>
import { watch, reactive } from 'vue'
import { RouterLink } from 'vue-router'
import { ElMessage } from 'element-plus'
import moment from 'moment'
import useClipboard from 'vue-clipboard3'

const JSON_FORMAT_SPACE = 4

const currentJson = reactive({ oldJson: '', formatJson: '' })

const { toClipboard } = useClipboard()

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
        currentJson.formatJson = JSON.stringify(jsonObj, null, JSON_FORMAT_SPACE)
      } catch (e) {
        currentJson.formatJson = ''
        ElMessage.error('待格式化的 Json 有误，请检查')
      }
    } else {
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
    ElMessage.success('复制格式化后的 json 到剪贴板成功')
  } catch (e) {
    console.error(e)
    ElMessage.error('复制格式化后的 json 到剪贴板失败')
  }
}
</script>

<style scoped>
.content-row {
  display: flex;
  flex-wrap: wrap;
  flex-grow: 1;
  min-height: 0;
}

.el-input-content {
  font-size: 1.05rem;
  background: rgb(250 250 250 / 0.95);
  border-radius: 0.75rem;
  padding: 1rem;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid rgb(228 228 231 / 0.95);
}

@media (prefers-color-scheme: dark) {
  .el-input-content {
    background: rgb(24 24 27 / 0.55);
    border-color: rgb(63 63 70 / 0.85);
  }
}

.json-title {
  font-size: 1.05rem;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  color: rgb(63 63 70);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

@media (prefers-color-scheme: dark) {
  .json-title {
    color: rgb(212 212 216);
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
  flex-grow: 1;
  min-height: 0;
}

.el-input-class :deep(.el-textarea__inner) {
  height: 100% !important;
  min-height: 22rem;
  background: rgb(255 255 255);
  border-radius: 0.5rem;
  border: 1px solid rgb(228 228 231);
  color: rgb(39 39 42);
  box-shadow: none;
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
  flex: 1 1 auto;
  min-height: 22rem;
  max-height: 70vh;
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

@media (max-width: 1023px) {
  .el-input-content {
    margin-bottom: 1rem;
  }

  .el-input-content:last-child {
    margin-bottom: 0;
  }
}
</style>
