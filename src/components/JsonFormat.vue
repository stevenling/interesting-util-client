<template>
  <div class = "app">
  <el-card class = "box-card">
    <template #header>
      <div class="card-header">
        <span class = "header">JSON 格式化</span>
        <el-button class="button"  type="primary">下载</el-button>
      </div>
    </template>
    <el-row :gutter="40">
        <el-col :span = "12">
          <h3>待格式化 JSON</h3>
          <el-input
              v-model="oldJson"
              :rows="15"
              type="textarea"
              placeholder="请输入待格式化 JSON 字符串"
              class = "el-input-class"
          />
        </el-col>

        <el-col :span = "12">
          <h3>格式化后的 JSON</h3>
          <el-input
              v-model="formatJson"
              :rows="15"
              type="textarea"
              class = "el-input-class"
          />
        </el-col>
    </el-row>
  </el-card>
  </div>
</template>

<script>
import { ref, onMounted, watch } from "vue";
// import {beforeCreate, beforeDestroy } from "vue";
export default {
  setup() {
    const oldJson = ref();
    const formatJson = ref();

    onMounted(() => {
      document.querySelector('body').setAttribute('style', 'background: #EBEDF0');
    })
    /**
     * 监听原来的 json 字符串
     */
    watch(oldJson, (newValue, oldValue) => {
      // 把 json 字符串转为 json 对象
      let jsonObj = JSON.parse(newValue);
      formatJson.value = JSON.stringify(jsonObj, null, 4);
    });

    return  {
      oldJson,
      formatJson,
      onMounted
    }
  }
}
</script>

<style scoped>

/*body::before{*/
/*  background: #EBEDF0;*/
/*}*/

.app{
  background: #EBEDF0;
}

.box-card {
  /* 表示上下边界为 0，左右则根据宽度自适应相同值 */
  margin: 0 auto;
  width: 50%;
  text-align: center;
  /*background: honeydew;*/
}

.header {
  font-size: 20px; /* 字体大小 */
  font-weight: bold; /* 字体加粗 */
  margin-right: 20px;
  top: 50px;
  /*width: 50%;*/
}

.card-header {
  color: black;
  /*background: steelblue;*/
  height: 60px;
}

.button {
  color: #fffdf2;
}

.el-input-class {
  font-size: 18px;
}
</style>