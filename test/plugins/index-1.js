const fs = require("fs")
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin');
class FileListPlugin {
    static defaultOptions = {
      outputFile: '',
    };
  
    // 需要传入自定义插件构造函数的任意选项
    //（这是自定义插件的公开API）
    constructor(options = {}) {
      // 在应用默认选项前，先应用用户指定选项
      // 合并后的选项暴露给插件方法
      // 记得在这里校验所有选项
      this.options = { ...FileListPlugin.defaultOptions, ...options };
    }
  
    apply(compiler) {
      const pluginName = FileListPlugin.name;
  
      // webpack 模块实例，可以通过 compiler 对象访问，
      // 这样确保使用的是模块的正确版本
      // （不要直接 require/import webpack）
      const { webpack } = compiler;
  
      // Compilation 对象提供了对一些有用常量的访问。
      const { Compilation } = webpack;
  
      // RawSource 是其中一种 “源码”("sources") 类型，
      // 用来在 compilation 中表示资源的源码
      const { RawSource } = webpack.sources;
  
      // 绑定到 “thisCompilation” 钩子，
      // 以便进一步绑定到 compilation 过程更早期的阶段
      compiler.hooks.emit.tap(pluginName, (compilation) => {
        const assets = compilation.assets;
        Object.keys(assets)
        .map((filename) => {
          if (filename.includes('.html')) {
            let matchArr = assets[filename].source().match('<tpl=\"(.+)\"?/>')
            // console.log(matchArr)
            if (matchArr[1]) {
              let file = matchArr[1].replace('"', '')
              const data = fs.readFileSync(path.resolve('./' + file), 'utf8')
              const source = assets[filename].source().replace(matchArr[0], data)
              compilation.updateAsset(filename, new RawSource(source))
              // HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
              //   pluginName, // <-- Set a meaningful name here for stacktraces
              //   (data, cb) => {
                 
              //     cb(null, data)
              //   }
              // )
           
              // fs.readFile(path.resolve('./' + file), 'utf8', (err, data) => {
              //   if (err) throw err;
              //   const source = assets[filename].source().replace(matchArr[0], data)
              //   compilation.updateAsset(filename, new RawSource(source))
              // })
            }
           
          }
          
        })
      
      });
      // compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      //   // 绑定到资源处理流水线(assets processing pipeline)
      //   compilation.hooks.processAssets.tap({
      //     name: pluginName,

      //     // 用某个靠后的资源处理阶段，
      //     // 确保所有资源已被插件添加到 compilation
      //     stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
      //   },
      //   (assets) => {
      //     console.log('2lai---assets', assets)
      //   })
      // })
    }
  }
  
  module.exports = FileListPlugin