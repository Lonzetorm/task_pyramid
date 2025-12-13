// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const Landing = () => import('../views/LandingView.vue')
const AppBoard = () => import('../views/AppBoard.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'landing', component: Landing },
    {
      path: '/app',
      name: 'app',
      component: AppBoard,
      meta: { requiresAuth: true }
    },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ],
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  }
})

// чтобы init вызывался только один раз
let authInitialized = false

router.beforeEach(async (to, from) => {
  const auth = useAuthStore()

  // 1. Гарантируем, что auth.init() отработал ДО проверки requiresAuth
  if (!authInitialized) {
    if (!auth.isReady) {
      try {
        await auth.init()
      } catch (e) {
        console.warn('auth.init in router error:', e)
      }
    }
    authInitialized = true
  }

  // 2. Если маршрут требует авторизации, а пользователь не залогинен — шлём на лендинг с модалкой логина
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'landing', query: { auth: 'login' } }
  }

  // иначе ничего не возвращаем — навигация продолжается как обычно
})

export default router
