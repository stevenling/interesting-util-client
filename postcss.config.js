module.exports = {
  plugins: {
    autoprefixer: {}
    // 注意：已禁用 postcss-px-to-viewport，原因：
    // 1. 项目已有完善的响应式设计（使用 @media 媒体查询）
    // 2. px转vw会影响PC端显示（固定宽度如 max-width: 1200px 会被转换成vw，导致PC端元素过大）
    // 3. 项目中的PC端布局需要保持px单位以确保正常显示
    //
    // 如果需要移动端适配，建议：
    // 方案1：在移动端媒体查询内手动使用 vw/rem 单位
    // 方案2：使用 rem 方案（amfe-flexible + postcss-pxtorem），通过设置根字体大小来控制
    // 方案3：只对特定移动端组件启用转换（使用 include 选项，但配置较复杂）
    //
    // 当前项目的移动端适配已通过媒体查询实现，无需额外转换
    /*
    'postcss-px-to-viewport': {
      viewportWidth: 375,
      viewportHeight: 667,
      unitPrecision: 3,
      viewportUnit: 'vw',
      selectorBlackList: ['.ignore', '.hairlines', '.el-', '.px-', '.no-vw'],
      minPixelValue: 1,
      mediaQuery: false,
      exclude: [/node_modules/, /element-plus/]
    }
    */
  }
}
