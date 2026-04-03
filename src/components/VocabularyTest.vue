<template>
  <div class="vocab-page">
    <TopMenu />
    <div class="main-container">
      <div class="hero-section">
        <div class="title">英语词汇量测试</div>
        <div class="subtitle">选择题 · 根据难度粗估被动阅读词汇量（仅供学习参考）</div>
      </div>

      <div class="content-container">
        <!-- 选题量 -->
        <el-card v-if="phase === 'setup'" class="vocab-card" shadow="hover">
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
        <el-card v-else-if="phase === 'quiz'" class="vocab-card" shadow="hover">
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
        <el-card v-else class="vocab-card result-card" shadow="hover">
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
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import TopMenu from "./TopMenu.vue";
import {
  VOCAB_POOL,
  pickQuestions,
  buildOptions,
  estimateVocabulary,
  accuracyPercent,
  getVocabLevelDescriptors,
  OPTION_DONT_KNOW,
} from "@/data/vocabularyTest.js";

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
.vocab-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-container {
  flex: 1;
  background: transparent;
  padding: 20px 0 40px;
}

.hero-section {
  text-align: center;
  padding: 30px 20px 16px;
  color: var(--site-heading);
  border-bottom: 1px solid var(--site-border);
}

.title {
  font-size: 2.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: var(--site-heading);
  text-shadow: none;
}

.subtitle {
  font-size: 0.95rem;
  color: var(--site-muted);
  opacity: 1;
}

.content-container {
  max-width: 680px;
  margin: 0 auto;
  padding: 0 20px;
}

.vocab-card {
  border-radius: 16px;
  border: 1px solid var(--site-border);
  background: var(--site-surface);
  backdrop-filter: blur(10px);
  box-shadow: var(--site-card-shadow);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
}

.card-header-row {
  justify-content: space-between;
  width: 100%;
}

.card-header i {
  color: var(--site-accent);
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
  color: #606266;
  line-height: 1.5;
}

.start-btn {
  align-self: stretch;
  border-radius: 12px;
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
  color: #303133;
  letter-spacing: 0.02em;
  margin-bottom: 8px;
  font-family: Georgia, "Times New Roman", serif;
}

.word-tip {
  font-size: 0.9rem;
  color: #909399;
  margin: 0 0 20px;
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
  color: #909399;
}

.result-body {
  padding: 8px 0;
}

.estimate-box {
  text-align: center;
  padding: 20px 16px 24px;
  background: rgb(37 99 235 / 0.08);
  border: 1px solid rgb(37 99 235 / 0.2);
  border-radius: 12px;
  margin-bottom: 20px;
}

.estimate-label {
  font-size: 0.95rem;
  color: #606266;
  margin-bottom: 8px;
}

.estimate-num {
  font-size: 2.8rem;
  font-weight: 800;
  color: var(--site-accent);
  line-height: 1.1;
}

.estimate-unit {
  font-size: 0.85rem;
  color: #909399;
  margin-top: 4px;
}

.level-box {
  margin-bottom: 20px;
  padding: 14px 14px 8px;
  background: rgb(37 99 235 / 0.06);
  border-radius: 12px;
  border: 1px solid rgb(37 99 235 / 0.22);
}

.level-box-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
}

.level-desc {
  margin-bottom: 8px;
}

.level-note {
  font-size: 0.78rem;
  color: #909399;
  line-height: 1.5;
  margin: 0;
  padding-top: 4px;
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
  color: #909399;
  line-height: 1.55;
  margin: 0 0 20px;
}

.result-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

@media (max-width: 768px) {
  .title {
    font-size: 1.65rem;
  }
  .word-en {
    font-size: 1.55rem;
  }
  .estimate-num {
    font-size: 2.2rem;
  }
  .content-container {
    padding: 0 12px;
  }
}

@media (max-width: 480px) {
  .title {
    font-size: 1.35rem;
  }

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

  .content-container {
    padding: 0 10px;
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
