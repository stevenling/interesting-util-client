<template>
  <div class="common-layout">
    <el-container>
      <el-header>节日倒计时</el-header>
      <el-main>
        <el-row justify="center">
          <el-col :span="6">
            <el-text class="mx-1" size="large" v-model="currentTime"
              >当前时间: {{ currentTime }}</el-text
            >
          </el-col>
        </el-row>

        <el-row justify="center">
          <el-col :span="6">
            <el-text class="mx-1" size="large"
              >离中秋节、国庆节还有: {{ midAutumnAndNationalDayDiff }}</el-text
            >
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";

const dayjs = require("dayjs");
dayjs.extend(require("dayjs/plugin/duration"));
let currentTime = ref("");
onMounted(() => {});

/**
 * 计算当前时间与中秋的差
 */
function calcDiff(needCalcDay, res) {
  // 当前时间与中秋的差
  const diff = dayjs().diff(dayjs(needCalcDay));
  const diffDay = dayjs.duration(diff).days();
  const diffHours = dayjs.duration(diff).hours();
  const diffMinutes = dayjs.duration(diff).minutes();
  const diffSeconds = dayjs.duration(diff).seconds();
  res.value =
    diffDay * -1 +
    "  天 " +
    diffHours * -1 +
    " 小时 " +
    diffMinutes * -1 +
    " 分钟 " +
    diffSeconds * -1 +
    " 秒 ";
}

// 设置一个定时器，每秒更新一次时间和倒计时。
// 注意：在 setup 中创建的定时器，必须在组件卸载时清除，否则会造成内存泄漏。
const timer = setInterval(() => {
  // 更新并格式化当前时间
  currentTime.value = dayjs().format("YYYY-MM-DD HH:mm:ss");

  // 计算并更新各个节日的倒计时
  // calcDiff("2023-9-3 00:00:00", victoryAgainstJapanDiff); // 此倒计时在模板中被注释，但逻辑仍在运行
  calcDiff("2023-9-29 00:00:00", midAutumnAndNationalDayDiff);
}, 1000);

const midAutumnAndNationalDayDiff = ref();
const victoryAgainstJapanDiff = ref();

// 在组件卸载前清除定时器，防止内存泄漏
onUnmounted(() => {
  clearInterval(timer);
});
</script>

<style scoped>
.mx-1 {
  justify-content: center;
}
</style>
