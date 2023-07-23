import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router/index' // 加载 router 文件夹底下的 index.js 路由配置文件


const app = createApp(App)
app.use(ElementPlus)
app.use(router)
app.mount('#app')
