<template>
  <div v-if="open" class="modal-backdrop" @keydown.esc="emit('close')" tabindex="-1">
    <div class="modal" @click.stop>
      <h4 v-if="parent">Новая подзадача для: {{ parent.title }}</h4>
      <h4 v-else>Новая главная задача</h4>
      <div class="row">
        <label>Название</label>
        <input ref="titleEl" type="text" v-model="title" placeholder="Например: Сверстать макет" @keyup.enter="save" />
      </div>
      <div class="row">
        <label>Описание</label>
        <textarea rows="4" v-model="description" placeholder="Кратко опишите задачу"></textarea>
      </div>
      <div class="actions">
        <button class="btn btn-ghost" @click="emit('close')">Отмена (Esc)</button>
        <button class="btn btn-accent btn-accent-strong" @click="save">Сохранить</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ open: Boolean, parent: Object })
const emit = defineEmits(['close','save'])
const title = ref('')
const description = ref('')
const titleEl = ref(null)

watch(() => props.open, v => {
  if (v) { title.value=''; description.value=''; setTimeout(()=> titleEl.value?.focus(), 0) }
})

function save(){
  const t = title.value.trim()
  if(!t) return
  emit('save', { title: t, description: description.value.trim() })
}
</script>

<style scoped>
input[type="text"], textarea {
  width: 100%;
  background: #121520;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 12px;
  color: var(--text);
  outline: none;
  transition: border-color .15s ease, box-shadow .15s ease;
}
input[type="text"]::placeholder,
textarea::placeholder { color: #7f879a; }

input[type="text"]:focus,
textarea:focus {
  border-color: rgba(110,168,254,.9);
  box-shadow: 0 0 0 3px rgba(110,168,254,.18);
}

label { font-size: 12px; color: var(--muted); }

.row { display: flex; flex-direction: column; gap: 6px; margin: 10px 0; }
.actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px; }

/* ✨ Улучшенная кнопка «Сохранить» */
.btn-accent-strong {
  background: linear-gradient(180deg, #3b5cff, #2a4bff);
  box-shadow: 0 0 12px rgba(58, 101, 255, 0.4);
  transition: filter 0.15s ease, box-shadow 0.2s ease;
}
.btn-accent-strong:hover {
  filter: brightness(1.15);
  box-shadow: 0 0 18px rgba(58, 101, 255, 0.55);
}
</style>
