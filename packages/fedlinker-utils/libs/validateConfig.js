const validProposals = require('./proposals');

module.exports = config => {
  if (typeof config !== 'object' || !config) {
    throw new Error('Config (options) should be an object');
  }

  if ('type' in config) {
    if (!['web', 'lib', 'doc'].includes(config.type)) {
      throw new Error('`type` should be one of "web", "lib" or "doc"');
    }
  }

  if ('flow' in config) {
    if (typeof config.flow !== 'boolean') {
      throw new Error('`flow` should be a boolean value');
    }
  }

  if ('typescript' in config) {
    if (typeof config.typescript !== 'boolean') {
      throw new Error('`typescript` should be a boolean value');
    }
  }

  if (config.flow && config.typescript) {
    throw new Error("Can't enable flow and typescript both");
  }

  if ('proposals' in config) {
    if (
      !['minimal', 'all', 'none', 'null', 'false', null, false].includes(
        config.proposals
      ) &&
      (!Array.isArray(config.proposals) ||
        config.proposals.some(proposal => !validProposals.includes(proposal)))
    ) {
      throw new Error(
        '`proposals` shoule be one of "minimal", "all", "none", null, false ' +
          `or array of items in ${JSON.stringify(validProposals)}`
      );
    }
  }

  if ('src' in config) {
    if (typeof config.src !== 'string') {
      throw new Error('`src` should be a string (path)');
    }
  }

  if ('dist' in config) {
    if (typeof config.dist !== 'string') {
      throw new Error('`dist` should be a string (path)');
    }
  }

  if ('statics' in config) {
    if (typeof config.statics !== 'string') {
      throw new Error('`statics` should be a string (path)');
    }
  }

  if ('productionPublicPath' in config) {
    if (typeof config.productionPublicPath !== 'string') {
      throw new Error(
        '`productionPublicPath` should be a string (path or url)'
      );
    }
  }

  if ('injectDefaultPolyfills' in config) {
    if (typeof config.injectDefaultPolyfills !== 'boolean') {
      throw new Error('`injectDefaultPolyfills` should be a boolean value');
    }
  }

  if ('polyfills' in config) {
    if (
      !Array.isArray(config.polyfills) ||
      config.polyfills.some(
        polyfill =>
          typeof polyfill !== 'string' || !polyfill || polyfill[0] === '.'
      )
    ) {
      throw new Error(
        '`polyfills` should be an array combined with module names or ' +
          'absolute paths'
      );
    }
  }

  if ('pages' in config) {
    if (
      !config.pages ||
      (typeof config.pages !== 'object' && !Array.isArray(config.pages))
    ) {
      throw new Error('`pages` should be an object or an array');
    }

    if (Array.isArray(config.pages)) {
      for (let name of config.pages) {
        if (typeof name !== 'string' || !name) {
          throw new Error('Item in `pages` array should be a non-empty string');
        }
      }
    }

    if (typeof config.pages === 'object') {
      for (let key in config.pages) {
        if (typeof key !== 'string' || !key) {
          throw new Error(
            '`pages` object prop name shoule be a non-empty string'
          );
        }
        const value = config.pages[key];
        if (
          !value ||
          (typeof value !== 'object' && typeof value !== 'string')
        ) {
          throw new Error(
            'Value in `pages` object shoule be an object or a non-empty ' +
              'string'
          );
        }
        if (typeof value === 'object') {
          if (
            'entry' in value &&
            (typeof value.entry !== 'string' || !value.entry)
          ) {
            throw new Error('`entry` in `pages` should be a non-empty string');
          }
          if (
            'template' in value &&
            (typeof value.template !== 'string' || !value.template)
          ) {
            throw new Error(
              '`template` in `pages` should be a non-empty string'
            );
          }
          if (
            'filename' in value &&
            (typeof value.filename !== 'string' || !value.filename)
          ) {
            throw new Error(
              '`filename` in `pages` should be a non-empty string'
            );
          }
          if ('title' in value && typeof value.title !== 'string') {
            throw new Error('`title` in `pages` should be a string');
          }
        }
      }
    }
  }

  if ('babel' in config) {
    if (
      !config.babel ||
      (typeof config.babel !== 'object' && typeof config.babel !== 'function')
    ) {
      throw new Error(
        '`babel` shoule be an object or a function that return an object'
      );
    }
  }

  if ('webpack' in config) {
    if (
      !config.webpack ||
      (typeof config.webpack !== 'object' &&
        typeof config.webpack !== 'function')
    ) {
      throw new Error(
        '`webpack` shoule be an object or a function that return an object'
      );
    }
  }
};
