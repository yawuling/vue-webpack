const webpack  = require('webpack')
const merge = require('webpack-merge')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const portFinder = require('portfinder')
const path = require('path')
const address = require('address')
const chalk = require('chalk')
const baseWebpackConfig = require('./webpack.base.conf')
const config = require('./config')
const utils = require('./utils')

const devWebpackConfig = merge(baseWebpackConfig, {
  devtool: config.dev.devtool,
  devServer: {
    clientLogLevel: 'warning',
    compress: true,
    contentBase: false,
    historyApiFallback: {
      rewrites: [
        { from: /.*/, to: path.join(config.dev.publicPath, 'index.html') },
      ]
    },
    host: '0.0.0.0',
    hot: true,
    open: false,
    overlay: true,
    quiet: true,
    port: config.dev.port,
    disableHostCheck: true,
    inline: true
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.BASE_URL': JSON.stringify(config.dev.baseUrl)
    })
  ]
})

if (process.env.PROXY) {
  let proxyTable = {}
  config.dev.mockList.forEach(item => {
    proxyTable[item.path] = {
      target: item.target,
      changeOrigin: true
    }
  })
  devWebpackConfig.devServer.proxy = proxyTable
} else {
  devWebpackConfig.devServer.before = utils.mockApi
}

module.exports = new Promise((resolve, reject) => {
  portFinder.basePort = config.dev.port

  portFinder.getPortPromise()
    .then((port) => {
      devWebpackConfig.devServer.port = port
      const localUrl = `http://localhost:${port}${config.dev.baseUrl}/`
      const networkUrl = `http://${address.ip()}:${port}${config.dev.baseUrl}/`
      const messages = [
  `App running at:

    - Local: ${chalk.cyan(localUrl)}
    - Network: ${chalk.cyan(networkUrl)}

  `
      ]

      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: messages
        },
        onErrors: config.dev.notifyOnError
          ? utils.createNotifierCallback()
          : undefined
      }))

      resolve(devWebpackConfig)
    })
    .catch(error => {
      reject(error)
    })
})
