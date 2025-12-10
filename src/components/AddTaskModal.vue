<template>
  <div v-if="open" class="modal-backdrop" @click.self="emit('close')">
    <div class="modal">
      <h4 v-if="parent">Новая подзадача для: {{ parent.title }}</h4>
      <h4 v-else>Новая главная задача</h4>

      <div class="row">
        <label>
          Название
          <input
            ref="titleEl"
            type="text"
            v-model="title"
            placeholder="Например: Сверстать макет"
            @keyup.enter="save"
          />
        </label>
      </div>

      <div class="row">
        <label>
          Описание
          <textarea rows="4" v-model="description" placeholder="Кратко опишите задачу"></textarea>
        </label>
      </div>

      <div class="actions">
        <button class="btn" @click="emit('close')">Отмена</button>
        <button class="btn btn-primary" @click="save">Сохранить</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ open: Boolean, parent: Object })
const emit = defineEmits(['close', 'save'])

const title = ref('')
const description = ref('')
const titleEl = ref(null)

watch(() => props.open, (v) => {
  if (v) {
    title.value = ''
    description.value = ''
    setTimeout(() => titleEl.value?.focus(), 0)
  }
})

function save() {
  const t = title.value.trim()
  if (!t) return
  emit('save', { title: t, description: description.value.trim() })
}
</script>

<style scoped>
.modal-backdrop{
  position:fixed;inset:0;background:rgba(0,0,0,.6);
  display:flex;align-items:center;justify-content:center;z-index:1000
}
.modal{
  width:min(560px,94vw);
  background:var(--surface);
  border:1px solid var(--border);
  border-radius:16px;
  box-shadow:0 6px 20px rgba(0,0,0,.15);
  padding:16px
}
.row{display:flex;flex-direction:column;gap:6px;margin:10px 0}
input[type="text"],textarea{
  width:100%;background:#fff;border:1px solid var(--border);
  border-radius:10px;padding:10px 12px;color:var(--text)
}
[data-theme='dark'] input,[data-theme='dark'] textarea{
  background:#121520;color:#e8eaf1;border-color:#2a2f40
}
.actions{display:flex;gap:8px;justify-content:flex-end;margin-top:8px}
.btn{border:1px solid var(--border);border-radius:10px;padding:8px 12px;background:var(--btn-bg);color:var(--btn-fg);font-weight:600}
.btn.btn-primary{background:var(--brand);color:#fff;border-color:transparent}
</style>
