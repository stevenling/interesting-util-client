module.exports = {
  //  应用部署的基础路径
  publicPath: process.env.NODE_ENV === 'production'
    ? '/interesting-util-client/'
    : '/',
  // 静态资源目录
  assetsDir: 'assets',
  // 是否开启eslint
  lintOnSave: false,
  // 生产环境关闭sourcemap
  productionSourceMap: false, 

  // 开发服务器配置（不影响build）
  devServer: {
    host: 'localhost',
    port: 8080
  }
}