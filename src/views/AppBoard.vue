<template>
  <div class="board-wrap">
    <!-- top bar -->
    <div class="board-top">
      <div class="spacer"></div>
      <div class="top-actions">
        <!-- кнопка "+ Добавить" -->
        <button class="add-btn" @click="openAddRoot">＋ Добавить</button>
        <div class="nav_arrows" v-if="canNavigate">
          <button
            class="icon-btn"
            :disabled="state.startLevel === 0"
            @click="shiftWindow(-1)"
            aria-label="Влево"
          >
            ←
          </button>
          <button
            class="icon-btn"
            :disabled="!canGoRight"
            @click="shiftWindow(+1)"
            aria-label="Вправо"
          >
            →
          </button>
        </div>
      </div>
    </div>

    <!-- viewport + slider -->
    <div class="viewport" ref="viewportRef">
      <!-- SVG-слой для связей -->
      <svg
        class="links-svg"
        ref="svgRef"
        :style="{ transform:`translate3d(${shift}px,0,0)` }"
      ></svg>

      <div class="slider" :style="{ transform:`translate3d(${shift}px,0,0)` }">
        <!-- COL 0 -->
        <div class="col" :class="{ root: windowLevels[0] === 0 }">
          <h3>{{ colTitles[0] }}</h3>
          <div class="list" v-if="columns[0].length">
            <TaskRow
              v-for="t in columns[0]"
              :key="t.id"
              :task="t"
              :level="windowLevels[0]"
              :selected="isSelected(t,0)"
              @toggle-done="toggleDone(t)"
              @toggle-expand="expandAt(t,0)"
              @delete="requestDelete(t, parentFor(0))"
              @request-add-child="openAddChild(t)"
            />
          </div>
          <div v-else class="empty">Нет задач</div>
        </div>

        <!-- COL 1 -->
        <div class="col">
          <h3>{{ colTitles[1] }}</h3>
          <div class="list" v-if="Array.isArray(columns[1])">
            <template v-if="columns[1].length">
              <TaskRow
                v-for="t in columns[1]"
                :key="t.id"
                :task="t"
                :level="windowLevels[1]"
                :selected="isSelected(t,1)"
                @toggle-done="toggleDone(t)"
                @toggle-expand="expandAt(t,1)"
                @delete="requestDelete(t, parentFor(1))"
                @request-add-child="openAddChild(t)"
              />
            </template>
            <div v-else class="empty">Нет подзадач</div>
          </div>
          <div v-else class="empty">Пока ничего не выбрано слева</div>
        </div>

        <!-- COL 2 -->
        <div class="col">
          <h3>{{ colTitles[2] }}</h3>
          <div class="list" v-if="Array.isArray(columns[2])">
            <template v-if="columns[2].length">
              <TaskRow
                v-for="t in columns[2]"
                :key="t.id"
                :task="t"
                :level="windowLevels[2]"
                :selected="isSelected(t,2)"
                @toggle-done="toggleDone(t)"
                @toggle-expand="expandAt(t,2)"
                @delete="requestDelete(t, parentFor(2))"
                @request-add-child="openAddChild(t)"
              />
            </template>
            <div v-else class="empty">Нет подзадач</div>
          </div>
          <div v-else class="empty">Пока ничего не выбрано слева</div>
        </div>
      </div>
    </div>

    <!-- modals -->
    <AddTaskModal
      :open="state.modal.open"
      :parent="state.modal.parent"
      @close="state.modal.open = false"
      @save="saveModal"
    />
    <ConfirmModal
      :open="state.confirm.open"
      :target="state.confirm.target"
      @close="state.confirm.open = false"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import {
  reactive,
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch
} from 'vue'
import TaskRow from '../components/TaskRow.vue'
import AddTaskModal from '../components/AddTaskModal.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import { supabase } from '../lib/supabaseClient'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()

