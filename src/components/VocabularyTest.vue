<template>
  <div
    class="matrix-root relative min-h-screen flex flex-col overflow-hidden text-slate-900 dark:text-neutral-100"
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
        class="fixed left-5 top-5 z-[2100] flex h-10 w-10 items-center justify-center rounded-full border border-black/[0.08] bg-white/80 text-slate-600 no-underline shadow-sm backdrop-blur-md transition-colors duration-200 hover:bg-white/95 hover:text-slate-900 dark:border-white/[0.12] dark:bg-zinc-900/70 dark:text-neutral-300 dark:hover:bg-zinc-800/80 dark:hover:text-white"
        aria-label="返回小工具集"
      >
        <el-icon :size="18"><ArrowLeft /></el-icon>
      </RouterLink>
    </el-tooltip>

    <div class="relative flex min-h-0 flex-1 flex-col">
      <section class="text-center px-6 pb-8 pt-14 sm:pb-10 sm:pt-20">
        <p
          class="mb-4 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-slate-500 dark:text-neutral-500 sm:text-xs"
        >
          Utilities
        </p>
        <h1
          class="mx-auto max-w-lg text-[1.75rem] font-semibold leading-[1.1] tracking-[-0.03em] text-slate-900 dark:text-white sm:text-4xl"
        >
          英语词汇量测试
        </h1>
        <p
          class="mx-auto mt-3 max-w-md text-[15px] font-normal leading-relaxed text-slate-600 dark:text-neutral-400 sm:text-base"
        >
          选择题 · 粗估被动阅读词汇量（仅供学习参考）
        </p>
        <div
          class="mx-auto mt-8 h-px w-12 rounded-full matrix-divider"
          aria-hidden="true"
        />
      </section>

      <div class="main-container relative flex-1 px-6 pb-12 sm:px-6">
        <div class="content-container mx-auto w-full max-w-2xl">
        <!-- 选题量 -->
        <el-card v-if="phase === 'setup'" class="vocab-matrix-card" shadow="never">
          <template #header>
            <div class="card-header">
              <i class="el-icon-edit-outline"></i>
              <span>选择题目数量</span>
            </div>
          </template>
          <div class="setup-body">
            <el-radio-group v-model="questionCount" size="large">
              <el-radio-button :label="10">10 题</el-radio-button>
              <el-radio-button :label="50">50 题</el-radio-button>
              <el-radio-button :label="100">100 题</el-radio-button>
            </el-radio-group>
            <p class="hint">
              每题给出英文单词，从四个中文释义中选择正确的一项；若不确定可选「不知道」（计为未答对）。
            </p>
            <el-button type="primary" size="large" class="start-btn" @click="startQuiz">
              开始测试
            </el-button>
          </div>
        </el-card>

        <!-- 答题 -->
        <el-card v-else-if="phase === 'quiz'" class="vocab-matrix-card" shadow="never">
          <template #header>
            <div class="card-header card-header-row">
              <span>
                <i class="el-icon-document"></i>
                第 {{ currentIndex + 1 }} / {{ quizItems.length }} 题
              </span>
              <el-button link type="primary" @click="confirmAbort">退出测试</el-button>
            </div>
          </template>
          <el-progress
            :percentage="progressPercent"
            :stroke-width="10"
            class="progress-bar"
          />
          <div class="question-block">
            <div class="word-en">{{ currentItem.en }}</div>
            <p class="word-tip">
              {{
                quizLocked
                  ? '请稍候，即将进入下一题…'
                  : '请选择最贴切的中文释义（点选后自动判题并进入下一题）'
              }}
            </p>
            <el-radio-group
              :key="currentIndex"
              v-model="selectedZh"
              class="options-group"
              :disabled="quizLocked"
              @change="onOptionSelected"
            >
              <el-radio
                v-for="(opt, idx) in displayOptions"
                :key="idx"
                :label="opt"
                border
                class="option-radio"
                :class="{ 'option-dont-know': opt === OPTION_DONT_KNOW }"
              >
                {{ opt }}
              </el-radio>
            </el-radio-group>
          </div>
        </el-card>

        <!-- 结果 -->
        <el-card v-else class="vocab-matrix-card result-card" shadow="never">
          <template #header>
            <div class="card-header">
              <i class="el-icon-trophy"></i>
              <span>测试结果</span>
            </div>
          </template>
          <div class="result-body">
            <div class="estimate-box">
              <div class="estimate-label">估算被动阅读词汇量（约）</div>
              <div class="estimate-num">{{ estimated }}</div>
              <div class="estimate-unit">词（粗估）</div>
            </div>

            <div class="level-box">
              <div class="level-box-title">相当于什么水平（粗估对照）</div>
              <el-descriptions :column="1" border size="small" class="level-desc">
                <el-descriptions-item label="学段">{{ levelDesc.school }}</el-descriptions-item>
                <el-descriptions-item label="CET-4">{{ levelDesc.cet4 }}</el-descriptions-item>
                <el-descriptions-item label="CET-6">{{ levelDesc.cet6 }}</el-descriptions-item>
                <el-descriptions-item label="雅思（总分粗估）">{{ levelDesc.ielts }}</el-descriptions-item>
                <el-descriptions-item label="托福 iBT（粗估）">{{ levelDesc.toefl }}</el-descriptions-item>
              </el-descriptions>
              <p class="level-note">
                雅思/托福为根据词汇量做的<strong>非常粗略</strong>的民间对照，与真实考试成绩差异可能很大。
              </p>
            </div>

            <el-descriptions :column="1" border class="result-desc">
              <el-descriptions-item label="题目数量">{{ totalAnswered }}</el-descriptions-item>
              <el-descriptions-item label="答对">{{ correctCount }}</el-descriptions-item>
              <el-descriptions-item label="选「不知道」">{{ unknownCount }} 次</el-descriptions-item>
              <el-descriptions-item label="正确率">{{ accuracy }}%</el-descriptions-item>
            </el-descriptions>
            <p class="disclaimer">
              本结果为根据本题库难度与正确率推算的<strong>娱乐/学习向粗估</strong>，不能替代标准化词汇量测试。
            </p>
            <div class="result-actions">
              <el-button type="primary" plain @click="showAnswerDialog = true">
                回答情况
              </el-button>
              <el-button type="primary" @click="restart">再测一次</el-button>
              <el-button @click="goUtilIndex">返回工具首页</el-button>
            </div>
          </div>
        </el-card>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="showAnswerDialog"
      title="回答情况（含全部正确答案）"
      width="92%"
      class="answer-dialog"
      destroy-on-close
      align-center
    >
      <el-table :data="answerRecords" stripe :max-height="480" style="width: 100%">
        <el-table-column prop="order" label="#" width="48" />
        <el-table-column prop="en" label="单词" min-width="100" show-overflow-tooltip />
        <el-table-column prop="userZh" label="你的选择" min-width="120" show-overflow-tooltip />
        <el-table-column prop="correctZh" label="正确答案" min-width="120" show-overflow-tooltip />
        <el-table-column label="结果" width="72" align="center">
          <template #default="{ row }">
            <span :class="row.isCorrect ? 'ok-yes' : 'ok-no'">{{
              row.isCorrect ? '正确' : '错误'
            }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { ArrowLeft } from "@element-plus/icons-vue";
import {
  VOCAB_POOL,
  pickQuestions,
  buildOptions,
  estimateVocabulary,
  accuracyPercent,
  getVocabLevelDescriptors,
  OPTION_DONT_KNOW,
} from "@/data/vocabularyTest.js";
import "../styles/matrix-page.css";

const router = useRouter();

const phase = ref("setup"); // setup | quiz | result
const questionCount = ref(10);
const quizItems = ref([]);
const currentIndex = ref(0);
const selectedZh = ref("");
const answers = ref([]); // { level, correct }
const answerRecords = ref([]);
const showAnswerDialog = ref(false);
/** 已选题、等待自动下一题时锁定，防止重复点击 */
const quizLocked = ref(false);
const pendingAdvanceTimer = ref(null);

const ADVANCE_DELAY_MS = 1000;

const currentItem = computed(() => quizItems.value[currentIndex.value] || {});
const displayOptions = computed(() => {
  const item = currentItem.value;
  if (!item.options?.length) return [OPTION_DONT_KNOW];
  return [...item.options, OPTION_DONT_KNOW];
});
const progressPercent = computed(() => {
  const n = quizItems.value.length;
  if (!n) return 0;
  return Math.round((currentIndex.value / n) * 100);
});

const estimated = ref(0);
const correctCount = ref(0);
const totalAnswered = ref(0);
const accuracy = ref(0);
const unknownCount = computed(
  () => answerRecords.value.filter((r) => r.userZh === "不知道").length
);
const levelDesc = ref(getVocabLevelDescriptors(0));

function clearAdvanceTimer() {
  if (pendingAdvanceTimer.value != null) {
    clearTimeout(pendingAdvanceTimer.value);
    pendingAdvanceTimer.value = null;
  }
}

onUnmounted(() => {
  clearAdvanceTimer();
});

function startQuiz() {
  const n = Number(questionCount.value) || 10;
  const picked = pickQuestions(n);
  if (picked.length < n) {
    ElMessage.info(`当前题库共 ${picked.length} 词，将使用全部可用题目。`);
  }
  quizItems.value = picked.map((q) => ({
    en: q.en,
    zh: q.zh,
    level: q.level,
    options: buildOptions(q, VOCAB_POOL),
  }));
  clearAdvanceTimer();
  quizLocked.value = false;
  currentIndex.value = 0;
  selectedZh.value = "";
  answers.value = [];
  answerRecords.value = [];
  phase.value = "quiz";
}

/**
 * 选中选项后立即提示正误，延迟后自动记录并进入下一题
 */
function onOptionSelected(choice) {
  if (quizLocked.value || phase.value !== "quiz" || !choice) return;

  const item = currentItem.value;
  if (!item.en) return;

  quizLocked.value = true;
  const indexAt = currentIndex.value;
  const isLastQ = indexAt >= quizItems.value.length - 1;
  const isDontKnow = choice === OPTION_DONT_KNOW;
  const ok = !isDontKnow && choice === item.zh;

  if (ok) {
    ElMessage.success({ message: "回答正确！", duration: 800 });
  } else if (isDontKnow) {
    ElMessage.warning({ message: `正确答案是：${item.zh}`, duration: 900 });
  } else {
    ElMessage.error({ message: `回答错误，正确：${item.zh}`, duration: 900 });
  }

  clearAdvanceTimer();
  pendingAdvanceTimer.value = setTimeout(() => {
    pendingAdvanceTimer.value = null;
    answers.value.push({ level: item.level, correct: ok });
    answerRecords.value.push({
      order: indexAt + 1,
      en: item.en,
      correctZh: item.zh,
      userZh: isDontKnow ? "不知道" : choice,
      isCorrect: ok,
    });
    selectedZh.value = "";
    quizLocked.value = false;
    if (isLastQ) {
      finishQuiz();
    } else {
      currentIndex.value += 1;
    }
  }, ADVANCE_DELAY_MS);
}

function finishQuiz() {
  const results = answers.value;
  totalAnswered.value = results.length;
  correctCount.value = results.filter((r) => r.correct).length;
  accuracy.value = accuracyPercent(correctCount.value, totalAnswered.value);
  estimated.value = estimateVocabulary(results);
  levelDesc.value = getVocabLevelDescriptors(estimated.value);
  phase.value = "result";
}

function confirmAbort() {
  ElMessageBox.confirm("确定要退出吗？当前进度将丢失。", "退出测试", {
    type: "warning",
    confirmButtonText: "退出",
    cancelButtonText: "继续答题",
  })
    .then(() => {
      clearAdvanceTimer();
      quizLocked.value = false;
      phase.value = "setup";
      quizItems.value = [];
      answers.value = [];
      answerRecords.value = [];
      currentIndex.value = 0;
      selectedZh.value = "";
    })
    .catch(() => {});
}

function restart() {
  clearAdvanceTimer();
  quizLocked.value = false;
  phase.value = "setup";
  quizItems.value = [];
  answers.value = [];
  answerRecords.value = [];
  showAnswerDialog.value = false;
  currentIndex.value = 0;
  selectedZh.value = "";
}

function goUtilIndex() {
  router.push("/utilIndex");
}
</script>

<style scoped>
/* 与 UtilIndex：磨砂卡 + slate 语义色，暗色随系统 */

.vocab-matrix-card {
  border-radius: 0.75rem;
  border: 1px solid rgb(203 213 225 / 0.9);
  background: rgb(241 245 249 / 0.9);
  box-shadow: 0 1px 2px rgb(15 23 42 / 0.04);
  transition:
    box-shadow 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.vocab-matrix-card:hover {
  border-color: rgb(100 116 139 / 0.55);
  box-shadow: 0 4px 14px rgb(15 23 42 / 0.08);
}

@media (prefers-color-scheme: dark) {
  .vocab-matrix-card {
    border-color: rgb(51 65 85 / 0.95);
    background: rgb(15 23 42 / 0.82);
  }

  .vocab-matrix-card:hover {
    border-color: rgb(148 163 184 / 0.45);
    box-shadow: 0 4px 20px rgb(0 0 0 / 0.35);
  }
}

.vocab-matrix-card :deep(.el-card__header) {
  border-bottom: 1px solid rgb(203 213 225 / 0.55);
  background: transparent;
  padding: 14px 18px;
}

@media (prefers-color-scheme: dark) {
  .vocab-matrix-card :deep(.el-card__header) {
    border-bottom-color: rgb(51 65 85 / 0.85);
  }
}

.vocab-matrix-card :deep(.el-card__body) {
  padding: 18px 20px 22px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.05rem;
  font-weight: 600;
  color: rgb(30 41 59);
}

@media (prefers-color-scheme: dark) {
  .card-header {
    color: rgb(248 250 252);
  }
}

.card-header-row {
  justify-content: space-between;
  width: 100%;
}

.card-header i {
  color: rgb(71 85 105);
}

@media (prefers-color-scheme: dark) {
  .card-header i {
    color: rgb(203 213 225);
  }
}

.setup-body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  padding: 8px 0;
}

.hint {
  margin: 0;
  font-size: 0.9rem;
  color: rgb(71 85 105);
  line-height: 1.55;
}

@media (prefers-color-scheme: dark) {
  .hint {
    color: rgb(163 163 163);
  }
}

.start-btn {
  align-self: stretch;
  border-radius: 9999px;
}

.progress-bar {
  margin-bottom: 20px;
}

.question-block {
  margin-bottom: 24px;
}

.word-en {
  font-size: 2rem;
  font-weight: 700;
  color: rgb(15 23 42);
  letter-spacing: 0.02em;
  margin-bottom: 8px;
  font-family: Georgia, "Times New Roman", serif;
}

@media (prefers-color-scheme: dark) {
  .word-en {
    color: rgb(248 250 252);
  }
}

.word-tip {
  font-size: 0.9rem;
  color: rgb(100 116 139);
  margin: 0 0 20px;
}

@media (prefers-color-scheme: dark) {
  .word-tip {
    color: rgb(163 163 163);
  }
}

.options-group {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
  width: 100%;
}

.option-radio {
  margin-right: 0 !important;
  height: auto !important;
  padding: 12px 14px;
  border-radius: 10px !important;
  white-space: normal;
  line-height: 1.4;
}

.option-dont-know {
  border-style: dashed !important;
  color: rgb(100 116 139);
}

@media (prefers-color-scheme: dark) {
  .option-dont-know {
    color: rgb(163 163 163);
  }
}

.vocab-matrix-card :deep(.el-radio.is-bordered) {
  border-color: rgb(203 213 225 / 0.9);
  background: rgb(255 255 255 / 0.5);
}

@media (prefers-color-scheme: dark) {
  .vocab-matrix-card :deep(.el-radio.is-bordered) {
    border-color: rgb(51 65 85 / 0.9);
    background: rgb(30 41 59 / 0.35);
  }
}

.result-body {
  padding: 8px 0;
}

.estimate-box {
  text-align: center;
  padding: 20px 16px 24px;
  background: rgb(100 116 139 / 0.1);
  border: 1px solid rgb(100 116 139 / 0.28);
  border-radius: 0.75rem;
  margin-bottom: 20px;
}

@media (prefers-color-scheme: dark) {
  .estimate-box {
    background: rgb(148 163 184 / 0.12);
    border-color: rgb(148 163 184 / 0.28);
  }
}

.estimate-label {
  font-size: 0.95rem;
  color: rgb(71 85 105);
  margin-bottom: 8px;
}

@media (prefers-color-scheme: dark) {
  .estimate-label {
    color: rgb(163 163 163);
  }
}

.estimate-num {
  font-size: 2.8rem;
  font-weight: 800;
  color: rgb(51 65 85);
  line-height: 1.1;
}

@media (prefers-color-scheme: dark) {
  .estimate-num {
    color: rgb(226 232 240);
  }
}

.estimate-unit {
  font-size: 0.85rem;
  color: rgb(100 116 139);
  margin-top: 4px;
}

@media (prefers-color-scheme: dark) {
  .estimate-unit {
    color: rgb(163 163 163);
  }
}

.level-box {
  margin-bottom: 20px;
  padding: 14px 14px 8px;
  background: rgb(100 116 139 / 0.08);
  border-radius: 0.75rem;
  border: 1px solid rgb(100 116 139 / 0.22);
}

@media (prefers-color-scheme: dark) {
  .level-box {
    background: rgb(148 163 184 / 0.1);
    border-color: rgb(148 163 184 / 0.22);
  }
}

.level-box-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: rgb(30 41 59);
  margin-bottom: 10px;
}

