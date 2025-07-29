
import YunhuMatrix from '../components/YunhuMatrix.vue'

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
    {
        name: 'UtilIndex',
        path: '/',
        component: () => import("@/components/UtilIndex")
    },
    {
        name: 'Login',
        path: '/login',
        // 我们将 ColorConvert 组件作为登录页
        component: () => import("@/components/JsonFormat")
    },
];

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
    {
        name: 'JsonFormat',
        path: '/JsonFormat',
        component: () => import("@/components/JsonFormat"),
        meta: { roles: ['admin'] } // 只有 'admin' 角色可以访问
    },
    {
        name: 'TextFormat',
        path: '/TextFormat',
        component: () => import("@/components/TextFormat"),
        meta: { roles: ['admin', 'editor'] } // admin 和 editor 角色可以访问
    },
    {
        name: 'BetweenNowToHoliday',
        path: '/BetweenNowToHoliday',
        component: () => import("@/components/BetweenNowToHoliday")
        // 没有 meta.roles，表示只要登录了就能访问
    },
    {
        name: 'HeavenlyStemsAndEarthlyBranches',
        path: '/heavenlyStemsAndEarthlyBranches',
        component: () => import("@/components/HeavenlyStemsAndEarthlyBranches.vue")
    },
    {
        name: 'GotoFontToImage',
        path: '/gotoFontToImage',
        component: () => import("@/components/fontToImage.vue")
    },
    {
        name: 'EpubReader',
        path: '/epubReader',
        component: () => import("@/components/EpubReader.vue")
    },
    {
        path: '/yunhuMatrix',
        name: 'YunhuMatrix',
        component: YunhuMatrix
    },
    // 404 page must be placed at the end !!!
    // { path: '/:catchAll(.*)', redirect: '/404', hidden: true }
];
