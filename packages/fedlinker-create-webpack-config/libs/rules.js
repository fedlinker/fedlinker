const resolve = require('resolve');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (options, { isProd, isDev }, config) => {
  const {
    flow,
    typescript,
    proposals,

    root,
    pages,

    shim,
    polyfills,

    babel,
  } = options;

  const entries = pages.map(page => {
    return resolve.sync(page.entry, {
      basedir: root,
      extensions: [
        '.mjs',
        '.js',
        '.json',
        '.jsx',
        typescript && '.ts',
        typescript && '.tsx',
      ].filter(Boolean),
    });
  });

  const defaultBabelOptions = {
    presets: [
      [
        require.resolve('babel-preset-fedlinker'),
        {
          flow,
          typescript,
          proposals,
          shim,
          entry: entries,
          polyfills,
        },
      ],
    ],
  };
  let babelOptions = babel || defaultBabelOptions;

  if (typeof babelOptions === 'function') {
    babelOptions = babelOptions(defaultBabelOptions);
  }

  if (!babelOptions || typeof babelOptions !== 'object') {
    throw new Error(
      '`babel` option should be an object or a function that return an object'
    );
  }

  const getStyleLoaders = (type, cssModules = false) => {
    const loaders = [
      isProd
        ? {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: false,
            },
          }
        : {
            loader: require.resolve('style-loader'),
            options: {
              sourceMap: isDev,
            },
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

    if (type === 'less') {
      loaders.push({
        loader: require.resolve('less-loader'),
        options: {
          sourceMap: isDev,
        },
      });
    }

    if (type === 'sass') {
      loaders.push({
        loader: require.resolve('sass-loader'),
        options: {
          sourceMap: isDev,
        },
      });
    }

    if (type === 'stylus') {
      loaders.push({
        loader: require.resolve('stylus-loader'),
        options: {
          sourceMap: isDev,
        },
      });
    }

    return loaders;
  };

  return Object.assign(config, {
    module: {
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
                      ? 'assets/images/[name].[hash:8].[ext]'
                      : 'assets/images/[name].[ext]',
                  },
                },
              ],
            },

            // Markdown.
            {
              test: /\.(md|markdown)$/,
              use: [
                {
                  loader: require.resolve('babel-loader'),
                  options: {
                    cacheDirectory: true,
                    babelrc: false,
                    ...babelOptions,
                  },
                },
                {
                  loader: require.resolve('fedlinker-markdown-loader'),
                },
              ],
            },

            // MDX.
            {
              test: /\.mdx$/,
              use: [
                {
                  loader: require.resolve('babel-loader'),
                  options: {
                    cacheDirectory: true,
                    babelrc: false,
                    ...babelOptions,
                  },
                },
                {
                  loader: require.resolve('@mdx-js/loader'),
                },
              ],
            },

            // Others.
            {
              exclude: [
                /\.(json|wasm)$/,
                typescript ? /\.(js|jsx|mjs|ts|tsx)$/ : /\.(js|jsx|mjs)$/,
                /\.(html|ejs)$/,
                /\.css$/,
                /\.less$/,
                /\.(scss|sass)$/,
                /\.(stly|stylus)$/,
                /\.(png|jpg|gif|jpeg|bmp)$/,
                /\.(md|markdown)$/,
                /\.mdx$/,
              ].filter(Boolean),
              use: [
                {
                  loader: require.resolve('file-loader'),
                  options: {
                    name: isProd
                      ? 'assets/rest/[name].[hash:8].[ext]'
                      : 'assets/rest/[name].[ext]',
                  },
                },
              ],
            },
          ].filter(Boolean),
        },
      ],
    },
  });
};
