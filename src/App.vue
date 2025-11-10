<template>
  <div class="app">
    <div class="header">
      <div>
        <div class="title">Task Pyramid</div>
        <div class="subtitle">Трёхколоночный визуальный трекер с декомпозицией задач.</div>
      </div>

      <div class="header-actions">
        <button class="btn btn-accent" @click="openAddRoot">+ Добавить</button>
        <div class="nav-arrows" v-if="canNavigate">
          <button class="btn btn-ghost" :disabled="state.startLevel===0" @click="state.startLevel = Math.max(0, state.startLevel-1)">← Предыдущие уровни</button>
          <button class="btn btn-ghost" :disabled="!canGoRight" @click="state.startLevel = state.startLevel+1">Следующие уровни →</button>
        </div>
      </div>
    </div>

    <Transition name="shift" mode="out-in">
      <div class="columns" :key="state.startLevel">
        <!-- 1 -->
        <div :class="['col', { 'col--primary': state.startLevel === 0 }]">
          <h3>{{ columnTitles[0] }}</h3>
          <div class="list" v-if="Array.isArray(columns[0]) && columns[0].length">
            <div
              class="row-anch"
              v-for="task in columns[0]"
              :key="task.id"
              :data-id="task.id"
            >
              <TaskRow
                :task="task"
                :level="absLevel(0)"
                :selected="selectedIds[absLevel(0)]===task.id"
                @toggle-done="toggleDone(task)"
                @toggle-expand="toggleExpand(task, absLevel(0))"
                @delete="requestDelete(task, parentForColumn(0))"
                @request-add-child="openAddChild(task)"
              />
            </div>
          </div>
          <div v-else class="empty">Нет задач</div>
        </div>

        <!-- 2 -->
        <div class="col">
          <h3>{{ columnTitles[1] }}</h3>
          <div class="list" v-if="Array.isArray(columns[1])">
            <template v-if="columns[1].length">
              <div
                class="row-anch"
                v-for="task in columns[1]"
                :key="task.id"
                :data-id="task.id"
              >
                <TaskRow
                  :task="task"
                  :level="absLevel(1)"
                  :selected="selectedIds[absLevel(1)]===task.id"
                  @toggle-done="toggleDone(task)"
                  @toggle-expand="toggleExpand(task, absLevel(1))"
                  @delete="requestDelete(task, parentForColumn(1))"
                  @request-add-child="openAddChild(task)"
                />
              </div>
            </template>
            <div v-else class="empty">Нет подзадач</div>
          </div>
          <div v-else class="empty">Пока ничего не выбрано слева</div>
        </div>

        <!-- 3 -->
        <div class="col">
          <h3>{{ columnTitles[2] }}</h3>
          <div class="list" v-if="Array.isArray(columns[2])">
            <template v-if="columns[2].length">
              <div
                class="row-anch"
                v-for="task in columns[2]"
                :key="task.id"
                :data-id="task.id"
              >
                <TaskRow
                  :task="task"
                  :level="absLevel(2)"
                  :selected="selectedIds[absLevel(2)]===task.id"
                  @toggle-done="toggleDone(task)"
                  @toggle-expand="toggleExpand(task, absLevel(2))"
                  @delete="requestDelete(task, parentForColumn(2))"
                  @request-add-child="openAddChild(task)"
                />
              </div>
            </template>
            <div v-else class="empty">Нет подзадач</div>
          </div>
          <div v-else class="empty">Пока ничего не выбрано слева</div>
        </div>
      </div>
    </Transition>

    <div class="footer">
      Совет: у задач без дочерних кнопки «Раскрыть/Скрыть» нет. Если уровней больше двух, используйте стрелки сверху (на экране всегда только три столбика).
    </div>

    <!-- Modals -->
    <AddTaskModal :open="state.modal.open" :parent="state.modal.parent" @close="state.modal.open=false" @save="saveModal" />
    <ConfirmModal :open="state.confirm.open" :target="state.confirm.target" @close="state.confirm.open=false" @confirm="confirmDelete" />
  </div>
