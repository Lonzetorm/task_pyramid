<template>
  <div v-if="open" class="modal-backdrop" @click="emit('close')">
    <div class="modal" @click.stop>
      <h4>Удалить задачу?</h4>
      <div class="row">Вы действительно хотите удалить «{{ target?.title }}» и все её подзадачи?</div>
      <div class="actions">
        <button class="btn btn-ghost" @click="emit('close')">Отмена</button>
        <button class="btn btn-danger" @click="emit('confirm')">Удалить</button>
      </div>
    </div>
  </div>
</template>
<script setup>
const props = defineProps({ open: Boolean, target: Object })
const emit = defineEmits(['close','confirm'])
</script>
<style scoped>
.modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:1000}
.modal{width:min(560px,94vw);background:linear-gradient(180deg,#171923,#1e2230);border:1px solid var(--border);border-radius:16px;box-shadow:0 6px 20px rgba(0,0,0,.35);padding:16px}
.modal h4{margin:0 0 10px 0;font-size:16px}
.row{display:flex;flex-direction:column;gap:6px;margin:10px 0}
.actions{display:flex;gap:8px;justify-content:flex-end;margin-top:8px}
</style>
