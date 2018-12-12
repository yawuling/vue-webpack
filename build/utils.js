const path = require('path')
const fs = require('fs')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const config = require('./config')
const packageConfig = require('../package.json')
const isProd = process.env.NODE_ENV === 'production'
const enableSrouceMap = isProd ? config.dev.sourceMap : config.build.sourceMap

exports.cssLoader = (...loaders) => {
  const formatLoaders = []
  formatLoaders.push('vue-style-loader')
  
  if (isProd) {
    formatLoaders.push(MiniCssExtractPlugin.loader)
  }
  loaders.forEach(loader => {
    formatLoaders.push({
      loader: loader,
      options: {
        sourceMap: enableSrouceMap
      }
    })
  })

  return formatLoaders
}

exports.assetsPath = file => {
  return path.posix.join(isProd ? config.build.assetsSubDirectory : config.dev.assetsSubDirectory, file)
}

exports.createNotifierCallback = () => {
  const notifier = require('node-notifier')

  return (severity, errors) => {
    if (severity !== 'error') return

    const error = errors[0]
    const filename = error.file && error.file.split('!').pop()

    notifier.notify({
      title: packageConfig.name,
      message: severity + ': ' + error.name,
      subtitle: filename || '',
      icon: path.join(__dirname, 'logo.png')
    })
  }
}

exports.getHtmlOptions = () => {
  const htmlOptions = {
    filename: 'index.html',
    template: 'public/index.html',
    inject: true,
    templateParameters: (compilation, assets, pluginOptions) => {
      let stats
      return {
        get webpack () {
          return stats || (stats = compilation.getStats().toJson())
        },
        compilation: compilation,
        webpackConfig: compilation.options,
        htmlWebpackPlugin: {
          files: assets,
          options: pluginOptions
        },
        config: isProd ? config.build : config.dev,
        'process.env.NODE_ENV': process.env.NODE_ENV
      }
    }
  }

  if (isProd) {
    Object.assign(htmlOptions, {
      filename: config.build.index,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        collapseBooleanAttributes: true,
        removeScriptTypeAttributes: true
      }
    })
  }

  return htmlOptions
}

exports.mockApi = (app) => {
  config.dev.mockList.forEach(item => {
    app.get(`${item.path}/*`, (req, res) => {
      let paramsName = req.params[0]
      if (paramsName.includes('.')) {
        paramsName = paramsName.split('.')[0]
      }
      let mockFile = path.join(__dirname, '../mock/', paramsName)
      if (fs.existsSync(mockFile + '.js')) {
        mockFile = mockFile + '.js'
        let result = {}
        try {
          const mockJs = require(mockFile)
          result = typeof mockJs === 'function'
            ? mockJs(req.query)
            : mockJs
        } catch (e) {
          result = {
            errorFile: `/mock/${paramsName}.js`,
            errorName: e.name,
            errorMsg: e.message
          }
        }
        delete require.cache[require.resolve(mockFile)]

        if (req.query.callback) {
          res.jsonp(result)
        } else {
          res.json(result)
        }
      } else if (fs.existsSync(mockFile + '.json')) {
        mockFile = mockFile + '.json'
        const result = JSON.parse(fs.readFileSync(mockFile))

        if (req.query.callback) {
          res.jsonp(result)
        } else {
          res.json(result)
        }
      } else {
        res.sendStatus(404)
      }
    })

    app.post(`${item.path}/*`, (req, res) => {
      let paramsName = req.params[0]
      if (paramsName.includes('.')) {
        paramsName = paramsName.split('.')[0]
      }
      let mockFile = path.join(__dirname, '../mock/', paramsName)
      if (fs.existsSync(mockFile + '.js')) {
        mockFile = mockFile + '.js'
        let result = {}
        try {
          const mockJs = require(mockFile)
          result = typeof mockJs === 'function'
            ? mockJs(req.query)
            : mockJs
        } catch (e) {
          result = {
            errorFile: `/mock/${paramsName}.js`,
            errorName: e.name,
            errorMsg: e.message
          }
        }
        delete require.cache[require.resolve(mockFile)]
        res.json(result)
      } else if (fs.existsSync(mockFile + '.json')) {
        mockFile = mockFile + '.json'
        const result = JSON.parse(fs.readFileSync(mockFile))
        res.json(result)
      } else {
        res.sendStatus(404)
      }
    })
  })

  app.get('/mock/img/:name', (req, res) => {
    let fileName = req.params.name

    var options = {
      root: path.join(__dirname, '../mock/img/'),
      dotfiles: 'deny',
      headers: {
          'x-timestamp': Date.now(),
          'x-sent': true
      }
    }

    res.sendFile(fileName, options)
  })
}
