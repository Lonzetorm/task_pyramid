<template>
  <section class="wrap">
    <div class="hero">
      <div class="left">
        <h1>Строй свои цели как пирамиду —<br> от вершины к шагам</h1>
        <p class="lead">
          TaskPyramid помогает превращать большие цели в понятные шаги.
          Визуально, просто и с фокусом на приоритеты.
        </p>
        <div class="cta">
          <router-link
            class="btn btn-primary"
            :to="{ path: '/', query: { auth: 'register' } }"
          >
            Начать бесплатно
          </router-link>
        </div>
      </div>

      <div class="right">
        <div class="pyramid">
          <svg
            viewBox="0 0 240 200"
            width="100%"
            height="100%"
            aria-hidden="true"
            class="pyramid-svg"
          >
            <!-- Тело пирамиды -->
            <polygon
              class="pyr-body"
              points="120,10 220,170 20,170"
            />

            <!-- Линии уровней: ~1/3 и ~2/3 высоты -->
            <!-- верхний уровень -->
            <line
              class="pyr-level"
              x1="86.7" y1="63.3"
              x2="153.3" y2="63.3"
            />
            <!-- нижний уровень -->
            <line
              class="pyr-level"
              x1="53.3" y1="116.7"
              x2="186.7" y2="116.7"
            />
          </svg>
        </div>
      </div>
    </div>

    <section id="how" class="how">
      <h2>Как это работает</h2>
      <div class="grid3">
        <div class="card">
          <div class="ico">1</div>
          <h3>Вершина</h3>
          <p>Задай цель</p>
        </div>
        <div class="card">
          <div class="ico">2</div>
          <h3>Уровни</h3>
          <p>Разбей на подцели</p>
        </div>
        <div class="card">
          <div class="ico">3</div>
          <h3>Основание</h3>
          <p>Распредели шаги</p>
        </div>
      </div>
    </section>

    <section id="benefits" class="benefits">
      <h2>Преимущества</h2>
      <div class="grid3 small">
        <div>Многоуровневая структура задач</div>
        <div>Просто и визуально</div>
        <div>Фокус на цели, а не списках</div>
        <div>Гибкость — от мечты до действия</div>
        <div>Совместная работа</div>
        <div>Экспорт / импорт</div>
      </div>
    </section>

    <section class="ctaFoot">
      <h2>Пора построить свою пирамиду</h2>
      <router-link
        class="btn btn-primary"
        :to="{ path: '/', query: { auth: 'register' } }"
      >
        Начать
      </router-link>
    </section>
  </section>
</template>

<script setup></script>

<style scoped>
.wrap {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 16px;
}

.hero {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 24px;
  align-items: center;
  margin: 16px 0 28px;
}

.left h1 {
  font-size: 40px;
  line-height: 1.1;
  margin: 0 0 12px;
}

.lead {
  color: var(--muted);
  max-width: 520px;
}

.cta {
  margin-top: 16px;
}

.right .pyramid {
  max-width: 420px;
  margin: 0 auto;
}

.pyramid-svg {
  display: block;
  width: 100%;
  height: auto;
}

/* светлая тема: зелёная пирамида с тёмно-зелёной обводкой */
.pyramid-svg .pyr-body {
  fill: #c9f6df;
  stroke: #158755;
  stroke-width: 3;
}

/* линии уровней такой же толщины, как обводка */
.pyramid-svg .pyr-level {
  stroke: #158755;
  stroke-width: 3;
  stroke-linecap: round;
}

/* тёмная тема: тело темнее, линии и контур синие */
:root[data-theme="dark"] .pyramid-svg .pyr-body {
  fill: #0f172a;
  stroke: #6EA8FE;
}

:root[data-theme="dark"] .pyramid-svg .pyr-level {
  stroke: #6EA8FE;
}

.how,
.benefits {
  margin: 70px 0;
}

.how h2,
.benefits h2,
.ctaFoot h2 {
  text-align: center;
  margin: 0 0 18px;
}

.grid3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px;
  text-align: center;
}

.card .ico {
  font-size: 26px;
  font-weight: 700;
  color: var(--brand);
}

.benefits .grid3.small > div {
  background: var(--surface);
  border: 1px dashed var(--border);
  border-radius: 12px;
  padding: 12px;
  text-align: center;
}

.ctaFoot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin: 80px 0 20px;
}

.btn {
  border: none;
  border-radius: 10px;
  padding: 12px 16px;
  background: var(--btn-bg);
  color: var(--btn-fg);
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
}

.btn-primary {
  background: var(--brand);
  color: #fff;
}

/* ---------- АДАПТИВ ---------- */

/* планшеты и ниже */
@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .left h1 {
    font-size: 32px;
  }

  .lead {
    margin: 0 auto;
  }

  .cta {
    display: flex;
    justify-content: center;
  }

  .right .pyramid {
    max-width: 320px;
    margin-top: 20px;
  }

  .grid3 {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* мобильные телефоны */
@media (max-width: 600px) {
  .wrap {
    padding: 20px 12px;
  }

  .hero {
    margin: 10px 0 24px;
    gap: 18px;
  }

  .left h1 {
    font-size: 26px;
    line-height: 1.15;
  }

  .lead {
    font-size: 14px;
  }

  .btn {
    padding: 10px 14px;
    font-size: 13px;
  }

  .right .pyramid {
    max-width: 260px;
  }

  .how,
  .benefits {
    margin: 48px 0;
  }

  .grid3 {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .card {
    padding: 12px;
  }

  .benefits .grid3.small > div {
    padding: 10px;
  }

  .ctaFoot {
    margin: 56px 0 20px;
  }
}
</style>
