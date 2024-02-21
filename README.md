
# html-template-module-loader

[![npm][npm]][npm-url]
[![node][node]][node-url]
[![size][size]][size-url]

## Getting Started

To begin, you'll need to install `html-template-module-loader`:

```console
$ npm install html-template-module-loader --save-dev

```
**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.html$/i,
        use: [
          {
            loader: 'html-template-module-loader',
            options: {
                tag: 'tpl',
                attr: 'file',
                tplTag: 'template',
                tplAttr: 'tpl'
            }
          },
        ],
      },
    ],
  },
};
```
**example**
```html
// template: example-tpl.html
<template tpl>
    模版
</template> 
// html
<tpl file="./src/tpl/example-tpl.html"></tpl>

```
[npm]: https://img.shields.io/npm/v/html-template-module-loader.svg
[npm-url]: https://npmjs.org/package/html-template-module-loader
[node]: https://img.shields.io/node/v/html-template-module-loader.svg
[node-url]: https://nodejs.org
[size]: https://packagephobia.now.sh/badge?p=html-template-module-loader
[size-url]: https://packagephobia.now.sh/result?p=html-template-module-loader