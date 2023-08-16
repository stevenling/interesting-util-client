<template>
  <div class = "title">云胡个人站</div>
  <el-row>
    <el-col :span="6"></el-col>
    <el-col :span="12">
      <div/>
      <el-card class="box-card">
        <template #header>
          <div>
            <span>云胡作品</span>
          </div>
        </template>
        <div>
          <el-button type="primary" @click="GotoYunhuLibrary">
            云胡图书馆
          </el-button>
          <el-button type="primary" @click="GotoYunhuUtils">
            云胡工具集合
          </el-button>
        </div>
      </el-card>
      <el-card class="box-card">
        <template #header>
          <div>
            <span>其他</span>
          </div>
        </template>
        <div>
          <el-button type="primary" @click="GotoYunhuLikeEssay">
            云胡喜欢的文章
          </el-button>
        </div>
      </el-card>
    </el-col>
  </el-row>
<footer  class = "icp">
  <a href="https://beian.miit.gov.cn/" target="_blank">闽ICP备2023011581号</a>
</footer >
</template>

<script>
import {useRouter} from "vue-router";
import {ElMessage} from "element-plus";
export default {
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

    /**
     * 跳转到云胡图书馆
     *
     * @constructor
     */
    function GotoYunhuLibrary() {
      window.open('http://library.yunhu.wiki', '_bank')
    }

    /**
     * 跳转到文本编辑页面
     *
     * @constructor
     */
    function GotoYunhuUtils() {
      window.open('http://utils.yunhu.wiki', '_bank')
    }

    return {
      GotoYunhuLibrary,
      GotoYunhuUtils
    }
  }
}
</script>

<style scoped>

.box-card {
  margin-bottom: 2rem;
  /*display: flex;*/
  /*justify-content: center;*/
  /*align-items: center;*/
  /*height: 100vh;*/
}

.title {
  text-align: center;
  margin: 2rem;
  font-size: 1.5rem;
  font-family: "Monotype Corsiva",serif;
  font-weight: bold;
}

.card-header {
  /*background: skyblue;*/

}

.icp {
  //position: absolute;

  //text-align: center;
  position:fixed;
  bottom: 0px;
  left: 45%;
  //left:0px;
}
</style>
