<template>
  <div class="task" :class="{ done: task.done, selected }">
    <!-- чекбокс -->
    <input
      class="check"
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

    <!-- иконки действий -->
    <div class="actions">
      <button
        v-if="hasChildren"
        class="icon-btn"
        :title="selected ? 'Скрыть подзадачи' : 'Раскрыть подзадачи'"
        @click="$emit('toggle-expand')"
      >
        <span v-if="selected">▴</span>
        <span v-else>▾</span>
      </button>
      <button
        class="icon-btn"
        title="Добавить подзадачу"
        @click="$emit('request-add-child')"
      >
        ＋
      </button>
      <button
        class="icon-btn danger"
        title="Удалить задачу"
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
.task{
  /* 3 колонки: чекбокс | контент | иконки */
  display:grid;
  grid-template-columns: auto 1fr auto;
  grid-template-areas: "check content actions";
  gap:10px 12px;

  border:1px solid var(--border);
  border-radius:12px;
  padding:12px;
  background: var(--panel, var(--surface));
  align-items:flex-start;

  min-width:0;
  transition: background .2s ease, box-shadow .2s ease;
}
.task.done{ opacity:.7; }
.task.selected{
  box-shadow:0 0 0 2px color-mix(in oklab, var(--brand) 35%, transparent) inset;
}

/* чекбокс */
.check{
  grid-area:check;
  margin-top:2px;
}

/* контент */
.content{
  grid-area:content;
  display:flex;
  flex-direction:column;
  gap:2px;
  min-width:0;
}
.t-title{
  font-weight:600;
  font-size:14px;
  margin-bottom:2px;
  white-space:normal;
  overflow-wrap:anywhere;
  word-break:break-word;
}
.desc{
  color:var(--muted);
  font-size:12px;
  margin-top:4px;
  overflow-wrap:anywhere;
  word-break:break-word;
}

/* действия */
.actions{
  grid-area:actions;
  display:inline-flex;
  gap:6px;
  align-self:flex-start;
  white-space:nowrap;
}

/* иконки — «старый» стиль с синим свечением в тёмной теме */
.icon-btn{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  width:28px; height:28px;
  border:1px solid var(--border);
  background: var(--panel-2, var(--surface));
  color:var(--text);
  border-radius:8px;
  cursor:pointer;
  font-size:14px; line-height:1;
  padding:0;
  transition: filter .15s ease,
             box-shadow .15s ease,
             transform .05s ease,
             background .15s ease,
             border-color .15s ease;
}
.icon-btn:hover{
  filter:brightness(1.04);
  background: color-mix(in oklab, var(--brand) 12%, var(--panel-2, var(--surface)));
  box-shadow:0 0 0 3px color-mix(in oklab, var(--brand) 18%, transparent);
}
.icon-btn:active{ transform:translateY(1px); }

.icon-btn.danger:hover{
  background: color-mix(in oklab, #ff5b6b 15%, var(--panel-2, var(--surface)));
  box-shadow:0 0 0 3px color-mix(in oklab, #ff5b6b 24%, transparent);
}

/* тёмная тема — прям как в старом приложении: холодный синий hover */
:root[data-theme='dark'] .icon-btn:hover{
  background: color-mix(in oklab, #6ea8fe 22%, var(--panel-2, var(--surface)));
  border-color: color-mix(in oklab, #6ea8fe 40%, var(--border));
  box-shadow:0 0 0 3px color-mix(in oklab, #6ea8fe 28%, transparent);
}
:root[data-theme='dark'] .icon-btn.danger:hover{
  background: color-mix(in oklab, #ff7b8a 26%, var(--panel-2, var(--surface)));
  border-color: color-mix(in oklab, #ff7b8a 40%, var(--border));
  box-shadow:0 0 0 3px color-mix(in oklab, #ff7b8a 34%, transparent);
}

/* mobile-фоллбек */
@media (max-width:520px){
  .actions{ white-space:normal; gap:4px; }
}
</style>
