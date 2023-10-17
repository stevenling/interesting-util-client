<template>
  <TopMenu></TopMenu>
  <div id="app">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <div class="title">天干地支纪年</div>
        </div>
      </template>
      <el-row :gutter="120" :span="12">
        <el-col :span="24" class="el-input-content">
          <div class="calendar-year-title-class">
            <p>公历年</p>
            <div class="smart-recognize-class">
              <el-input
                class="el-input-class"
                v-model="calendarYear"
                placeholder="请输入公历年"
                clearable
              />
              <el-button type="primary" @click="clickRecognize">一键识别</el-button>
            </div>
          </div>

          <div class="hex-title-class">
            <p>天干地支</p>
            <div class="smart-recognize-class">
              <el-input
                class="input-hex-color-class"
                v-model="heavenlyStemsEarthlyBranchesYear"
                placeholder="请输入天干地支年"
                clearable
              />
              <el-button type="primary" @click="clickCopyHexColor">复制</el-button>
            </div>
          </div>

          <div class="select-color-title-class">
            <p>取色</p>
            <el-color-picker v-model="selectColor" @change="clickSelectColor" />
          </div>

          <div class="show-color-title-class">
            <p>当前选择的颜色</p>
            <el-card
              class="show-color-el-card-class"
              :style="{ backgroundColor: selectColor }"
            ></el-card>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import { watch, ref } from "vue";
import { ElMessage } from "element-plus";
import useClipboard from "vue-clipboard3";
import TopMenu from "./TopMenu.vue";

export default {
  components: {
    TopMenu,
  },
  setup() {
    // 公历年
    const calendarYear = ref();
    // 天干地支纪年
    const heavenlyStemsEarthlyBranchesYear = ref("");

    // 十天干
    const heavenlyStemsList = [
      "甲",
      "乙",
      "丙",
      "丁",
      "戊",
      "己",
      "庚",
      "辛",
      "壬",
      "癸",
    ];
    // 阳天干
    const positiveHeavenlyStemsList = ["甲", "丙", "戊", "庚", "壬"];
    // 阴天干
    const negativeHeavenlyStemsList = ["乙", "丁", "己", "辛", "癸"];

    // 十二地支
    const earthlyBranchesList = ["甲", "丙", "戊", "庚", "壬"];

    /**
     * 监听 16 进制的颜色值
     */
    watch(calendarYear, (newValue, oldValue) => {
      if (newValue && newValue !== undefined && newValue !== "") {
      }
    });

    /**
     * 一键识别
     */
    const clickRecognize = () => {};

    /**
     * 复制 16 进制颜色值
     */
    const clickCopyHexColor = async () => {
      const { toClipboard } = useClipboard();
      try {
        await toClipboard(inputHexColor.value);
        ElMessage.success("复制 16 进制颜色值成功");
      } catch (e) {
        console.error(e);
        ElMessage.error("复制 16 进制颜色值失败");
      }
    };

    /**
     * 复制 rgb 颜色值
     */
    const clickCopyRgbColor = async () => {
      const { toClipboard } = useClipboard();
      try {
        const rgbColor =
          "rgb(" +
          inputRedColor.value +
          ", " +
          inputGreenColor.value +
          ", " +
          inputBlueColor.value +
          ")";
        await toClipboard(rgbColor);
        ElMessage.success("复制 RGB 颜色值成功");
      } catch (e) {
        console.error(e);
        ElMessage.error("复制 RGB 进制颜色值失败");
      }
    };

    return {
      calendarYear,
      heavenlyStemsEarthlyBranchesYear,
      clickRecognize,
    };
  },
};
</script>

<style scoped>
html,
body {
  width: 100%;
  height: 100%;
}

.app {
  background: #ebedf0;
}

.box-card {
  /* 表示上下边界为 0，左右则根据宽度自适应相同值 */
  /*display: flex;*/
  /*position: absolute;*/

  margin: 1rem auto;
  width: 50%;
  text-align: center;
}

.calendar-year-title-class {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-content: flex-start;
  text-align: left;
}

.smart-recognize-class {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  height: 30px;
  margin-top: 20px;
}

.el-input-class {
  width: 300px;
  margin-left: 20px;
  margin-right: 20px;
}

.single-rgb-class {
  margin-top: 20px;
}

.el-input-single-class {
  width: 150px;
  margin-left: 20px;
  margin-right: 20px;
}

.hex-title-class {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-content: flex-start;
  text-align: left;
  margin-top: 20px;
}

.select-color-title-class {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-content: flex-start;
  text-align: left;
  margin-top: 20px;
}

:root {
  --card-color: #4d4e53;
}

.color-el-card-class {
  color: var(--card-color);
}

.show-color-el-card-class {
  height: 200px;
}

.input-hex-color-class {
  width: 150px;
  margin-right: 20px;
}

.title {
  font-size: 18px;
  font-weight: bold;
}
</style>
