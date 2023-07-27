<template>
  <div id = "app">
  <el-card class = "box-card">
    <template #header>
      <div class="card-header">
        <div class = "title">Json 格式化</div>
        <div class = "el-button-list">
          <el-button class="button"  type="primary" @click="clickDownload">下载</el-button>
        </div>
      </div>
    </template>
    <el-row :gutter="120">
        <el-col :span = "12" class = "el-input-content">
          <div class = "json-title">待格式化 Json
            <el-button class="clear-and-copy-button"  type="danger" @click="clickClear">清空</el-button>
          </div>
            <el-input
                v-model="currentJson.oldJson"
                :rows="23"
                type="textarea"
                placeholder="请输入待格式化 JSON 字符串"
                class = "el-input-class"
            />
        </el-col>

        <el-col :span = "12" class = "el-input-content">
          <div class = "json-title">格式化后的 Json
            <el-button class="clear-and-copy-button"  type="success" @click="clickCopy">复制到剪贴板</el-button>
          </div>
          <highlightjs language='json' :code= "currentJson.formatJson" class = "highlight-json"/>
        </el-col>
    </el-row>
  </el-card>
  </div>
</template>

<script>
import  moment  from "moment" // 引入 moment 处理时间
import {onMounted, watch, reactive} from "vue";
import {ElMessage} from "element-plus";
import useClipboard from "vue-clipboard3"; // 引入剪切板处理

export default {
  setup() {
    let currentJson = reactive({oldJson: "", formatJson: ""});
    onMounted(() => {
      document.querySelector('body').setAttribute('style', 'background: #EBEDF0');
    })

    /**
     * 监听原来的未格式化的 json 字符串，必须使用 try catch 异常处理，否则会报错
     * 用箭头函数来监听 reactive 中的某个基本数据
     * @param oldJson 用户输入的未格式化的 json 字符串，最开始是空
     * @param newValue 用户改变后的新的值
     */
    watch(() => currentJson.oldJson, (newValue, oldValue) => {
      console.log("newValue" + newValue);
      const jsonFormatSpace = 4; // json 格式化的缩进
      if (typeof newValue == "string" && newValue !== "" && newValue != null) {
        try {
          // 把 json 字符串转为 json 对象
          let newValueJsonObject = JSON.parse(newValue);
          // 将 json 对象通过 4 个缩进格式化，实现美化功能
          currentJson.formatJson = JSON.stringify(newValueJsonObject, null, jsonFormatSpace);
        } catch (e) {
          ElMessage.error('待格式化的 Json 有误，请检查');
          console.log(e);
          currentJson.formatJson = '';
        }
      }
      if (newValue === "") {
        currentJson.formatJson = '';
      }
    });

    /**
     * 点击下载
     */
    function clickDownload() {
      if (currentJson.formatJson === "") {
        ElMessage.error('下载空 Json 没有意义');
        return;
      }

      let eleLink = document.createElement("a");
      const fileName = moment().format('YYYY-MM-DD-hh-mm-ss');

      eleLink.download = fileName + '.json';
      eleLink.style.display = "none";
      // 字符内容转变成 blob 地址
      let blob = new Blob([currentJson.formatJson], {type: "text/json"});
      eleLink.href = URL.createObjectURL(blob);
      // 触发点击
      document.body.appendChild(eleLink);
      eleLink.click();
      // 然后移除
      document.body.removeChild(eleLink);
    }

    /**
     * 点击清空
     */
    function clickClear() {
      if (currentJson.oldJson === '') {
        ElMessage.info('已经清空了，没必要再次清空');
      }
      currentJson.formatJson = '';
      currentJson.oldJson = '';
    }

    /**
     * 点击复制 json 到剪切板
     */
    async function clickCopy() {
      console.log("clickCopy");
      const {toClipboard} = useClipboard();
      if (currentJson.formatJson == null || currentJson.formatJson === "") {
        ElMessage.error("无法复制空的 json ");
        return;
      }
      try {
        await toClipboard(currentJson.formatJson);
        ElMessage.success("复制格式化后的 json 到剪切板成功")
      } catch (e) {
        console.error(e);
        ElMessage.error("复制格式化后的 json 到剪切板失败");
      }
    }

    return  {
      currentJson,
      onMounted,
      clickDownload,
      clickClear,
      clickCopy
    }
  }
}
</script>

<style scoped>
html, body {
  width: 100%;
  height: 100%;
}
.app{
  background: #EBEDF0;
}

.box-card {
  /* 表示上下边界为 0，左右则根据宽度自适应相同值 */
  /*display: flex;*/
  /*position: absolute;*/

  margin: 1rem auto;
  width: 50%;
  text-align: center;
}

.title {
  font-size: 1.5rem;
  font-weight: bold;
  font-family: Arial, "Microsoft YaHei";
  margin: 2rem;
}

.card-header {
}

.button {
  color: #fffdf2;
  margin-left: 1rem;
}

.clear-and-copy-button {
  margin-left: 5rem;
}

.el-input-content {
  font-size: 1.125rem; /* 18px */
  width: 25rem;
}

.json-title {
  font-size: 1.125rem;
  margin: 1rem;
}

.el-input-class {
  font-size: 1.0rem;
}

.el-button-list {
  margin-left: 2rem;
}

.highlight-json {
  text-align: left;
  font-size: 1.125rem; /* 18px */
  /*width: 25rem;*/
  height: 100%;

}
</style>