const fs = require('fs');
const path = require('path');
const { validateAndNormalizeConfig } = require('fedlinker-utils');

module.exports = (options = {}, env) => {
  options = validateAndNormalizeConfig(options);
  env = env || process.env.NODE_ENV;

  if (env !== 'production' && env !== 'development') {
    throw new Error(
      'Should set `env` to "production" or "development" when use ' +
        '`fedlinker-create-webpack-config`'
    );
  }

  const isProd = env === 'production';
  const isDev = env === 'development';

  return fs
    .readdirSync(__dirname)
    .filter(
      filename =>
        fs.statSync(path.join(__dirname, filename)).isFile() &&
        path.extname(filename) === '.js' &&
        filename !== 'index.js'
    )
    .reduce((config, filename) => {
      return require(path.join(__dirname, filename))(
        options,
        { env, isProd, isDev },
        config
      );
    }, {});
};
