import { createRouter, createWebHistory } from 'vue-router'
//import ViewAR from '../views/ViewAR.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('../views/Start.vue')
        },
        {
            path: '/viewAR',
            name: 'viewAR',
            component: () => import('../views/ViewAR.vue')
        },
        {
            path: '/arjs',
            name: 'arjs',
            component: () => import('../views/ViewARJS.vue')
        },
        {
            path: '/nft',
            name: 'nft',
            component: () => import('../views/ViewNFTToolkit.vue')
        }
    ]
})

export default router