import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import EpubReader from './EpubReader.vue';
import { ElMessage } from 'element-plus';
import html2canvas from 'html2canvas';

// --- Mocks ---

// Mock Element Plus components and services
jest.mock('element-plus', () => ({
  ...jest.requireActual('element-plus'), // Keep original components
  ElMessage: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}));

// Mock html2canvas
jest.mock('html2canvas');

// Mock epubjs
const mockRendition = {
  display: jest.fn().mockResolvedValue(undefined),
  prev: jest.fn().mockResolvedValue(undefined),
  next: jest.fn().mockResolvedValue(undefined),
  destroy: jest.fn(),
  on: jest.fn(),
  themes: {
    default: jest.fn(),
    register: jest.fn(),
    select: jest.fn(),
  },
  annotations: {
    add: jest.fn(),
  },
};

const mockBook = {
  ready: Promise.resolve(),
  loaded: {
    metadata: Promise.resolve({
      title: 'Mock Book Title',
      creator: 'Mock Author',
    }),
    navigation: Promise.resolve({
      toc: [
        { href: 'chapter1', label: 'Chapter 1' },
        { href: 'chapter2', label: 'Chapter 2' },
      ],
    }),
  },
  spine: Promise.resolve({ length: 10 }),
  renderTo: jest.fn().mockReturnValue(mockRendition),
  getRange: jest.fn(cfi => Promise.resolve({ toString: () => `Text for ${cfi}` })),
};

jest.mock('epubjs', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => mockBook),
}));

// Mock Browser APIs
const mockClipboard = {
  write: jest.fn(),
};
Object.defineProperty(navigator, 'clipboard', {
  value: mockClipboard,
  writable: true,
});
global.ClipboardItem = jest.fn(data => data);

const mockFileReader = {
  readAsArrayBuffer: jest.fn(),
  onload: jest.fn(),
  result: new ArrayBuffer(8),
};
global.FileReader = jest.fn(() => mockFileReader);

let localStorageMock = {};
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(key => localStorageMock[key] || null),
    setItem: jest.fn((key, value) => {
      localStorageMock[key] = value;
    }),
    removeItem: jest.fn(key => {
      delete localStorageMock[key];
    }),
    clear: jest.fn(() => {
      localStorageMock = {};
    }),
  },
  writable: true,
});


