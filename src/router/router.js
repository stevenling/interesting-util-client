const routes = [
    // {
    //     name: 'Index',
    //     path: '/',
    //     component: ()=>import("@/components/Index"),
    //     meta: { title: '云胡个人站' }
    // },
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
    }
];

export default routes