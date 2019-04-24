module.exports = (chain, options, { isDev }) => {
  if (isDev) {
    const { statics } = options;

    chain.devServer
      .clientLogLevel('none')
      .compress(true)
      .contentBase(statics)
      .historyApiFallback({ disableDotRule: true })
      .host('0.0.0.0')
      .hot(true)
      .open(true)
      .overlay(true)
      .port(8080)
      .publicPath('/')
      .quiet(true)
      .watchContentBase(true);
  }
};