@media (prefers-color-scheme: dark) {
  .level-box-title {
    color: rgb(248 250 252);
  }
}

.level-desc {
  margin-bottom: 8px;
}

.level-note {
  font-size: 0.78rem;
  color: rgb(100 116 139);
  line-height: 1.5;
  margin: 0;
  padding-top: 4px;
}

@media (prefers-color-scheme: dark) {
  .level-note {
    color: rgb(163 163 163);
  }
}

.result-desc {
  margin-bottom: 16px;
}

.ok-yes {
  color: #67c23a;
  font-weight: 600;
}

.ok-no {
  color: #f56c6c;
  font-weight: 600;
}

.disclaimer {
  font-size: 0.82rem;
  color: rgb(100 116 139);
  line-height: 1.55;
  margin: 0 0 20px;
}

@media (prefers-color-scheme: dark) {
  .disclaimer {
    color: rgb(163 163 163);
  }
}

.result-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

/* 按钮与题量选项：主色用 slate，不用蓝 */
.matrix-root :deep(.el-button--primary) {
  --el-button-bg-color: rgb(51 65 85);
  --el-button-border-color: rgb(51 65 85);
  --el-button-hover-bg-color: rgb(71 85 105);
  --el-button-hover-border-color: rgb(71 85 105);
  --el-button-active-bg-color: rgb(30 41 59);
  --el-button-active-border-color: rgb(30 41 59);
  --el-button-text-color: #fff;
  --el-button-hover-text-color: #fff;
  --el-button-active-text-color: #fff;
}

