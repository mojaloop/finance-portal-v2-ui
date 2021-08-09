const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const { DefinePlugin } = require('webpack');
const TerserPlugin = require("terser-webpack-plugin");
const path = require('path');

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          keep_classnames: true,
          keep_fnames: true,
        },
      }),
    ],
  },
  entry: './src/index',
  devtool: 'cheap-module-source-map',
  devServer: {
    disableHostCheck: true,
    // Enable gzip compression of generated files.
    compress: false,
    // Silence WebpackDevServer's own logs since they're generally not useful.
    // It will still show compile warnings and errors with this setting.
    clientLogLevel: 'none',
    // By default files from `contentBase` will not trigger a page reload.
    watchContentBase: true,
    // Enable hot reloading server. It will provide WDS_SOCKET_PATH endpoint
    // for the WebpackDevServer client so it can learn when the files were
    // updated. The WebpackDevServer client is included as an entry point
    // in the webpack development configuration. Note that only changes
    // to CSS are currently hot reloaded. JS changes will refresh the browser.
    hot: true,
    // Use 'ws' instead of 'sockjs-node' on server since we're using native
    // websockets in `webpackHotDevClient`.
    transportMode: 'ws',
    // Prevent a WS client from getting injected as we're already including
    // `webpackHotDevClient`.
    injectClient: false,
    historyApiFallback: true, // React Router
    contentBase: path.join(__dirname, 'dist'),
    port: 3000,
    publicPath: '/',
    proxy: {
      '/api/login': {
        target: 'http://localhost:3002',
        secure: false,
        pathRewrite: {
          '^/api/login': '',
        },
      },
      '/api/settlement': {
        target: 'http://localhost:3007',
        secure: false,
        pathRewrite: {
          '^/api/settlement': '',
        },
      },
      '/api/portal-backend': {
        target: 'http://localhost:3002',
        secure: false,
        pathRewrite: {
          '^/api/portal-backend': '',
        },
      },
    },
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/', // Where it's going to be expected to be published for being externally loaded
  },
  resolve: {
    alias: {
      react: path.resolve(__dirname, 'node_modules', 'react'),
      'react-redux': path.resolve(__dirname, 'node_modules', 'react-redux'),
    },
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.css'],
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.(ts|js)x?$/,
        use: 'eslint-loader',
        exclude: [/node_modules/, /integration_test/],
      },
      {
        test: /\.(ts|js)x?$/,
        use: 'ts-loader',
        exclude: [/node_modules/, /integration_test/],
      },
      {
        test: /\.css$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
        ],
      },
      {
        test: /\.(png|jpg|gif)$/i,
        use: [
          {
            loader: 'url-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'app',
      library: { type: 'var', name: 'app' },
      filename: 'app.js',
      exposes: {
        './App': './src/App',
      },
      shared: [
        'react',
        'react-dom',
        'react-redux',
        'react-router-dom',
        'redux',
        'redux-saga',
        'history',
        '@reduxjs/toolkit',
        '@modusbox/modusbox-ui-components',
      ],
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};
