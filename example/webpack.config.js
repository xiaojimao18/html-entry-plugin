var path = require('path');
var webpack = require('webpack');
var HTMLEntryPlugin = require('html-entry-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: {
    'index': ['./src/index.js'],
    'admin/index': './src/admin/index.js'
  },
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/dist/',
    filename: '[name].[chunkhash:8].js',
    chunkFileName: 'chunk.[id].[chunkhash:8].js'
  },
  module: {
    loaders: [
      {test: /\.css$/, loader: ExtractTextPlugin.extract('style', 'css')}
    ]
  },
  plugins: [
    new ExtractTextPlugin('[name].[contenthash:8].css', { allChunks: true}),
    new HTMLEntryPlugin({
      src: 'src'
    })
  ]
};