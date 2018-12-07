const path = require('path')

module.exports = {
  dev: {
    baseUrl: '',
    publicPath: '/',
    assetsSubDirectory: 'static',
    devtool: 'cheap-module-eval-source-map',
    port: 8080,
    notifyOnError: true,
    sourceMap: true,
    mockList: [
      {
        path: '/api',
        target: 'http://example.com'
      }
    ]
  },
  build: {
    index: path.resolve(__dirname, '../dist/index.html'),
    baseUrl: '',
    publicPath: '/',
    assetsSubDirectory: 'static',
    devtool: 'cheap-module-source-map',
    // 预发开启静态资源sourceMap，线上环境关闭
    sourceMap: process.env.BUILD_TYPE === 'yf',
    productionGzip: process.env.BUILD_TYPE !== 'yf',
    bundleAnalyzerReport: process.env.ANALYZE
  }
}
