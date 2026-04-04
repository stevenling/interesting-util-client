<template>
  <div
    class="matrix-root relative min-h-screen flex flex-col overflow-hidden text-slate-900 dark:text-neutral-100"
  >
    <div
      class="pointer-events-none fixed inset-0 -z-10 matrix-bg-base"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none fixed -top-32 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full matrix-blob matrix-blob-a blur-3xl opacity-90"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none fixed top-[28%] -right-24 h-[28rem] w-[28rem] rounded-full matrix-blob matrix-blob-b blur-3xl opacity-80"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none fixed bottom-0 left-0 h-[22rem] w-[22rem] rounded-full matrix-blob matrix-blob-c blur-3xl opacity-70"
      aria-hidden="true"
    />

    <div class="relative flex-1 min-h-0 flex flex-col">
      <div class="flex-1 min-h-0 px-4 sm:px-6 py-6 flex flex-col">
        <div class="max-w-4xl mx-auto w-full flex-1 flex flex-col min-h-0">
          <router-link
            to="/utilIndex"
            class="mb-3 shrink-0 inline-block text-sm text-slate-500 hover:text-slate-800 dark:text-neutral-500 dark:hover:text-neutral-200 transition-colors duration-300"
          >
            ← 
          </router-link>

          <div
            class="matrix-tool-panel flex-1 flex flex-col min-h-0 overflow-hidden"
          >
            <header class="matrix-tool-panel-header shrink-0 px-5 py-4">
              <p
                class="text-[0.6875rem] sm:text-xs font-medium tracking-[0.22em] uppercase text-slate-500 dark:text-neutral-500 mb-2"
              >
                Utilities
              </p>
              <h1 class="title text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                颜色进制转换
              </h1>
            </header>

            <div class="p-4 sm:p-5 flex-1 overflow-auto min-h-0">
              <div class="cc-section">
                <p class="cc-block-title">RGB</p>
                <div class="cc-row cc-row--wrap">
                  <el-tooltip class="box-item" effect="light" placement="left-start">
                    <template #content>
                      1. 识别 (30, 80, 255) 格式<br />2. 识别 rgb(30, 80, 255) 或者 RGB(30,
                      80, 255) 格式 <br />
                      3. 识别 30, 80, 255 格式 <br />
                      4. 识别 30 80 255 格式
                    </template>
                    <el-text class="cc-hint">智能识别</el-text>
                  </el-tooltip>

                  <el-input
                    v-model="inputRgbColor"
                    class="cc-input-wide"
                    placeholder="请输入 RGB 颜色值"
                    clearable
                  />
                  <el-button class="cc-btn cc-btn-solid" @click="clickRecognize">一键识别</el-button>
                </div>

                <div class="cc-row cc-row--wrap cc-row--tight">
                  <span class="cc-label">R</span>
                  <el-input
                    v-model="inputRedColor"
                    class="cc-input-narrow"
                    placeholder="红 0–255"
                    clearable
                  />
                  <span class="cc-label">G</span>
                  <el-input
                    v-model="inputGreenColor"
                    class="cc-input-narrow"
                    placeholder="绿 0–255"
                    clearable
                  />
                  <span class="cc-label">B</span>
                  <el-input
                    v-model="inputBlueColor"
                    class="cc-input-narrow"
                    placeholder="蓝 0–255"
                    clearable
                  />
                  <el-button class="cc-btn cc-btn-solid" @click="clickCopyRgbColor">复制</el-button>
                </div>
              </div>

              <div class="cc-section">
                <p class="cc-block-title">HEX</p>
                <div class="cc-row cc-row--wrap">
                  <el-input
                    v-model="inputHexColor"
                    class="cc-input-hex"
                    placeholder="请输入 HEX 颜色值"
                    clearable
                  />
                  <el-button class="cc-btn cc-btn-solid" @click="clickCopyHexColor">复制</el-button>
                </div>
              </div>

              <div class="cc-section">
                <p class="cc-block-title">取色</p>
                <el-color-picker v-model="selectColor" @change="clickSelectColor" />
              </div>

              <div class="cc-section">
                <p class="cc-block-title">当前选择的颜色</p>
                <div
                  class="cc-swatch"
                  :style="{ backgroundColor: selectColor }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer
        class="matrix-footer shrink-0 relative border-t border-black/[0.06] dark:border-white/[0.08] py-8 px-6"
      >
        <div class="text-center">
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            class="text-[13px] text-slate-500 hover:text-slate-800 dark:text-neutral-500 dark:hover:text-neutral-200 transition-colors duration-300"
          >
            闽ICP备2023011581号
          </a>
        </div>
      </footer>
    </div>
  </div>
