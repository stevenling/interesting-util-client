<template>
  <div
    class="matrix-root jztk-home-page relative flex min-h-screen flex-col overflow-hidden text-slate-900 dark:text-neutral-100"
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
        class="jztk-back-fab fixed left-5 top-5 z-[2000] sm:left-8 sm:top-7"
        aria-label="返回小工具集"
      >
        <el-icon :size="18"><ArrowLeft /></el-icon>
      </RouterLink>
    </el-tooltip>

    <div class="main-container relative z-10 flex-1">
      <div class="jztk-home-panel matrix-tool-panel mx-auto max-w-[800px]">
        <div class="hero-section matrix-tool-panel-header">
          <div class="title">驾考刷题王</div>
          <div class="subtitle">选择考试科目后开始练习</div>
        </div>

        <div class="content-container">
        <div class="subject-grid">
          <el-card
            class="subject-card"
            shadow="hover"
            @click="goPractice('1')"
          >
            <div class="subject-icon">1</div>
            <h2 class="subject-title">科目一</h2>
            <p class="subject-desc">
              道路交通安全法律、法规和规章，交通信号，安全行车、文明驾驶等
            </p>
            <el-button round class="subject-btn" @click.stop="goPractice('1')">
              开始刷题
            </el-button>
            <div class="subject-actions" @click.stop>
              <el-button link class="jztk-sub-link" @click="goWrongPractice('1')">
                练习错题
              </el-button>
              <span class="action-dot" aria-hidden="true" />
              <el-button link class="jztk-sub-link" @click="goFavorites('1')">
                查看收藏
              </el-button>
            </div>
          </el-card>

          <el-card
            class="subject-card"
            shadow="hover"
            @click="goPractice('4')"
          >
            <div class="subject-icon">4</div>
            <h2 class="subject-title">科目四</h2>
            <p class="subject-desc">
              安全文明驾驶常识，复杂条件下的安全驾驶知识、紧急情况处置等
            </p>
            <el-button round class="subject-btn" @click.stop="goPractice('4')">
              开始刷题
            </el-button>
            <div class="subject-actions" @click.stop>
              <el-button link class="jztk-sub-link" @click="goWrongPractice('4')">
                练习错题
              </el-button>
              <span class="action-dot" aria-hidden="true" />
              <el-button link class="jztk-sub-link" @click="goFavorites('4')">
                查看收藏
              </el-button>
            </div>
          </el-card>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter, RouterLink } from "vue-router";
import { ArrowLeft } from "@element-plus/icons-vue";
import "../styles/matrix-page.css";

const router = useRouter();

function goPractice(subject) {
  router.push({
    path: "/jztk/practice",
    query: { subject },
  });
}

/** 错题练习：与刷题页 mode=wrong 一致 */
function goWrongPractice(subject) {
  router.push({
    path: "/jztk/practice",
    query: { subject, mode: "wrong" },
  });
}

/** 打开刷题页并自动展开侧栏「收藏」Tab */
function goFavorites(subject) {
  router.push({
    path: "/jztk/practice",
    query: { subject, drawer: "fav" },
  });
}
</script>

<style scoped>
.jztk-home-page {
  --jztk-line: rgb(0 0 0 / 0.08);
}

@media (prefers-color-scheme: dark) {
  .jztk-home-page {
    --jztk-line: rgb(255 255 255 / 0.1);
  }
}

.jztk-back-fab {
  display: flex;
  width: 2.5rem;
  height: 2.5rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  border: 1px solid rgb(0 0 0 / 0.08);
  background: rgb(255 255 255 / 0.8);
  color: rgb(71 85 105);
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
  text-decoration: none;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.15s ease,
    background 0.2s ease;
}

.jztk-back-fab:hover {
  border-color: rgb(0 0 0 / 0.12);
  background: rgb(255 255 255 / 0.95);
  color: rgb(15 23 42);
}

.jztk-back-fab:active {
  transform: scale(0.96);
}

@media (prefers-color-scheme: dark) {
  .jztk-back-fab {
    border-color: rgb(255 255 255 / 0.12);
    background: rgb(24 24 27 / 0.72);
    color: rgb(212 212 216);
    box-shadow: 0 1px 2px rgb(0 0 0 / 0.35);
  }

  .jztk-back-fab:hover {
    border-color: rgb(255 255 255 / 0.18);
    background: rgb(39 39 42 / 0.85);
    color: rgb(250 250 250);
  }
}

.main-container {
  padding: 3.5rem 0 3rem;
}

.hero-section {
  text-align: center;
  padding: 1.75rem 1rem 1.25rem;
  color: rgb(15 23 42);
}

@media (prefers-color-scheme: dark) {
  .hero-section {
    color: rgb(245 245 247);
  }
}

.title {
  font-size: 1.85rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  letter-spacing: 0.02em;
  color: inherit;
  text-shadow: none;
}

