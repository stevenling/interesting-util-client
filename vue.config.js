/* eslint-env node */
module.exports = {
  //  应用部署的基础路径
  // Vercel 使用根路径，GitHub Pages 使用子路径
  publicPath: process.env.VERCEL === '1' || process.env.VERCEL_URL
    ? '/' 
    : (process.env.NODE_ENV === 'production' ? '/interesting-util-client/' : '/'),
  // 静态资源目录
  assetsDir: 'assets',
  // 是否开启eslint
  lintOnSave: false,
  // 生产环境关闭sourcemap
  productionSourceMap: false, 

  // 开发服务器配置（不影响build）
  devServer: {
    host: '0.0.0.0', // 允许局域网访问，改为 'localhost' 则只能本机访问
    port: 8080
  }
}