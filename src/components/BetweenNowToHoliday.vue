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

        <!--  <el-row>-->
        <!--    <el-col :span="6">-->
        <!--      <el-text class="mx-1" size="large" v-model="currentTime">离春节: {{ currentTime }}</el-text>-->
        <!--    </el-col>-->
        <!--  </el-row>-->

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

  <!--  <el-row>-->
  <!--    <el-text class="mx-1" size="large">离抗日战争胜利还有: {{ victoryAgainstJapanDiff }}</el-text>-->
  <!--  </el-row>-->
</template>

<script>
import { onMounted, ref } from "vue";

const dayjs = require("dayjs");
dayjs.extend(require("dayjs/plugin/duration"));

export default {
  name: "BetweenNowToHoliday",
  setup() {
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

    const time = setInterval(() => {
      // 当前时间
      currentTime.value = dayjs().format("YYYY-MM-DD HH:mm:ss");

      calcDiff("2023-9-3 00:00:00", victoryAgainstJapanDiff);
      calcDiff("2023-9-29 00:00:00", midAutumnAndNationalDayDiff);
    }, 1000);

    // let midAutumnAndNationalDay = ref();
    // var date = dayjs('2023-9-29 00:00:00');
    // var time2 = dayjs().format('YYYY-MM-DD');

    // var diff = dayjs().diff('2023-9-29 00:00:00', 'day');
    //
    // console.log(diff);
    //
    // console.log(dayjs(diff));
    // console.log(dayjs(diff).format('HH:mm:ss'));

    const midAutumnAndNationalDayDiff = ref();
    const victoryAgainstJapanDiff = ref();
    // 格式化为需要的格式 这里是时分秒

    // console.log(dayjs(time2).diff('2023-9-29', 'date'), '秒')

    return {
      calcDiff,
      time,
      currentTime,
      midAutumnAndNationalDayDiff,
      victoryAgainstJapanDiff,
    };
  },
};
</script>

<style scoped>
.mx-1 {
  justify-content: center;
}
</style>
