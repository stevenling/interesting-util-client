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
          <el-button type="primary" @click="gotoJsonFormat"> Json 代码美化 </el-button>

          <el-button type="primary" @click="gotoColorConvert"> 颜色进制转换 </el-button>
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

          <el-button type="primary" @click="gotoCalcHeavenlyStemsAndEarthlyBranches"> 天干地支纪年 </el-button>

        </div>

      </el-card>
    </el-col>
  </el-row>

  <footer class="icp">
    <a href="https://beian.miit.gov.cn/" target="_blank">闽ICP备2023011581号</a>
  </footer>
</template>

<script>
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import TopMenu from "./TopMenu.vue";

export default {
  name: "UtilIndex",
  components: {
    TopMenu,
  },
  setup() {
    const router = useRouter();

    /**
     * 转到颜色进制转换
     *
     * @constructor
     */
    function gotoColorConvert() {
      router.push({
        path: "/ColorConvert",
      });
    }

    function gotoJsonFormat() {
      router.push({
        path: "/JsonFormat",
      });
    }

    function GotoBetweenNowToHoliday() {
      router.push({
        path: "/BetweenNowToHoliday",
      });
    }

    /**
     * 计算 BMI
     */
    const gotoCalcBmi = () => {
      ElMessage.error("云胡哥哥正在开发中!");

      // router.push({
      //   path: "/DPlayer",
      // });
    };

    /**
     * 跳转到计算天干地支
     */
    const gotoCalcHeavenlyStemsAndEarthlyBranches = () => {
      router.push({
        path: "/heavenlyStemsAndEarthlyBranches",
      });
    }
    return {
      gotoJsonFormat,
      gotoColorConvert,
      GotoBetweenNowToHoliday,
      gotoCalcBmi,
      gotoCalcHeavenlyStemsAndEarthlyBranches
    };
  },
};
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /*//text-align: center;*/
  /*color: #2c3e50;*/
  margin-top: 60px;
  /*position:relative;*/
}

.title {
  text-align: center;
  margin: 2rem;
  font-size: 1.5rem;
  font-family: "Monotype Corsiva";
  font-weight: bold;
}

.box-card {
  /* display: flex; */
  /*justify-content: center;*/
  /*align-items: center;*/
  /*height: 100vh;*/
  margin-bottom: 20px;
}

.card-header {
  /*background: skyblue;*/
}

.icp {
  /*position: absolute;*/

  /*text-align: center;*/
  position: fixed;
  bottom: 0px;
  left: 45%;
  /*left:0px;*/
}
</style>
