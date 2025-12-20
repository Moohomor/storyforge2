import { createRouter, createWebHistory } from 'vue-router'
import Home from '../Home.vue'
import Player from '../Player.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {path: '/', component: Home},
    {path: '/play/:id', component: Player}
  ],
})

export default router
