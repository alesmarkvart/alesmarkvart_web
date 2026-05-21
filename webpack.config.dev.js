const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  watchOptions: {
    ignored: /node_modules/,
  },
  devServer: {
    liveReload: true,
    hot: false,
    open: true,
    static: {
      directory: './',
      watch: false,
    },
    watchFiles: {
      paths: ['*.html', 'css/**/*', 'js/**/*', 'img/**/*'],
      options: {
        ignored: /node_modules/,
        usePolling: false,
      },
    },
  },
});