</template>

<script setup>
import { reactive, computed, nextTick, onMounted } from 'vue'
import TaskRow from './components/TaskRow.vue'
import AddTaskModal from './components/AddTaskModal.vue'
import ConfirmModal from './components/ConfirmModal.vue'

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36)

const state = reactive({
  tasks: [],
  path: [],
  startLevel: 0,
  modal: { open:false, parent:null },
  confirm: { open:false, target:null, parent:null },
})

function save(){
  localStorage.setItem('task-pyramid', JSON.stringify({
    tasks: state.tasks,
    pathIds: state.path.map(t=>t.id),
    startLevel: state.startLevel
  }))
}

function load(){
  const raw = localStorage.getItem('task-pyramid')
  if(!raw){
    state.tasks = [
      { id: uid(), title: 'Запустить проект', done:false, children:[
        { id: uid(), title: 'Собрать требования', done:false, children:[
          { id: uid(), title: 'Интервью с пользователями', done:false, children:[] },
          { id: uid(), title: 'Анализ конкурентов', done:false, children:[] }
        ]},
        { id: uid(), title: 'Сверстать прототип', done:false, children:[] }
      ]},
      { id: uid(), title: 'Маркетинг', done:false, children:[
        { id: uid(), title: 'Контент-план', done:false, children:[] },
        { id: uid(), title: 'Запуск рекламы', done:false, children:[
          { id: uid(), title: 'Подготовка креативов', done:false, children:[] }
        ]}
      ]}
    ]
    return
  }
  try{
    const parsed = JSON.parse(raw)
    state.tasks = parsed.tasks || []
    state.startLevel = parsed.startLevel || 0
    const pathIds = parsed.pathIds || []
    let level = state.tasks
    const rebuilt = []
    for(const id of pathIds){
      const found = (level||[]).find(t=>t.id===id)
      if(found){ rebuilt.push(found); level = found.children } else break
    }
    state.path = rebuilt
  }catch(e){ console.warn('load failed', e) }
}

onMounted(load)

const selectedIds = computed(() => state.path.map(t=>t?.id))
const windowLevels = computed(() => [state.startLevel, state.startLevel+1, state.startLevel+2])
const deepestLevelIndex = computed(() => state.path.length)
const canNavigate = computed(() => (deepestLevelIndex.value > 2) || (state.startLevel>0))
const canGoRight = computed(() => (state.startLevel + 2) < deepestLevelIndex.value)

const columnTitles = computed(() => {
  const titles = []
  for(let i=0;i<3;i++){
    const level = state.startLevel + i
    titles[i] = level === 0 ? 'Столбик 1 — Главные задачи' : `Столбик ${level+1} — Дочерние`
  }
  return titles
})

const columns = computed(() => {
  const levels = []
  levels[0] = Array.isArray(state.tasks) ? state.tasks : []
  for(let i=0;i<state.path.length;i++){
    const parent = state.path[i]
    levels[i+1] = Array.isArray(parent?.children) ? parent.children : []
  }
  const [a,b,c] = windowLevels.value
  return [ levels[a] || [], levels[b] || [], levels[c] || [] ]
})

const absLevel = (colIndex) => state.startLevel + colIndex
const parentForColumn = (colIndex) => {
  const lvl = absLevel(colIndex)
  return lvl > 0 ? state.path[lvl - 1] : null
}

function findParent(target, list = state.tasks){
  for(const t of list){
    if(t.children?.includes(target)) return { parent:t, list:t.children }
    const deep = findParent(target, t.children || [])
    if(deep) return deep
  }
  return null
}

function propagateDoneUpwards(task){
  const info = findParent(task)
  if(!info) return
  const parent = info.parent
  const allDone = (parent.children||[]).length>0 && parent.children.every(ch=>ch.done)
  parent.done = allDone
  propagateDoneUpwards(parent)
}

