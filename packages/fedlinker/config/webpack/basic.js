module.exports = (chain, options, { isProd, isDev }) => {
  const { entry, dest, publicPath, typescript } = options;

  chain.mode(isProd ? 'production' : 'development');
  chain.bail(isProd);
  chain.entry('main').add(entry);

  chain.output
    .path(dest)
    .filename(
      isProd
        ? 'assets/js/[name].[contenthash].bundle.js'
        : 'assets/js/[name].bundle.js'
    )
    .chunkFilename(
      isProd
        ? 'assets/js/[name].[contenthash].chunk.js'
        : 'assets/js/[name].chunk.js'
    )
    .publicPath(publicPath);

  chain.resolve.extensions
    .add('.mjs')
    .add('.js')
    .add('.json')
    .add('.jsx');
  if (typescript) {
    chain.resolve.extensions.add('.ts').add('.tsx');
  }

  if (isDev) {
    chain.devtool('cheap-module-eval-source-map');
  }

  chain.optimization.runtimeChunk('single');
};