describe('EpubReader.vue', () => {
  let wrapper;

  const mountComponent = (options = {}) => {
    return mount(EpubReader, {
      global: {
        stubs: {
          TopMenu: true,
          ElUpload: true,
          ElIcon: true,
          UploadFilled: true,
        },
      },
      ...options,
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock = {};
  });

  describe('Initial (Upload) State', () => {
    it('renders the upload section when no book is loaded', () => {
      wrapper = mountComponent();
      expect(wrapper.find('.upload-section').exists()).toBe(true);
      expect(wrapper.find('h2').text()).toBe('EPUB 在线阅读器');
      expect(wrapper.find('.reading-section').exists()).toBe(false);
    });

    it('attempts to load a book from localStorage on mount', () => {
      localStorageMock['epub-book-base64'] = 'dGVzdA=='; // "test" in base64
      wrapper = mountComponent();
      expect(localStorage.getItem).toHaveBeenCalledWith('epub-book-base64');
      // The loadBook logic will be tested separately
    });
  });

  describe('File Handling and Loading', () => {
    beforeEach(() => {
      wrapper = mountComponent();
    });

    it('loads a valid epub file and stores it in localStorage', async () => {
      const file = { raw: new File([''], 'book.epub', { type: 'application/epub+zip', size: 1024 }) };
      await wrapper.vm.handleFileChange(file);

      // Simulate FileReader onload
      mockFileReader.onload({ target: { result: new ArrayBuffer(8) } });
      await nextTick();

      expect(localStorage.setItem).toHaveBeenCalledWith('epub-book-base64', expect.any(String));
      expect(mockBook.renderTo).toHaveBeenCalled();
    });

    it('shows an error for invalid file types', async () => {
      const file = { raw: new File([''], 'book.txt', { type: 'text/plain' }) };
      await wrapper.vm.handleFileChange(file);
      expect(ElMessage.error).toHaveBeenCalledWith('请上传有效的EPUB文件');
    });

    it('shows a warning for large files and does not save to localStorage', async () => {
      const largeFile = { raw: new File([''], 'largebook.epub', { type: 'application/epub+zip', size: 5 * 1024 * 1024 }) };
      await wrapper.vm.handleFileChange(largeFile);
      
      expect(ElMessage.error).toHaveBeenCalledWith('文件过大，无法自动保存到本地。请上传小于4.5MB的EPUB文件。');
      
      // Simulate FileReader onload
      mockFileReader.onload({ target: { result: new ArrayBuffer(8) } });
      await nextTick();

      expect(localStorage.setItem).not.toHaveBeenCalled();
      expect(mockBook.renderTo).toHaveBeenCalled(); // Still loads the book
    });

    it('shows an error if book loading fails', async () => {
        const error = new Error('EPUB Load Failed');
        // Use jest.requireActual to get the real ePub module and then mock its default export
        const ePub = (await import('epubjs')).default;
        ePub.mockImplementationOnce(() => {
            throw error;
        });

        await wrapper.vm.loadBook(new ArrayBuffer(8));
        expect(ElMessage.error).toHaveBeenCalledWith(`加载书籍失败: ${error.message}`);
    });
  });

  describe('Reading View', () => {
    beforeEach(async () => {
      wrapper = mountComponent();
      // Manually trigger book loading to set up the reading view state
      await wrapper.vm.loadBook(new ArrayBuffer(8));
      await nextTick();
    });

    it('renders the reading section after a book is loaded', () => {
      expect(wrapper.find('.reading-section').exists()).toBe(true);
      expect(wrapper.find('.upload-section').exists()).toBe(false);
      expect(wrapper.find('.book-info h3').text()).toBe('Mock Book Title');
    });

    it('navigates to the next and previous page', async () => {
      wrapper.vm.currentPage = 2;
      wrapper.vm.totalPages = 10;
      await nextTick();

      const nextButton = wrapper.findAll('.controls .el-button-stub').find(b => b.text().includes('下一页'));
      const prevButton = wrapper.findAll('.controls .el-button-stub').find(b => b.text().includes('上一页'));

      await nextButton.trigger('click');
      expect(mockRendition.next).toHaveBeenCalled();

      await prevButton.trigger('click');
      expect(mockRendition.prev).toHaveBeenCalled();
    });

    it('goes to a specific chapter from TOC', async () => {
      wrapper.vm.showToc = true;
      await nextTick();

      const chapterLink = wrapper.find('.toc-item');
      await chapterLink.trigger('click');

      expect(mockRendition.display).toHaveBeenCalledWith('chapter1');
      expect(wrapper.vm.showToc).toBe(false);
    });

    it('changes font size', async () => {
      wrapper.vm.showSettings = true;
      await nextTick();

      const initialSize = wrapper.vm.fontSize;
      const increaseButton = wrapper.findAll('.font-size-controls .el-button-stub').find(b => b.text() === 'A+');
      await increaseButton.trigger('click');

      expect(wrapper.vm.fontSize).toBe(initialSize + 2);
      expect(mockRendition.themes.default).toHaveBeenCalled();
    });

    it('resets the reader', async () => {
      const resetButton = wrapper.findAll('.controls .el-button-stub').find(b => b.text().includes('重新上传'));
      await resetButton.trigger('click');

      expect(mockRendition.destroy).toHaveBeenCalled();
      expect(localStorage.removeItem).toHaveBeenCalledWith('epub-book-base64');
      expect(wrapper.vm.book).toBe(null);
      await nextTick();
      expect(wrapper.find('.upload-section').exists()).toBe(true);
    });

    describe('Text Selection and Export', () => {
      it('shows tooltip on text selection', async () => {
        // Simulate the 'selected' event from epubjs
        const cfiRange = 'epubcfi(/6/2[cover]!/4/1/2/2@1:1)';
        const selectedCallback = mockRendition.on.mock.calls.find(call => call[0] === 'selected')[1];
        await selectedCallback(cfiRange);
        await nextTick();

        expect(wrapper.vm.selectedText).toBe(`Text for ${cfiRange}`);
        expect(wrapper.find('.tooltip-panel').exists()).toBe(true);
      });

      it('adds a highlight', async () => {
        // Simulate selection first
        const cfiRange = 'epubcfi(/6/2[cover]!/4/1/2/2@1:1)';
        const selectedCallback = mockRendition.on.mock.calls.find(call => call[0] === 'selected')[1];
        await selectedCallback(cfiRange);
        await nextTick();

        const highlightButton = wrapper.find('.tooltip-actions .el-button-stub[type="primary"]');
        await highlightButton.trigger('click');

        expect(wrapper.vm.highlights.length).toBe(1);
        expect(wrapper.vm.highlights[0].text).toBe(`Text for ${cfiRange}`);
        expect(mockRendition.annotations.add).toHaveBeenCalledWith('highlight', cfiRange, expect.any(Object));
        expect(ElMessage.success).toHaveBeenCalledWith('划线添加成功！');
      });

      it('opens the export dialog and copies image', async () => {
        // 1. Simulate selection
        const cfiRange = 'epubcfi(/6/2[cover]!/4/1/2/2@1:1)';
        const selectedCallback = mockRendition.on.mock.calls.find(call => call[0] === 'selected')[1];
        await selectedCallback(cfiRange);
        await nextTick();

        // 2. Click export button in tooltip
        const exportButton = wrapper.find('.tooltip-actions .el-button-stub[type="success"]');
        await exportButton.trigger('click');
        await nextTick();

        expect(wrapper.vm.showExportImageDialog).toBe(true);
        expect(wrapper.vm.selectedTextForExport).toBe(`Text for ${cfiRange}`);

        // 3. Mock html2canvas for the copy action
        const mockCanvas = { toBlob: jest.fn(cb => cb(new Blob(['mock-blob']))) };
        html2canvas.mockResolvedValue(mockCanvas);

        // 4. Click copy button in the dialog
        // We need to find the dialog component first. Since it's in the root, we can do this.
        const dialogWrapper = mount(EpubReader, { attachTo: document.body });
        await dialogWrapper.vm.loadBook(new ArrayBuffer(8));
        await selectedCallback(cfiRange);
        await dialogWrapper.find('.tooltip-actions .el-button-stub[type="success"]').trigger('click');
        await nextTick();

        const copyButton = dialogWrapper.find('.el-dialog__footer .el-button--primary');
        await copyButton.trigger('click');
        await nextTick();

        expect(html2canvas).toHaveBeenCalled();
        expect(navigator.clipboard.write).toHaveBeenCalled();
        expect(ElMessage.success).toHaveBeenCalledWith('图片已复制到剪贴板！');

        dialogWrapper.unmount();
      });
    });
  });
});
