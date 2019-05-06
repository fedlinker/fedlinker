const TerserWebpackPlugin = require('terser-webpack-plugin');
const OptimizeCssAssets = require('optimize-css-assets-webpack-plugin');

module.exports = (options, { isProd }, config) => {
  return Object.assign(config, {
    optimization: {
      minimize: isProd,

      minimizer: [new TerserWebpackPlugin(), new OptimizeCssAssets()],

      splitChunks: {
        chunks: 'all',
      },

      runtimeChunk: true,
    },
  });
};