.matrix-root :deep(.el-button--primary.is-plain) {
  --el-button-bg-color: transparent;
  --el-button-border-color: rgb(100 116 139);
  --el-button-text-color: rgb(51 65 85);
  --el-button-hover-bg-color: rgb(241 245 249);
  --el-button-hover-border-color: rgb(71 85 105);
  --el-button-hover-text-color: rgb(51 65 85);
  --el-button-active-text-color: rgb(51 65 85);
}

.matrix-root :deep(.el-button.is-link.el-button--primary) {
  --el-button-text-color: rgb(71 85 105);
  --el-button-hover-text-color: rgb(51 65 85);
}

.matrix-root :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: rgb(51 65 85);
  border-color: rgb(51 65 85);
  color: #fff;
  box-shadow: -1px 0 0 0 rgb(51 65 85);
}

.matrix-root :deep(.el-radio-button:first-child .el-radio-button__original-radio:checked + .el-radio-button__inner) {
  box-shadow: none;
}

@media (prefers-color-scheme: dark) {
  .matrix-root :deep(.el-button--primary) {
    --el-button-bg-color: rgb(226 232 240);
    --el-button-border-color: rgb(226 232 240);
    --el-button-hover-bg-color: rgb(248 250 252);
    --el-button-hover-border-color: rgb(248 250 252);
    --el-button-active-bg-color: rgb(203 213 225);
    --el-button-active-border-color: rgb(203 213 225);
    --el-button-text-color: rgb(15 23 42);
    --el-button-hover-text-color: rgb(15 23 42);
    --el-button-active-text-color: rgb(15 23 42);
  }

  .matrix-root :deep(.el-button--primary.is-plain) {
    --el-button-bg-color: transparent;
    --el-button-border-color: rgb(148 163 184);
    --el-button-text-color: rgb(226 232 240);
    --el-button-hover-bg-color: rgb(51 65 85);
    --el-button-hover-border-color: rgb(203 213 225);
    --el-button-hover-text-color: rgb(248 250 252);
    --el-button-active-text-color: rgb(248 250 252);
  }

  .matrix-root :deep(.el-button.is-link.el-button--primary) {
    --el-button-text-color: rgb(203 213 225);
    --el-button-hover-text-color: rgb(248 250 252);
  }

  .matrix-root :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
    background-color: rgb(226 232 240);
    border-color: rgb(226 232 240);
    color: rgb(15 23 42);
    box-shadow: -1px 0 0 0 rgb(226 232 240);
  }

  .matrix-root :deep(.el-radio-button:first-child .el-radio-button__original-radio:checked + .el-radio-button__inner) {
    box-shadow: none;
  }
}

