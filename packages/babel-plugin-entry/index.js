const { isAbsolute, extname } = require('path');
const { addSideEffect } = require('@babel/helper-module-imports');

module.exports = (babel, { entry = [], polyfills = [] }) => {
  const entries = Array.isArray(entry) ? entry : [entry];
  if (!checkEntries(entries)) {
    throw new Error(
      '`entry` option must be an absolute path with file extension or an ' +
        'array contains absolute paths with file extensions'
    );
  }

  if (!checkPolyfills(polyfills)) {
    throw new Error(
      '`polyfills` option must be an array contains moudle names or absolute paths'
    );
  }

  // `addSideEffect` always add statement on top. Reverse polyfills to correct
  // orders.
  polyfills = polyfills.reverse();

  // Whether should inject polyfills.
  const shouldNotInject = !entries.length || !polyfills.length;

  return {
    name: 'babel-plugin-entry',
    visitor: {
      Program(path, state) {
        if (
          shouldNotInject ||
          !state.filename ||
          !entries.includes(state.filename)
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

function isRelative(path) {
  if (!path || typeof path !== 'string') return false;
  return path[0] === '.';
}

function checkEntries(entries) {
  if (!Array.isArray(entries)) return false;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];

    if (typeof entry !== 'string' || !entry) return false;
    if (!isAbsolute(entry)) return false;

    const ext = extname(entry);
    if (!ext || ext === '.') return false;
  }

  return true;
}

function checkPolyfills(polyfills) {
  if (!Array.isArray(polyfills)) return false;

  for (let i = 0; i < polyfills.length; i++) {
    const polyfill = polyfills[i];

    if (typeof polyfill !== 'string' || !polyfill) return false;
    if (isRelative(polyfill)) return false;
  }

  return true;
}
