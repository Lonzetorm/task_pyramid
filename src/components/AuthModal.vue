<template>
  <teleport to="body">
    <div
      v-if="open"
      class="tp-modal-backdrop"
      @click.self="emit('close')"
      @keydown.esc="emit('close')"
      tabindex="-1"
    >
      <div class="tp-modal">
        <div class="tp-tabs">
          <button :class="{active: modeLocal==='login'}" @click="modeLocal='login'">Вход</button>
          <button :class="{active: modeLocal==='register'}" @click="modeLocal='register'">Регистрация</button>
          <button class="ghost" @click="modeLocal='forgot'">Забыли пароль?</button>
        </div>

        <form v-if="modeLocal==='login'" @submit.prevent="login">
          <label>Email
            <input type="email" v-model.trim="email" required />
          </label>
          <label>Пароль
            <input type="password" v-model.trim="password" required minlength="6" />
          </label>
          <div class="tp-actions">
            <button class="tp-btn tp-btn-primary" :disabled="loading">Войти</button>
            <button type="button" class="tp-btn tp-btn-ghost" @click="emit('close')">Отмена</button>
          </div>
          <p v-if="error" class="tp-error">{{ error }}</p>
        </form>

        <form v-else-if="modeLocal==='register'" @submit.prevent="register">
          <label>Имя
            <input type="text" v-model.trim="name" required minlength="2" />
          </label>
          <label>Email
            <input type="email" v-model.trim="email" required />
          </label>
          <label>Пароль
            <input type="password" v-model.trim="password" required minlength="6" />
          </label>
          <div class="tp-actions">
            <button class="tp-btn tp-btn-primary" :disabled="loading">Создать</button>
            <button type="button" class="tp-btn tp-btn-ghost" @click="emit('close')">Отмена</button>
          </div>
          <p v-if="error" class="tp-error">{{ error }}</p>
        </form>

        <form v-else @submit.prevent="forgot">
          <label>Email
            <input type="email" v-model.trim="email" required />
          </label>
          <div class="tp-actions">
            <button class="tp-btn tp-btn-primary" :disabled="loading">Отправить ссылку</button>
            <button type="button" class="tp-btn tp-btn-ghost" @click="modeLocal='login'">Назад</button>
          </div>
          <p v-if="msg" class="tp-ok">{{ msg }}</p>
        </form>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from '../stores/auth'

const props = defineProps({ open: Boolean, mode: { type:String, default:'login' } })
const emit = defineEmits(['close','success'])
const auth = useAuthStore()

const modeLocal = ref(props.mode)
watch(()=>props.mode, v=> modeLocal.value=v)

const email = ref('')
const password = ref('')
const name = ref('')
const loading = ref(false)
const error = ref('')
const msg = ref('')

// Блокируем скролл под модалкой
watch(()=>props.open, v=>{
  if (v) document.documentElement.classList.add('tp-modal-open')
  else document.documentElement.classList.remove('tp-modal-open')
})
onMounted(()=>{ if(props.open) document.documentElement.classList.add('tp-modal-open') })
onBeforeUnmount(()=> document.documentElement.classList.remove('tp-modal-open'))

async function login(){
  error.value=''; loading.value=true
  try{ await auth.login({ email: email.value, password: password.value }); emit('success') }
  catch(e){ error.value = e.message || 'Ошибка входа' }
  finally{ loading.value=false }
}
async function register(){
  error.value=''; loading.value=true
  try{
    await auth.register({ name: name.value, email: email.value, password: password.value })
    modeLocal.value='login'; msg.value='Аккаунт создан. Теперь войдите.'
  }catch(e){ error.value = e.message || 'Ошибка регистрации' }
  finally{ loading.value=false }
}
async function forgot(){
  loading.value=true; msg.value=''
  await new Promise(r=>setTimeout(r,400))
  msg.value='Если такой email есть, мы отправили ссылку на сброс.'
  loading.value=false
}
</script>

<style scoped>
/* Бэкдроп: поверх всего, фиксированный */
.tp-modal-backdrop{
  position:fixed; inset:0;
  display:flex; align-items:center; justify-content:center;
  background:var(--modal-backdrop);
  z-index: 1000;
}

/* Окно модалки */
.tp-modal{
  width:min(560px, 94vw);
  background:var(--modal-surface);
  border:1px solid var(--modal-border);
  border-radius:16px;
  box-shadow: 0 20px 60px var(--modal-shadow);
  padding:16px;
}

/* Вкладки */
.tp-tabs{ display:flex; gap:8px; align-items:center; margin-bottom:10px }
.tp-tabs button{
  border:1px solid var(--modal-border);
  border-radius:10px; padding:8px 10px;
  background:transparent; color:var(--text);
  font-weight:600; cursor:pointer;
}
.tp-tabs .ghost{ background:transparent; color:var(--muted); border-style:dashed }
.tp-tabs .active{
  background:var(--modal-accent); color:#fff; border-color:transparent;
}

/* Формы */
label{ display:flex; flex-direction:column; gap:6px; margin:8px 0 }
input{
  width:100%; padding:10px 12px; border-radius:10px;
  border:1px solid var(--modal-input-border);
  background:var(--modal-input-bg); color:var(--text);
}
.tp-actions{ display:flex; gap:8px; justify-content:flex-end; margin-top:10px }
.tp-error{ color:#d53f3f; margin-top:8px }
.tp-ok{ color:#1fa97a; margin-top:8px }

/* Кнопки */
.tp-btn{
  border:1px solid var(--modal-border);
  border-radius:10px; padding:10px 14px;
  background:var(--btn-bg); color:var(--btn-fg);
  font-weight:600; cursor:pointer;
}
.tp-btn-primary{
  background:var(--modal-accent); color:#fff; border-color:transparent;
}
.tp-btn-ghost{
  background:transparent; color:var(--text); border:1px solid var(--modal-border);
}
</style>
