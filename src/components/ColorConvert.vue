<template>
    <!-- <el-breadcrumb :separator-icon="ArrowRight">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/ColorConvert' }">颜色进制转换</el-breadcrumb-item>
    </el-breadcrumb> -->
    <TopMenu></TopMenu>
    <div id="app">
        <el-card class="box-card">
            <template #header>
                <div class="card-header">
                    <div class="title">颜色进制转换</div>
                </div>
            </template>
            <el-row :gutter="120" :span="12">
                <el-col :span="24" class="el-input-content">
                    <div class="rgb-title-class">
                        <p>RGB</p>
                        <div class="smart-recognize-class">

                            <el-tooltip class="box-item" effect="light"
                                content="1. 识别 (30, 80, 255) 格式\n 2. 识别 rgb(123, 200, 67)" placement="top-start">
                                <template #content>
                                    1. 识别 (30, 80, 255) 格式<br />2. 识别 rgb(30, 80, 255) 或者 RGB(30, 80, 255) 格式
                                    <br /> 3. 识别 30, 80, 255 格式
                                    <br /> 4. 识别 30 80 255 格式
                                </template>
                                <el-text @mouseenter="showSmartRecognizeTip">智能识别</el-text>
                            </el-tooltip>

                            <el-input class="el-input-class" v-model="inputRgbColor" placeholder="Please input" clearable />
                            <el-button type="primary" @click="clickRecognize">一键识别</el-button>
                        </div>

                        <div class="single-rgb-class">
                            <el-text>R: </el-text>
                            <el-input class="el-input-single-class" v-model="inputRedColor" placeholder="请输入红色像素值"
                                clearable />

                            <el-text>G: </el-text>
                            <el-input class="el-input-single-class" v-model="inputGreenColor" placeholder="请输入绿色像素值"
                                clearable />

                            <el-text>B: </el-text>
                            <el-input class="el-input-single-class" v-model="inputBlueColor" placeholder="请输入蓝色像素值"
                                clearable />

                            <el-button type="primary" @click="clickCopyRgbColor">复制</el-button>
                        </div>
                    </div>

                    <div class="hex-title-class">
                        <p>HEX</p>
                        <div class="smart-recognize-class">
                            <el-input class="input-hex-color-class" v-model="inputHexColor" placeholder="Please input"
                                clearable />
                            <el-button type="primary" @click="clickCopyHexColor">复制</el-button>
                        </div>

                    </div>

                    <div class="select-color-title-class">
                        <p>取色</p>
                        <el-color-picker v-model="selectColor" @change="clickSelectColor" />
                    </div>

                    <div class="show-color-title-class">
                        <p>当前选择的颜色</p>
                        <el-card class="show-color-el-card-class" :style="{ backgroundColor: selectColor }"></el-card>
                    </div>
                </el-col>
            </el-row>
        </el-card>
    </div>
</template>
  
<script>
import { onMounted, watch, reactive, ref, nextTick } from "vue";
import moment from "moment" // 引入 moment 处理时间
import { ElMessage } from "element-plus";
import useClipboard from "vue-clipboard3"; // 引入剪切板处理
import ArrowRight from '@element-plus/icons-vue'
import TopMenu from "./TopMenu.vue";

