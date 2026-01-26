# 移动端自适应配置说明

## ⚠️ 重要说明

**postcss-px-to-viewport 插件已禁用**

原因：
1. **影响PC端显示**：px转vw会导致PC端的固定宽度（如 `max-width: 1200px`）被转换成vw，在PC端大屏幕上元素会变得过大
2. **项目已有响应式设计**：项目已使用 `@media` 媒体查询实现移动端适配，无需额外转换
3. **布局冲突**：PC端需要保持px单位以确保正常布局

## 当前移动端适配方案

项目使用**媒体查询（Media Queries）**实现响应式设计，这是最稳定可靠的方案。

## 移动端适配最佳实践

### 使用媒体查询（当前方案）

在CSS中使用媒体查询，针对不同屏幕尺寸设置不同的样式：

```css
/* PC端默认样式 */
.container {
  max-width: 1200px;
  padding: 40px;
  font-size: 16px;
}

/* 平板端 */
@media (max-width: 900px) {
  .container {
    max-width: 100%;
    padding: 30px;
    font-size: 15px;
  }
}

/* 移动端 */
@media (max-width: 768px) {
  .container {
    padding: 20px;
    font-size: 14px;
  }
}

/* 小屏手机 */
@media (max-width: 480px) {
  .container {
    padding: 15px;
    font-size: 13px;
  }
}
```

### 如果需要使用 vw 单位（手动）

可以在移动端媒体查询内手动使用 vw 单位：

```css
/* PC端保持px */
.container {
  width: 1200px;
}

/* 移动端使用vw */
@media (max-width: 768px) {
  .container {
    width: 100vw; /* 或使用 calc(100vw - 40px) 等 */
    padding: 5.333vw; /* 20px / 375px * 100 */
  }
}
```

## 为什么禁用 postcss-px-to-viewport？

### 问题示例

假设有一个PC端的容器：

```css
.container {
  max-width: 1200px; /* PC端正常显示 */
}
```

如果启用 px转vw，会被转换成：

```css
.container {
  max-width: 62.5vw; /* 在1920px屏幕上 = 1200px，正常 */
  /* 但在375px手机上 = 234px，太小了！ */
}
```

这会导致：
- ✅ PC端：可能正常（取决于屏幕尺寸）
- ❌ 移动端：元素过小
- ❌ 固定布局：被破坏

### 正确的做法

使用媒体查询分别设置：

```css
.container {
  max-width: 1200px; /* PC端固定宽度 */
}

@media (max-width: 768px) {
  .container {
    max-width: 100%; /* 移动端自适应 */
    padding: 20px;
  }
}
```

## 替代方案（如果需要）

如果确实需要自动转换，可以考虑：

### 方案1：rem 方案（推荐）

使用 `amfe-flexible` + `postcss-pxtorem`：

```bash
npm install --save-dev amfe-flexible postcss-pxtorem
```

优点：
- 可以通过设置根字体大小控制整体缩放
- 不会影响固定宽度布局
- 更灵活

### 方案2：条件转换

只对移动端组件启用转换（需要复杂配置）

## 当前项目状态

✅ 已使用媒体查询实现响应式设计  
✅ PC端和移动端布局正常  
✅ 无需额外配置

## 测试

1. 启动开发服务器：`npm run dev`
2. 打开浏览器开发者工具（F12）
3. 切换到移动设备模式（Cmd+Shift+M / Ctrl+Shift+M）
4. 检查样式是否正确自适应

## 常见问题

### Q: 为什么某些样式没有被转换？
A: 检查是否在 `selectorBlackList` 中，或者使用了 `.ignore` 等类名。

### Q: 如何调整转换精度？
A: 修改 `unitPrecision` 值（当前为 3，即保留 3 位小数）。

### Q: 横屏适配如何配置？
A: 设置 `landscape: true` 并配置 `landscapeWidth`。
