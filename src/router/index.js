
import { createRouter, createWebHistory } from 'vue-router'
import { constantRoutes, asyncRoutes } from './router'

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes: constantRoutes // 初始化时只挂载常量路由
})

// 模拟一个获取用户角色的API
function getRolesFromBackend() {
    return new Promise((resolve) => {
        // 假设从 localStorage 获取角色信息来模拟后端返回
        const roles = JSON.parse(localStorage.getItem('user-roles')) || [];
        setTimeout(() => {
            resolve({ roles });
        }, 500);
    });
}

/**
 * 根据角色判断是否有权限
 * @param roles {string[]} 用户拥有的角色
 * @param route {object} 当前路由对象
 * @returns {boolean}
 */
function hasPermission(roles, route) {
    if (route.meta && route.meta.roles) {
        // 如果路由定义了 roles，则需要用户角色中至少有一个匹配
        return roles.some(role => route.meta.roles.includes(role));
    } else {
        // 如果路由没有定义 roles，则默认所有登录用户都有权限
        return true;
    }
}

/**
 * 递归过滤异步路由表
 * @param routes {object[]} 异步路由
 * @param roles {string[]} 用户角色
 * @returns {object[]}
 */
function filterAsyncRoutes(routes, roles) {
    const res = [];
    routes.forEach(route => {
        const tmp = { ...route };
        if (hasPermission(roles, tmp)) {
            if (tmp.children) {
                tmp.children = filterAsyncRoutes(tmp.children, roles);
            }
            res.push(tmp);
        }
    });
    return res;
}

// 全局前置守卫
let hasAddedRoutes = false; // 添加一个标志位，防止重复添加路由

/*
router.beforeEach(async (to, from, next) => {
    const hasToken = localStorage.getItem('user-token');

    if (hasToken) {
        if (to.path === '/login') {
            // 如果已登录，访问登录页则重定向到首页
            next({ path: '/' });
        } else {
            if (!hasAddedRoutes) {
                try {
                    // 模拟从后端获取用户角色
                    const { roles } = await getRolesFromBackend();

                    // 根据角色生成可访问的路由表
                    const accessRoutes = filterAsyncRoutes(asyncRoutes, roles);

                    // 动态添加可访问的路由
                    accessRoutes.forEach(route => {
                        router.addRoute(route);
                    });

                    hasAddedRoutes = true; // 标记已经添加过路由

                    // 使用 router.replace 确保addRoute()完成后再进行跳转
                    // this is a hack to ensure that addRoute is complete
                    next({ ...to, replace: true });
                } catch (error) {
                    // 发生错误，重置token并跳转到登录页
                    localStorage.removeItem('user-token');
                    localStorage.removeItem('user-roles');
                    next('/login');
                }
            } else {
                next(); // 如果已经添加过路由，直接放行
            }
        }
    } else {
        // 未登录
        if (to.path === '/login') {
            next(); // 如果是登录页，直接放行
        } else {
            // 否则全部重定向到登录页
            next(`/login?redirect=${to.path}`);
        }
    }
});
*/
export default router;
