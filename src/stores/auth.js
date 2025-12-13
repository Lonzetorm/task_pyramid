// src/stores/auth.js
import { defineStore } from 'pinia'
import { supabase } from '../lib/supabaseClient'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    isReady: false, // init уже отработал
  }),

  actions: {
    // Инициализация сессии при загрузке приложения
    async init() {
      try {
        // 1. Пробуем восстановить сессию из Supabase
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.warn('auth.init getSession error:', error.message)
          this.user = null
          this.isAuthenticated = false
        } else {
          this.user = session?.user ?? null
          this.isAuthenticated = !!session
        }
      } catch (e) {
        console.warn('auth.init unexpected error:', e)
        this.user = null
        this.isAuthenticated = false
      } finally {
        this.isReady = true
      }

      // 2. Подписка на будущие изменения авторизации
      supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          this.user = session?.user ?? null
          this.isAuthenticated = !!session?.user
        }

        if (event === 'SIGNED_OUT') {
          this.user = null
          this.isAuthenticated = false
        }
      })
    },

    // РЕГИСТРАЦИЯ
    async register({ email, password }) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error

      // если Supabase сразу вернул user (без подтверждения)
      if (data?.user) {
        this.user = data.user
        this.isAuthenticated = true
      }

      return data
    },

    // ЛОГИН
    async login({ email, password }) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error

      this.user = data.user
      this.isAuthenticated = true

      return data
    },

    // ВЫХОД
    async logout() {
      await supabase.auth.signOut()
      this.user = null
      this.isAuthenticated = false
    },
  },
})
