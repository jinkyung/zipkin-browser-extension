const path = require('path');
const webpack = require('webpack');
const ChromeDevPlugin = require('chrome-dev-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const panelSCSS = new ExtractTextPlugin('panel.css');


module.exports = {
  entry: {
    background: './src/background.js',
    devtools: './src/devtools.js',
    panel: './src/panel.js',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.join(__dirname, 'build'),
  },
  context: __dirname,
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: ['node_modules'],
      },
      {
        test: /\.scss$/,
        include: [
          path.resolve(__dirname, "src")
        ],
        loader: panelSCSS.extract(
          {
            fallback: 'style-loader',
            use: ['css-loader', 'sass-loader']
          }
        )
      }
    ],
  },
  plugins: [
    panelSCSS,
    new ChromeDevPlugin(),
    new CopyWebpackPlugin([
      // { context: path.join(__dirname, 'src/html'), from: '*' },
      { context: path.join(__dirname, 'src/img'), from: '*' },
      { from: require.resolve('webextension-polyfill') },
    ]),
    new HtmlWebpackPlugin({
      inject: true,
      chunks: ['panel'],
      filename: 'panel.html',
      template: './src/html/panel.html'
    }),
    new HtmlWebpackPlugin({
      inject: false,
      chunks: ['devtools'],
      filename: 'devtools.html',
      template: './src/html/devtools.html'
    }),
    new ZipPlugin({
      path: path.join(__dirname, 'dist'),
      filename: 'zipkin-extension.zip',
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"dev"',
      },
    }),
  ],
};
