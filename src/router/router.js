
import YunhuMatrix from '../components/YunhuMatrix.vue'

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
    {
        name: 'UtilIndex',
        path: '/utilIndex',
        meta: { public: true },
        component: () => import("@/components/UtilIndex.vue")
    },
    {
        name: 'JsonFormat',
        path: '/JsonFormat',
        component: () => import("@/components/programmer-tools/JsonFormat.vue")
    },
    {
        name: 'ColorConvert',
        path: '/ColorConvert',
        component: () => import("@/components/programmer-tools/ColorConvert.vue")
    },
    {
        name: 'TextFormat',
        path: '/TextFormat',
        component: () => import("@/components/TextFormat.vue")
    },
    {
        name: 'BetweenNowToHoliday',
        path: '/BetweenNowToHoliday',
        component: () => import("@/components/BetweenNowToHoliday.vue")
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
        name: 'MarkdownReader',
        path: '/markdownReader',
        component: () => import("@/components/MarkdownReader.vue")
    },
    {
        name: 'ArticleList',
        path: '/articleList',
        component: () => import("@/components/ArticleList.vue")
    },
    {
        name: 'ArticleDetail',
        path: '/articleDetail',
        component: () => import("@/components/ArticleDetail.vue")
    },
    {
        name: 'EbookConvert',
        path: '/ebookConvert',
        component: () => import("@/components/EbookConvert.vue")
    },
    {
        name: 'HistoryTimeline',
        path: '/historyTimeline',
        component: () => import("@/components/HistoryTimeline.vue")
    },
    {
        name: 'HistoryTimelineCountry',
        path: '/historyTimeline/:country',
        component: () => import("@/components/HistoryTimeline.vue")
    },
    {
        name: 'VocabularyTest',
        path: '/vocabularyTest',
        component: () => import("@/components/VocabularyTest.vue")
    },
    {
        name: 'JztkHome',
        path: '/jztk',
        component: () => import("@/components/JztkHome.vue")
    },
    {
        name: 'JztkPractice',
        path: '/jztk/practice',
        component: () => import("@/components/JztkPractice.vue")
    },
    {
        path: '/',
        name: 'YunhuMatrix',
        meta: { public: true },
        component: YunhuMatrix
    },
    {
        path: '/login',
        name: 'Login',
        meta: { public: true },
        component: () => import("@/components/auth/Login.vue")
    },
    {
        path: '/register',
        name: 'Register',
        meta: { public: true },
        component: () => import("@/components/auth/Register.vue")
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
