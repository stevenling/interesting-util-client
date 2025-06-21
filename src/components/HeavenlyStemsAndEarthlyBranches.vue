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
            <div class="calendar-year-div-class">
              <el-input
                class="el-input-class"
                v-model="calendarYear"
                placeholder="请输入公历年"
                clearable
              />
              <p>{{ currentDynasty }}</p>
            </div>
          </div>

          <div class="hex-title-class">
            <p>天干地支</p>
            <div class="calendar-year-div-class">
              <el-input
                class="input-hex-color-class"
                v-model="heavenlyStemsEarthlyBranchesYear"
                placeholder="请输入天干地支年"
                clearable
              />
              <el-button type="primary" @click="clickCopyHexColor"
                >复制</el-button
              >
            </div>
          </div>

          <div class="select-color-title-class">
            <p>所有年份</p>
          </div>
          <el-table :data="yearData" style="width: 30%">
            <el-table-column prop="year" label="公历年" />
            <el-table-column prop="dynasty" label="朝代" />
          </el-table>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { watch, ref } from "vue";
import { ElMessage } from "element-plus";
import useClipboard from "vue-clipboard3";
import TopMenu from "./TopMenu.vue";

// 公历年
const calendarYear = ref();
// 天干地支纪年
const heavenlyStemsEarthlyBranchesYear = ref("");

let yearData = ref([]);

// 当前朝代
let currentDynasty = ref("");

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

// 十二地支
const earthlyBranchesList = [
  "子",
  "丑",
  "寅",
  "卯",
  "辰",
  "巳",
  "午",
  "未",
  "申",
  "酉",
  "戌",
  "亥",
];

// 完整天干地支
let entireHeavenlyStemsEarthlyBranchesList = [];

let digit = 0;
let row = 0;
let column = 0;
for (let i = 0; i < heavenlyStemsList.length; i++) {
  entireHeavenlyStemsEarthlyBranchesList[row] = [];
  column = 0;
  for (let j = 0; j < earthlyBranchesList.length; j++) {
    entireHeavenlyStemsEarthlyBranchesList[row][column] =
      heavenlyStemsList[i] + earthlyBranchesList[j];
    column++;
    i++;
    if (i === heavenlyStemsList.length) {
      i = 0;
    }
    if (j === earthlyBranchesList.length - 1) {
      i--;
    }
  }
  row++;
  if (
    row === heavenlyStemsList.length / 2 &&
    column === earthlyBranchesList.length
  ) {
    break;
  }
}
let calendarYearList = [];
let beginCalendarYear = 4;
for (let i = 0; i < entireHeavenlyStemsEarthlyBranchesList.length; i++) {
  calendarYearList[i] = [];
  for (let j = 0; j < entireHeavenlyStemsEarthlyBranchesList[i].length; j++) {
    calendarYearList[i][j] = beginCalendarYear++;
  }
}

watch(calendarYear, (newValue, ) => {
  if (newValue && newValue !== undefined && newValue !== "") {
    const currentCalendarYear = parseInt(newValue);
    if (currentCalendarYear > 3) {
      // 余数
      let remainder = (currentCalendarYear - 4) % 60;
      let currentRow = Math.floor(remainder / 12);
      let currentColumn = remainder % 12;
      heavenlyStemsEarthlyBranchesYear.value =
        entireHeavenlyStemsEarthlyBranchesList[currentRow][currentColumn];
      currentDynasty.value = calcDynasty(currentCalendarYear);
      console.log(currentDynasty.value);
    }
  }
});

/**
 * 根据年份获取朝代
 */
function calcDynasty(currentYear) {
  if (currentYear <= 8) {
    return "西汉";
  } else if (currentYear > 8 && currentYear < 24) {
    return "王莽新朝";
  } else if (currentYear >= 23 && currentYear <= 25) {
    return "更始政权";
  } else if (currentYear >= 25 && currentYear <= 220) {
    return "东汉";
  } else if (currentYear >= 220 && currentYear <= 280) {
    return "三国";
  } else if (currentYear >= 266 && currentYear <= 316) {
    return "西晋";
  } else if (currentYear >= 317 && currentYear <= 420) {
    return "东晋";
  } else if (currentYear >= 420 && currentYear <= 589) {
    return "南北朝";
  } else if (currentYear >= 581 && currentYear <= 619) {
    return "隋朝";
  } else if (currentYear >= 618 && currentYear <= 907) {
    return "唐朝";
  } else if (currentYear >= 907 && currentYear <= 979) {
    return "五代十国";
  } else if (currentYear >= 960 && currentYear <= 1127) {
    return "北宋";
  } else if (currentYear >= 1127 && currentYear <= 1279) {
    return "南宋";
  } else if (currentYear >= 1271 && currentYear <= 1388) {
    return "元朝";
  } else if (currentYear >= 1368 && currentYear <= 1644) {
    return "明朝";
  } else if (currentYear >= 1636 && currentYear <= 1912) {
    return "清朝";
  } else if (currentYear >= 1912 && currentYear <= 1949) {
    return "中华民国";
  } else if (currentYear >= 1949) {
    return "中华人民共和国";
  }
}

watch(heavenlyStemsEarthlyBranchesYear, (newValue, oldValue) => {
  if (newValue && newValue !== undefined && newValue !== "") {
    for (let i = 0; i < entireHeavenlyStemsEarthlyBranchesList.length; i++) {
      for (
        let j = 0;
        j < entireHeavenlyStemsEarthlyBranchesList[i].length;
        j++
      ) {
        if (newValue === entireHeavenlyStemsEarthlyBranchesList[i][j]) {
          yearData.value = [];
          for (let count = 0; count < 35; count++) {
            let currentYear = calendarYearList[i][j] + 60 * count;
            let currentDynasty = calcDynasty(currentYear);
            const newObj = { year: currentYear, dynasty: currentDynasty };
            yearData.value.push(newObj);
          }
        }
      }
    }
  }
});

/**
 * 复制 16 进制颜色值
 */
const clickCopyHexColor = async () => {
  const { toClipboard } = useClipboard();
  try {
    await toClipboard(heavenlyStemsEarthlyBranchesYear.value);
    ElMessage.success("复制成功");
  } catch (e) {
    console.error(e);
    ElMessage.error("复制失败");
  }
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

.calendar-year-div-class {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  height: 30px;
  margin-top: 10px;
}

.el-input-class {
  width: 250px;
  margin-right: 20px;
}

.single-rgb-class {
  margin-top: 20px;
}

.el-input-single-class {
  width: 120px;
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
  width: 110px;
  margin-right: 20px;
}

.title {
  font-size: 18px;
  font-weight: bold;
}
</style>
