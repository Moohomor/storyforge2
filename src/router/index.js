import { createRouter, createWebHistory } from 'vue-router'
import Home from '../Home.vue'
import Player from '../Player.vue'
import Editor from '../Editor.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {path: '/', component: Home},
    {path: '/play/:id', component: Player},
    {path: '/edit/:id', component: Editor},
  ],
})

export default router
