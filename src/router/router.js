import YunhuMatrix from '../components/YunhuMatrix.vue'

const routes = [
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
        name: 'ColorConvert',
        path: '/ColorConvert',
        component: () => import("@/components/ColorConvert")
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

export default routes