const state = reactive({
  tasks: [],        // корневые задачи (дерево)
  path: [],         // путь выбранных задач
  startLevel: 0,    // первый видимый уровень
  modal: { open: false, parent: null },
  confirm: { open: false, target: null, parent: null }
})

// ширина вьюпорта, чтобы считать количество видимых колонок
const viewportWidth = ref(
  typeof window !== 'undefined' ? window.innerWidth : 1200
)

const viewportRef = ref(null)
const svgRef = ref(null)
let themeObserver = null

function updateViewport () {
  if (typeof window === 'undefined') return
  viewportWidth.value = window.innerWidth
  nextTick(drawLinks)
}

/* ===== ЗАГРУЗКА ИЗ SUPABASE (таблица tasks) ===== */

async function loadTasksFromSupabase () {
  const userId = auth.user?.id
  if (!userId) {
    state.tasks = []
    state.path = []
    state.startLevel = 0
    return
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('level', { ascending: true })
    .order('ordinal', { ascending: true })

  if (error) {
    console.error('loadTasks error:', error)
    state.tasks = []
    state.path = []
    state.startLevel = 0
    return
  }

  const rows = data || []
  state.tasks = buildTreeFromRows(rows)
  state.path = []
  state.startLevel = 0
}

function buildTreeFromRows (rows) {
  const byId = new Map()
  rows.forEach(r => {
    byId.set(r.id, {
      id: r.id,
      title: r.title,
      description: r.description || '',
      done: !!r.done,
      level: r.level ?? 0,
      children: []
    })
  })

  const roots = []

  rows.forEach(r => {
    const node = byId.get(r.id)
    if (!node) return
    if (r.parent_id) {
      const parent = byId.get(r.parent_id)
      if (parent) {
        parent.children.push(node)
      }
    } else {
      roots.push(node)
    }
  })

  return roots
}

onMounted(async () => {
  updateViewport()

  if (typeof window !== 'undefined') {
    window.addEventListener('resize', updateViewport)
    window.addEventListener('scroll', drawLinks)

    // следим за сменой темы (data-theme), чтобы сразу перекрашивать линии
    themeObserver = new MutationObserver(muts => {
      for (const m of muts) {
        if (m.attributeName === 'data-theme') {
          drawLinks()
          break
        }
      }
    })
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    })
  }

  await loadTasksFromSupabase()
  nextTick(drawLinks)
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', updateViewport)
    window.removeEventListener('scroll', drawLinks)
  }
  if (themeObserver) {
    themeObserver.disconnect()
    themeObserver = null
  }
})

/* ===== windowing ===== */
const windowLevels = computed(() => [
  state.startLevel,
  state.startLevel + 1,
  state.startLevel + 2
])

const deepestLevel = computed(() => state.path.length)

const visibleColumns = computed(() => {
  const w = viewportWidth.value
  if (w <= 600) return 1
  if (w <= 900) return 2
  return 3
})

const canNavigate = computed(() => {
  return deepestLevel.value >= visibleColumns.value || state.startLevel > 0
})

const canGoRight = computed(() => {
  return (
    state.startLevel + (visibleColumns.value - 1) < deepestLevel.value
  )
})

const levelsArrays = computed(() => {
  const L = []
  L[0] = state.tasks || []
  for (let i = 0; i < state.path.length; i++) {
    const p = state.path[i]
    L[i + 1] = Array.isArray(p?.children) ? p.children : []
  }
  return L
})

const columns = computed(() => {
  const [a, b, c] = windowLevels.value
  const L = levelsArrays.value
  return [L[a] ?? [], L[b] ?? [], L[c] ?? []]
})

const colTitles = computed(() => {
  const [a, b, c] = windowLevels.value
  const title = lvl =>
    lvl === 0 ? 'Главные задачи' : `#${lvl} — Дочерние`
  return [title(a), title(b), title(c)]
})

/* ===== helpers ===== */
function isSelected (task, colIndex) {
  const lvl = windowLevels.value[colIndex]
  return state.path[lvl]?.id === task.id
}

