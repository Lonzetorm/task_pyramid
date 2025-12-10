import { defineStore } from 'pinia'

const LS_KEY = 'tp_auth'
function load() { try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null') || null } catch { return null } }
function save(data) { localStorage.setItem(LS_KEY, JSON.stringify(data)) }

async function apiLogin({ email, password }) {
  await new Promise(r => setTimeout(r, 250))
  if (!email || !password) throw new Error('Неверные данные')
  return { user: { id: 'u_' + Date.now(), email, name: email.split('@')[0] }, token: 'mock.' + Math.random().toString(36).slice(2) }
}
async function apiRegister({ name, email, password }) {
  await new Promise(r => setTimeout(r, 300))
  if (!name || !email || !password) throw new Error('Заполните все поля')
  return { ok: true }
}
async function apiLogout() { await new Promise(r => setTimeout(r, 120)); return { ok: true } }

export const useAuthStore = defineStore('auth', {
  state: () => ({ session: load() }),
  getters: {
    user: (s) => s.session?.user || null,
    isAuthenticated: (s) => Boolean(s.session?.token)
  },
  actions: {
    async login(payload) { const res = await apiLogin(payload); this.session = res; save(this.session) },
    async register(payload) { await apiRegister(payload) },
    async logout() { await apiLogout(); this.session = null; save(this.session) }
  }
})
