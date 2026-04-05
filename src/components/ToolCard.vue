<template>
  <div
    class="tool-card w-full min-w-0 p-5 rounded-xl border border-slate-300/90 dark:border-slate-700
           bg-slate-100/90 dark:bg-slate-900/80 shadow-sm
           hover:border-blue-500/60 dark:hover:border-blue-400/45
           hover:shadow-md hover:shadow-slate-400/15 dark:hover:shadow-black/40
           hover:-translate-y-0.5
           transition-all duration-200 cursor-pointer"
    role="button"
    tabindex="0"
    @click="go"
    @keydown.enter="go"
  >
    <h3 class="text-lg font-medium mb-1 text-slate-800 dark:text-slate-50">
      {{ title }}
    </h3>

    <p class="text-sm text-slate-600 dark:text-slate-400">
      {{ desc }}
    </p>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import * as demoAuth from '@/utils/demoAuth'

const props = defineProps({
  title: String,
  desc: String,
  link: {
    type: String,
    default: '',
  },
  /** 为 true 且未登录时，不直接跳转，改为通知父级弹窗 */
  requireLogin: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['require-auth'])

const router = useRouter()

const isExternal = (url) => /^https?:\/\//i.test(url)

const go = () => {
  if (!props.link) return
  if (isExternal(props.link)) {
    window.open(props.link, '_blank', 'noopener,noreferrer')
    return
  }
  if (props.requireLogin && !demoAuth.getToken()) {
    emit('require-auth', props.link)
    return
  }
  router.push(props.link)
}
</script>
