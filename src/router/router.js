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
        name: 'DPlayer',
        path: '/DPlayer',
        component: () => import("@/components/DPlayer")
    }
];

export default routes