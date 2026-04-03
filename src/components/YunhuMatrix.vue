<template>
  <div class="min-h-screen flex flex-col bg-slate-200 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <div class="flex-1 min-h-0">
      <section class="text-center py-16 sm:py-20 px-6 border-b border-slate-300/70 dark:border-slate-800">
        <h1 class="text-3xl sm:text-4xl font-semibold mb-4 tracking-tight text-slate-800 dark:text-slate-50">
          Nyx Matrix
        </h1>
        <!-- <p class="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          站点聚合与快速入口
        </p> -->
      </section>

      <ToolSection title="Quick access" :list="quickLinks" />
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

const quickLinks = [
  {
    title: 'Articles Collection',
    desc: '文集与文档站',
    link: 'https://stevenling.github.io/yunhu-love-essay-doc/',
  },
  {
    title: 'Nyx Blog',
    desc: '博客',
    link: 'https://stevenling.github.io/yunhu-blog/',
  },
  {
    title: '博尔赫斯中文站',
    desc: '博尔赫斯中文资源',
    link: 'https://stevenling.github.io/chinese-borges-website/',
  },
  {
    title: 'Nyx Tools',
    desc: '站内工具总览',
    link: '/utilIndex',
  },
]
</script>
