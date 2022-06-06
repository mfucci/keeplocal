const { merge } = require('webpack-merge');
const common = require('./webpack.config.js');
const { ESBuildMinifyPlugin } = require('esbuild-loader')


module.exports = merge(common, {
  mode: 'production',
  optimization: {
    usedExports: true,
    minimize: true,
    minimizer: [new ESBuildMinifyPlugin({
      target: 'es2015'
    })],
  },
});
