const resolve = require('resolve');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (options, { isProd, isDev }, config) => {
  const {
    flow,
    typescript,
    proposals,

    root,
    assets,
    productionSourceMap,

    style,
    postcss,
    css,
    less,
    sass,
    stylus,

    markdown,
    mdx,
    image,
    other,
    thread,

    shim,
    polyfills,

    pages,

    babel,
  } = options;

  const extensions = [
    '.jsx',
    '.js',
    typescript && '.tsx',
    typescript && '.ts',
    '.mjs',
  ].filter(Boolean);

  const entries = pages.map(page => {
    try {
      return resolve.sync(page.entry, {
        basedir: root,
        extensions,
      });
    } catch (e) {
      return page.entry;
    }
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
              ...(typeof style === 'object' ? style : {}),
            },
          }
        : {
            loader: require.resolve('style-loader'),
            options: {
              sourceMap: isDev,
              ...(typeof style === 'object' ? style : {}),
            },
          },
      {
        loader: require.resolve('css-loader'),
        options: {
          modules: cssModules,
          camelCase: cssModules,
          sourceMap: isDev || (isProd && productionSourceMap),
          importLoaders: postcss
            ? type === 'css'
              ? 1
              : 2
            : type === 'css'
            ? 0
            : 1,
          ...(typeof css === 'object' ? css : {}),
        },
      },
    ];

    if (postcss) {
      loaders.push({
        loader: require.resolve('postcss-loader'),
        options: {
          sourceMap: isDev || (isProd && productionSourceMap),
          ident: 'postcss',
          plugins: [
            require('postcss-flexbugs-fixes'),
            require('postcss-preset-env')({ stage: 3 }),
            require('postcss-normalize')(),
          ],
          ...(typeof postcss === 'object' ? postcss : {}),
        },
      });
    }

    if (type === 'less' && !!less) {
      loaders.push({
        loader: require.resolve('less-loader'),
        options: {
          sourceMap: isDev || (isProd && productionSourceMap),
          ...(typeof less === 'object' ? less : {}),
        },
      });
    }

    if (type === 'sass' && !!sass) {
      loaders.push({
        loader: require.resolve('sass-loader'),
        options: {
          sourceMap: isDev || (isProd && productionSourceMap),
          ...(typeof sass === 'object' ? sass : {}),
        },
      });
    }

    if (type === 'stylus' && !!stylus) {
      loaders.push({
        loader: require.resolve('stylus-loader'),
        options: {
          sourceMap: isDev || (isProd && productionSourceMap),
          ...(typeof stylus === 'object' ? stylus : {}),
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
                !!thread && {
                  loader: require.resolve('thread-loader'),
                  options: {
                    ...(typeof thread === 'object' ? thread : {}),
                  },
                },
                {
                  loader: require.resolve('babel-loader'),
                  options: {
                    cacheDirectory: true,
                    babelrc: false,
                    ...babelOptions,
                  },
                },
              ].filter(Boolean),
            },

            // CSS rule.
            !!css && {
              test: /\.module\.css$/,
              use: getStyleLoaders('css', true),
            },
            !!css && {
              test: /\.css$/,
              exclude: /\.module\.css$/,
              use: getStyleLoaders('css', false),
            },

            // Less rule.
            !!less && {
              test: /\.module\.less$/,
              use: getStyleLoaders('less', true),
            },
            !!less && {
              test: /\.less$/,
              exclude: /\.module\.less$/,
              use: getStyleLoaders('less', false),
            },

            // Sass rule.
            !!sass && {
              test: /\.module\.(sass|scss)$/,
              use: getStyleLoaders('sass', true),
            },
            !!sass && {
              test: /\.(sass|scss)$/,
              exclude: /\.module\.(sass|scss)$/,
              use: getStyleLoaders('sass', false),
            },

            // Stylus rule.
            !!stylus && {
              test: /\.module\.(styl|stylus)$/,
              use: getStyleLoaders('stylus', true),
            },
            !!stylus && {
              test: /\.(styl|stylus)$/,
              exclude: /\.module\.(styl|stylus)$/,
              use: getStyleLoaders('stylus', false),
            },

            // Images.
            !!image && {
              test: /\.(png|jpg|gif|jpeg|bmp)$/,
              use: [
                {
                  loader: require.resolve('url-loader'),
                  options: {
                    limit: 8192,
                    name: isProd
                      ? `${assets}images/[name].[hash:8].[ext]`
                      : `${assets}images/[name].[ext]`,
                    ...(typeof image === 'object' ? image : {}),
                  },
                },
              ],
            },

            // Markdown.
            !!markdown && {
              test: /\.(md|markdown)$/,
              use: [
                !!thread && {
                  loader: require.resolve('thread-loader'),
                  options: {
                    ...(typeof thread === 'object' ? thread : {}),
                  },
                },
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
                  options: {
                    ...(typeof markdown === 'object' ? markdown : {}),
                  },
                },
              ].filter(Boolean),
            },

            // MDX.
            !!mdx && {
              test: /\.mdx$/,
              use: [
                !!thread && {
                  loader: require.resolve('thread-loader'),
                  options: {
                    ...(typeof thread === 'object' ? thread : {}),
                  },
                },
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
                  options: {
                    ...(typeof mdx === 'object' ? mdx : {}),
                  },
                },
              ].filter(Boolean),
            },

            // Others.
            !!other && {
              exclude: [
                /\.(json|wasm)$/,
                /\.(html|ejs)$/,
                /\.(js|jsx|mjs)$/,
                typescript && /\.(ts|tsx)$/,
                !!css && /\.css$/,
                !!less && /\.less$/,
                !!sass && /\.(scss|sass)$/,
                !!stylus && /\.(stly|stylus)$/,
                !!image && /\.(png|jpg|gif|jpeg|bmp)$/,
                !!markdown && /\.(md|markdown)$/,
                !!mdx && /\.mdx$/,
              ].filter(Boolean),
              use: [
                {
                  loader: require.resolve('file-loader'),
                  options: {
                    name: isProd
                      ? `${assets}other/[name].[hash:8].[ext]`
                      : `${assets}other/[name].[ext]`,
                    ...(typeof other === 'object' ? other : {}),
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
