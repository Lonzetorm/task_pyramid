<template>
  <teleport to="body">
    <div
      v-if="open"
      class="tp-modal-backdrop"
      @click.self="emit('close')"
      tabindex="-1"
    >
      <div class="tp-modal">
        <h3 class="tp-title">
          {{ parent ? 'Новая подзадача' : 'Новая главная задача' }}
        </h3>

        <form @submit.prevent="onSubmit">
          <label>
            Название
            <input v-model.trim="title" required minlength="2" />
          </label>

          <label>
            Описание
            <textarea v-model.trim="description" rows="3" />
          </label>

          <div class="tp-actions">
            <button type="submit" class="tp-btn tp-btn-primary">
              Сохранить
            </button>
            <button
              type="button"
              class="tp-btn tp-btn-ghost"
              @click="emit('close')"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  parent: { type: Object, default: null }
})
const emit = defineEmits(['close', 'save'])

const title = ref('')
const description = ref('')

// сброс при открытии
watch(
  () => props.open,
  v => {
    if (v) {
      title.value = ''
      description.value = ''
      document.documentElement.classList.add('tp-modal-open')
    } else {
      document.documentElement.classList.remove('tp-modal-open')
    }
  }
)

// ESC для закрытия
function handleKeydown (e) {
  if (e.key === 'Escape' && props.open) {
    emit('close')
  }
}

onMounted(() => {
  if (props.open) {
    document.documentElement.classList.add('tp-modal-open')
  }
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.documentElement.classList.remove('tp-modal-open')
  window.removeEventListener('keydown', handleKeydown)
})

function onSubmit () {
  if (!title.value.trim()) return
  emit('save', {
    title: title.value.trim(),
    description: description.value.trim()
  })
}
</script>

<style scoped>
.tp-modal-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--modal-backdrop);
  z-index: 1000;
}

.tp-modal {
  width: min(460px, 95vw);
  background: var(--modal-surface);
  border: 1px solid var(--modal-border);
  border-radius: 16px;
  box-shadow: 0 20px 60px var(--modal-shadow);
  padding: 16px 16px 14px;
}

.tp-title {
  margin: 0 0 10px;
  font-size: 16px;
  font-weight: 700;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 8px 0;
  font-size: 13px;
}

input,
textarea {
  width: 100%;
  padding: 9px 11px;
  border-radius: 10px;
  border: 1px solid var(--modal-input-border);
  background: var(--modal-input-bg);
  color: var(--text);
  font: inherit;
}

textarea {
  resize: vertical;
}

.tp-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 10px;
}

.tp-btn {
  border: 1px solid var(--modal-border);
  border-radius: 10px;
  padding: 9px 13px;
  background: var(--btn-bg);
  color: var(--btn-fg);
  font-weight: 600;
  cursor: pointer;
  font-size: 13px;
}

.tp-btn-primary {
  background: var(--modal-accent);
  color: #fff;
  border-color: transparent;
}

.tp-btn-ghost {
  background: transparent;
  color: var(--text);
  border: 1px solid var(--modal-border);
}
</style>
