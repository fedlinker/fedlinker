const fs = require('fs');
const path = require('path');
const { validateAndNormalizeConfig } = require('fedlinker-utils');

module.exports = (options = {}, env) => {
  options = validateAndNormalizeConfig(options);
  env = env || process.env.NODE_ENV;

  if (env !== 'production' && env !== 'development') {
    throw new Error('Should set `env` to "production" or "development"');
  }

  const isProd = env === 'production';
  const isDev = env === 'development';

  return fs
    .readdirSync(__dirname)
    .map(filename => path.join(__dirname, filename))
    .filter(
      pathname =>
        fs.statSync(pathname).isFile() &&
        path.extname(pathname) === '.js' &&
        path.basename(pathname) !== 'index.js'
    )
    .reduce((config, pathname) => {
      return require(pathname)(options, { env, isProd, isDev }, config);
    }, {});
};
