import { createRouter, createWebHistory } from 'vue-router'
import Home from '../Home.vue'
import Player from '../Player.vue'
import Editor from '../Editor.vue'
import Auth from '../Auth.vue'
import Register from '../register.vue'
import Library from '../library.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {path: '/', component: Home},
    {path: '/play/:id', component: Player},
    {path: '/edit/:id', component: Editor},
    {path: '/auth', component: Auth},
    {path: '/register', component: Register},
    {path: '/library', component: Library}
  ],
})

export default router
