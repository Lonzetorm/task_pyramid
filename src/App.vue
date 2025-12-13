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
        <span class="brand-text">TaskPyramid</span>
      </router-link>

      <div
        class="actions"
        :class="{ 'actions--alone': true }"
      >
        <!-- Пока auth не готов — рисуем только плейсхолдер, чтобы ничего не мигало -->
        <template v-if="auth.isReady">
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
            <!-- Кнопка "К приложению" показывается ТОЛЬКО на лендинге -->
            <router-link
              v-if="showAppLink"
              class="btn btn-ghost"
              to="/app"
            >
              К приложению
            </router-link>

            <button
              class="btn btn-ghost"
              @click="handleLogout"
            >
              Выйти
            </button>
          </template>
        </template>

        <template v-else>
          <div class="actions-placeholder"></div>
        </template>

        <!-- Переключатель темы -->
        <button
          class="btn btn-ghost"
          @click="toggleTheme"
          :title="theme === 'light' ? 'Тёмная тема' : 'Светлая тема'"
        >
          <span v-if="theme === 'light'">🌙</span>
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
        <!-- под будущие ссылки -->
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
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import AuthModal from './components/AuthModal.vue'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const theme = ref(localStorage.getItem('tp_theme') || 'light')
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

// Выход: очищаем сессию и уводим на лендинг
async function handleLogout () {
  try {
    await auth.logout()
  } finally {
    router.push('/')
  }
}

// Кнопку "К приложению" показываем только:
// - когда пользователь авторизован
// - и мы реально на лендинге
const showAppLink = computed(() =>
  auth.isAuthenticated && route.name === 'landing'
)

// Обрабатываем ?auth=login|register
watch(
  () => route.query.auth,
  v => {
    if (v) {
      openAuth(String(v))
      router.replace({ query: {} })
    }
  },
  { immediate: true }
)

onMounted(applyTheme)

const currentYear = new Date().getFullYear()
</script>

<style>
.site {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* HEADER */
.nav {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
  backdrop-filter: saturate(1.2) blur(3px);
  position: sticky;
  top: 0;
  background: var(--surface);
  z-index: 10;
}

/* Брендинг слева */
.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  text-decoration: none;
  color: var(--text);
  flex: 0 0 auto;
}
.brand-text {
  white-space: nowrap;
}
.logo {
  fill: var(--brand);
}

/* Кнопки справа */
.actions {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-left: auto;
  flex: 0 0 auto;
}

/* Плейсхолдер под кнопки, пока auth.isReady === false */
.actions-placeholder {
  width: 140px;
  height: 36px;
  visibility: hidden;
}

/* Кнопки */
.btn {
  border: none;
  border-radius: 10px;
  padding: 10px 14px;
  background: var(--btn-bg);
  color: var(--btn-fg);
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}
.btn:hover {
  filter: brightness(1.05);
}
.btn-primary {
  background: var(--brand);
  color: #fff;
}
.btn-ghost {
  background: transparent;
  color: var(--text);
  border: 1px solid var(--border);
}

main {
  flex: 1;
}

/* FOOTER */
.ft {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  border-top: 1px solid var(--border);
  color: var(--muted);
  background: var(--surface);
}
.ft .links {
  display: flex;
  gap: 16px;
  flex: 0 0 auto;
}

/* Мобильная подстройка бренда */
@media (max-width: 480px) {
  .brand-text {
    font-size: 13px;
  }
}
</style>
