# 云胡工具集 02: 颜色进制转换

## 一、前言
在进行网页样式设计的时候，很多时候会模仿别人网站设计的颜色之类的。

微信的截图工具 `alt` + `a` 可以取色，上面显示了当前像素的 `RGB` 值，而我平常更习惯用 `16` 进制的 `HEX`颜色值，因此需要将 `RGB` 转为 `HEX`。

有非常多的工具网站有实现这个功能，但我记不住这些网站名，而且它们不支持各种格式的 `RGB`转换，于是打算自己造个轮子。
## 二、布局
这次布局我采用 `flex`布局，里面再嵌套 `flex`，很方便实现自己想要的布局。

## 三、知识点

### 3.1 `parseInt` 
`parseInt` 是 `JavaScript` 中的一个内置函数，用于将字符串解析为整数。
```javascript
// output: 123
parseInt("123");


// 将 ff 这个 16 进制的字符串转为 10 进制的 number 数值
// output: 255
parseInt("ff", 16); 
```

### 3.2 `watch` 监听多个值
`watch` 侦听器可以同时监听多个值，只要有一个值发生改变，就可以被监听到。

用数组将需要监听的值作为第一个参数。
```javascript
watch(() => [inputRedColor.value, inputGreenColor.value, inputBlueColor.value], (newValue, oldValue) => {
    // inputRedColor.value 的新值是 newValue[0]
    // inputGreenColor.value 的新值是 newValue[1]
    // inputBlueColor.value 的新值是 newValue[2]
}); 
```
## 四、功能实现

### 4.1 识别多种格式的 RGB 颜色值
当用户输入不同格式的 `RGB` 颜色值，所有数据都直接响应式获取，然后可以复制 `RGB` 值，也可以复制 `HEX` 值。

支持的格式：

1. 30 80 255
2. 30, 80, 255
3. (30, 80, 255)
4. RGB(30, 80, 255)
5. rgb(30, 80, 255)

格式的识别是用正则处理的，然后获取各个颜色通道对应的颜色值。

正则处理的颜色值是在 `0-255`之间，为了快速生成匹配 0-255 的正则，我借助了 ChatGPT。
```javascript
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
}
```

### 4.2 RGB 与 HEX 双向同步
**RGB → HEX**：通过 `watch` 监听 R、G、B 三个输入，在 0–255 合法范围内时，用 `toString(16)` 转成两位十六进制并补前导 0（当前实现里是判断若小于 16 则前面加 `"0"`），拼成 `#RRGGBB` 写入 HEX 输入框。

**HEX → RGB**：通过 `watch(inputHexColor)`，当用户输入 HEX 时校验首字符为 `#`、长度为 7，则更新取色器显示并解析 `slice(1,3)` / `slice(3,5)` / `slice(5,7)` 为十进制，写回 R、G、B 输入框，实现「改 HEX 即同步 RGB 和取色器」。

### 4.3 取色
`Element Plus` 的 `el-color-picker` 用于取色。当前页面实现方式为：

- 绑定变量：`v-model="selectColor"`（如 `#FFFFFF`），用于取色器显示和下方「当前选择的颜色」预览。
- 取色后通过 `@change="clickSelectColor"` 回调：仅当 `selectColor.length === 7`（即不含透明度）时，将 HEX 写入 HEX 输入框，并用 `parseInt(hex.slice(1,3), 16)` 等方式解析出 R、G、B 写回对应输入框；同时清空「RGB 整串」输入框，避免与单通道不一致。

```html
<el-color-picker v-model="selectColor" @change="clickSelectColor" />
```

### 4.4 复制功能
复制使用 **`vue-clipboard3`** 的 `useClipboard().toClipboard(text)`，将当前 HEX 或拼好的 `rgb(r, g, b)` 写入剪贴板。