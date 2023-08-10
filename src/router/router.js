import JsonFormat from '@/components/JsonFormat'
import Index from '@/components/Index'
import TextFormat from '@/components/TextFormat'

const routes = [
    {
        name: 'Index',
        path: '/',
        component: Index
    },
    {
        name: 'JsonFormat',
        path: '/JsonFormat',
        component: JsonFormat
    },
    {
        name: 'TextFormat',
        path: '/TextFormat',
        component: TextFormat
    }
];

export default routes