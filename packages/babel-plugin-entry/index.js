const { isAbsolute, resolve } = require('path');
const { addSideEffect } = require('@babel/helper-module-imports');
const isRelative = path => path[0] === '.';

module.exports = (babel, { entry, entries = [], polyfills = [], context = process.cwd() }) => {
  if (!Array.isArray(entries)) {
    throw new Error('babel-plugin-entry: `entries` muest be an array which contains paths');
  }

  if (entry) entries.push(entry);
  if (!isAbsolute(context)) {
    throw new Error('babel-plugin-entry: `context` muest be a absolute path');
  }

  entries = entries.map(path => {
    if (!path && typeof path !== 'string') {
      throw new Error('babel-plugin-entry: `entry` must be a path');
    }

    if (isAbsolute(path)) return path;
    else return resolve(context, path);
  });

  if (!Array.isArray(polyfills)) {
    polyfills = [polyfills];
  }

  polyfills = polyfills
    .map(polyfill => {
      if (!polyfill && typeof polyfill !== 'string') {
        throw new Error(
          'babel-plugin-entry: `polyfill` must be a non-empty string: filename, path or module name'
        );
      }

      if (isRelative(polyfill)) return resolve(context, polyfill);
      else return polyfill;
    })
    // `addSideEffect` always add statement on top. Reverse polyfills to correct orders.
    .reverse();

  return {
    name: 'babel-plugin-entry',
    visitor: {
      Program(path, state) {
        if (
          !entries.length ||
          !state.filename ||
          !entries.includes(state.filename) ||
          !polyfills.length
        ) {
          return;
        }

        polyfills.forEach(moduleName => {
          addSideEffect(path, moduleName);
        });
      },
    },
  };
};
