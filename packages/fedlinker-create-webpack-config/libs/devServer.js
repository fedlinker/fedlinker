module.exports = (options, { isDev }, config) => {
  const { statics } = options;

  return isDev
    ? Object.assign(config, {
        devServer: {
          clientLogLevel: 'none',
          compress: true,
          contentBase: statics,
          historyApiFallback: {
            disableDotRule: true,
          },
          host: '0.0.0.0',
          hot: true,
          open: true,
          openPage: '',
          overlay: true,
          port: 8080,
          publicPath: '/',
          watchContentBase: true,
        },
      })
    : config;
};
