const path = require('path');
const babel = require('@babel/core');
const plugin = require('../index');
const cwd = process.cwd();
const filename = path.join(cwd, 'entry.js');

describe('babel-plugin-entry', () => {
  test('shoud inject polyfills correctly', () => {
    const { code } = babel.transformSync('', {
      babelrc: false,
      plugins: [
        [
          plugin,
          { entry: filename, polyfills: ['module-name', '/polyfills.js'] },
        ],
      ],
      filename: filename,
    });
    expect(code).toMatch(`import "module-name"`);
    expect(code).toMatch(`import "/polyfills.js"`);
  });

  test('entry can be an array', () => {
    const { code } = babel.transformSync('', {
      babelrc: false,
      plugins: [[plugin, { entry: [filename], polyfills: ['module-name'] }]],
      filename: filename,
    });
    expect(code).toMatch(`import "module-name"`);
  });

  test('check entry option', () => {
    // invalid values
    [
      '/without-file-extension',
      './relative-path.js',
      'module-name',
      '',
    ].forEach(entry => {
      expect(() => {
        babel.transformSync('', {
          babelrc: false,
          plugins: [[plugin, { entry: entry }]],
          filename,
        });
      }).toThrow();
    });
  });

  test('check polyfills option', () => {
    // polyfills is not an array
    expect(() => {
      babel.transformSync('', {
        babelrc: false,
        plugins: [[plugin, { entry: filename, polyfills: false }]],
        filename,
      });
    }).toThrow();

    // polyfills contains invalid value
    ['', './relative-path'].forEach(polyfill => {
      expect(() => {
        babel.transformSync('', {
          babelrc: false,
          plugins: [[plugin, { entry: filename, polyfills: [polyfill] }]],
          filename,
        });
      }).toThrow();
    });
  });
});
