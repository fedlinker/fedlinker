module.exports = (options, { isDev }, config) => {
  const { statics } = options;

  return isDev
    ? Object.assign(config, {
        devServer: {
          clientLogLevel: 'none',

          compress: true,

          historyApiFallback: {
            disableDotRule: true,
          },

          publicPath: '/',

          host: '0.0.0.0',

          port: 8080,

          open: true,

          openPage: '',

          hot: true,

          overlay: true,

          contentBase: statics,

          watchContentBase: true,
        },
      })
    : config;
};
