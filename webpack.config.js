const path = require('path')
const webpack = require('webpack')

// https://webpack.js.org/configuration/
module.exports = {
  mode: process.env.NODE_ENV || 'production',

  entry: {
    popup: './src/scripts/popup.ts',
    inject: './src/scripts/inject.ts',
    'i18n-html': './src/scripts/i18n-html.ts'
  },

  output: {
    path: path.resolve(__dirname, './dist/scripts'),
    filename: '[name].js'
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },

  resolve: {
    modules: ['node_modules'],
    extensions: ['.ts'],
  },

  target: 'web',

  optimization: {
    minimize: true
  },

  plugins: [
    new webpack.EnvironmentPlugin(['BROWSER'])
  ]
}