module.exports = {
  // The test environment that will be used for testing.
  // 'jsdom' is a good default for browser-like environment.
  testEnvironment: 'jsdom',

  // A list of file extensions your modules use
  moduleFileExtensions: [
    'js',
    'json',
    'vue'
  ],

  // A map from regular expressions to paths to transformers
  transform: {
    // process `*.vue` files with `@vue/vue3-jest`
    '^.+\\.vue$': '@vue/vue3-jest',
    // process `*.js` files with `babel-jest`
    '^.+\\.js$': 'babel-jest',
  },

  // This is needed to support `<script setup>` syntax in tests
  testEnvironmentOptions: {
    customExportConditions: ["node", "node-addons"],
  },

  // 启用覆盖率收集
  collectCoverage: true,

  // 指定报告的格式
  // 'lcov' 会生成一个可在浏览器中查看的 html 报告
  // 'text' 会在控制台打印一个总结
  // 'json' 用于 CI/CD 集成
  coverageReporters: ['lcov', 'text', 'json'],

  // 指定需要被统计覆盖率的文件
  collectCoverageFrom: [
    'src/**/*.{js,vue}',
    '*.js',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!jest.config.js',
    '!babel.config.js',
    '!vue.config.js',
  ],
};