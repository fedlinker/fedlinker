module.exports = (chain, options, { isProd, isDev }) => {
  const { typescript } = options;

  chain.module.rule('parser').parser({ requireEnsure: false });

  // Script
  chain.module
    .rule('script')
    .test(typescript ? /\.(js|mjs|jsx|ts|tsx)$/ : /\.(js|mjs|jsx)$/)
    .exclude.add(/(node_modules|bower_components)/)
    .end()
    .use('babel-loader')
    .loader(require.resolve('babel-loader'))
    .options({
      babelrc: false,
      presets: [[require.resolve('babel-preset-fedlinker'), options]],
      cacheDirectory: true,
    });

  // CSS
  chain.module.rule('css').test(/\.css$/);

  // Image
  chain.module
    .rule('image')
    .test(/\.(bmp|gif|jpg|jpeg|png)$/)
    .use('url-loader')
    .loader(require.resolve('url-loader'))
    .options({
      limit: 8192,
    });
};
