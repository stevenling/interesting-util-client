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
    // {
    //     name: 'DPlayer',
    //     path: '/DPlayer',
    //     component: () => import("@/components/DPlayer")
    // },
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
<<<<<<< HEAD
        name: 'EpubReader',
        path: '/epub-reader',
        component: () => import("@/components/EpubReader.vue")
=======
        path: '/yunhuMatrix',
        name: 'YunhuMatrix',
        component: YunhuMatrix
>>>>>>> 439aeb02e72295fa0ecc22314daedf4894c2f6bc
    }
];

export default routes