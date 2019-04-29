const webpack = require('webpack');
const fs = require('fs');
const resolve = require('resolve');
const { normalizeConfig } = require('fedlinker-utils');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackSubresourceIntegrity = require('webpack-subresource-integrity');
const ResourceHintWebpackPlugin = require('resource-hints-webpack-plugin');
const WebpackBar = require('webpackbar');

module.exports = (options = {}, env) => {
  // Validate and normalize options.
  if (!options || !options.__normalized) {
    options = normalizeConfig(options, true);
  }

  const {
    flow,
    typescript,
    src,
    dist,
    statics,
    productionPublicPath,
    injectDefaultPolyfills,
    pages,
    proposals,
    polyfills,
  } = options;

  // Env.

  env = env || process.env.NODE_ENV;

  if (env !== 'production' && env !== 'development') {
    throw new Error(
      'Should set env to "production" or "development" when use ' +
        '`fedlinker-create-webpack-config`'
    );
  }

  const isProd = env === 'production';
  const isDev = env === 'development';

  // Extensions.

  const extensions = [
    '.wasm',
    '.mjs',
    '.js',
    '.json',
    '.jsx',
    typescript && '.ts',
    typescript && '.tsx',
  ].filter(Boolean);

  // Entries.

  const entries = {};
  pages.forEach(page => {
    entries[page.name] = page.entry;
  });

  // Absolute entry filenames.

  const absoluteEntryFilenames = pages.map(page => {
    return resolve.sync(page.entry, {
      basedir: src,
      extensions: extensions,
    });
  });

  // Babel options.

  const defaultBabelOptions = {
    presets: [
      [
        require.resolve('babel-preset-fedlinker'),
        {
          flow,
          typescript,
          proposals,
          injectDefaultPolyfills,
          entry: absoluteEntryFilenames,
          polyfills,
        },
      ],
    ],
  };
  let babelOptions = options.babel || defaultBabelOptions;

  if (typeof babelOptions === 'function') {
    babelOptions = babelOptions(defaultBabelOptions);
  }

  if (!babelOptions || typeof babelOptions !== 'object') {
    throw new Error(
      '`babel` option should be an object or a function that return an object'
    );
  }

  // Get style loaders.

  const getStyleLoaders = (type, cssModules = false) => {
    const loaders = [
      isProd
        ? {
            loader: MiniCssExtractPlugin.loader,
            options: { hmr: false },
          }
        : {
            loader: require.resolve('style-loader'),
            options: { sourceMap: isDev },
          },
      {
        loader: require.resolve('css-loader'),
        options: {
          modules: cssModules,
          camelCase: cssModules,
          sourceMap: isDev,
          importLoaders: type === 'css' ? 1 : 2,
        },
      },
      {
        loader: require.resolve('postcss-loader'),
        options: {
          sourceMap: isDev,
          ident: 'postcss',
          plugins: [
            require('postcss-flexbugs-fixes'),
            require('postcss-preset-env')({ stage: 3 }),
            require('postcss-normalize')(),
          ],
        },
      },
    ];

    if (type !== 'css') {
      loaders.push({
        loader: require.resolve(`${type}-loader`),
        options: { sourceMap: isDev },
      });
    }

    return loaders;
  };

  // Basic.

  const config = {
    mode: env,
    bail: isProd,
    entry: entries,
    output: {
      path: dist,
      filename: isProd
        ? 'assets/js/[name].[contenthash].bundle.js'
        : 'assets/js/[name].bundle.js',
      chunkFilename: isProd
        ? 'assets/js/[name].[contenthash].chunk.js'
        : 'assets/js/[name].chunk.js',
      publicPath: isProd ? productionPublicPath : '/',
      futureEmitAssets: true,
      crossOriginLoading: 'anonymous',
    },
    resolve: { extensions: extensions },
    devtool: isDev ? 'cheap-module-eval-source-map' : false,
    optimization: {
      splitChunks: {
        chunks: 'all',
      },
      runtimeChunk: true,
    },
  };

  // Rules.

  config.module = {
    rules: [
      // Forbidden `require.ensure()`, use `import()`.
      { parser: { requireEnsure: false } },

      {
        oneOf: [
          // Script rule.
          {
            test: typescript ? /\.(js|jsx|mjs|ts|tsx)$/ : /\.(js|jsx|mjs)$/,
            exclude: /(node_modules|bower_components)/,
            use: [
              {
                loader: require.resolve('babel-loader'),
                options: {
                  cacheDirectory: true,
                  babelrc: false,
                  ...babelOptions,
                },
              },
            ],
          },

          // CSS rule.
          {
            test: /\.module\.css$/,
            use: getStyleLoaders('css', true),
          },
          {
            test: /\.css$/,
            exclude: /\.module\.css$/,
            use: getStyleLoaders('css', false),
          },

          // Less rule.
          {
            test: /\.module\.less$/,
            use: getStyleLoaders('less', true),
          },
          {
            test: /\.less$/,
            exclude: /\.module\.less$/,
            use: getStyleLoaders('less', false),
          },

          // Sass rule.
          {
            test: /\.module\.(sass|scss)$/,
            use: getStyleLoaders('sass', true),
          },
          {
            test: /\.(sass|scss)$/,
            exclude: /\.module\.(sass|scss)$/,
            use: getStyleLoaders('sass', false),
          },

          // Stylus rule.
          {
            test: /\.module\.(styl|stylus)$/,
            use: getStyleLoaders('stylus', true),
          },
          {
            test: /\.(styl|stylus)$/,
            exclude: /\.module\.(styl|stylus)$/,
            use: getStyleLoaders('stylus', false),
          },

          // Images.
          {
            test: /\.(png|jpg|gif|jpeg|bmp)$/,
            use: [
              {
                loader: require.resolve('url-loader'),
                options: {
                  limit: 8192,
                  name: isProd
                    ? 'assets/images/[name].[hash].[ext]'
                    : 'assets/images/[name].[ext]',
                },
              },
            ],
          },

          // Others.
          {
            exclude: [
              /\.(js|jsx|mjs|ts|tsx|json)$/,
              /\.(css|scss|sass|stly|stylus)$/,
              /\.(png|jpg|gif|jpeg|bmp)$/,
              /\.(html|ejs)$/,
            ],
            use: [
              {
                loader: require.resolve('file-loader'),
                options: {
                  name: isProd
                    ? 'assets/other/[name].[hash].[ext]'
                    : 'assets/other/[name].[ext]',
                },
              },
            ],
          },
        ],
      },
    ],
  };

  // Plugins.

  config.plugins = [
    new WebpackBar(),
    isProd && new CleanWebpackPlugin(),
    isProd &&
      fs.existsSync(statics) &&
      new CopyWebpackPlugin([{ from: statics, to: dist }]),
    isDev && new webpack.HotModuleReplacementPlugin(),
    isProd &&
      new MiniCssExtractPlugin({
        filename: isProd
          ? 'assets/css/[name].[contenthash].bundle.css'
          : 'assets/css/[name].bundle.css',
        chunkFilename: isProd
          ? 'assets/css/[name].[contenthash].chunk.css'
          : 'assets/css/[name].chunk.css',
      }),
    isProd && new OptimizeCssAssetsPlugin(),
    isProd &&
      new WebpackSubresourceIntegrity({
        hashFuncNames: ['sha512'],
        enabled: isProd,
      }),
    ...pages.map(page => {
      const { filename, template, title, name } = page;
      return new HtmlWebpackPlugin({
        // html-webpack-plugin options.
        title,
        filename,
        template,
        hash: isProd,
        chunks: [`runtime~${name}`, `vendors~${name}`, name],
      });
    }),
    isProd && new ResourceHintWebpackPlugin(),
  ].filter(Boolean);

  // Dev server.

  if (isDev) {
    config.devServer = {
      clientLogLevel: 'none',
      compress: true,
      contentBase: statics,
      historyApiFallback: {
        disableDotRule: true,
      },
      host: '0.0.0.0',
      hot: true,
      open: true,
      overlay: true,
      port: 8080,
      publicPath: isProd ? productionPublicPath : '/',
      watchContentBase: true,
    };
  }

  return config;
};
