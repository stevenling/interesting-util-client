import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import router from './router/index' 
import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json'
import hljsVuePlugin from "@highlightjs/vue-plugin";

import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import 'highlight.js/styles/stackoverflow-light.css'

hljs.registerLanguage('json', json);

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.use(ElementPlus)
app.use(router)
app.use(hljsVuePlugin)
app.mount('#app')