function expandAt (task, colIndex) {
  const lvl = windowLevels.value[colIndex]

  if (state.path[lvl]?.id === task.id) {
    // свернуть уровень
    state.path = state.path.slice(0, lvl)
    if (state.startLevel > state.path.length) {
      state.startLevel = Math.max(0, state.path.length - 2)
    }
  } else {
    // выбрать задачу на уровне
    const np = state.path.slice(0, lvl)
    np[lvl] = task
    state.path = np

    // авто-смещение окна, если кликаем по "правому" видимому столбцу
    const nextLevel = lvl + 1
    const visCount = visibleColumns.value
    const lastIdx = visCount - 1
    const rightmostLevel = state.startLevel + lastIdx

    if (colIndex === lastIdx && nextLevel > rightmostLevel) {
      shiftWindow(+1)
    }
  }
  nextTick(drawLinks)
}

function parentFor (colIndex) {
  const lvl = windowLevels.value[colIndex]
  return lvl > 0 ? state.path[lvl - 1] || null : null
}

/* ===== поиск родителя в локальном дереве ===== */
function findParent (target, list = state.tasks) {
  for (const t of list) {
    if (t.children?.includes(target)) {
      return { parent: t, list: t.children }
    }
    const deep = findParent(target, t.children || [])
    if (deep) return deep
  }
  return null
}

/* ===== Supabase: обновление done ===== */
async function updateTaskDoneInDb (task) {
  try {
    await supabase
      .from('tasks')
      .update({ done: task.done })
      .eq('id', task.id)
  } catch (e) {
    console.error('updateTaskDoneInDb error', e)
  }
}

/* ===== done propagation ===== */
async function propagateDoneUp (task) {
  const info = findParent(task)
  if (!info) return
  const p = info.parent
  if (!p) return

  p.done =
    (p.children || []).length > 0 &&
    p.children.every(ch => ch.done)

  await updateTaskDoneInDb(p)
  await propagateDoneUp(p)
}

async function toggleDone (task) {
  task.done = !task.done

  if (!task.done) {
    let info = findParent(task)
    while (info && info.parent) {
      info.parent.done = false
      await updateTaskDoneInDb(info.parent)
      info = findParent(info.parent)
    }
  } else {
    await propagateDoneUp(task)
  }

  await updateTaskDoneInDb(task)
  nextTick(drawLinks)
}

/* ===== delete & modals ===== */
function requestDelete (task, parent) {
  state.confirm = { open: true, target: task, parent: parent || null }
}

async function confirmDelete () {
  const { target, parent } = state.confirm
  if (!target) return

  if (parent) {
    parent.children = parent.children.filter(t => t.id !== target.id)
    await propagateDoneUp(parent)
  } else {
    const idx = state.tasks.findIndex(t => t.id === target.id)
    if (idx >= 0) state.tasks.splice(idx, 1)
    else {
      const info = findParent(target)
      if (info) {
        info.list.splice(info.list.indexOf(target), 1)
        if (info.parent) await propagateDoneUp(info.parent)
      }
    }
  }

  try {
    await supabase.from('tasks').delete().eq('id', target.id)
  } catch (e) {
    console.error('delete task error', e)
  }

  const pos = state.path.findIndex(t => t?.id === target.id)
  if (pos >= 0) state.path = state.path.slice(0, pos)

  state.confirm = { open: false, target: null, parent: null }
  nextTick(drawLinks)
}

function openAddRoot () {
  state.modal = { open: true, parent: null }
}
function openAddChild (parent) {
  if (!parent) return
  state.modal = { open: true, parent }
}

