<template>
  <TopMenu></TopMenu>
  <div class="title">云胡工具集</div>

  <el-row>
    <el-col :span="6"></el-col>
    <el-col :span="12">
      <div />
      <el-card class="box-card">
        <template #header>
          <div>
            <span>程序员工具</span>
          </div>
        </template>
        <div>
          <el-button type="primary" @click="gotoJsonFormat">
            Json 代码美化
          </el-button>

          <el-button type="primary" @click="gotoColorConvert">
            颜色进制转换
          </el-button>
        </div>
      </el-card>

      <el-card class="box-card">
        <template #header>
          <div>
            <span>其他</span>
          </div>
        </template>
        <!-- <div>
          <el-button type="primary" @click="GotoBetweenNowToHoliday">
            距离放假时间
          </el-button>
        </div> -->
        <div>
          <el-button type="primary" @click="gotoCalcBmi"> BMI 计算 </el-button>

          <el-button
            type="primary"
            @click="gotoCalcHeavenlyStemsAndEarthlyBranches"
          >
            天干地支纪年
          </el-button>
        </div>
      </el-card>
    </el-col>
  </el-row>

  <footer class="icp">
    <a href="https://beian.miit.gov.cn/" target="_blank">闽ICP备2023011581号</a>
  </footer>
</template>

<script setup>
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import TopMenu from "./TopMenu.vue";

const router = useRouter();

/**
 * 转到颜色进制转换页面
 */
function gotoColorConvert() {
  router.push({
    path: "/ColorConvert",
  });
}

/**
 * 转到JSON格式化页面
 */
function gotoJsonFormat() {
  router.push({
    path: "/JsonFormat",
  });
}

/**
 * 转到距离放假时间计算页面
 */
function GotoBetweenNowToHoliday() {
  router.push({
    path: "/BetweenNowToHoliday",
  });
}

/**
 * 转到BMI计算页面
 * 目前功能正在开发中
 */
const gotoCalcBmi = () => {
  ElMessage.error("云胡哥哥正在开发中!");

  // router.push({
  //   path: "/DPlayer",
  // });
};

/**
 * 转到天干地支纪年计算页面
 */
const gotoCalcHeavenlyStemsAndEarthlyBranches = () => {
  router.push({
    path: "/heavenlyStemsAndEarthlyBranches",
  });
};
</script>

<style scoped>
/* 全局应用样式 */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  /* 启用字体平滑，使字体在WebKit浏览器中更清晰 */
  -webkit-font-smoothing: antialiased;
  /* 启用字体平滑，使字体在Firefox浏览器中更清晰 */
  -moz-osx-font-smoothing: grayscale;
  /*//text-align: center;*/
  /*color: #2c3e50;*/
  /* 设置顶部外边距 */
  margin-top: 60px;
  /*position:relative;*/
}

/* 页面标题样式 */
.title {
  /* 文本居中对齐 */
  text-align: center;
  /* 设置外边距为2rem */
  margin: 2rem;
  /* 设置字体大小为1.5rem */
  font-size: 1.5rem;
  /* 设置字体为Monotype Corsiva */
  font-family: "Monotype Corsiva";
  /* 设置字体粗细为粗体 */
  font-weight: bold;
}

/* 卡片容器样式 */
.box-card {
  /* display: flex; */
  /*justify-content: center;*/
  /*align-items: center;*/
  /*height: 100vh;*/
  /* 设置底部外边距为20px */
  margin-bottom: 20px;
}

/* 卡片头部样式 */
.card-header {
  /*background: skyblue;*/
}

/* ICP备案信息样式 */
.icp {
  /*position: absolute;*/
  /*text-align: center;*/
  /* 使用固定定位 */
  position: fixed;
  /* 距离底部0px */
  bottom: 0px;
  /* 距离左侧45% */
  left: 45%;
  /*left:0px;*/
}
</style>
