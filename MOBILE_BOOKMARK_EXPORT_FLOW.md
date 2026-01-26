# 移动端书摘导出逻辑梳理

## 整体流程

```
用户选中文本 
  ↓
触发文本选择事件 (handleTextSelection / handleSelectionChange)
  ↓
更新 selectedText.value 并显示工具栏
  ↓
用户点击"导出书摘"按钮
  ↓
handleExportBookmark() 函数
  ↓
检测为移动端 → 直接生成图片
  ↓
使用隐藏的书摘卡片 (hiddenBookmarkCardRef) 生成图片
  ↓
显示图片预览对话框 (bookmarkImagePreviewVisible)
  ↓
用户点击"复制图片"按钮
  ↓
copyBookmarkImageFromPreview() 函数
  ↓
复制图片到剪贴板
```

## 详细步骤

### 1. 文本选择阶段

**触发事件：**
- `@mouseup="handleTextSelection"` (桌面端)
- `@touchend="handleTextSelection"` (移动端)
- `document.addEventListener('selectionchange', handleSelectionChange)` (全局监听)

**处理函数：**
```javascript
handleTextSelection() {
  // 延迟100ms确保移动端选择完成
  setTimeout(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      selectedText.value = selection.toString().trim();
      // 显示工具栏
      toolbarVisible.value = true;
    }
  }, 100);
}

handleSelectionChange() {
  // 实时监听选择变化
  const selection = window.getSelection();
  if (selection && selection.toString().trim()) {
    selectedText.value = selection.toString().trim();
    toolbarVisible.value = true;
  }
}
```

**关键变量：**
- `selectedText.value` - 存储选中的文本内容

### 2. 点击导出按钮阶段

**按钮位置：**
- 工具栏中的"导出书摘"按钮（图标：Picture）
- 位置：文章内容右侧，垂直居中

**处理函数：**
```javascript
handleExportBookmark() {
  // 1. 重新检查选中文本（防止移动端选择状态丢失）
  const selection = window.getSelection();
  if (selection && selection.toString().trim()) {
    selectedText.value = selection.toString().trim();
  }
  
  // 2. 验证是否有选中文本
  if (!selectedText.value) {
    ElMessage.warning('请先选中要导出的文本');
    return;
  }
  
  // 3. 检测设备类型
  const isMobileDevice = detectMobile();
  
  if (isMobileDevice) {
    // 移动端流程
  } else {
    // 桌面端流程（显示设置对话框）
  }
}
```

### 3. 移动端图片生成阶段

**关键组件：**
- 隐藏的书摘卡片 (`hiddenBookmarkCardRef`)
- 位置：页面外部（`position: absolute; left: -9999px`），不可见但存在于 DOM 中

**生成流程：**
```javascript
// 1. 等待 DOM 更新
await nextTick();
await new Promise(resolve => setTimeout(resolve, 100));

// 2. 检查隐藏卡片是否存在
if (!hiddenBookmarkCardRef.value) {
  ElMessage.error('书摘卡片未准备好，请重试');
  return;
}

// 3. 调用生成函数
const canvas = await generateBookmarkImage();
```

**generateBookmarkImage() 函数：**
```javascript
generateBookmarkImage() {
  // 1. 验证选中文本
  if (!selectedText.value) return null;
  
  // 2. 选择卡片引用（移动端用隐藏卡片，桌面端用对话框中的卡片）
  const cardRef = isMobileDevice ? hiddenBookmarkCardRef.value : bookmarkCardRef.value;
  
  // 3. 使用 html2canvas 生成图片
  const canvas = await html2canvas(cardRef, {
    scale: 2,
    useCORS: true,
    onclone: (clonedDoc) => {
      // 应用主题背景色
      const clonedCard = clonedDoc.querySelector('.bookmark-card');
      clonedCard.style.background = bgColor;
    }
  });
  
  return canvas;
}
```

### 4. 显示预览对话框阶段

**对话框组件：**
- `bookmarkImagePreviewVisible` - 控制对话框显示
- 宽度：90%
- 内容：图片 + 复制按钮 + 提示文字

**显示逻辑：**
```javascript
if (canvas) {
  // 1. 将 canvas 转换为 base64 数据 URL
  generatedBookmarkImageUrl.value = canvas.toDataURL('image/png', 1.0);
  
  // 2. 显示预览对话框
  bookmarkImagePreviewVisible.value = true;
  
  // 3. 重置生成状态
  generatingBookmark.value = false;
}
```

### 5. 复制图片阶段

**复制按钮：**
- 位置：图片下方，提示文字上方，靠右对齐
- 文本：`复制图片` / `复制中...`

**复制函数：**
```javascript
copyBookmarkImageFromPreview(event) {
  // 1. 阻止事件冒泡
  event.stopPropagation();
  event.preventDefault();
  
  // 2. 验证图片是否准备好
  if (!generatedBookmarkImageUrl.value) {
    ElMessage.warning('图片未准备好');
    return;
  }
  
  // 3. 防止重复调用
  if (generatingBookmark.value) return;
  
  // 4. 将 base64 转换为 Blob
  const response = await fetch(generatedBookmarkImageUrl.value);
  const blob = await response.blob();
  
  // 5. 复制到剪贴板
  await navigator.clipboard.write([
    new ClipboardItem({ 'image/png': blob })
  ]);
  
  ElMessage.success('书摘图片已复制到剪贴板');
}
```

