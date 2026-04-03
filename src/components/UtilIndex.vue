<template>
  <div class="min-h-screen flex flex-col bg-slate-200 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <div class="flex-1 min-h-0">
      <section class="text-center py-16 sm:py-20 px-6 border-b border-slate-300/70 dark:border-slate-800">
        <h1 class="text-3xl sm:text-4xl font-semibold mb-4 tracking-tight text-slate-800 dark:text-slate-50">
          Nyx Tools
        </h1>
        <p class="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          常用小工具集中入口，简单顺手
        </p>
      </section>

      <ToolSection title="程序员工具" :list="devTools" />
      <ToolSection title="阅读与文档" :list="readingTools" />
      <ToolSection title="其他实用工具" :list="otherTools" />
    </div>

    <footer class="border-t border-slate-300 dark:border-slate-800 py-6 mt-auto bg-slate-200/80 dark:bg-slate-950/80">
      <div class="text-center">
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm text-slate-600 hover:text-blue-700 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
        >
          闽ICP备2023011581号
        </a>
      </div>
    </footer>
  </div>
</template>

<script setup>
import ToolSection from './ToolSection.vue'

const devTools = [
  { title: 'Json 代码美化', desc: '格式化与高亮 JSON', link: '/JsonFormat' },
  { title: '颜色进制转换', desc: 'HEX / RGB 等互转', link: '/ColorConvert' },
  { title: '文本处理', desc: '文本格式化与转换', link: '/TextFormat' },
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
  { title: '假期倒计时', desc: '距离节假日还有多久', link: '/BetweenNowToHoliday' },
  { title: '天干地支纪年', desc: '传统干支换算', link: '/heavenlyStemsAndEarthlyBranches' },
  { title: '英语词汇量测试', desc: '自测词汇量', link: '/vocabularyTest' },
  { title: '驾考刷题王', desc: '题库练习与同步', link: '/jztk' },
]
</script>
