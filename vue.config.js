module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/interesting-util-client/'
    : '/',
  assetsDir: 'assets',
  lintOnSave: false,
  productionSourceMap: false, // 生产环境关闭sourcemap

  // 开发服务器配置（不影响build）
  devServer: {
    host: 'localhost',
    port: 8080
  }
}