import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ColorConvert from './ColorConvert.vue';
import { ElMessage } from 'element-plus';
import useClipboard from 'vue-clipboard3';

// --- Mocks ---

// 模拟 Element Plus 的 ElMessage
jest.mock('element-plus', () => ({
  ElMessage: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// 模拟 vue-clipboard3
const mockToClipboard = jest.fn();
jest.mock('vue-clipboard3', () => ({
  __esModule: true,
  default: () => ({
    toClipboard: mockToClipboard,
  }),
}));

describe('ColorConvert.vue', () => {
  let wrapper;

  beforeEach(() => {
    // 在每个测试用例开始前重置所有模拟函数
    jest.clearAllMocks();

    // 挂载组件，并存根子组件和复杂的 Element Plus 组件
    wrapper = mount(ColorConvert, {
      global: {
        stubs: {
          TopMenu: true,
          ElTooltip: true,
          ElColorPicker: true,
        },
      },
    });
  });

  it('应该正确渲染初始状态', () => {
    expect(wrapper.find('.title').text()).toBe('颜色进制转换');
    expect(wrapper.vm.selectColor).toBe('#FFFFFF');
    expect(wrapper.vm.inputHexColor).toBe('');
    expect(wrapper.vm.inputRedColor).toBeUndefined();
  });

  it('当颜色选择器变化时，应更新所有输入框', async () => {
    // 模拟颜色选择器 v-model 的变化
    wrapper.vm.selectColor = '#ff5733';
    // 手动触发 change 事件的回调
    await wrapper.vm.clickSelectColor();

    expect(wrapper.vm.inputHexColor).toBe('#ff5733');
    expect(wrapper.vm.inputRedColor).toBe(255);
    expect(wrapper.vm.inputGreenColor).toBe(87);
    expect(wrapper.vm.inputBlueColor).toBe(51);
  });

  describe('双向转换逻辑 (Watchers)', () => {
    it('当输入有效的 HEX 值时，应更新 RGB 和颜色选择器', async () => {
      // 模拟用户在 HEX 输入框中输入
      await wrapper.vm.$patch({ inputHexColor: '#11AACC' });
      await nextTick();

      expect(wrapper.vm.selectColor).toBe('#11AACC');
      expect(wrapper.vm.inputRedColor).toBe(17);
      expect(wrapper.vm.inputGreenColor).toBe(170);
      expect(wrapper.vm.inputBlueColor).toBe(204);
    });

    it('当输入有效的 R, G, B 值时，应更新 HEX 值', async () => {
      await wrapper.vm.$patch({
        inputRedColor: '17',
        inputGreenColor: '170',
        inputBlueColor: '204',
      });
      await nextTick();

      expect(wrapper.vm.inputHexColor).toBe('#11aacc');
    });

    it('当 RGB 值转换的 HEX 为单位数时，应正确补零', async () => {
      await wrapper.vm.$patch({
        inputRedColor: '10', // a
        inputGreenColor: '11', // b
        inputBlueColor: '12', // c
      });
      await nextTick();

      expect(wrapper.vm.inputHexColor).toBe('#0a0b0c');
    });

    it('当输入超出范围的 RGB 值时，应显示错误提示', async () => {
      await wrapper.vm.$patch({
        inputRedColor: '300',
        inputGreenColor: '200',
        inputBlueColor: '100',
      });
      await nextTick();

      expect(ElMessage.error).toHaveBeenCalledWith('RGB 颜色值不可以小于 0 或者大于 255, 请重新输入');
    });
  });

  describe('智能识别 (clickRecognize)', () => {
    const testCases = [
      { format: '(30, 80, 255)', r: '30', g: '80', b: '255', hex: '#1e50ff', desc: '(r, g, b)' },
      { format: 'rgb(30, 80, 255)', r: '30', g: '80', b: '255', hex: '#1e50ff', desc: 'rgb(r, g, b)' },
      { format: '30 80 255', r: '30', g: '80', b: '255', hex: '#1e50ff', desc: 'r g b' },
      { format: '30, 80, 255', r: '30', g: '80', b: '255', hex: '#1e50ff', desc: 'r, g, b' },
    ];

    testCases.forEach(({ format, r, g, b, hex, desc }) => {
      it(`应该能识别 ${desc} 格式`, async () => {
        wrapper.vm.inputRgbColor = format;
        await wrapper.vm.clickRecognize();

        expect(wrapper.vm.inputRedColor).toBe(r);
        expect(wrapper.vm.inputGreenColor).toBe(g);
        expect(wrapper.vm.inputBlueColor).toBe(b);
        
        // 验证识别后是否也触发了到 HEX 的转换
        await nextTick();
        expect(wrapper.vm.inputHexColor).toBe(hex);
      });
    });

    it('对于无法识别的格式，应显示错误提示', async () => {
      wrapper.vm.inputRgbColor = '这是一个无效格式';
      await wrapper.vm.clickRecognize();

      expect(ElMessage.error).toHaveBeenCalledWith('智能识别失败, 请检查 RGB 格式');
    });
  });

  describe('复制到剪贴板', () => {
    it('应该能成功复制 HEX 值', async () => {
      wrapper.vm.inputHexColor = '#aabbcc';
      mockToClipboard.mockResolvedValue(); // 模拟成功

      await wrapper.vm.clickCopyHexColor();

      expect(mockToClipboard).toHaveBeenCalledWith('#aabbcc');
      expect(ElMessage.success).toHaveBeenCalledWith('复制 16 进制颜色值成功');
    });

    it('应该能成功复制 RGB 值', async () => {
      wrapper.vm.inputRedColor = '10';
      wrapper.vm.inputGreenColor = '20';
      wrapper.vm.inputBlueColor = '30';
      mockToClipboard.mockResolvedValue();

      await wrapper.vm.clickCopyRgbColor();

      expect(mockToClipboard).toHaveBeenCalledWith('rgb(10, 20, 30)');
      expect(ElMessage.success).toHaveBeenCalledWith('复制 RGB 颜色值成功');
    });
  });
});