async function saveModal (payload) {
  if (!payload?.title) return
  const userId = auth.user?.id
  if (!userId) {
    console.warn('saveModal: no user')
    return
  }

  const parent = state.modal.parent
  let parentId = null
  let level = 0
  let ordinal = 0

  if (parent) {
    parentId = parent.id
    level = (parent.level ?? 0) + 1
    ordinal = parent.children ? parent.children.length : 0
  } else {
    level = 0
    ordinal = state.tasks.length
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      parent_id: parentId,
      title: payload.title,
      description: payload.description || '',
      done: false,
      level,
      ordinal
    })
    .select()
    .single()

  if (error) {
    console.error('insert task error', error)
    return
  }

  const node = {
    id: data.id,
    title: data.title,
    description: data.description || '',
    done: data.done,
    level: data.level,
    children: []
  }

  if (parent) {
    parent.children = parent.children || []
    parent.children.push(node)
    await propagateDoneUp(parent)
  } else {
    state.tasks.push(node)
  }

  state.modal.open = false
  nextTick(drawLinks)
}

/* ===== silky slide (плавный) ===== */
const shift = ref(0)
const SLIDE_OFFSET = 40      // на сколько «уезжаем» при свайпе
const SLIDE_DURATION = 420   // должно совпадать с transition в css

function nudge (dir) {
  const delta = dir > 0 ? -SLIDE_OFFSET : SLIDE_OFFSET
  shift.value = delta
  requestAnimationFrame(() => {
    shift.value = 0
  })

  setTimeout(() => {
    drawLinks()
  }, SLIDE_DURATION + 40)
}

function shiftWindow (delta) {
  const prev = state.startLevel
  const next = Math.max(0, prev + delta)
  if (next === prev) return
  state.startLevel = next
  nudge(delta)
}

/* ===== отрисовка линий ===== */
function drawLinks () {
  if (visibleColumns.value < 2) {
    const svg = svgRef.value
    if (svg) svg.innerHTML = ''
    return
  }

  const svg = svgRef.value
  const viewport = viewportRef.value
  if (!svg || !viewport) return

  const vpRect = viewport.getBoundingClientRect()
  const width = vpRect.width
  const height = vpRect.height || 1

  svg.setAttribute('width', width)
  svg.setAttribute('height', height)
  svg.innerHTML = ''

  const theme = document.documentElement.getAttribute('data-theme') || 'light'
  const strokeColor = theme === 'dark' ? '#6EA8FE' : '#2FAE76'
  const strokeWidth = theme === 'dark' ? 2.6 : 2.4
  const CURVE_OFFSET = 28

  const cols = viewport.querySelectorAll('.col')
  if (!cols.length) return

  cols.forEach((col, idx) => {
    const next = cols[idx + 1]
    if (!next) return

    const selected = col.querySelector('.task.selected')
    const children = next.querySelectorAll('.task')
    if (!selected || !children.length) return

    const rectA = selected.getBoundingClientRect()
    if (!rectA.width || !rectA.height) return

    children.forEach(child => {
      const rectB = child.getBoundingClientRect()
      if (!rectB.width || !rectB.height) return

      // точки связи — ровно на границах карточек
      const x1 = rectA.right - vpRect.left
      const y1 = rectA.top - vpRect.top + rectA.height / 2

      const x2 = rectB.left - vpRect.left
      const y2 = rectB.top - vpRect.top + rectB.height / 2

      const cx1 = x1 + CURVE_OFFSET
      const cx2 = x2 - CURVE_OFFSET

      const path = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'path'
      )
      path.setAttribute(
        'd',
        `M${x1},${y1} C${cx1},${y1} ${cx2},${y2} ${x2},${y2}`
      )
      path.setAttribute('class', 'link-line')
      path.setAttribute('stroke', strokeColor)
      path.setAttribute('stroke-width', String(strokeWidth))
      path.setAttribute('fill', 'none')
      path.setAttribute('stroke-linecap', 'round')
      path.setAttribute('stroke-linejoin', 'round')
      path.setAttribute('opacity', '0.8')

      svg.appendChild(path)
    })
  })
}

// перерисовываем связи при изменениях данных/разметки
watch([columns, state.path, viewportWidth], () => {
  nextTick(drawLinks)
})
</script>

<style scoped>
.board-wrap {
  max-width: 1100px;
  margin: 12px auto 18px;
  padding: 0 16px;
}

