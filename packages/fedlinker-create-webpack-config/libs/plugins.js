const fs = require('fs');
const webpack = require('webpack');
const WebpackBar = require('webpackbar');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackSubresourceIntegrity = require('webpack-subresource-integrity');

module.exports = (options, { isProd, isDev }, config) => {
  const { dist, assets, statics, pages } = options;

  return Object.assign(config, {
    plugins: [
      new WebpackBar(),

      new CleanWebpackPlugin(),

      new CopyWebpackPlugin(
        statics
          .map(staticPath => {
            return fs.existsSync(staticPath) &&
              fs.statSync(staticPath).isDirectory()
              ? { from: staticPath, to: dist }
              : undefined;
          })
          .filter(Boolean)
      ),

      isDev && new webpack.HotModuleReplacementPlugin(),

      isProd &&
        new MiniCssExtractPlugin({
          filename: isProd
            ? `${assets}css/[name].[contenthash:8].css`
            : `${assets}css/[name].css`,
          chunkFilename: isProd
            ? `${assets}css/[name].[contenthash:8].css`
            : `${assets}css/[name].css`,
        }),

      isProd &&
        new WebpackSubresourceIntegrity({
          hashFuncNames: ['sha256'],
          enabled: isProd,
        }),

      ...pages.map(page => {
        const {
          name,
          entry,
          title,
          filename,
          template,
          chunks,
          ...rest
        } = page;

        return new HtmlWebpackPlugin({
          inject: !!template,
          title,
          filename,
          chunks,
          template: template || require('html-webpack-template'),
          hash: isProd,

          appMountId: 'root',
          mobile: true,

          ...rest,
        });
      }),
    ].filter(Boolean),
  });
};
