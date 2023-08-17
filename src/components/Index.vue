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
            <span>学习</span>
          </div>
        </template>
        <div>
          <el-button type="primary" @click="GotoYunhuLikeEssay">
            markdown(https://markdown.com.cn/)
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

      <el-card class="box-card">
        <template #header>
          <div>
            <span>网站收藏</span>
          </div>
        </template>
        <div>
          <el-button type="primary" @click="GotoWaitButWhy">
            WaitButWhy
          </el-button>

          <el-button type="primary" @click="GotoChineseMarxists">
            中文马克思主义文库
          </el-button>

          <el-button type="primary" @click="GotoCText">
            中国哲学书电子化计划
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
     * 跳转到云胡图书馆
     *
     * @constructor
     */
    function GotoYunhuLibrary() {
      window.open('http://library.yunhu.wiki', '_blank')
    }

    /**
     * 跳转到文本编辑页面
     *
     * @constructor
     */
    function GotoYunhuUtils() {
      window.open('http://utils.yunhu.wiki', '_blank')
    }

    /**
     * 跳转到云胡喜欢的文章
     *
     * @constructor
     */
    function GotoYunhuLikeEssay() {
      window.open('https://stevenling.github.io/yunhu-love-essay-doc/', '_blank')
    }

    /**
     * 跳转到 WaitButWhy
     *
     * @constructor
     */
    function GotoWaitButWhy() {
      window.open('https://waitbutwhy.com/', '_blank')
    }

    /**
     * 跳转到中文马克思主义文库
     *
     * @constructor
     */
    function GotoChineseMarxists() {
      window.open('https://www.marxists.org/chinese/index.html', '_blank')
    }

    /**
     * 跳转到中国电子书哲学计划
     *
     * @constructor
     */
    function GotoCText() {
      window.open('https://ctext.org/zhs', '_blank')
    }

    return {
      GotoYunhuLibrary,
      GotoYunhuUtils,
      GotoYunhuLikeEssay,
      GotoWaitButWhy,
      GotoChineseMarxists,
      GotoCText
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