</template>

<script>
import "../../styles/matrix-page.css";
import { watch, ref } from "vue";
import { ElMessage } from "element-plus";
import useClipboard from "vue-clipboard3";

export default {
  setup() {
    const selectColor = ref("#FFFFFF");
    const inputHexColor = ref("");
    const inputRgbColor = ref();

    const inputRedColor = ref();
    const inputGreenColor = ref();
    const inputBlueColor = ref();

    /**
     * 在取色板中取色
     */
    const clickSelectColor = async () => {
      if (selectColor.value.length == 7) {
        inputHexColor.value = selectColor.value;
        inputRedColor.value = parseInt(selectColor.value.slice(1, 3), 16);
        inputGreenColor.value = parseInt(selectColor.value.slice(3, 5), 16);
        inputBlueColor.value = parseInt(selectColor.value.slice(5, 7), 16);
        inputRgbColor.value = "";
      }
    };

    /**
     * 监听 16 进制的颜色值
     */
    watch(inputHexColor, (newValue, oldValue) => {
      if (newValue !== null && newValue !== undefined && newValue !== "") {
        if (newValue[0] !== "#") {
          ElMessage.error("颜色格式有误, 请重新输入");
        }
        if (newValue.length === 7) {
          selectColor.value = newValue;
          clickSelectColor();
        }
      }
    });

    watch(
      () => [inputRedColor.value, inputGreenColor.value, inputBlueColor.value],
      (newValue, oldValue) => {
        // 10 进制 number 值
        if (newValue[0] && newValue[1] && newValue[2]) {
          let redColor = parseInt(newValue[0]);
          let greenColor = parseInt(newValue[1]);
          let blueColor = parseInt(newValue[2]);

          if (
            redColor < 0 ||
            redColor > 255 ||
            greenColor < 0 ||
            greenColor > 255 ||
            blueColor < 0 ||
            blueColor > 255 ||
            isNaN(redColor) ||
            isNaN(greenColor) ||
            isNaN(blueColor)
          ) {
            ElMessage.error("RGB 颜色值不可以小于 0 或者大于 255, 请重新输入");
            return;
          } else {
            // 16 进制字符串 string
            let redHexColor = redColor.toString(16);
            let greenHexColor = greenColor.toString(16);
            let blueHexColor = blueColor.toString(16);

            if (parseInt(redHexColor, 16) < 16) {
              redHexColor = "0" + redHexColor;
            }

            if (parseInt(greenHexColor, 16) < 16) {
              greenHexColor = "0" + greenHexColor;
            }

            if (parseInt(blueHexColor, 16) < 16) {
              blueHexColor = "0" + blueHexColor;
            }

            inputHexColor.value = "#" + redHexColor + greenHexColor + blueHexColor;
          }
        }
      }
    );

    /**
     * 一键识别
     */
    const clickRecognize = () => {
      // 1. 匹配 (123, 200, 67)
      const regexFirst = /\s*\((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\s*,\s*(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\s*,\s*(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\)\s*/;
      const match = inputRgbColor.value.match(regexFirst);

      if (match) {
        inputRedColor.value = parseInt(match[1], 10).toString();
        inputGreenColor.value = parseInt(match[2], 10).toString();
        inputBlueColor.value = parseInt(match[3], 10).toString();
        return;
      }

      // 2. 匹配 rgb(123, 200, 67) 或者 RGB(123, 200, 67)
      const regexSecond = /\s*(rgb|RGB)\((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\s*,\s*(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\s*,\s*(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\)/;
      const matchSecond = inputRgbColor.value.match(regexSecond);

      if (matchSecond) {
        inputRedColor.value = parseInt(matchSecond[2], 10).toString();
        inputGreenColor.value = parseInt(matchSecond[3], 10).toString();
        inputBlueColor.value = parseInt(matchSecond[4], 10).toString();
        return;
      }

      // 3. 匹配 123 200 67
      const regexThird = /^\s*(\s*25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\s+(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\s+(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\s*$/;
      const matchThird = inputRgbColor.value.match(regexThird);

      if (matchThird) {
        inputRedColor.value = parseInt(matchThird[1], 10).toString();
        inputGreenColor.value = parseInt(matchThird[2], 10).toString();
        inputBlueColor.value = parseInt(matchThird[3], 10).toString();
        return;
      }

      // 4. 匹配 123, 200, 67
      const regexFourth = /^\s*(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?),\s*(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?),\s*(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\s*$\s*/;
      const matchFourth = inputRgbColor.value.match(regexFourth);

      if (matchFourth) {
        inputRedColor.value = parseInt(matchFourth[1], 10).toString();
        inputGreenColor.value = parseInt(matchFourth[2], 10).toString();
        inputBlueColor.value = parseInt(matchFourth[3], 10).toString();
        return;
      }

      ElMessage.error("智能识别失败, 请检查 RGB 格式");
    };

    /**
     * 复制 16 进制颜色值
     */
    const clickCopyHexColor = async () => {
      const { toClipboard } = useClipboard();
      try {
        await toClipboard(inputHexColor.value);
        ElMessage.success("复制 16 进制颜色值成功");
      } catch (e) {
        console.error(e);
        ElMessage.error("复制 16 进制颜色值失败");
      }
    };

    /**
     * 复制 rgb 颜色值
     */
    const clickCopyRgbColor = async () => {
      const { toClipboard } = useClipboard();
      try {
        const rgbColor =
          "rgb(" +
          inputRedColor.value +
          ", " +
          inputGreenColor.value +
          ", " +
          inputBlueColor.value +
          ")";
        await toClipboard(rgbColor);
        ElMessage.success("复制 RGB 颜色值成功");
      } catch (e) {
        console.error(e);
        ElMessage.error("复制 RGB 进制颜色值失败");
      }
    };

    return {
      clickSelectColor,
      clickRecognize,
      clickCopyHexColor,
      clickCopyRgbColor,
      selectColor,
      inputHexColor,
      inputRgbColor,
      inputRedColor,
      inputGreenColor,
      inputBlueColor,
    };
  },
};
</script>

<style scoped>
.cc-section {
  margin-bottom: 1.5rem;
}

.cc-section:last-child {
  margin-bottom: 0;
}

.cc-block-title {
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgb(100 116 139);
  margin: 0 0 0.75rem 0;
}

@media (prefers-color-scheme: dark) {
  .cc-block-title {
    color: rgb(163 163 163);
  }
}

.cc-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.75rem 1rem;
}

.cc-row--wrap {
  flex-wrap: wrap;
}

.cc-row--tight {
  margin-top: 0.75rem;
}

.cc-hint {
  color: rgb(71 85 105);
  cursor: default;
  font-size: 0.875rem;
}

@media (prefers-color-scheme: dark) {
  .cc-hint {
    color: rgb(148 163 184);
  }
}

.cc-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(71 85 105);
  min-width: 1.25rem;
}

@media (prefers-color-scheme: dark) {
  .cc-label {
    color: rgb(203 213 225);
  }
}

.cc-input-wide {
  width: min(100%, 18rem);
}

.cc-input-narrow {
  width: min(100%, 7rem);
}

.cc-input-hex {
  width: min(100%, 12rem);
}

.cc-swatch {
  height: 10rem;
  max-width: 24rem;
  border-radius: 0.75rem;
  border: 1px solid rgb(0 0 0 / 0.08);
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
}

@media (prefers-color-scheme: dark) {
  .cc-swatch {
    border-color: rgb(255 255 255 / 0.12);
  }
}

.cc-btn.el-button {
  font-weight: 500;
  border-radius: 0.5rem;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.cc-btn-solid.el-button {
  background-color: rgb(51 65 85);
  border-color: rgb(51 65 85);
  color: rgb(248 250 252);
}

.cc-btn-solid.el-button:hover {
  background-color: rgb(71 85 105);
  border-color: rgb(71 85 105);
  color: rgb(255 255 255);
}

@media (prefers-color-scheme: dark) {
  .cc-btn-solid.el-button {
    background-color: rgb(71 85 105);
    border-color: rgb(100 116 139);
    color: rgb(244 244 245);
  }

  .cc-btn-solid.el-button:hover {
    background-color: rgb(100 116 139);
    border-color: rgb(148 163 184);
    color: rgb(255 255 255);
  }
}
</style>
