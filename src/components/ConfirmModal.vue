<template>
  <div v-if="open" class="modal-backdrop" @click.self="emit('close')">
    <div class="modal">
      <h4>Удалить задачу?</h4>
      <div class="row">
        Вы действительно хотите удалить «{{ target?.title }}» и все её подзадачи?
      </div>
      <div class="actions">
        <button class="btn" @click="emit('close')">Отмена</button>
        <button class="btn danger" @click="emit('confirm')">Удалить</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ open: Boolean, target: Object })
const emit = defineEmits(['close', 'confirm'])
</script>

<style scoped>
.modal-backdrop{
  position:fixed;inset:0;background:rgba(0,0,0,.6);
  display:flex;align-items:center;justify-content:center;z-index:1000
}
.modal{
  width:min(520px,94vw);
  background:var(--surface);
  border:1px solid var(--border);
  border-radius:16px;
  box-shadow:0 6px 20px rgba(0,0,0,.15);
  padding:16px
}
.row{margin:10px 0;color:var(--text)}
.actions{display:flex;gap:8px;justify-content:flex-end}
.btn{border:1px solid var(--border);border-radius:10px;padding:8px 12px;background:var(--btn-bg);color:var(--btn-fg);font-weight:600}
.btn.danger{background:#bb2d3b;color:#fff;border-color:transparent}
</style>
