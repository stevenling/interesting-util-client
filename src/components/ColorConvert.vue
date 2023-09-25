<template>
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
                            <el-text>智能识别</el-text>
                            <el-input class="el-input-class" v-model="input" placeholder="Please input" clearable />
                            <el-button type="primary">一键识别</el-button>
                        </div>

                        <div class="single-rgb-class">
                            <el-text>R: </el-text>
                            <el-input class="el-input-single-class" v-model="input" placeholder="请输入红色像素值" clearable />

                            <el-text>G: </el-text>
                            <el-input class="el-input-single-class" v-model="input" placeholder="请输入绿色像素值" clearable />

                            <el-text>B: </el-text>
                            <el-input class="el-input-single-class" v-model="input" placeholder="请输入蓝色像素值" clearable />
                        </div>
                    </div>

                    <div class="hex-title-class">
                        <p>HEX</p>
                        <div class="smart-recognize-class">
                            <el-input v-model="input" placeholder="Please input" clearable />
                        </div>
                    </div>

                    <div class="select-color-title-class">
                        <p>取色</p>
                        <el-color-picker v-model="selectColor" @change="clickSelectColor" />
                    </div>

                    <div class="show-color-title-class">
                        <p>当前选择的颜色</p>
                        <el-card :style="{ backgroundColor: selectColor }">dddddd</el-card>

                        <el-text color="{{selectColor}}"> dfsfs</el-text>
                    </div>
                </el-col>
            </el-row>

            <el-row :gutter="120" :span="12">
                <el-col :span="12" class="el-input-content">

                </el-col>

                <el-col :span="12" class="el-input-content">

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

export default {
    setup() {
        let selectColor = ref("#123456");

        const elCardRef = ref();

        async function onMounted() {
            ElMessage.success(selectColor.value);
            await nextTick();

            // elCardRef.value.style.color = selectColor.value;
            // document.body.style.setProperty('--card-color', selectColor.value);
        }

        async function clickSelectColor() {
            // ElMessage.success(selectColor.value);
            // console.log('elCardRef', elCardRef);
            // await nextTick();
            // elCardRef.value.style.color = selectColor.value;

            // elCardRef.value.style.background = selectColor.value;
            // elCardRef.value
        }

        return {
            onMounted,
            clickSelectColor,
            elCardRef,
            selectColor
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
</style>