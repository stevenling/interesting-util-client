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
  margin: 0;
  padding: 0;
  background: #ebedf0;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background: #ebedf0;
}

.box-card {
  margin: 1rem auto 0 auto;
  width: 90%;
  max-width: 1100px;
  text-align: center;
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.08), 0 1.5px 4px 0 rgba(0,0,0,0.03);
  border-radius: 18px;
  background: #fff;
  border: none;
  padding-bottom: 0.5rem;
}

.title {
  font-size: 2.2rem;
  font-weight: 700;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
  margin: 1.2rem 0 0.5rem 0;
  color: #2d8cf0;
  letter-spacing: 2px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem 1.2rem 0.3rem 1.2rem;
  background: transparent;
  border-bottom: 1px solid #f0f0f0;
  border-radius: 18px 18px 0 0;
}

.el-button-list {
  margin-left: 1rem;
}

.button {
  color: #fff;
  margin-left: 0.7rem;
  border-radius: 6px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(45,140,240,0.08);
  transition: background 0.2s;
}
.button:hover {
  background: #1765ad;
}

.clear-and-copy-button {
  margin-left: 1rem;
  border-radius: 6px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(45,140,240,0.08);
  transition: background 0.2s;
}

.el-input-content {
  font-size: 1.08rem;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  background: #f8fafc;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
  padding: 0.3rem 0.3rem 0.3rem 0.3rem;
  border: 1px solid #e6e8eb;
  min-height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.json-title {
  font-size: 1.08rem;
  margin: 0 0 0.3rem 0;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.el-input-class {
  font-size: 0.98rem;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e6e8eb;
  min-height: 36px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.02);
  margin-bottom: 0.3rem;
}

.highlight-json {
  text-align: left;
  font-size: 1.08rem;
  background: #f6f8fa;
  border-radius: 8px;
  border: 1px solid #e6e8eb;
  min-height: 36px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.02);
  padding: 0.3rem;
  overflow-x: auto;
}

@media (max-width: 900px) {
  .box-card {
    width: 98%;
    padding: 0 0.3rem;
  }
  .el-input-content {
    max-width: 100%;
    min-height: 36px;
    padding: 0.2rem 0.1rem 0.1rem 0.1rem;
  }
  .el-input-class, .highlight-json {
    min-height: 24px;
    font-size: 0.92rem;
  }
}

@media (max-width: 600px) {
  .box-card {
    width: 100%;
    margin: 0;
    border-radius: 0;
    box-shadow: none;
  }
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 0.5rem 0.2rem 0.2rem 0.2rem;
  }
  .title {
    font-size: 1.1rem;
    margin: 0.7rem 0 0.3rem 0;
  }
  .el-input-content {
    min-height: 24px;
    padding: 0.1rem 0.05rem 0.05rem 0.05rem;
  }
}
</style>