function toggleDone(task){
  task.done = !task.done
  if(!task.done){
    let info = findParent(task)
    while(info && info.parent){ info.parent.done = false; info = findParent(info.parent) }
  }
  propagateDoneUpwards(task)
  nextTick(save)
}

function toggleExpand(task, level){
  if(state.path[level]?.id === task.id){
    state.path = state.path.slice(0, level)
    if(state.startLevel > state.path.length) state.startLevel = Math.max(0, state.path.length - 2)
  } else {
    const np = state.path.slice(0, level)
    np[level] = task
    state.path = np
    const nextLevel = level + 1
    if(nextLevel > state.startLevel + 2) state.startLevel = nextLevel - 2
  }
  nextTick(save)
}

function openAddRoot(){ state.modal = { open:true, parent:null } }
function openAddChild(parent){ if(!parent) return; state.modal = { open:true, parent } }

function saveModal(payload){
  if(!payload?.title) return
  if(state.modal.parent){
    const p = state.modal.parent
    p.children = p.children || []
    p.children.push({ id: uid(), title: payload.title, description: payload.description || '', done:false, children:[] })
    propagateDoneUpwards(p)
  } else {
    state.tasks.push({ id: uid(), title: payload.title, description: payload.description || '', done:false, children:[] })
  }
  state.modal.open = false
  nextTick(save)
}

function requestDelete(task, parent){ state.confirm = { open:true, target:task, parent:parent||null } }
function confirmDelete(){
  const { target, parent } = state.confirm
  if(!target) return
  if(parent){
    parent.children = parent.children.filter(t=>t.id!==target.id)
    propagateDoneUpwards(parent)
  } else {
    const idx = state.tasks.findIndex(t=>t.id===target.id)
    if(idx>=0) state.tasks.splice(idx,1)
    else {
      const info = findParent(target)
      if(info){ info.list.splice(info.list.indexOf(target),1); propagateDoneUpwards(info.parent) }
    }
  }
  const pos = state.path.findIndex(t=>t?.id===target.id)
  if(pos>=0) state.path = state.path.slice(0, pos)
  state.confirm = { open:false, target:null, parent:null }
  nextTick(save)
}
</script>

<style scoped>
.app{ min-height: 100vh; margin: 0 auto; padding: 24px 16px; }
.columns{ grid-template-columns: repeat(3, minmax(0, 1fr)); align-items: stretch; }
.col{ min-height: 780px; } /* увеличенная высота колонок */

.list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Подсветка только колонки главных задач */
.col--primary{
  border-color: rgba(110,168,254,.9);
  box-shadow: 0 8px 28px rgba(110,168,254,.12), 0 6px 20px rgba(0,0,0,.35);
}
.col--primary h3{ color: #cfe2ff; }

/* анимация смены уровней */
.shift-enter-from{ opacity:0; transform: translateX(24px); }
.shift-enter-to{ opacity:1; transform: translateX(0); }
.shift-enter-active{ transition: opacity .25s ease, transform .25s ease; }
.shift-leave-from{ opacity:1; transform: translateX(0); }
.shift-leave-to{ opacity:0; transform: translateX(-24px); }
.shift-leave-active{ transition: opacity .2s ease, transform .2s ease; }

.row-anch{ position:relative; }
</style>

<!-- глобальные стили для модалок -->
<style>
.modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:1000}
.modal{width:min(560px,94vw);background:linear-gradient(180deg,#171923,#1e2230);border:1px solid var(--border);border-radius:16px;box-shadow:0 6px 20px rgba(0,0,0,.35);padding:16px}
.modal h4{margin:0 0 10px 0;font-size:16px}
.modal .row{display:flex;flex-direction:column;gap:6px;margin:10px 0}
.modal .actions{display:flex;gap:8px;justify-content:flex-end;margin-top:8px}
</style>
