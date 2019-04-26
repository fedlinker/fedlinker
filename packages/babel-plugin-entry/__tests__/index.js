const path = require('path');
const babel = require('@babel/core');
const entryPlugin = require('../index');
const inputCode = `class Foo {}`;
const cwd = process.cwd();
const filename = path.join(cwd, 'entry.js');

describe('babel-plugin-entry', () => {
  test('shoud inject polyfills correctly', () => {
    const { code } = babel.transformSync(inputCode, {
      babelrc: false,
      plugins: [
        [
          entryPlugin,
          { entry: filename, polyfills: ['module-name', '/root/polyfill.js'] },
        ],
      ],
      filename: filename,
    });
    expect(code).toMatch(`import "module-name"`);
    expect(code).toMatch(`import "/root/polyfill.js"`);
  });

  test('entry can be an array', () => {
    const { code } = babel.transformSync(inputCode, {
      babelrc: false,
      plugins: [
        [entryPlugin, { entry: [filename], polyfills: ['module-name'] }],
      ],
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
        babel.transformSync(inputCode, {
          babelrc: false,
          plugins: [[entryPlugin, { entry: entry }]],
          filename,
        });
      }).toThrow();
    });
  });

  test('check polyfills option', () => {
    // polyfills is not an array
    expect(() => {
      babel.transformSync(inputCode, {
        babelrc: false,
        plugins: [[entryPlugin, { entry: filename, polyfills: false }]],
        filename,
      });
    }).toThrow();

    // polyfills contains invalid value
    ['', './relative-path'].forEach(polyfill => {
      expect(() => {
        babel.transformSync(inputCode, {
          babelrc: false,
          plugins: [[entryPlugin, { entry: filename, polyfills: [polyfill] }]],
          filename,
        });
      }).toThrow();
    });
  });
});
