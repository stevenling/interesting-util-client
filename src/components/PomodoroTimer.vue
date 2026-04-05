<template>
  <div
    class="matrix-root pomodoro-root relative min-h-screen flex flex-col overflow-hidden text-slate-900 dark:text-neutral-100"
  >
    <div
      class="pointer-events-none fixed inset-0 -z-10 matrix-bg-base"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none fixed -top-32 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full matrix-blob matrix-blob-a blur-3xl opacity-90"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none fixed top-[28%] -right-24 h-[28rem] w-[28rem] rounded-full matrix-blob matrix-blob-b blur-3xl opacity-80"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none fixed bottom-0 left-0 h-[22rem] w-[22rem] rounded-full matrix-blob matrix-blob-c blur-3xl opacity-70"
      aria-hidden="true"
    />

    <el-tooltip content="返回小工具集" placement="right">
      <RouterLink
        to="/utilIndex"
        class="pomodoro-back fixed top-5 left-5 z-20 sm:top-7 sm:left-8 inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/[0.08] bg-white/80 text-slate-600 shadow-sm backdrop-blur-md transition-colors duration-200 hover:bg-white/95 hover:text-slate-900 dark:border-white/[0.12] dark:bg-zinc-900/70 dark:text-neutral-300 dark:hover:bg-zinc-800/80 dark:hover:text-white"
        aria-label="返回小工具集"
      >
        <el-icon :size="18"><ArrowLeft /></el-icon>
      </RouterLink>
    </el-tooltip>

    <div class="relative z-10 flex flex-1 flex-col items-center px-6 pt-24 pb-20 sm:pt-28">
      <header class="matrix-hero text-center mb-12 max-w-md sm:mb-14">
        <p
          class="mb-5 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-slate-500 sm:text-xs dark:text-neutral-500"
        >
          Pomodoro
        </p>
        <h1
          class="mx-auto max-w-lg text-[2.125rem] font-semibold leading-[1.08] tracking-[-0.03em] text-slate-900 sm:text-5xl dark:text-white"
        >
          番茄时钟
        </h1>
      </header>

      <div
        class="matrix-tool-panel pomodoro-panel select-none"
        aria-live="polite"
      >
        <div class="pomodoro-ring-stage">
          <svg
            class="pomodoro-ring-svg"
            viewBox="0 0 220 220"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id="pomodoro-ring-grad"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" style="stop-color: var(--pomodoro-ring-a)" />
                <stop offset="100%" style="stop-color: var(--pomodoro-ring-b)" />
              </linearGradient>
            </defs>
            <circle
              class="pomodoro-ring-track"
              cx="110"
              cy="110"
              r="96"
              fill="none"
            />
            <circle
              class="pomodoro-ring-progress"
              cx="110"
              cy="110"
              r="96"
              fill="none"
              stroke="url(#pomodoro-ring-grad)"
              stroke-linecap="round"
              transform="rotate(-90 110 110)"
              :stroke-dasharray="ringCircumference"
              :stroke-dashoffset="ringDashOffset"
            />
          </svg>
          <div class="pomodoro-ring-center tabular-nums">
            <span class="pomodoro-time">{{ formattedTime }}</span>
            <span class="pomodoro-time-label">剩余时间</span>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-center gap-3">
        <button
          v-if="!isRunning"
          type="button"
          class="pomodoro-btn pomodoro-btn-primary"
          :disabled="pausedRemainingMs <= 0"
          @click="onStartOrResume"
        >
          {{ hasStarted && pausedRemainingMs > 0 ? '继续' : '开始' }}
        </button>
        <button
          v-else
          type="button"
          class="pomodoro-btn pomodoro-btn-primary"
          @click="onPause"
        >
          暂停
        </button>
        <button
          type="button"
          class="pomodoro-btn pomodoro-btn-secondary"
          @click="onReset"
        >
          重置
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import '../styles/matrix-page.css'

/** 一个番茄：25 分钟 */
const FULL_MS = 25 * 60 * 1000
/** 与 SVG 中 r=96 一致，用于描边周长 */
const RING_R = 96
const ringCircumference = 2 * Math.PI * RING_R

const isRunning = ref(false)
/** 运行中：到点时刻（ms） */
const endAt = ref(null)
/** 未运行或暂停时：剩余毫秒；初始为一整番茄 */
const pausedRemainingMs = ref(FULL_MS)
/** 是否曾经点过开始（用于「继续」文案） */
const hasStarted = ref(false)

/** 驱动 computed 周期性依赖 Date.now() */
const tick = ref(0)
let intervalId = null

function startTicker() {
  if (intervalId != null) return
  intervalId = window.setInterval(() => {
    tick.value += 1
    if (!isRunning.value || endAt.value == null) return
    if (Date.now() >= endAt.value) {
      isRunning.value = false
      endAt.value = null
      pausedRemainingMs.value = 0
      window.clearInterval(intervalId)
      intervalId = null
      ElMessage.success('本轮番茄已完成')
    }
  }, 250)
}

function stopTicker() {
  if (intervalId != null) {
    window.clearInterval(intervalId)
    intervalId = null
  }
}

const displayMs = computed(() => {
  tick.value
  if (isRunning.value && endAt.value != null) {
    return Math.max(0, endAt.value - Date.now())
  }
  return pausedRemainingMs.value
})

