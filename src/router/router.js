import JsonFormat from '@/components/JsonFormat'
import Index from '@/components/Index'

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
    }
];

export default routes