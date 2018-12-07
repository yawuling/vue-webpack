# Vue 项目通用配置升级强化

## 运行

```
npm install
```

### 运行开发环境
```
npm run dev
```

### 运行开发环境（代理）
```
npm run dev:proxy
```

### 打包预发环境
```
npm run build:yf
```

### 打包正式环境

```
npm run build
```

## 支持

* webpack4 ☑️
* scss预处理语言 ☑️️
* 资源preload，prefetch ☑️
* eslint
* Mock API ☑️
* Proxy 代理 ☑️
* pc 预渲染支持SEO
* mobile 支持骨架屏（skelton）
* mobile flexible
* PWA

## 说明

### Mock API

使用 Mock API 功能，在`/build/config.js`中的 `dev.mockList` 中设置名单列表，express 会对 mockList 数组的每个成员
的 path 进行拦截，将请求打到 `/mock` 同请求路径的 js 文件或者 json 文件上。请求的地址后缀名依旧可以是`.action`等，

同个请求支持`jsonp`请求和`ajax`请求，因为在处理请求的时候对是否带有`callback`函数进行了判断

#### JS 文件 Mock

JS 文件进行 Mock 数据模拟，主要是用于实现动态数据 Mock，按照 `Common.js` 的语法导出一个函数，函数有入参`query`，可以获取到
请求的`query`参数（如：?name=John，获取name的值为query.name）。一般 JS 文件的 Mock 是用来测试多种返回状态效果的功能。

> JS Mock 支持热更新，即随时修改代码即时访问，无需重启服务器。本质上是使用express和require进行文件读取，因为require会对模块
进行缓存，所以在获取到函数返回的数据后，需要手动将缓存清除。

示例：请求地址 http://example.com/api/login.action, Mock 的路径为 /mock/login.js 
```JavaScript
module.exports = query => {
  let code = Math.random() > 0.5 ? 1 : 0

  return {
    code: code,
    data: {
      name: query.name
    }
  }
}
```

请求支持多级路径，如：请求地址 http://example.com/api/user/login.action, Mock 的路径为 /mock/user/login.js 

#### JSON 文件 Mock

JSON 文件的 Mock，就是直接写个 JSON 文件即可，express 会根据路径用 fs 去读取文件的内容，并将其作为结果返回。

示例：请求地址 http://example.com/test.action, Mock 的路径为 /mock/test.json
```json
{
  "code": 1
}
```

请求支持多级路径，如：请求地址 http://example.com/api/user/test.action, Mock 的路径为 /mock/user/test.json 

### Proxy 代理

使用 Proxy 代理功能，在`/build/config.js`中的 `dev.mockList` 中设置名单列表，对 mockList 数组的每个子项，会将
子项的`path`路径转发到`target`域名上
