const routes = [
    {
        name: 'UtilIndex',
        path: '/',
        component: ()=>import("@/components/UtilIndex")
    },
    {
        name: 'JsonFormat',
        path: '/JsonFormat',
        component: ()=>import("@/components/JsonFormat")
    },
    {
        name: 'TextFormat',
        path: '/TextFormat',
        component: ()=>import("@/components/TextFormat")
    },
    {
        name: 'BetweenNowToHoliday',
        path: '/BetweenNowToHoliday',
        component: ()=>import("@/components/BetweenNowToHoliday")
    }
];

export default routes