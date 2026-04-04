
import { createRouter, createWebHistory } from 'vue-router'
import { constantRoutes } from './router'

// Vite 会根据 vite.config.js 的 base 注入 import.meta.env.BASE_URL
const baseUrl = import.meta.env.BASE_URL || '/interesting-util-client/';

const router = createRouter({
    history: createWebHistory(baseUrl),
    routes: constantRoutes // 初始化时只挂载常量路由
})

/**
 * 未登录访问需登录页面时跳转登录；已登录访问登录/注册则回工具列表
 * 公开路由在 router.js 中设置 meta.public === true
 */
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('user-token');
    const isPublic = to.meta.public === true;

    if (token && (to.path === '/login' || to.path === '/register')) {
        const r = to.query.redirect;
        if (typeof r === 'string' && r.startsWith('/') && !r.startsWith('/login') && !r.startsWith('/register')) {
            next(r);
        } else {
            next({ path: '/utilIndex' });
        }
        return;
    }

    if (!isPublic && !token) {
        next({
            path: '/login',
            query: { redirect: to.fullPath },
        });
        return;
    }

    next();
});

export default router;
