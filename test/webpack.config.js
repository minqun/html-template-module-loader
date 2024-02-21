const path = require("path");
const { config } = require("./config.js");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
function resolve(file) {
  return path.resolve(__dirname, file);
}
function tplAbuildFile() {
  const entry =  {
    index: "./src/index.js",
  }
  const plugins = []
  for (let i in entry) {
    if (i) {
      plugins.push(new HtmlWebpackPlugin({
        filename: `${i}.html`,
        template: `src/${i}.html`,
        chunks: [i]
      }))
    }
    
  }
  return {
    entry,
    plugins
  }
}

module.exports = {
  mode: config.type,
  entry: tplAbuildFile().entry,
  output: {
    filename: "[name].[contenthash].js",
    path: resolve("dist"),
    publicPath: "/",
    clean: true,
  },
  resolve: {
    alias: {
      "@src": resolve("src"),
    },
  },
  devtool: config.type != "production" && "inline-source-map",
  devServer: {
    static: resolve("dist"),
    watchFiles: ["src/*", "src/tpl/*"],
    hot: true,
    proxy: {
      '/api': {
        target: 'http://test.shoplus.net/api',
        secure: false,
        changeOrigin: true,
        pathRewrite: {'^/api': ''},
      }
    },
  },
  externals: {
    lodash: {
      // 外部资源依赖
      //   commonjs: 'lodash',
      //   commonjs2: 'lodash',
      //   amd: 'lodash',
      //   root: '_',
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: resolve("src"),
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-env"],
          plugins: ["@babel/plugin-transform-runtime"],
        },
      },
      {
        test: /\.scss$/i,
        use: [
          config.type != "production"
            ? "style-loader"
            : MiniCssExtractPlugin.loader,
            
          "css-loader",
          "postcss-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: "asset/resource",
      },
      {
        test: /\.html$/i,
       use: ['html-loader', {loader: path.resolve('./plugins/index.js'),
        options: {
          tag: 'tpl',
          attr: 'src',
          tplTag: 'div',
          tplAttr: 'tpl'
        }
      }
       ]
      },
      
    ],
  },
  plugins: [
    new CopyPlugin({
        patterns: [
          { from: "public", to: "public" },
        ],
      }),
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css",
      chunkFilename: "[id].[contenthash].css",
    }),
    ...tplAbuildFile().plugins
    
  ],
  optimization: {
    splitChunks: {
      chunks: "all",
    },
    runtimeChunk: "single",
  },
};
