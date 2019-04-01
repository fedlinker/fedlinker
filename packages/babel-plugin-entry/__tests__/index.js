const path = require('path');
const babel = require('@babel/core');
const entryPlugin = require('../index');

const input = `class Foo {}`;

function importDeclaration(moduleName) {
  return `import "${moduleName}"`;
}

describe('babel-plugin-entry', () => {
  test('do nothing if no entry', () => {
    const { code } = babel.transformSync(input, {
      babelrc: false,
      plugins: [[entryPlugin, { polyfills: ['module-name'] }]],
    });
    expect(code.trim()).toBe(input);
  });

  test('inject polyfills with custom context', () => {
    const { code } = babel.transformSync(input, {
      babelrc: false,
      plugins: [
        [
          entryPlugin,
          {
            entry: '/entry.js',
            polyfills: ['module-name', './relative-path', '/absolute-path'],
            context: '/root/',
          },
        ],
      ],
      filename: '/entry.js',
    });
    expect(code).toMatch(importDeclaration('module-name'));
    expect(code).toMatch(importDeclaration(path.resolve('/root/', './relative-path')));
    expect(code).toMatch(importDeclaration('/absolute-path'));
  });

  test('inject polyfills with default context `process.cwd()`', () => {
    const { code } = babel.transformSync(input, {
      babelrc: false,
      plugins: [[entryPlugin, { entries: ['entry.js'], polyfills: ['./relative-path'] }]],
      filename: path.resolve(process.cwd(), 'entry.js'),
    });
    expect(code).toMatch(importDeclaration(path.resolve(process.cwd(), './relative-path')));
  });
});