const formattedTime = computed(() => {
  const sec = Math.ceil(displayMs.value / 1000)
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

/** 圆环表示「剩余比例」，随 displayMs 减小而缩短 */
const ringDashOffset = computed(() => {
  const p = Math.min(1, Math.max(0, displayMs.value / FULL_MS))
  return ringCircumference * (1 - p)
})

function onStartOrResume() {
  hasStarted.value = true
  isRunning.value = true
  endAt.value = Date.now() + pausedRemainingMs.value
  startTicker()
}

function onPause() {
  if (!isRunning.value || endAt.value == null) return
  pausedRemainingMs.value = Math.max(0, endAt.value - Date.now())
  isRunning.value = false
  endAt.value = null
}

function onReset() {
  isRunning.value = false
  endAt.value = null
  pausedRemainingMs.value = FULL_MS
  hasStarted.value = false
  stopTicker()
}

watch(isRunning, (run) => {
  if (!run && intervalId != null && pausedRemainingMs.value > 0) {
    stopTicker()
  }
})

onUnmounted(() => {
  stopTicker()
})
</script>

<style scoped>
/* 与 matrix-page 主站一致的中性色环（无蓝） */
.pomodoro-root {
  --pomodoro-ring-a: rgb(51 65 85);
  --pomodoro-ring-b: rgb(100 116 139);
}

@media (prefers-color-scheme: dark) {
  .pomodoro-root {
    --pomodoro-ring-a: rgb(186 198 212);
    --pomodoro-ring-b: rgb(148 163 184);
  }
}

/* 在 matrix-tool-panel 基础上略放大圆角与内边距，容纳圆环 */
.matrix-root .pomodoro-panel {
  width: min(19.5rem, 88vw);
  margin-bottom: 2.75rem;
  padding: 2rem 1.5rem 1.75rem;
  border-radius: 1.375rem;
}

@media (min-width: 640px) {
  .matrix-root .pomodoro-panel {
    width: min(21rem, 90vw);
    padding: 2.35rem 1.75rem 2rem;
    border-radius: 1.5rem;
  }
}

.pomodoro-ring-stage {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  max-width: 15.5rem;
  margin: 0 auto;
}

@media (min-width: 640px) {
  .pomodoro-ring-stage {
    max-width: 17rem;
  }
}

.pomodoro-ring-svg {
  display: block;
  width: 100%;
  height: auto;
}

.pomodoro-ring-track {
  stroke: rgb(15 23 42 / 0.08);
  stroke-width: 7;
}

@media (prefers-color-scheme: dark) {
  .pomodoro-ring-track {
    stroke: rgb(255 255 255 / 0.12);
  }
}

.pomodoro-ring-progress {
  stroke-width: 7;
  transition: stroke-dashoffset 0.35s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.pomodoro-ring-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 0.125rem;
}

.pomodoro-time {
  font-size: clamp(2.75rem, 11vw, 4.125rem);
  font-weight: 300;
  letter-spacing: -0.04em;
  line-height: 1;
  color: rgb(15 23 42);
  font-variant-numeric: tabular-nums;
}

@media (prefers-color-scheme: dark) {
  .pomodoro-time {
    color: rgb(245 245 247);
  }
}

.pomodoro-time-label {
  margin-top: 0.625rem;
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: rgb(100 116 139);
}

@media (prefers-color-scheme: dark) {
  .pomodoro-time-label {
    color: rgb(163 163 170);
  }
}

.pomodoro-btn {
  min-width: 7.5rem;
  padding: 0.78rem 1.5rem;
  font-family: inherit;
  font-size: 1.0625rem;
  font-weight: 500;
  letter-spacing: -0.02em;
  line-height: 1.2;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    opacity 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;
}

.pomodoro-btn:active:not(:disabled) {
  transform: scale(0.97);
}

.pomodoro-btn:disabled {
  opacity: 0.38;
  cursor: not-allowed;
}

.pomodoro-btn-primary {
  color: rgb(248 250 252);
  background: rgb(30 41 59);
  border: 1px solid rgb(15 23 42 / 0.2);
  box-shadow:
    0 1px 0 rgb(255 255 255 / 0.12) inset,
    0 4px 14px rgb(15 23 42 / 0.2);
}

.pomodoro-btn-primary:hover:not(:disabled) {
  background: rgb(15 23 42);
  box-shadow:
    0 1px 0 rgb(255 255 255 / 0.14) inset,
    0 6px 18px rgb(15 23 42 / 0.28);
}

@media (prefers-color-scheme: dark) {
  .pomodoro-btn-primary {
    color: rgb(24 24 27);
    background: rgb(228 228 231);
    border-color: rgb(255 255 255 / 0.14);
    box-shadow:
      0 1px 0 rgb(255 255 255 / 0.55) inset,
      0 4px 16px rgb(0 0 0 / 0.35);
  }

  .pomodoro-btn-primary:hover:not(:disabled) {
    background: rgb(244 244 245);
  }
}

.pomodoro-btn-secondary {
  color: rgb(15 23 42);
  background: rgb(255 255 255 / 0.72);
  border: 1px solid rgb(0 0 0 / 0.06);
  box-shadow:
    0 0 0 1px rgb(255 255 255 / 0.8) inset,
    0 1px 2px rgb(0 0 0 / 0.04);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
}

.pomodoro-btn-secondary:hover {
  background: rgb(255 255 255 / 0.88);
  border-color: rgb(0 0 0 / 0.08);
}

@media (prefers-color-scheme: dark) {
  .pomodoro-btn-secondary {
    color: rgb(245 245 247);
    background: rgb(28 28 30 / 0.65);
    border-color: rgb(255 255 255 / 0.1);
    box-shadow:
      0 0 0 1px rgb(255 255 255 / 0.04) inset,
      0 1px 2px rgb(0 0 0 / 0.35);
  }

  .pomodoro-btn-secondary:hover {
    background: rgb(44 44 46 / 0.75);
    border-color: rgb(255 255 255 / 0.12);
  }
}
</style>