.subtitle {
  margin: 0;
  font-size: 0.9rem;
  color: rgb(100 116 139);
  font-weight: 400;
  text-shadow: none;
}

@media (prefers-color-scheme: dark) {
  .subtitle {
    color: rgb(163 163 170);
  }
}

.content-container {
  padding: 1rem 1rem 1.5rem;
}

.subject-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

@media (max-width: 600px) {
  .subject-grid {
    grid-template-columns: 1fr;
  }
}

.subject-card {
  cursor: pointer;
  border-radius: 1.125rem;
  text-align: center;
  padding: 4px 4px 18px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
  border: 1px solid rgb(0 0 0 / 0.06);
  background: rgb(255 255 255 / 0.55);
  --el-card-border-color: transparent;
  box-shadow:
    0 0 0 1px rgb(255 255 255 / 0.65) inset,
    0 1px 2px rgb(0 0 0 / 0.04);
  backdrop-filter: saturate(180%) blur(16px);
  -webkit-backdrop-filter: saturate(180%) blur(16px);
}

.subject-card:hover {
  transform: translateY(-2px);
  border-color: rgb(0 0 0 / 0.1);
  box-shadow:
    0 0 0 1px rgb(255 255 255 / 0.85) inset,
    0 4px 12px rgb(0 0 0 / 0.06),
    0 16px 40px rgb(15 23 42 / 0.08);
}

@media (prefers-color-scheme: dark) {
  .subject-card {
    border-color: rgb(255 255 255 / 0.1);
    background: rgb(28 28 30 / 0.5);
    box-shadow:
      0 0 0 1px rgb(255 255 255 / 0.05) inset,
      0 1px 2px rgb(0 0 0 / 0.35);
  }

  .subject-card:hover {
    border-color: rgb(255 255 255 / 0.14);
    box-shadow:
      0 0 0 1px rgb(255 255 255 / 0.08) inset,
      0 8px 24px rgb(0 0 0 / 0.45);
  }
}

.subject-icon {
  width: 52px;
  height: 52px;
  margin: 14px auto 14px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--site-accent);
  background: color-mix(in srgb, var(--site-accent) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--site-accent) 28%, transparent);
}

.subject-title {
  margin: 0 0 10px;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--site-heading);
}

.subject-desc {
  margin: 0 0 18px;
  font-size: 0.86rem;
  line-height: 1.65;
  color: var(--site-muted);
  padding: 0 14px;
  min-height: 4.5em;
}

.subject-card :deep(.subject-btn.el-button) {
  padding-left: 28px;
  padding-right: 28px;
  font-weight: 600;
  border: 1px solid rgb(15 23 42 / 0.88);
  background: rgb(15 23 42);
  color: rgb(248 250 252);
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.08);
}

.subject-card :deep(.subject-btn.el-button:hover),
.subject-card :deep(.subject-btn.el-button:focus) {
  border-color: rgb(30 41 59);
  background: rgb(30 41 59);
  color: rgb(255 255 255);
}

.subject-card :deep(.subject-btn.el-button:active) {
  border-color: rgb(15 23 42);
  background: rgb(15 23 42);
}

@media (prefers-color-scheme: dark) {
  .subject-card :deep(.subject-btn.el-button) {
    border: 1px solid rgb(255 255 255 / 0.14);
    background: rgb(250 250 250 / 0.96);
    color: rgb(15 23 42);
    box-shadow: 0 1px 2px rgb(0 0 0 / 0.35);
  }

  .subject-card :deep(.subject-btn.el-button:hover),
  .subject-card :deep(.subject-btn.el-button:focus) {
    border-color: rgb(255 255 255 / 0.22);
    background: rgb(255 255 255);
    color: rgb(15 23 42);
  }

  .subject-card :deep(.subject-btn.el-button:active) {
    border-color: rgb(255 255 255 / 0.14);
    background: rgb(244 244 245);
  }
}

.subject-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 10px;
  padding-top: 12px;
  border-top: 1px solid var(--jztk-line);
}

.action-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--site-border);
  flex-shrink: 0;
}

.subject-card :deep(.jztk-sub-link) {
  color: var(--site-muted);
  font-size: 0.8125rem;
  font-weight: 400;
  padding: 4px 6px;
}

.subject-card :deep(.jztk-sub-link:hover) {
  color: rgb(15 23 42);
}

@media (prefers-color-scheme: dark) {
  .subject-card :deep(.jztk-sub-link:hover) {
    color: rgb(250 250 250);
  }
}

.hint {
  margin-top: 24px;
  font-size: 0.82rem;
  line-height: 1.55;
  color: var(--site-muted);
  text-align: center;
}

.hint code {
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--site-surface-solid);
  border: 1px solid var(--site-border);
  font-size: 0.8rem;
  color: var(--site-heading);
}
</style>
