// index.js 路由配置文件 中引入views包下的.vue。
import { createRouter, createWebHistory } from 'vue-router'
import routes from './router'    // 导入 router 目录下的 router.js

const router = createRouter({
    // eslint-disable-next-line no-undef
    history: createWebHistory(process.env.BASE_URL),
    routes
})

/**
 * 全局前置路由守卫
 */
// router.beforeEach((to, from, next) => {
    // // document.title = to.meta.title ? to.meta.title : defaultTitle
    // if (to.path === '/user/login' || to.path === '/user/register') {
    //     next();
    // } else {
    //     const token = localStorage.getItem('Authorization'); // 获取token
    //     // console.log("beforeEach token = " + token);
    //     // token 不存在
    //     if (token === null || token === '') {
    //         ElMessage.error('您还没有登录，请先登录');
    //         // 跳转到登录页面
    //         next('/user/login');
    //     } else {
    //         next();
    //     }
    // }
// });

export default router;