/* 进度条与选项圆点：与按钮同色 slate，避免残留品牌蓝 */
.matrix-root :deep(.el-progress-bar__inner) {
  background-color: rgb(71 85 105);
}

.matrix-root :deep(.el-radio__input.is-checked .el-radio__inner) {
  background-color: rgb(51 65 85);
  border-color: rgb(51 65 85);
}

@media (prefers-color-scheme: dark) {
  .matrix-root :deep(.el-progress-bar__inner) {
    background-color: rgb(203 213 225);
  }

  .matrix-root :deep(.el-radio__input.is-checked .el-radio__inner) {
    background-color: rgb(226 232 240);
    border-color: rgb(226 232 240);
  }
}

@media (max-width: 768px) {
  .word-en {
    font-size: 1.55rem;
  }
  .estimate-num {
    font-size: 2.2rem;
  }
}

@media (max-width: 480px) {
  .word-en {
    font-size: 1.25rem;
  }

  .word-tip {
    font-size: 0.8rem;
    margin-bottom: 14px;
  }

  .estimate-num {
    font-size: 2rem;
  }

  .option-radio {
    padding: 10px 12px;
    font-size: 0.95rem;
  }

  .level-box {
    padding: 12px 12px 6px;
  }

  .level-note {
    font-size: 0.72rem;
  }

  /* 弹窗表格：更小字号 + 允许换行，避免窄屏挤压/横向滚动 */
  .answer-dialog :deep(.el-dialog__body) {
    padding: 12px 14px;
  }

  .answer-dialog :deep(.el-table) {
    font-size: 12px;
  }

  .answer-dialog :deep(.el-table th),
  .answer-dialog :deep(.el-table td),
  .answer-dialog :deep(.el-table__cell) {
    padding: 6px 4px;
    white-space: normal;
    word-break: break-word;
    overflow-wrap: anywhere;
  }

  .answer-dialog :deep(.el-table__header-wrapper th) {
    font-size: 12px;
  }
}
</style>
