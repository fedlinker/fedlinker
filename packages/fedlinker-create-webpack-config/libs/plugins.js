const WebpackBar = require('webpackbar');
const webpack = require('webpack');
const fs = require('fs');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackSubresourceIntegrity = require('webpack-subresource-integrity');
const ResourceHintWebpackPlugin = require('resource-hints-webpack-plugin');

module.exports = (options, { isProd, isDev }, config) => {
  const { dist, statics, pages } = options;

  return Object.assign(config, {
    plugins: [
      new WebpackBar(),

      isProd && new CleanWebpackPlugin(),

      isProd &&
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
            ? 'assets/css/[name].[contenthash:8].bundle.css'
            : 'assets/css/[name].bundle.css',
          chunkFilename: isProd
            ? 'assets/css/[name].[contenthash:8].chunk.css'
            : 'assets/css/[name].chunk.css',
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

      isProd && new ResourceHintWebpackPlugin(),
    ].filter(Boolean),
  });
};
