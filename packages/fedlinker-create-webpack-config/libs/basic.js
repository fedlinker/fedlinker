module.exports = (options, { env, isProd, isDev }, config) => {
  const { typescript, root, dist, productionPublicPath, pages } = options;

  const entries = {};
  pages.forEach(page => {
    entries[page.name] = page.entry;
  });

  return Object.assign(config, {
    mode: env,
    bail: isProd,
    context: root,
    entry: entries,
    output: {
      path: dist,
      filename: isProd
        ? 'assets/js/[name].[contenthash:8].bundle.js'
        : 'assets/js/[name].bundle.js',
      chunkFilename: isProd
        ? 'assets/js/[name].[contenthash:8].chunk.js'
        : 'assets/js/[name].chunk.js',
      publicPath: isProd ? productionPublicPath : '/',
      futureEmitAssets: true,
      crossOriginLoading: isProd ? 'anonymous' : undefined,
    },
    resolve: {
      extensions: [
        '.wasm',
        '.mjs',
        '.js',
        '.json',
        '.jsx',
        typescript && '.ts',
        typescript && '.tsx',
      ].filter(Boolean),
    },
    devtool: isDev ? 'cheap-module-eval-source-map' : false,
    stats: isDev ? 'minimal' : 'normal',
  });
};
