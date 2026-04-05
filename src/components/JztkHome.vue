<template>
  <div class="jztk-home-page">
    <el-tooltip content="返回小工具集" placement="right">
      <RouterLink to="/utilIndex" class="jztk-back-fab" aria-label="返回小工具集">
        <el-icon :size="18"><ArrowLeft /></el-icon>
      </RouterLink>
    </el-tooltip>

    <div class="main-container">
      <div class="hero-section">
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
            <el-button type="primary" round class="subject-btn" @click.stop="goPractice('1')">
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
            <el-button type="primary" round class="subject-btn" @click.stop="goPractice('4')">
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
</template>

<script setup>
import { useRouter, RouterLink } from "vue-router";
import { ArrowLeft } from "@element-plus/icons-vue";

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
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--site-bg);
  --jztk-line: var(--site-border);
}

.jztk-back-fab {
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 2000;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--site-surface-solid);
  border: 1px solid var(--site-border);
  color: var(--site-heading);
  box-shadow: var(--site-card-shadow);
  text-decoration: none;
  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.15s ease;
}

.jztk-back-fab:hover {
  color: var(--site-accent);
  border-color: var(--site-accent);
  box-shadow: 0 2px 12px rgb(15 23 42 / 0.08);
}

.jztk-back-fab:active {
  transform: scale(0.96);
}

.main-container {
  flex: 1;
  background: transparent;
  padding: 56px 0 48px;
}

.hero-section {
  text-align: center;
  padding: 28px 16px 24px;
  color: var(--site-heading);
  border-bottom: 1px solid var(--site-border);
}

.title {
  font-size: 1.85rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  letter-spacing: 0.02em;
  color: var(--site-heading);
  text-shadow: none;
}

.subtitle {
  margin: 0;
  font-size: 0.9rem;
  color: var(--site-muted);
  font-weight: 400;
  text-shadow: none;
}

.content-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 16px;
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
  border-radius: 14px;
  text-align: center;
  padding: 4px 4px 18px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
  border: 1px solid var(--site-border);
  background: var(--site-surface);
  --el-card-border-color: var(--jztk-line);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.subject-card:hover {
  transform: translateY(-2px);
  border-color: var(--site-border);
  box-shadow: var(--site-card-shadow), 0 10px 28px rgb(15 23 42 / 0.06);
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

.subject-btn {
  padding-left: 28px;
  padding-right: 28px;
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
  color: var(--site-accent);
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
