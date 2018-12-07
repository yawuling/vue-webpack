const path = require('path')
const { VueLoaderPlugin } = require('vue-loader')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const PreloadPlugin = require('@vue/preload-webpack-plugin')
const config = require('./config')
const utils = require('./utils')

module.exports = {
  mode: process.env.NODE_ENV,
  context: path.resolve(__dirname, '../'),
  entry: {
    app: './src/main.js'
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    publicPath: config.dev.publicPath,
    filename: '[name].js',
    chunkFilename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: utils.cssLoader('css-loader', 'postcss-loader')
      },
      {
        test: /\.scss$/,
        use: utils.cssLoader('css-loader', 'postcss-loader', 'sass-loader')
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        loader: 'url-loader',
        options: {
          limit: 4096,
          name: utils.assetsPath('img/[name].[hash:8].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'file-loader',
        options: {
          limit: 4096,
          name: utils.assetsPath('fonts/[name].[hash:8].[ext]')
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': path.resolve(__dirname, '../src'),
    }
  },
  plugins: [
    new HtmlWebpackPlugin(utils.getHtmlOptions()),
    new VueLoaderPlugin(),
    // 将public文件夹除index.html以外的文件复制到打包后的目录
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../public'),
        to: utils.assetsPath('public'),
        toType: 'dir',
        ignore: [
          'index.html',
          '.DS_Store'
        ]
      }
    ]),
    new PreloadPlugin({
      rel: 'preload',
      include: 'initial',
      fileBlacklist: [/\.map$/, /hot-update\.js$/]
    }),
    new PreloadPlugin({
      rel: 'prefetch',
      include: 'asyncChunks'
    })
  ]
}
