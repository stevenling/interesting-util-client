import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import fontToImage from './fontToImage.vue';
import html2canvas from 'html2canvas';
import { ElMessage } from 'element-plus';

// --- Mocks ---

// 模拟 html2canvas 库
jest.mock('html2canvas');

// 模拟 element-plus 的 ElMessage
jest.mock('element-plus', () => ({
  ElMessage: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// 模拟浏览器的剪贴板 API
const mockClipboard = {
  write: jest.fn(),
};
Object.defineProperty(navigator, 'clipboard', {
  value: mockClipboard,
  writable: true,
});
global.ClipboardItem = jest.fn(data => data); // 模拟 ClipboardItem 构造函数

describe('fontToImage.vue', () => {
  let wrapper;
  let consoleErrorSpy;

  // 在每个测试用例开始前执行
  beforeEach(() => {
    // 重置所有模拟函数
    jest.clearAllMocks();
    // 捕获 console.error 调用，避免在测试输出中显示错误信息
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // 挂载组件，并 stub（存根）所有子组件和 Element Plus 组件以隔离测试
    wrapper = mount(fontToImage, {
      global: {
        stubs: {
          TopMenu: true,
          ElCard: true,
          ElInput: true,
          ElButton: true,
          ElSelect: true,
          ElOption: true,
          ElDialog: true,
        },
      },
    });
  });

  // 在每个测试用例结束后执行
  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('应该正确渲染初始状态', () => {
    expect(wrapper.find('.input-title').text()).toBe('输入你的摘录文字');
    expect(wrapper.find('.weixin-card-text').text()).toBe('这里会显示你的摘录内容');
    expect(wrapper.find('.weixin-card-preview').classes()).toContain('bg-white');
    expect(wrapper.vm.selectedFont).toBe('KaiTi, "楷体", serif');
    // 初始状态下日期不显示
    expect(wrapper.find('.weixin-card-date').exists()).toBe(false);
  });

  it('当 inputText 改变时，应更新预览文本', async () => {
    const newText = '这是一段新的测试文字。';
    // 直接修改组件实例上的数据
    wrapper.vm.inputText = newText;
    await nextTick(); // 等待 DOM 更新
    expect(wrapper.find('.weixin-card-text').text()).toBe(newText);
  });

  it('应该能增加和减小字体大小', async () => {
    const initialSize = wrapper.vm.previewFontSize;

    // 找到 A+ 和 A- 按钮并触发点击
    const buttons = wrapper.findAll('el-button-stub');
    const increaseBtn = buttons.find(b => b.text() === 'A+');
    const decreaseBtn = buttons.find(b => b.text() === 'A-');

    await increaseBtn.trigger('click');
    expect(wrapper.vm.previewFontSize).toBeCloseTo(initialSize + 0.1);

    await decreaseBtn.trigger('click');
    expect(wrapper.vm.previewFontSize).toBeCloseTo(initialSize); // 恢复原大小
  });

  it('当改变背景类型时，应重置背景选择', async () => {
    expect(wrapper.vm.selectedBgType).toBe('solid');
    expect(wrapper.vm.selectedBg).toBe('bg-white');

    // 切换背景类型为 'gradient'
    wrapper.vm.selectedBgType = 'gradient';
    await nextTick();

    // 验证背景选择是否已重置为渐变类型的默认值
    expect(wrapper.vm.selectedBg).toBe('bg-gradient-green');
    expect(wrapper.find('.weixin-card-preview').classes()).toContain('bg-gradient-green');
  });

  describe('copyImage 功能', () => {
    const mockCanvas = {
      toDataURL: jest.fn().mockReturnValue('data:image/png;base64,mock-data-url'),
      toBlob: jest.fn(callback => callback('mock-blob-data')),
    };

    beforeEach(() => {
      // 在此 describe 块的所有测试中，html2canvas 都返回一个模拟的 canvas 对象
      html2canvas.mockResolvedValue(mockCanvas);
    });

    it('在桌面端，应成功复制图片到剪贴板', async () => {
      Object.defineProperty(navigator, 'userAgent', { value: 'Desktop', configurable: true });
      mockClipboard.write.mockResolvedValue(undefined);

      await wrapper.find('.copy-btn').trigger('click');
      await nextTick(); // 等待 html2canvas 的 promise
      await new Promise(resolve => setTimeout(resolve, 0)); // 等待 toBlob 的回调

      expect(html2canvas).toHaveBeenCalled();
      expect(mockCanvas.toBlob).toHaveBeenCalled();
      expect(navigator.clipboard.write).toHaveBeenCalledWith([expect.any(Object)]);
      expect(ElMessage.success).toHaveBeenCalledWith('图片已复制到剪贴板，可直接粘贴');
      expect(wrapper.vm.showDate).toBe(false); // 验证日期在结束后被隐藏
    });

    it('在移动端，应显示图片预览弹窗', async () => {
      Object.defineProperty(navigator, 'userAgent', { value: 'iPhone', configurable: true });

      await wrapper.find('.copy-btn').trigger('click');
      await nextTick();

      expect(html2canvas).toHaveBeenCalled();
      expect(mockCanvas.toDataURL).toHaveBeenCalled();
      expect(wrapper.vm.showImagePreview).toBe(true);
      expect(wrapper.vm.generatedImageUrl).toBe('data:image/png;base64,mock-data-url');
      expect(ElMessage.info).toHaveBeenCalledWith('请长按图片进行保存或复制');
    });

    it('当剪贴板写入失败时，应显示错误消息', async () => {
      Object.defineProperty(navigator, 'userAgent', { value: 'Desktop', configurable: true });
      const error = new Error('Clipboard write failed');
      mockClipboard.write.mockRejectedValue(error);

      await wrapper.find('.copy-btn').trigger('click');
      await new Promise(resolve => setTimeout(resolve, 0)); // 等待所有 microtask 和 macrotask

      expect(ElMessage.error).toHaveBeenCalledWith('复制图片到剪贴板失败，可能是浏览器不支持或权限问题');
      expect(console.error).toHaveBeenCalledWith('复制失败:', error);
    });

    it('当 html2canvas 失败时，应显示错误消息', async () => {
      const error = new Error('Canvas generation failed');
      html2canvas.mockRejectedValue(error);

      await wrapper.find('.copy-btn').trigger('click');
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(ElMessage.error).toHaveBeenCalledWith('图片生成失败');
      expect(console.error).toHaveBeenCalledWith('截图失败:', error);
      expect(wrapper.vm.showDate).toBe(false); // 验证 finally 块被执行
    });
  });
});