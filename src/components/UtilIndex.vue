<template>
  <div
    class="matrix-root relative min-h-screen flex flex-col overflow-hidden text-slate-900 dark:text-neutral-100"
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

    <div
      class="fixed top-5 right-5 z-20 sm:top-7 sm:right-8 flex items-center gap-2 pointer-events-auto"
      aria-live="polite"
    >
      <template v-if="isLoggedIn">
        <span
          class="inline-flex items-center rounded-full border border-black/[0.08] dark:border-white/[0.12] bg-white/80 dark:bg-zinc-900/70 backdrop-blur-md px-3.5 py-1.5 text-[13px] font-medium text-slate-900 dark:text-white truncate max-w-[10rem] sm:max-w-[14rem] shadow-sm"
        >
          {{ loggedInName || '用户' }}
        </span>
        <button
          type="button"
          class="shrink-0 rounded-full border border-black/[0.08] dark:border-white/[0.12] bg-white/80 dark:bg-zinc-900/70 backdrop-blur-md px-3 py-1.5 text-[13px] font-medium text-slate-600 hover:text-slate-900 hover:bg-white/95 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-zinc-800/80 shadow-sm transition-colors duration-200"
          @click="onLogout"
        >
          退出
        </button>
      </template>
      <el-popover
        v-else
        placement="bottom-end"
        :width="280"
        trigger="click"
        popper-class="util-index-auth-hint-popper"
      >
        <template #reference>
          <button
            type="button"
            class="shrink-0 rounded-full border border-black/[0.08] dark:border-white/[0.12] bg-white/80 dark:bg-zinc-900/70 backdrop-blur-md px-3.5 py-1.5 text-[13px] font-medium text-slate-600 hover:text-slate-900 hover:bg-white/95 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-zinc-800/80 shadow-sm transition-colors duration-200"
          >
            未登录
          </button>
        </template>
        <p class="text-sm text-slate-600 dark:text-neutral-300 leading-relaxed m-0">
          使用下方工具前请先
          <router-link
            to="/register"
            class="text-slate-800 dark:text-neutral-100 font-medium hover:underline underline-offset-2"
          >注册</router-link>
          或
          <router-link
            :to="{ path: '/login', query: { redirect: route.fullPath } }"
            class="text-slate-800 dark:text-neutral-100 font-medium hover:underline underline-offset-2"
          >登录</router-link>
        </p>
      </el-popover>
    </div>

    <div class="relative flex-1 min-h-0 flex flex-col">
      <section
        class="matrix-hero text-center px-6 pt-20 pb-12 sm:pt-28 sm:pb-16"
      >
        <p
          class="text-[0.6875rem] sm:text-xs font-medium tracking-[0.22em] uppercase text-slate-500 dark:text-neutral-500 mb-5"
        >
          Utilities
        </p>
        <h1
          class="text-[2.125rem] sm:text-5xl font-semibold tracking-[-0.03em] leading-[1.08] text-slate-900 dark:text-white max-w-lg mx-auto"
        >
          Nyx Tools
        </h1>
        <p
          class="mt-4 text-[15px] sm:text-base text-slate-600 dark:text-neutral-400 max-w-md mx-auto leading-relaxed font-normal"
        >
          常用小工具集中入口，简单顺手
        </p>
        <div
          class="mt-10 h-px w-12 mx-auto matrix-divider rounded-full"
          aria-hidden="true"
        />
      </section>

      <ToolSection
        class="matrix-links !pt-4 sm:!pt-6"
        title="程序员工具"
        :list="devTools"
        :require-login="!isLoggedIn"
        @require-auth="onToolRequireAuth"
      />
      <ToolSection
        class="matrix-links !pt-4 sm:!pt-6"
        title="阅读与文档"
        :list="readingTools"
        :require-login="!isLoggedIn"
        @require-auth="onToolRequireAuth"
      />
      <ToolSection
        class="matrix-links !pt-4 sm:!pt-6 pb-12 sm:pb-14"
        title="其他实用工具"
        :list="otherTools"
        :require-login="!isLoggedIn"
        @require-auth="onToolRequireAuth"
      />
    </div>

    <el-dialog
      v-model="toolAuthDialogVisible"
      title="需要登录"
      width="400px"
      align-center
      append-to-body
      class="util-index-tool-auth-dialog"
      @closed="pendingToolPath = ''"
    >
      <p class="text-sm text-slate-600 dark:text-neutral-400 leading-relaxed m-0">
        使用工具前需要先登录。登录成功后会自动打开你刚才选择的工具。
      </p>
      <template #footer>
        <div class="flex flex-wrap justify-end gap-2">
          <el-button @click="toolAuthDialogVisible = false">稍后再说</el-button>
          <el-button type="primary" @click="goLoginForTool">去登录</el-button>
        </div>
      </template>
    </el-dialog>

    <footer
      class="matrix-footer relative mt-auto border-t border-black/[0.06] dark:border-white/[0.08] py-8 px-6"
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
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ToolSection from './ToolSection.vue'
import '../styles/matrix-page.css'
import * as demoAuth from '@/utils/demoAuth'

const route = useRoute()
const router = useRouter()
/** localStorage 非响应式，登出后 bump 以刷新 isLoggedIn / 注册提示 */
const authTick = ref(0)

const isLoggedIn = computed(() => {
  authTick.value
  return !!demoAuth.getToken()
})
const loggedInName = computed(() => {
  authTick.value
  return demoAuth.getStoredUsername().trim()
})

function onLogout() {
  demoAuth.clearSession()
  authTick.value += 1
  ElMessage.success('已退出')
  router.replace({ path: '/utilIndex', query: {} })
}

const toolAuthDialogVisible = ref(false)
const pendingToolPath = ref('')

function onToolRequireAuth(path) {
  pendingToolPath.value =
    typeof path === 'string' && path.startsWith('/') ? path : '/utilIndex'
  toolAuthDialogVisible.value = true
}

function goLoginForTool() {
  const redirect = pendingToolPath.value || route.fullPath
  toolAuthDialogVisible.value = false
  router.push({ path: '/login', query: { redirect } })
}

const devTools = [
  { title: 'Json 代码美化', desc: '格式化与高亮 JSON', link: '/JsonFormat' },
  { title: '颜色进制转换', desc: 'HEX / RGB 等互转', link: '/ColorConvert' },
  // { title: '文本处理', desc: '文本格式化与转换', link: '/TextFormat' },
]

const readingTools = [
  { title: 'EPUB 阅读器', desc: '浏览器内阅读 EPUB', link: '/epubReader' },
  { title: 'Markdown 阅读器', desc: '打开并渲染 Markdown', link: '/markdownReader' },
  { title: '文章列表', desc: '站内文章浏览', link: '/articleList' },
  { title: '电子书格式转换', desc: '常见电子书互转', link: '/ebookConvert' },
  { title: '生成摘录卡片', desc: '文字排版成分享图', link: '/gotoFontToImage' },
]

const otherTools = [
  { title: '历史年表', desc: '按国别浏览历史时间线', link: '/historyTimeline' },
  { title: '天干地支纪年', desc: '传统干支换算', link: '/heavenlyStemsAndEarthlyBranches' },
  { title: '英语词汇量测试', desc: '自测词汇量', link: '/vocabularyTest' },
  { title: '驾考刷题王', desc: '题库练习与同步', link: '/jztk' },
]
</script>
