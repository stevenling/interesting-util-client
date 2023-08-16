import TextFormat from '@/components/TextFormat'
import UtilIndex from '@/components/UtilIndex'

const routes = [
    {
        name: 'Index',
        path: '/',
        component: ()=>import("@/components/Index")
    },
    {
        name: 'UtilIndex',
        path: '/UtilIndex',
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