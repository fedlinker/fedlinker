module.exports = (options, environment, config) => {
  return Object.assign(config, {
    optimization: {
      splitChunks: {
        chunks: 'all',
      },
      runtimeChunk: true,
    },
  });
};
