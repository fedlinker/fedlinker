const path = require('path');
const cwd = process.cwd();

module.exports = (config = {}) => {
  if (config.__normalized) return config;

  const src = normalizeDir('src', config, './src');
  const dest = normalizeDir('dest', config, './dist');
  const statics = normalizeDir('statics', config, './statics');

  return {
    flow: config.flow || false,
    typescript: config.typescript || false,
    proposals: config.proposals || 'minimal',
    polyfills: config.polyfills || [],
    src,
    dest,
    statics,
    entry: config.entry || src,
    publicPath: config.publicPath || '/',
    // Identifier for avoiding duplicated normalization
    __normalized: true,
  };
};

function normalizeDir(dirName, config, defaultValue) {
  if (dirName in config) {
    if (path.isAbsolute(config[dirName])) {
      return config[dirName];
    } else {
      return path.resolve(cwd, config[dirName]);
    }
  } else {
    return path.resolve(cwd, defaultValue);
  }
}
