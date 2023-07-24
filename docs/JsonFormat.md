# 云胡工具集之 Json 格式化

## 一、布局

将 `el-card` 卡片放在中间, 宽度是屏幕宽度的一半。

```css
.box-card {
  margin: 0 auto;
  text-align: center;  
  width: 50%;
}
```

## 二、功能实现

### 2.1 json 格式化

监听待格式化的 `json` 字符串，然后将其转成 `json` 对象, 再将其转为带有格式的 `json` 字符串。

必须使用异常处理，`JSON.parse(jsonObject)` 在解析不正确的`json` 对象会报错。
```javascript
    /**
     * 监听原来的未格式化的 json 字符串，必须使用 try catch 异常处理，否则会报错
     *
     * @param oldJson 用户输入的未格式化的 json 字符串，最开始是空
     * @param newValue 用户改变后的新的值
     */
    watch(oldJson, (newValue, oldValue) => {
        const jsonFormatSpace = 4; // json 格式化的缩进
        if (typeof newValue == "string" && newValue !== "" && newValue != null) {
            try {
                // 把 json 字符串转为 json 对象
                let newValueJsonObject = JSON.parse(newValue);
                // 将 json 对象通过 4 个缩进格式化，实现美化功能
                formatJson.value = JSON.stringify(newValueJsonObject, null, jsonFormatSpace);
            } catch (e) {
                ElMessage.error('待格式化的 json 有误，请检查');
                console.log(e);
                formatJson.value = '';
            }
        }
    })
```
### 2.2 下载 json 到本地

引入 `moment.js` 时间处理插件。

安装 `npm install --save moment`，注意加上 `--save`，会下载 `moment` 库并且会在 `package.json`的`dependencies`中写入。

之后，其他地方如果在 `npm install` 下载的时候也会安装上，这是，不加 `--save` 只会在本地下载，不会写入到 `package.json` 中。

使用 `moment().format('YYYY-MM-DD-hh-mm-ss')` 来获取当前的日期和时间作为格式化后的`json`文件名。

```javascript
    /**
     * 点击下载
     */
    function clickDownload() {
        let eleLink = document.createElement("a");
        const fileName = moment().format('YYYY-MM-DD-hh-mm-ss');
    
        eleLink.download = fileName + '.json';
        eleLink.style.display = "none";
        // 字符内容转变成 blob 地址
        let blob = new Blob([formatJson.value], {type: "text/json"});
        eleLink.href = URL.createObjectURL(blob);
        // 触发点击
        document.body.appendChild(eleLink);
        eleLink.click();
        // 然后移除
        document.body.removeChild(eleLink);
    }
```
### 2.3 复制 json 到剪切板

使用 `vue-clipboard3` 库来实现复制到剪切板功能。

安装: `npm install --save vue-clipboard3`

引入: `import useClipboard from "vue-clipboard3"`

```javascript
    /**
     * 点击复制 json 到剪切板
     */
    async function clickCopy() {
      const {toClipboard} = useClipboard();
      if (formatJson.value == null || formatJson.value === "") {
        ElMessage.error("无法复制空的 json ");
        return;
      }
      try {
        await toClipboard(formatJson.value);
        ElMessage.success("复制格式化后的 json 到剪切板成功")
      } catch (e) {
        console.error(e);
        ElMessage.error("复制格式化后的 json 到剪切板失败");
      }
    }
```

