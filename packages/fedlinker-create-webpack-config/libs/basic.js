module.exports = (options, { env, isProd, isDev }, config) => {
  const {
    typescript,
    root,
    dist,
    assets,
    productionPublicPath,
    productionSourceMap,
    pages,
  } = options;

  const entries = {};
  pages.forEach(page => (entries[page.name] = page.entry));

  return Object.assign(config, {
    mode: env,

    context: root,

    entry: entries,

    output: {
      path: dist,

      filename: isProd
        ? `${assets}js/[name].[contenthash:8].js`
        : `${assets}js/[name].js`,

      chunkFilename: isProd
        ? `${assets}js/[name].[contenthash:8].js`
        : `${assets}js/[name].js`,

      publicPath: isProd ? productionPublicPath : '/',

      futureEmitAssets: true,

      // Use with webpack-subresource-integrity plugin in production env.
      crossOriginLoading: isProd ? 'anonymous' : undefined,
    },

    resolve: {
      extensions: [
        '.jsx',
        '.js',
        typescript && '.tsx',
        typescript && '.ts',
        '.json',
        '.mjs',
      ].filter(Boolean),
    },

    devtool:
      isProd && productionSourceMap
        ? 'source-map'
        : isDev
        ? 'cheap-module-eval-source-map'
        : false,

    stats: isDev ? 'minimal' : 'normal',

    bail: isProd,
  });
};
