<div align="center">
    <a href="#" target="_blank">
    <img src="https://i.postimg.cc/bN7f4YY3/logo.png" alt="websee-logo" height="80">
    </a>
    <p>websee-sourcemap，主要配合websee使用，打包时自动上传sourceMap</p>
    <p>在打包完成后，输出dist文件前运行</p>
</div>

## 功能

1、打包时自动上传sourceMap

注意：打包时productionSourceMap需要为true，确保能生成map文件用于上传，如果不想在dist保留map文件，可在websee-sourcemap配置中配置productionSourceMap，等上传结束后，自动删除map文件




## 安装

```bash
$ npm install websee-sourcemap
```

## 配置

```bash
// vue.config.js
const WebSeeSourceMap = require('websee-sourcemap');

module.exports = defineConfig({
  productionSourceMap: true,// true生产环境生成sourceMap文件
  configureWebpack: {
    plugins: [
      new WebSeeSourceMap({
        name: '',// 项目名称 可选
        token: '',// 项目唯一token 必填 websee平台新增项目会生成token
        dsn: '',// sourceMap上传地址 必填
        appVersion: '',// web应用版本(package.json'中的version) 必填 不可跟以前版本重复，用户存放历史版本map文件
        productionSourceMap: '',// 生产环境是否保留sourceMap 必填
        uploadScript: []// 需要上传sourceMap的命令 可选 默认值为['vue-cli-service build']，其他命令需要上传sourceMap的话，加入数组即可
      })
    ]
  }
})
```
