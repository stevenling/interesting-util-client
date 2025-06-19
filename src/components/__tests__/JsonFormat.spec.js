import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import JsonFormat from '../JsonFormat.vue'
import { ElMessage } from 'element-plus'
import useClipboard from 'vue-clipboard3'

// Mock element-plus message
vi.mock('element-plus', () => ({
  ElMessage: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn()
  }
}))

// Mock vue-clipboard3
vi.mock('vue-clipboard3', () => ({
  default: () => ({
    toClipboard: vi.fn()
  })
}))

describe('JsonFormat.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(JsonFormat)
  })

  describe('JSON Formatting', () => {
    it('should format valid JSON correctly', async () => {
      const inputJson = '{"name":"test","age":25}'
      const expectedOutput = '{\n    "name": "test",\n    "age": 25\n}'
      
      await wrapper.find('textarea').setValue(inputJson)
      expect(wrapper.vm.currentJson.formatJson).toBe(expectedOutput)
    })

    it('should handle empty input', async () => {
      await wrapper.find('textarea').setValue('')
      expect(wrapper.vm.currentJson.formatJson).toBe('')
    })

    it('should show error message for invalid JSON', async () => {
      const invalidJson = '{invalid json}'
      await wrapper.find('textarea').setValue(invalidJson)
      
      expect(ElMessage.error).toHaveBeenCalledWith('待格式化的 Json 有误，请检查')
      expect(wrapper.vm.currentJson.formatJson).toBe('')
    })
  })

  describe('Clear Button', () => {
    it('should clear both input and output when clicked', async () => {
      // Set initial values
      await wrapper.find('textarea').setValue('{"test": "value"}')
      
      // Click clear button
      await wrapper.find('.clear-and-copy-button').trigger('click')
      
      expect(wrapper.vm.currentJson.oldJson).toBe('')
      expect(wrapper.vm.currentJson.formatJson).toBe('')
    })

    it('should show info message when trying to clear empty input', async () => {
      await wrapper.find('.clear-and-copy-button').trigger('click')
      expect(ElMessage.info).toHaveBeenCalledWith('已经清空了，没必要再次清空')
    })
  })

  describe('Copy Button', () => {
    it('should copy formatted JSON to clipboard', async () => {
      const { toClipboard } = useClipboard()
      const formattedJson = '{\n    "test": "value"\n}'
      
      // Set formatted JSON
      wrapper.vm.currentJson.formatJson = formattedJson
      
      // Click copy button
      await wrapper.find('.clear-and-copy-button[type="success"]').trigger('click')
      
      expect(toClipboard).toHaveBeenCalledWith(formattedJson)
      expect(ElMessage.success).toHaveBeenCalledWith('复制格式化后的 json 到剪切板成功')
    })

    it('should show error when trying to copy empty JSON', async () => {
      await wrapper.find('.clear-and-copy-button[type="success"]').trigger('click')
      expect(ElMessage.error).toHaveBeenCalledWith('无法复制空的 json ')
    })
  })

  describe('Download Button', () => {
    it('should create download link with formatted JSON', async () => {
      const formattedJson = '{\n    "test": "value"\n}'
      wrapper.vm.currentJson.formatJson = formattedJson
      
      // Mock URL.createObjectURL
      const mockCreateObjectURL = vi.fn()
      URL.createObjectURL = mockCreateObjectURL
      
      // Mock document.createElement and appendChild
      const mockAppendChild = vi.fn()
      const mockRemoveChild = vi.fn()
      const mockClick = vi.fn()
      document.createElement = vi.fn(() => ({
        download: '',
        style: {},
        href: '',
        click: mockClick
      }))
      document.body.appendChild = mockAppendChild
      document.body.removeChild = mockRemoveChild
      
      await wrapper.find('.button').trigger('click')
      
      expect(mockCreateObjectURL).toHaveBeenCalled()
      expect(mockAppendChild).toHaveBeenCalled()
      expect(mockClick).toHaveBeenCalled()
      expect(mockRemoveChild).toHaveBeenCalled()
    })

    it('should show error when trying to download empty JSON', async () => {
      await wrapper.find('.button').trigger('click')
      expect(ElMessage.error).toHaveBeenCalledWith('下载空 Json 没有意义')
    })
  })
}) 