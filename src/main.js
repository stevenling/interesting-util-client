import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router/index' // 加载 router 文件夹底下的 index.js 路由配置文件

import 'highlight.js/styles/stackoverflow-light.css'
import hljs from 'highlight.js/lib/core';
// import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json'
import hljsVuePlugin from "@highlightjs/vue-plugin";

hljs.registerLanguage('javascript', json);

const app = createApp(App)
app.use(ElementPlus)
app.use(router)
app.use(hljsVuePlugin)
app.mount('#app')
