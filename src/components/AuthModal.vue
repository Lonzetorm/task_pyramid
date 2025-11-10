<template>
  <div v-if="open" class="modal-backdrop" @keydown.esc="emit('close')" tabindex="-1" @click="emit('close')">
    <div class="modal" @click.stop>
      <div class="tabs">
        <button
          class="tab"
          :class="{ active: modeLocal==='login' }"
          @click="modeLocal='login'"
        >Вход</button>
        <button
          class="tab"
          :class="{ active: modeLocal==='register' }"
          @click="modeLocal='register'"
        >Регистрация</button>
      </div>

      <h4 v-if="modeLocal==='login'">Вход в Task Pyramid</h4>
      <h4 v-else>Регистрация в Task Pyramid</h4>

      <div v-if="error" class="error">{{ error }}</div>

      <div class="row" v-if="modeLocal==='register'">
        <label>Имя</label>
        <input type="text" v-model.trim="name" placeholder="Как к вам обращаться" />
      </div>

      <div class="row">
        <label>Email</label>
        <input type="email" v-model.trim="email" placeholder="you@example.com" />
      </div>

      <div class="row">
        <label>Пароль</label>
        <input type="password" v-model="password" placeholder="Минимум 6 символов" />
      </div>

      <div class="actions">
        <button class="btn btn-ghost" @click="emit('close')">Отмена (Esc)</button>
        <button
          class="btn btn-accent btn-accent-strong"
          @click="submit"
        >{{ modeLocal==='login' ? 'Войти' : 'Создать аккаунт' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  open: { type: Boolean, required: true },
  mode: { type: String, default: 'login' } // 'login' | 'register'
})
const emit = defineEmits(['close','login','register'])

const modeLocal = ref(props.mode)
const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')

watch(() => props.open, (v) => {
  if (v) reset()
})

watch(() => props.mode, (m) => {
  modeLocal.value = m || 'login'
})

function reset(){
  modeLocal.value = props.mode || 'login'
  name.value = ''
  email.value = ''
  password.value = ''
  error.value = ''
}

function isEmail(v){ return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) }
function submit(){
  error.value = ''
  if(!isEmail(email.value)){ error.value = 'Введите корректный email'; return }
  if(!password.value || password.value.length < 6){ error.value = 'Пароль должен быть не короче 6 символов'; return }

  if(modeLocal.value === 'register'){
    if(!name.value.trim()){ error.value = 'Укажите имя'; return }
    emit('register', { name: name.value.trim(), email: email.value.trim().toLowerCase(), password: password.value })
  } else {
    emit('login', { email: email.value.trim().toLowerCase(), password: password.value })
  }
}
</script>

<style scoped>
.tabs{
  display:flex; gap:6px; margin-bottom:10px;
}
.tab{
  border:1px solid var(--border);
  background:#1b2031;
  color:var(--text);
  border-radius:10px;
  padding:8px 12px;
  cursor:pointer;
  font-weight:600;
  font-size:12px;
}
.tab.active{
  background:linear-gradient(180deg,#2a4bff,#3965ff);
  border-color:transparent;
}

.error{
  background:#2a1120;
  border:1px solid #6a2030;
  color:#ffb3bf;
  border-radius:10px;
  padding:8px 10px;
  font-size:12px;
  margin:8px 0;
}

/* поля ввода — в стиле приложения */
input[type="text"], input[type="email"], input[type="password"]{
  width:100%;
  background:#121520;
  border:1px solid var(--border);
  border-radius:10px;
  padding:10px 12px;
  color:var(--text);
  outline:none;
  transition:border-color .15s ease, box-shadow .15s ease;
}
input::placeholder{ color:#7f879a; }
input:focus{
  border-color: rgba(110,168,254,.9);
  box-shadow: 0 0 0 3px rgba(110,168,254,.18);
}

.row{ display:flex; flex-direction:column; gap:6px; margin:10px 0; }
.actions{ display:flex; gap:10px; justify-content:flex-end; margin-top:8px; }

/* выразительная основная кнопка */
.btn-accent-strong {
  background: linear-gradient(180deg, #3b5cff, #2a4bff);
  box-shadow: 0 0 12px rgba(58,101,255,0.4);
  transition: filter .15s ease, box-shadow .2s ease;
}
.btn-accent-strong:hover{
  filter:brightness(1.15);
  box-shadow:0 0 18px rgba(58,101,255,0.55);
}
</style>