## 关键组件说明

### 隐藏的书摘卡片

**用途：** 移动端用于生成图片，不显示给用户

**位置：** 
```html
<div v-if="isMobile" class="hidden-bookmark-card-container">
  <div class="bookmark-card hidden-bookmark-card" ref="hiddenBookmarkCardRef">
    <!-- 日期、书摘内容、来源信息 -->
  </div>
</div>
```

**样式：**
```css
.hidden-bookmark-card-container {
  position: absolute;
  left: -9999px;  /* 移出视口 */
  top: -9999px;
  visibility: hidden;
  pointer-events: none;
}
```

**为什么需要隐藏的书摘卡片？**

这是由 **html2canvas 的技术限制** 和 **移动端用户体验设计** 共同决定的：

#### 1. html2canvas 的技术限制
- `html2canvas` 只能对 **DOM 中实际存在的元素** 进行截图
- 它不能对虚拟元素、不在 DOM 中的元素或已移除的元素生成图片
- 必须有一个真实的 DOM 元素作为截图目标

#### 2. 移动端 vs 桌面端的设计差异

**桌面端流程：**
```
点击导出 → 显示设置对话框 → 对话框中有可见的书摘卡片 → 用户调整设置 → 点击复制 → 使用对话框中的卡片生成图片
```
- 桌面端有设置对话框，对话框中的 `bookmarkCardRef` 就是可见的书摘卡片
- 这个卡片在 DOM 中，用户可以看到，html2canvas 也可以截图

**移动端流程：**
```
点击导出 → 直接生成图片 → 显示预览对话框
```
- 移动端为了简化体验，**不显示设置对话框**（对话框在移动端体验不好）
- 但 html2canvas 仍然需要一个 DOM 元素来截图
- 如果显示对话框，用户体验会变差（需要先看设置对话框，再看到图片）
- 所以需要一个**隐藏的卡片**：在 DOM 中存在（供 html2canvas 使用），但用户看不到（不影响体验）

#### 3. 隐藏的实现方式
- 使用 `position: absolute; left: -9999px` 将元素移到视口外
- 使用 `visibility: hidden` 确保元素不可见
- 使用 `pointer-events: none` 确保元素不响应鼠标事件
- 元素仍在 DOM 中，样式已渲染，html2canvas 可以正常截图

#### 4. 为什么不直接用对话框中的卡片？
如果移动端也显示设置对话框，会有以下问题：
- 移动端屏幕小，对话框占用空间大
- 用户需要先看设置对话框，再看到图片，操作步骤多
- 移动端用户通常不需要频繁调整主题/字体，默认设置即可
- 直接显示图片预览更符合移动端"快速操作"的使用习惯

**总结：** 隐藏卡片是移动端"跳过设置对话框，直接生成图片"这个设计决策的技术实现方案。

### 图片预览对话框

**组件：** `el-dialog` with `bookmarkImagePreviewVisible`

**内容结构：**
```
[图片]
[复制图片按钮 - 靠右]
[提示文字：请长按图片进行保存或复制]
[关闭按钮 - footer]
```

## 移动端 vs 桌面端差异

| 特性 | 移动端 | 桌面端 |
|------|--------|--------|
| 点击导出后 | 直接生成图片 | 显示设置对话框 |
| 使用的卡片 | 隐藏卡片 (`hiddenBookmarkCardRef`) | 对话框中的卡片 (`bookmarkCardRef`) |
| 主题/字体设置 | 使用默认设置 | 可在对话框中调整 |
| 复制方式 | 显示预览对话框，用户点击复制 | 直接复制到剪贴板 |
| 对话框 | 只显示图片预览对话框 | 先显示设置对话框，再复制 |

## 可能的问题和解决方案

### 问题1：选中文本后工具栏不显示
**原因：** 移动端 `mouseup` 事件不触发
**解决：** 已添加 `touchend` 事件和 `selectionchange` 全局监听

### 问题2：点击导出按钮没反应
**原因：** 
- 选中文本丢失
- 隐藏卡片未渲染
**解决：** 
- 在 `handleExportBookmark` 中重新获取选中文本
- 增加等待时间确保卡片渲染

### 问题3：生成图片失败
**原因：** 
- 隐藏卡片不存在
- html2canvas 渲染失败
**解决：** 
- 检查 `hiddenBookmarkCardRef.value` 是否存在
- 添加错误提示和重试机制

### 问题4：复制按钮位置不对
**原因：** CSS 样式被覆盖
**解决：** 使用 `order` 属性和 `!important` 强制样式

## 优化建议

1. **添加加载状态：** 生成图片时显示加载动画
2. **错误重试：** 生成失败时提供重试按钮
3. **主题选择：** 移动端也可以添加简单的主题切换
4. **缓存优化：** 相同文本可以缓存生成的图片
