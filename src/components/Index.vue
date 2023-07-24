<template>
  <div class = "title">云胡工具集合</div>
  <el-row>
    <el-col :span="6"></el-col>
    <el-col :span="12">
      <div/>
      <el-card class="box-card">
        <template #header>
          <div>
            <span>程序员工具</span>
          </div>
        </template>
        <div>
          <el-button type="primary" @click="GotoJsonFormat">
            Json 代码美化
          </el-button>
          <el-button type="primary" @click="GotoColorSystemSwitch">
            颜色进制转换
          </el-button>
        </div>
      </el-card>
    </el-col>
  </el-row>


</template>

<script>
// import { isDark } from './composables/dark'
// import { isDark } from '~/com'

import {ElMessage} from "element-plus";
import { useRouter} from "vue-router";

export default {
  // name: 'index',
  // components: {
  //
  // },
  name: "index",
  setup() {
    const router = useRouter();

    /**
     * 转到 Json 格式化工具中
     *
     * @constructor
     */
    function GotoColorSystemSwitch() {
      ElMessage.info("云胡哥哥努力开发中");
    }

    function GotoJsonFormat() {
      router.push({
        path: "/JsonFormat"
      });
    }

    return {
      GotoJsonFormat,
      GotoColorSystemSwitch
    }
  }
}
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
  /*display: flex;*/
  /*justify-content: center;*/
  /*align-items: center;*/
  /*height: 100vh;*/
}

.card-header {
  /*background: skyblue;*/

}
</style>