/* top bar */
.board-top {
  display: flex;
  align-items: center;
  margin: 6px 0 10px;
}
.board-top .spacer {
  flex: 1;
}
.top-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* навигация и стрелки */
.nav_arrows {
  display: flex;
  gap: 8px;
}

.icon-btn {
  border: 1px solid var(--border);
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: none;
  box-shadow: none;
  color: var(--text);
  font-weight: 800;
  font-size: 16px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.icon-btn:hover {
  background: color-mix(in oklab, var(--brand) 10%, transparent);
}

/* кнопка "+ Добавить" */
.add-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 14px;
  font-size: 13px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  border: none;
  background: #3a7bff;
  color: #fff;
  transition:
    background 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.05s ease;
}
.add-btn:hover {
  background: #4c8cff;
  box-shadow: 0 0 10px rgba(58, 123, 255, 0.3);
}
.add-btn:active {
  transform: translateY(1px);
}
:root[data-theme='light'] .add-btn {
  background: color-mix(in oklab, var(--brand) 75%, white 10%);
  color: #fff;
}
:root[data-theme='light'] .add-btn:hover {
  background: color-mix(in oklab, var(--brand) 90%, white 0%);
  box-shadow: 0 0 10px color-mix(in oklab, var(--brand) 40%, transparent);
}

/* viewport + slider — базово 3 столбца (десктоп) */
.viewport {
  position: relative;
  overflow: hidden;
}
.slider {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  align-items: start;
  transition: transform 0.42s cubic-bezier(0.22, 0.61, 0.36, 1);
  will-change: transform;
}

/* SVG-слой со связями */
.links-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
  z-index: 3;
}

/* columns */
.col {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 12px;
  min-height: clamp(280px, 44vh, 520px);
  display: flex;
  flex-direction: column;
  transform: translateZ(0);
  min-width: 0;
}

/* выделяем только колонку с главными задачами, когда она видима */
.col.root {
  border-color: color-mix(in oklab, var(--brand) 55%, var(--border));
}

h3 {
  margin: 4px 2px 6px;
  font-size: 14px;
  font-weight: 700;
  color: var(--muted);
}

.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 6px;
  min-width: 0;
}
.empty {
  opacity: 0.75;
  border: 1px dashed var(--border);
  border-radius: 12px;
  padding: 14px;
  text-align: center;
  color: var(--muted);
}

/* базовые кнопки (если где-то ещё используются) */
.btn {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 8px 12px;
  background: var(--btn-bg);
  color: var(--btn-fg);
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
}
.btn.ghost {
  background: transparent;
  color: var(--text);
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ===== до 600 px — только ОДИН столбец ===== */
@media (max-width: 600px) {
  .board-wrap {
    padding: 0 10px;
    margin: 8px auto 14px;
  }

  .board-top {
    margin: 4px 0 8px;
  }

  .slider {
    display: block; /* вместо grid */
  }

  .col {
    width: 100%;
    max-width: 100%;
    min-height: auto;
    border-radius: 14px;
    padding: 10px;
  }

  /* прячем второй и третий столбец — остаётся только первый (columns[0]) */
  .col:nth-of-type(2),
  .col:nth-of-type(3) {
    display: none;
  }

  .top-actions {
    gap: 8px;
  }

  .add-btn {
    padding: 5px 12px;
    font-size: 12px;
    height: 30px;
  }

  .icon-btn {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
}

/* ===== 600–900 px — показываем ДВА столбца ===== */
@media (min-width: 601px) and (max-width: 900px) {
  .board-wrap {
    padding: 0 14px;
    margin: 10px auto 16px;
  }

  .slider {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .col {
    min-height: clamp(260px, 40vh, 480px);
  }

  /* прячем третий столбец */
  .col:nth-of-type(3) {
    display: none;
  }
}
</style>

<!-- глобальные стили только для линий, чтобы scoped-ограничение не мешало -->
<style>
.link-line {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
