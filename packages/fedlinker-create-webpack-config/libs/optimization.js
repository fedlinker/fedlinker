const TerserWebpackPlugin = require('terser-webpack-plugin');
const OptimizeCssAssets = require('optimize-css-assets-webpack-plugin');

module.exports = (options, { isProd }, config) => {
  const { productionSourceMap } = options;

  return Object.assign(config, {
    optimization: {
      minimize: isProd,

      minimizer: [
        new TerserWebpackPlugin({
          cache: true,
          sourceMap: isProd && productionSourceMap,
        }),
        new OptimizeCssAssets({
          cssProcessorOptions: {
            map:
              isProd && productionSourceMap
                ? {
                    inline: false,
                    annotation: true,
                  }
                : false,
          },
        }),
      ],

      splitChunks: {
        chunks: 'all',
      },

      runtimeChunk: true,
    },
  });
};
