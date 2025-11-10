<template>
  <div class="task" :class="{ done: task.done }">
    <!-- чекбокс слева -->
    <input
      type="checkbox"
      :checked="task.done"
      @change="$emit('toggle-done')"
      title="Выполнено"
    />

    <!-- контент -->
    <div class="content">
      <div class="t-title">{{ task.title }}</div>
      <small v-if="hasChildren">Подзадач: {{ task.children.length }}</small>
      <small v-else>Без подзадач</small>
      <div v-if="task.description" class="desc">{{ task.description }}</div>
    </div>

    <!-- иконки-действия в правом верхнем углу -->
    <div class="actions">
      <button
        v-if="hasChildren"
        class="icon-btn"
        :title="selected ? 'Скрыть' : 'Раскрыть'"
        :aria-label="selected ? 'Скрыть' : 'Раскрыть'"
        @click="$emit('toggle-expand')"
      >
        <span v-if="selected">▲</span>
        <span v-else>▼</span>
      </button>

      <button
        class="icon-btn"
        title="Добавить подзадачу"
        aria-label="Добавить подзадачу"
        @click="$emit('request-add-child')"
      >
        ＋
      </button>

      <button
        class="icon-btn danger"
        title="Удалить задачу"
        aria-label="Удалить задачу"
        @click="$emit('delete')"
      >
        🗑
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  task: { type: Object, required: true },
  level: { type: Number, required: true },
  selected: { type: Boolean, default: false }
})

const hasChildren = computed(
  () => Array.isArray(props.task.children) && props.task.children.length > 0
)
</script>

<style scoped>
.task {
  position: relative;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px;
  padding-right: 76px; /* место под иконки справа */
  background: #151926;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
  align-items: flex-start;
}
.task.done { opacity: .7; }

.t-title { font-weight: 600; font-size: 14px; margin-bottom: 2px; }
.desc { color: var(--muted); font-size: 12px; margin-top: 4px; }
.content { display: flex; flex-direction: column; gap: 2px; }

/* панель иконок в правом верхнем углу */
.actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: inline-flex;
  gap: 8px;
}

/* компактные кнопки-иконки */
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid var(--border);
  background: #1b2031;
  color: var(--text);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  padding: 0;
  transition: filter .15s ease, box-shadow .15s ease, transform .05s ease;
}
.icon-btn:hover { filter: brightness(1.12); box-shadow: 0 0 0 3px rgba(110,168,254,.15); }
.icon-btn:active { transform: translateY(1px); }
.icon-btn.danger:hover { box-shadow: 0 0 0 3px rgba(255,63,82,.18); }
</style>
