# @speedy/sass-loader
[![npm version](https://img.shields.io/npm/v/@speedy/sass-loader.svg)](https://www.npmjs.com/package/@speedy/sass-loader)
[![dependencies Status](https://david-dm.org/alan-agius4/speedy-webpack-sass-loader/status.svg)](https://david-dm.org/alan-agius4/speedy-webpack-sass-loader)
[![devDependencies Status](https://david-dm.org/alan-agius4/speedy-webpack-sass-loader/dev-status.svg)](https://david-dm.org/alan-agius4/speedy-webpack-sass-loader?type=dev)

This is a drop in replacement for [SASS Loader](https://github.com/webpack-contrib/sass-loader) It is highly simplified in order to improve performance on large application with a lot of SASS imports.

This has mainly been developed for "legacy" SASS architecture, ie: SASS is not required within a JS file. However this doesn't mean it will not work with modern architectures.

## Install
```cmd
npm install @speedy/sass-loader node-sass webpack --save-dev
```

## Examples
```js
// webpack.config.js
module.exports = {
  entry: {
    "app.mobile": "./src/apps/app/app.scss"
  },
  module: {
      rules: [{
          test: /\.scss$/,
          use: [{
              loader: "@speedy/sass-loader" // compiles SASS to CSS
          }]
      }]
  }
};
```
Usually, it's recommended to extract the style sheets into a dedicated file in production using the ExtractTextPlugin. This way your styles are not dependent on JavaScript:
```js
// webpack.config.js
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: {
    "app.mobile": "./src/apps/app/app.scss"
  },

  module: {
    loaders: [
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          use: [
            {
              loader: "@speedy/sass-loader",
              options: {
                includePaths: ["./src/assets/sass"]
              }
            }
          ]
        })
      }
    ]
  },

  plugins: [
    new ExtractTextPlugin({
      filename: "[name].css",
      allChunks: true
    })
  ]
};
```