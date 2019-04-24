const { isAbsolute, extname } = require('path');
const { addSideEffect } = require('@babel/helper-module-imports');
const isRelative = path => path[0] === '.';

const checkEntry = entries => {
  if (!Array.isArray(entries) || !entries.length) return false;
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (typeof entry !== 'string') return false;
    if (!entry) return false;
    if (!isAbsolute(entry)) return false;
    const ext = extname(entry);
    if (!ext || ext === '.') return false;
  }
  return true;
};

const checkPolyfills = polyfills => {
  if (!Array.isArray(polyfills)) return false;
  for (let i = 0; i < polyfills.length; i++) {
    const polyfill = polyfills[i];
    if (typeof polyfill !== 'string') return false;
    if (!polyfill) return false;
    if (isRelative(polyfill)) return false;
  }
  return true;
};

module.exports = (babel, { entry, polyfills = [] }) => {
  const entries = Array.isArray(entry) ? entry : [entry];
  if (!checkEntry(entries)) {
    throw new Error(
      '[babel-plugin-entry]: `entry` option must be an absolute path with ' +
        'file extension or an array contains absolute paths with file extensions'
    );
  }

  if (!checkPolyfills(polyfills)) {
    throw new Error(
      '[babel-plugin-entry]: `polyfills` option must be an array contains moudle names or absolute paths'
    );
  }

  // `addSideEffect` always add statement on top. Reverse polyfills to correct orders.
  polyfills = polyfills.reverse();

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
