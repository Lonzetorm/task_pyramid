<template>
  <div class="site">
    <header class="nav">
      <router-link to="/" class="brand">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          stroke="var(--brand)"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <!-- Контур пирамиды -->
          <path d="M12 3 L20.5 18 H3.5 L12 3 Z" />
          <!-- Верхний уровень -->
          <path d="M9 10 L15 10" />
          <!-- Нижний уровень -->
          <path d="M7 14 L17 14" />
        </svg>
        TaskPyramid
      </router-link>

      <div class="actions" :class="{ 'actions--alone': true }">
        <template v-if="!auth.isAuthenticated">
          <button
            class="btn btn-ghost"
            data-auth-login
            @click="openAuth('login')"
          >
            Войти
          </button>
          <button
            class="btn btn-primary"
            @click="openAuth('register')"
          >
            Начать
          </button>
        </template>

        <template v-else>
          <router-link
            v-if="route.path !== '/app'"
            class="btn btn-ghost"
            to="/app"
          >
            К приложению
          </router-link>

          <button
            class="btn btn-ghost"
            @click="logoutAndGoHome()"
          >
            Выйти
          </button>
        </template>

        <button
          class="btn btn-ghost"
          @click="toggleTheme"
          :title="theme==='light' ? 'Тёмная тема' : 'Светлая тема'"
        >
          <span v-if="theme==='light'">🌙</span>
          <span v-else>☀️</span>
        </button>
      </div>
    </header>

    <main>
      <router-view />
    </main>

    <footer class="ft">
      <span>© {{ currentYear }} TaskPyramid</span>
      <div class="links">
        <!-- <a href="#privacy">Политика конфиденциальности</a> -->
        <!-- <a href="#terms">Условия использования</a> -->
      </div>
    </footer>

    <AuthModal
      :open="authOpen"
      :mode="authMode"
      @close="authOpen = false"
      @success="onAuthSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import AuthModal from './components/AuthModal.vue'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const theme = ref(localStorage.getItem('tp_theme') || 'light')
const currentYear = new Date().getFullYear()

function applyTheme () {
  document.documentElement.setAttribute('data-theme', theme.value)
}

function toggleTheme () {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  localStorage.setItem('tp_theme', theme.value)
  applyTheme()
}

const authOpen = ref(false)
const authMode = ref('login')

function openAuth (mode = 'login') {
  authMode.value = mode
  authOpen.value = true
}

function onAuthSuccess () {
  authOpen.value = false
  router.push('/app')
}

function logoutAndGoHome () {
  auth.logout()
  router.push('/')
}

watch(
  () => route.query.auth,
  (v) => {
    if (v) {
      openAuth(String(v))
      router.replace({ query: {} })
    }
  },
  { immediate: true }
)

onMounted(applyTheme)
</script>

<style>
.site{
  min-height:100vh;
  display:flex;
  flex-direction:column;
}

/* HEADER */
.nav{
  display:flex;
  align-items:center;
  gap:18px;
  padding:14px 18px;
  border-bottom:1px solid var(--border);
  backdrop-filter:saturate(1.2) blur(3px);
  position:sticky;
  top:0;
  background:var(--surface);
  z-index:10;
}

/* Брендинг слева */
.brand{
  display:inline-flex;
  align-items:center;
  gap:10px;
  font-weight:800;
  text-decoration:none;
  color:var(--text);
  flex:0 0 auto;
}

/* Кнопки справа */
.actions{
  display:flex;
  gap:10px;
  align-items:center;
  margin-left:auto;
  flex:0 0 auto;
}

.actions.actions--alone{
  margin-left:auto;
}

/* Кнопки */
.btn{
  border:none;
  border-radius:10px;
  padding:10px 14px;
  background:var(--btn-bg);
  color:var(--btn-fg);
  cursor:pointer;
  font-weight:600;
  font-size:14px;
  text-decoration:none;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  white-space:nowrap;
}
.btn:hover{filter:brightness(1.05)}
.btn-primary{background:var(--brand);color:#fff}
.btn-ghost{background:transparent;color:var(--text);border:1px solid var(--border)}

main{flex:1}

/* FOOTER */
.ft{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:16px;
  padding:16px 18px;
  border-top:1px solid var(--border);
  color:var(--muted);
  background:var(--surface);
}
.ft .links{
  display:flex;
  gap:16px;
  flex:0 0 auto;
}

/* ===== МОБИЛЬНАЯ ВЕРСИЯ ХЕДЕРА ===== */
@media (max-width: 600px) {
  .nav {
    padding: 10px 12px;
    gap: 12px;
  }

  .brand {
    font-size: 12px;
    white-space: nowrap;
    gap: 6px;
  }

  .brand svg {
    width: 20px;
    height: 20px;
  }

  .actions {
    gap: 6px;
  }

  .btn {
    padding: 8px 10px;
    font-size: 12px;
  }
}
</style>
