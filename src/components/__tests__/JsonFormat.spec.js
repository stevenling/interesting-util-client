import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import ElementPlus from 'element-plus'
import JsonFormat from '../programmer-tools/JsonFormat.vue'
import { ElMessage } from 'element-plus'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/utilIndex', component: { template: '<div />' } },
  ],
})

// A custom stub for ElInput to ensure a textarea is rendered for testing v-model
const ElInputStub = {
  props: ['modelValue', 'type', 'placeholder', 'class'],
  template: '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"></textarea>'
}

// Create a stable mock function for toClipboard
const mockToClipboard = jest.fn()

jest.mock('element-plus', () => {
  const actual = jest.requireActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      error: jest.fn(),
      success: jest.fn(),
      info: jest.fn(),
    },
  }
})

// Mock vue-clipboard3
jest.mock('vue-clipboard3', () => ({
  __esModule: true, // Handle ES Module interop
  default: () => ({ // The composable `useClipboard` is a function
    toClipboard: mockToClipboard // that returns an object with our mock
  })
}))

describe('JsonFormat.vue', () => {
  let wrapper

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    jest.clearAllMocks();
    // Use fake timers to control debounce
    jest.useFakeTimers();
    wrapper = mount(JsonFormat, {
      global: {
        plugins: [router, ElementPlus],
        stubs: {
          highlightjs: true,
          ElInput: ElInputStub,
        }
      }
    })
  })

  afterEach(() => {
    // Restore real timers
    jest.useRealTimers();
  });

  describe('JSON Formatting', () => {
    it('should format valid JSON correctly', async () => {
      const inputJson = '{"name":"test","age":25}'
      const expectedOutput = '{\n    "name": "test",\n    "age": 25\n}'

      await wrapper.find('textarea').setValue(inputJson)
      // Advance timers to trigger the debounced watcher
      await jest.runAllTimers();
      expect(wrapper.vm.currentJson.formatJson).toBe(expectedOutput)
    })

    it('should handle empty input', async () => {
      await wrapper.find('textarea').setValue('')
      await jest.runAllTimers();
      expect(wrapper.vm.currentJson.formatJson).toBe('')
    })

    it('should show error message for invalid JSON', async () => {
      const invalidJson = '{invalid json}'
      await wrapper.find('textarea').setValue(invalidJson)
      await jest.runAllTimers();
      expect(ElMessage.error).toHaveBeenCalledWith('待格式化的 Json 有误，请检查')
      expect(wrapper.vm.currentJson.formatJson).toBe('')
    })
  })

  describe('Clear Button', () => {
    it('should clear both input and output when clicked', async () => {
      // Set initial values
      await wrapper.find('textarea').setValue('{"test": "value"}')
      await jest.runAllTimers();

      // Click clear button
      await wrapper.find('[data-testid="json-format-clear"]').trigger('click')

      expect(wrapper.vm.currentJson.oldJson).toBe('')
      expect(wrapper.vm.currentJson.formatJson).toBe('')
    })

    it('should show info message when trying to clear empty input', async () => {
      await wrapper.find('[data-testid="json-format-clear"]').trigger('click')
      expect(ElMessage.info).toHaveBeenCalledWith('已经清空了，没必要再次清空')
    })
  })

  describe('Copy Button', () => {
    it('should copy formatted JSON to clipboard', async () => {
      const formattedJson = '{\n    "test": "value"\n}'

      // Set formatted JSON
      wrapper.vm.currentJson.formatJson = formattedJson

      // Click copy button
      await wrapper.find('[data-testid="json-format-copy"]').trigger('click')

      expect(mockToClipboard).toHaveBeenCalledWith(formattedJson)
      expect(ElMessage.success).toHaveBeenCalledWith('复制成功')
    })

    it('should show error when trying to copy empty JSON', async () => {
      await wrapper.find('[data-testid="json-format-copy"]').trigger('click')
      expect(ElMessage.error).toHaveBeenCalledWith('无法复制空的 json ')
    })
  })

  describe('Download Button', () => {
    it('should create download link with formatted JSON', async () => {
      const formattedJson = '{\n    "test": "value"\n}'
      wrapper.vm.currentJson.formatJson = formattedJson

      const mockCreateObjectURL = jest.fn().mockReturnValue('blob:mock')
      const prevCreate = URL.createObjectURL
      const prevRevoke = URL.revokeObjectURL
      URL.createObjectURL = mockCreateObjectURL
      URL.revokeObjectURL = jest.fn()

      const mockClick = jest.fn()
      const realCreateElement = document.createElement.bind(document)
      const createSpy = jest.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') {
          const el = realCreateElement('a')
          el.click = mockClick
          return el
        }
        return realCreateElement(tag)
      })

      try {
        await wrapper.find('[data-testid="json-format-download"]').trigger('click')

        expect(mockCreateObjectURL).toHaveBeenCalled()
        expect(mockClick).toHaveBeenCalled()
      } finally {
        createSpy.mockRestore()
        URL.createObjectURL = prevCreate
        URL.revokeObjectURL = prevRevoke
      }
    })

    it('should show error when trying to download empty JSON', async () => {
      await wrapper.find('[data-testid="json-format-download"]').trigger('click')
      expect(ElMessage.error).toHaveBeenCalledWith('下载空 Json 没有意义')
    })
  })
})