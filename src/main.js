// Vue 应用入口

import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import ElementPlus from 'element-plus'
import router from './router/index'
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
import hljsVuePlugin from '@highlightjs/vue-plugin'

import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import 'highlight.js/styles/stackoverflow-light.css'

// 注册 JSON 语法高亮（供 JsonFormat 等组件使用）
hljs.registerLanguage('json', json)

const app = createApp(App)

// 全局注册 Element Plus 图标，模板中可直接使用 <el-icon><Document /></el-icon> 等
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(ElementPlus)
app.use(router)
app.use(hljsVuePlugin)

// 挂载到 index.html 的 #app 节点
app.mount('#app')
