
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
        name: 'JsonFormat',
        path: '/JsonFormat',
        component: () => import("@/components/JsonFormat")
    },
    {
        name: 'ColorConvert',
        path: '/ColorConvert',
        component: () => import("@/components/ColorConvert")
    },
    {
        name: 'TextFormat',
        path: '/TextFormat',
        component: () => import("@/components/TextFormat")
    },
    {
        name: 'BetweenNowToHoliday',
        path: '/BetweenNowToHoliday',
        component: () => import("@/components/BetweenNowToHoliday")
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
    }
];

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 * 目前所有路由都移到了 constantRoutes，这里保留空数组
 */
export const asyncRoutes = [
    // 404 page must be placed at the end !!!
    // { path: '/:catchAll(.*)', redirect: '/404', hidden: true }
];
