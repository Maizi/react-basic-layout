const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 8089,
    historyApiFallback: true,
    host: '0.0.0.0',
    // inline: true,
    // hotOnly:true,
    hot: true,
  },
});
