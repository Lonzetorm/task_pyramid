<template>
  <teleport to="body">
    <div
      v-if="open"
      class="tp-modal-backdrop"
      @click.self="emit('close')"
      tabindex="-1"
    >
      <div class="tp-modal">
        <h3 class="tp-title">Удалить задачу?</h3>
        <p class="tp-text">
          Это действие нельзя отменить. Все подзадачи также будут удалены.
        </p>

        <div class="tp-actions">
          <button class="tp-btn tp-btn-danger" @click="onConfirm">
            Удалить
          </button>
          <button class="tp-btn tp-btn-ghost" @click="emit('close')">
            Отмена
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  target: { type: Object, default: null }
})
const emit = defineEmits(['close', 'confirm'])

function handleKeydown (e) {
  if (e.key === 'Escape' && props.open) {
    emit('close')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

function onConfirm () {
  emit('confirm')
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
  width: min(420px, 90vw);
  background: var(--modal-surface);
  border: 1px solid var(--modal-border);
  border-radius: 16px;
  box-shadow: 0 20px 60px var(--modal-shadow);
  padding: 16px 16px 14px;
}

.tp-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 700;
}

.tp-text {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--muted);
}

.tp-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
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

.tp-btn-ghost {
  background: transparent;
  color: var(--text);
  border: 1px solid var(--modal-border);
}

.tp-btn-danger {
  background: #dc2626;
  border-color: #dc2626;
  color: #fff;
}
</style>
