# Json 格式化

## 布局

将 `el-card` 卡片放在中间, 宽度是屏幕宽度的一般。

```css
.box-card {
  margin: 0 auto;
  text-align: center;  
  width: 50%;
}
```

## 功能实现
监听待格式化的 json 字符串，然后将其转成 json 对象, 再将其转为 json 字符串，这个时候是带有格式的。
```js
watch(oldJson, (newValue, oldValue) => {
    // 把 json 字符串转为 json 对象
    let jsonObj = JSON.parse(newValue);
    formatJson.value = JSON.stringify(jsonObj, null, 4);
});
```