export default {
    // name: ColorConvert,
    components: {
        TopMenu
    },
    setup() {
        let selectColor = ref("#FFFFFF");
        const elCardRef = ref();

        const inputHexColor = ref("");
        const inputRgbColor = ref();

        const inputRedColor = ref();
        const inputGreenColor = ref();
        const inputBlueColor = ref();

        async function onMounted() {

        }

        async function clickSelectColor() {
            if (selectColor.value.length == 7) {
                inputHexColor.value = selectColor.value;
                inputRedColor.value = parseInt(selectColor.value.slice(1, 3), 16);
                inputGreenColor.value = parseInt(selectColor.value.slice(3, 5), 16);
                inputBlueColor.value = parseInt(selectColor.value.slice(5, 7), 16);
                console.log(selectColor.value);
                console.log(inputHexColor.value);

                console.log(typeof inputHexColor.value);

                inputRgbColor.value = "";
            }

        }

        /**
         * 监听 16 进制的
         */
        watch(inputHexColor, (newValue, oldValue) => {
            if (newValue !== null && newValue !== undefined && newValue !== "") {
                if (newValue[0] !== '#') {
                    ElMessage.error("颜色格式有误, 请重新输入");
                }
                if (newValue.length === 7) {
                    selectColor.value = newValue;
                }
            }
        });

        watch(() => [inputRedColor.value, inputGreenColor.value, inputBlueColor.value], (newValue, oldValue) => {
            // 10 进制 number 值
            if (newValue[0] && newValue[1] && newValue[2]) {
                let redColor = parseInt(newValue[0], 10);
                let greenColor = parseInt(newValue[1], 10);
                let blueColor = parseInt(newValue[2], 10);

                if (redColor < 0 || redColor > 255 || greenColor < 0 || greenColor > 255 || blueColor < 0 || blueColor > 255
                    || isNaN(redColor) || isNaN(greenColor) || isNaN(blueColor)) {
                    ElMessage.error("RGB 颜色值不可以小于 0 或者大于 255, 请重新输入");
                    return;
                } else {
                    // 16 进制字符串 string  
                    let redHexColor = redColor.toString(16);
                    let greenHexColor = greenColor.toString(16);
                    let blueHexColor = blueColor.toString(16);

                    if (parseInt(redHexColor, 16) < 16) {
                        redHexColor = '0' + redHexColor;
                    }

                    if (parseInt(greenHexColor, 16) < 16) {
                        greenHexColor = '0' + greenHexColor;
                    }

                    if (parseInt(blueHexColor, 16) < 16) {
                        blueHexColor = '0' + blueHexColor;
                    }

                    inputHexColor.value = '#' + redHexColor + greenHexColor + blueHexColor;
                }
            }
        })


        /**
         * 一键识别
         */
        function clickRecognize() {
            // 1. 匹配 (123, 200, 150)
            const regexFirst = /\((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\s*,\s*(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\s*,\s*(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\)/;
            const match = inputRgbColor.value.match(regexFirst);

            if (match) {
                inputRedColor.value = parseInt(match[1], 10).toString();
                inputGreenColor.value = parseInt(match[2], 10).toString();
                inputBlueColor.value = parseInt(match[3], 10).toString();
                return;
            }

            // 2. 匹配 rgb(123, 200, 67) 或者 RGB(123, 200, 67)
            const regexSecond = /(rgb|RGB)\((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\s*,\s*(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\s*,\s*(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\)/;
            const matchSecond = inputRgbColor.value.match(regexSecond);

            if (matchSecond) {
                inputRedColor.value = parseInt(matchSecond[2], 10).toString();
                inputGreenColor.value = parseInt(matchSecond[3], 10).toString();
                inputBlueColor.value = parseInt(matchSecond[4], 10).toString();
                return;
            }

            // 3. 匹配 123 200 67
            const regexThird = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\s+(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\s+(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
            const matchThird = inputRgbColor.value.match(regexThird);

            if (matchThird) {
                inputRedColor.value = parseInt(matchThird[1], 10).toString();
                inputGreenColor.value = parseInt(matchThird[2], 10).toString();
                inputBlueColor.value = parseInt(matchThird[3], 10).toString();
                return;
            }

            // 4. 匹配 123, 200, 67
            const regexFourth = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?),\s*(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?),\s*(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
            const matchFourth = inputRgbColor.value.match(regexFourth);

            if (matchFourth) {
                inputRedColor.value = parseInt(matchFourth[1], 10).toString();
                inputGreenColor.value = parseInt(matchFourth[2], 10).toString();
                inputBlueColor.value = parseInt(matchFourth[3], 10).toString();
                return;
            }

            ElMessage.error("智能识别失败, 请检查 RGB 格式");
        }

        /**
         * 复制 16 进制颜色值
         */
        async function clickCopyHexColor() {
            const { toClipboard } = useClipboard();
            try {
                await toClipboard(inputHexColor.value);
                ElMessage.success("复制 16 进制颜色值成功")
            } catch (e) {
                console.error(e);
                ElMessage.error("复制 16 进制颜色值失败");
            }
        }

        /**
         * 复制 rgb 颜色值
         */
        const clickCopyRgbColor = (async () => {
            const { toClipboard } = useClipboard();
            try {
                const rgbColor = "rgb(" + inputRedColor.value + ", " + inputGreenColor.value + ", " + inputBlueColor.value + ")";
                await toClipboard(rgbColor);
                ElMessage.success("复制 RGB 颜色值成功")
            } catch (e) {
                console.error(e);
                ElMessage.error("复制 RGB 进制颜色值失败");
            }
        })

        /**
         * 显示智能识别的类型
         */
        const showSmartRecognizeTip = (() => {

        })

        return {
            onMounted,
            clickSelectColor,
            clickRecognize,
            clickCopyHexColor,
            clickCopyRgbColor,
            showSmartRecognizeTip,
            elCardRef,
            selectColor,
            inputHexColor,
            inputRgbColor,
            inputRedColor,
            inputGreenColor,
            inputBlueColor
        }
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

.rgb-title-class {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-content: flex-start;
    text-align: left;
}

.smart-recognize-class {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    height: 30px;
    margin-top: 20px;
}

.el-input-class {
    width: 300px;
    margin-left: 20px;
    margin-right: 20px;
}

.single-rgb-class {
    margin-top: 20px;
}

.el-input-single-class {
    width: 150px;
    margin-left: 20px;
    margin-right: 20px;
}

.hex-title-class {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-content: flex-start;
    text-align: left;
    margin-top: 20px;
}

.select-color-title-class {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-content: flex-start;
    text-align: left;
    margin-top: 20px;
}

:root {
    --card-color: #4d4e53;
}

.color-el-card-class {
    color: var(--card-color);
}

.show-color-el-card-class {
    height: 200px;
}

.input-hex-color-class {
    width: 150px;
    margin-right: 20px;
}

.title {
    font-size: 18px;
    font-weight: bold;
}
</style>