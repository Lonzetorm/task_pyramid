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
          <path d="M12 3 L20.5 18 H3.5 L12 3 Z" />
          <path d="M9 10 L15 10" />
          <path d="M7 14 L17 14" />
        </svg>

        <span class="brand-text">TaskPyramid</span>
      </router-link>

      <div class="actions" :class="{ 'actions--alone': route.path !== '/' }">
        <template v-if="auth.isReady">
          <template v-if="!auth.isAuthenticated">
            <button class="btn btn-ghost" @click="openAuth('login')">Войти</button>
            <button class="btn btn-primary" @click="openAuth('register')">Начать</button>
          </template>

          <template v-else>
            <router-link
              v-if="route.path !== '/app'"
              class="btn btn-ghost"
              style="text-decoration: none"
              to="/app"
            >
              К приложению
            </router-link>
            <button class="btn btn-ghost" @click="logout">Выйти</button>
          </template>
        </template>

        <button
          class="btn btn-ghost"
          @click="toggleTheme"
          :title="theme==='light'?'Тёмная тема':'Светлая тема'"
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
      <span>© {{ year }} TaskPyramid</span>
    </footer>

    <AuthModal
      :open="authOpen"
      :mode="authMode"
      @close="authOpen=false"
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

function openAuth (mode='login') {
  authMode.value = mode
  authOpen.value = true
}

function onAuthSuccess () {
  authOpen.value = false
  router.push('/app')
}

function logout () {
  auth.logout()
  router.push('/')
}

watch(
  () => route.query.auth,
  v => {
    if (v) {
      openAuth(String(v))
      router.replace({ query:{} })
    }
  },
  { immediate:true }
)

onMounted(() => {
  applyTheme()
  auth.init()
})

const year = computed(() => new Date().getFullYear())
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
  position:sticky;
  top:0;
  background:var(--surface);
  z-index:10;
}

/* Бренд */
.brand{
  display:inline-flex;
  align-items:center;
  gap:10px;
  font-weight:800;
  text-decoration:none;
  color:var(--text);
  flex:0 0 auto;
}

.brand-text{
  white-space:nowrap;
}

/* Actions */
.actions{
  display:flex;
  gap:10px;
  align-items:center;
  margin-left:auto;
}

.actions--alone{
  margin-left:auto;
}

/* Buttons */
.btn{
  border:none;
  border-radius:10px;
  padding:10px 14px;
  background:var(--btn-bg);
  color:var(--btn-fg);
  cursor:pointer;
  font-weight:600;
  font-size:14px;
}
.btn-primary{background:var(--brand);color:#fff}
.btn-ghost{background:transparent;border:1px solid var(--border)}

main{flex:1}

/* FOOTER */
.ft{
  display:flex;
  align-items:center;
  padding:16px 18px;
  border-top:1px solid var(--border);
  color:var(--muted);
  background:var(--surface);
}

/* ===== MOBILE FIX ===== */
@media (max-width: 520px){
  .nav{
    padding:12px 14px;
  }

  .brand{
    flex-direction:column;
    align-items:center;
    gap:4px;
    text-align:center;
  }

  .brand-text{
    font-size:12px;
    line-height:1.1;
    white-space:normal;
  }

  .actions{
    gap:8px;
  }

  .btn{
    padding:9px 12px;
    font-size:13px;
  }
}
</style>
