<template>
  <TopMenu></TopMenu>
  <div id="app">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <div class="title">Json 格式化</div>
          <div class="el-button-list">
            <el-button class="button" type="primary" @click="clickDownload"
              >下载</el-button
            >
          </div>
        </div>
      </template>
      <el-row :gutter="40">
        <el-col :span="12" class="el-input-content">
          <div class="json-title">
            待格式化 Json
            <el-button class="clear-and-copy-button" type="danger" @click="clickClear"
              >清空</el-button
            >
          </div>
          <el-input
            v-model="currentJson.oldJson"
            :rows="23"
            type="textarea"
            placeholder="请输入待格式化 JSON 字符串"
            class="el-input-class"
          />
        </el-col>

        <el-col :span="12" class="el-input-content">
          <div class="json-title">
            格式化后的 Json
            <el-button class="clear-and-copy-button" type="success" @click="clickCopy"
              >复制到剪贴板</el-button
            >
          </div>
          <highlightjs
            language="json"
            :code="currentJson.formatJson"
            class="highlight-json"
          />
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, watch, reactive } from "vue";
import { ElMessage } from "element-plus";
import moment from "moment";
import useClipboard from "vue-clipboard3";
import TopMenu from "./TopMenu.vue";

/**
 * @constant
 * @type {number}
 * @description JSON 格式化的缩进空格数
 */
const JSON_FORMAT_SPACE = 4;

const currentJson = reactive({ oldJson: "", formatJson: "" });

onMounted(() => {
  document.querySelector("body").setAttribute("style", "background: #EBEDF0");
});

/**
 * @function debounce
 * @description 防抖函数，避免高频触发
 * @param {Function} fn 需要防抖的函数
 * @param {number} delay 延迟时间（毫秒）
 * @returns {Function}
 */
function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * @description 监听用户输入的 JSON 字符串，自动格式化
 * @param {string} newValue 用户输入的新值
 */
watch(
  () => currentJson.oldJson,
  debounce((newValue) => {
    if (typeof newValue === "string" && newValue.trim() !== "") {
      try {
        const jsonObj = JSON.parse(newValue);
        currentJson.formatJson = JSON.stringify(jsonObj, null, JSON_FORMAT_SPACE);
      } catch (e) {
        currentJson.formatJson = "";
        ElMessage.error("待格式化的 Json 有误，请检查");
      }
    } else {
      currentJson.formatJson = "";
    }
  }, 300)
);

/**
 * @function clickDownload
 * @description 下载格式化后的 JSON 文件
 * @returns {void}
 */
function clickDownload() {
  if (!currentJson.formatJson) {
    ElMessage.error("下载空 Json 没有意义");
    return;
  }
  let eleLink = document.createElement("a");
  const fileName = moment().format("YYYY-MM-DD-hh-mm-ss");
  eleLink.download = fileName + ".json";
  eleLink.style.display = "none";
  let blob = new Blob([currentJson.formatJson], { type: "text/json" });
  eleLink.href = URL.createObjectURL(blob);
  document.body.appendChild(eleLink);
  eleLink.click();
  document.body.removeChild(eleLink);
}

/**
 * @function clickClear
 * @description 清空输入和输出内容
 * @returns {void}
 */
function clickClear() {
  if (!currentJson.oldJson) {
    ElMessage.info("已经清空了，没必要再次清空");
    return;
  }
  currentJson.formatJson = "";
  currentJson.oldJson = "";
}

/**
 * @function clickCopy
 * @description 复制格式化后的 JSON 到剪贴板
 * @returns {Promise<void>}
 */
async function clickCopy() {
  const { toClipboard } = useClipboard();
  if (!currentJson.formatJson) {
    ElMessage.error("无法复制空的 json ");
    return;
  }
  try {
    await toClipboard(currentJson.formatJson);
    ElMessage.success("复制格式化后的 json 到剪贴板成功");
  } catch (e) {
    console.error(e);
    ElMessage.error("复制格式化后的 json 到剪贴板失败");
  }
}
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
  width: 80%;
  text-align: center;
}

.title {
  font-size: 1.5rem;
  font-weight: bold;
  font-family: Arial, "Microsoft YaHei", serif;
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
  font-size: 1.125rem;
  /* 18px */
  width: 40rem;
}

.json-title {
  font-size: 1.125rem;
  margin: 1rem;
}

.el-input-class {
  font-size: 1rem;
}

.el-button-list {
  margin-left: 2rem;
}

.highlight-json {
  text-align: left;
  font-size: 1.125rem;
  /* 18px */
  /*width: 25rem;*/
  height: 100%;
}
</style>
