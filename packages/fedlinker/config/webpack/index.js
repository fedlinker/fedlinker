const fs = require('fs');
const WebpackChain = require('webpack-chain');
const validate = require('../validate');
const normalize = require('../normalize');

const createWebpackConfig = (options = {}, env) => {
  env = env || process.env.NODE_ENV || 'development';
  const envObj = {
    env,
    isProd: env === 'production',
    isDev: env === 'development',
  };
  const chain = new WebpackChain();

  if (!options.__normalized) {
    validate(options);
    options = normalize(options);
  }

  fs.readdirSync(__dirname).forEach(filename => {
    if (filename !== 'index.js') {
      require('./' + filename)(chain, options, envObj);
    }
  });

  return chain;
};

console.dir(createWebpackConfig({}, 'development').toConfig(), { depth: 10 });

module.exports = createWebpackConfig;
