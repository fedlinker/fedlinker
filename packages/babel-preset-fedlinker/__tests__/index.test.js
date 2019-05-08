const babel = require('@babel/core');
const preset = require('../index');

beforeEach(() => {
  process.env = Object.assign(process.env, { BABEL_ENV: 'development' });
});
afterEach(() => {
  process.env = Object.assign(process.env, { BABEL_ENV: 'development' });
});

describe('babel-preset-fedlinker', () => {
  describe('environment', () => {
    const input = `
      import React, { Component } from 'react'
      import propTypes from 'prop-types'
      class Button extends Component {
        render() {
          const { disabled, children } = this.props
          return (
            <button disabled={disabled}>{children}</button>
          )
        }
      }
      Button.propTypes = { disabled: propTypes.bool, children: propTypes.node }
      export default Button
    `;
    const options = {
      babelrc: false,
      presets: [[preset]],
      filename: '/index.jsx',
    };

    test('in development', () => {
      process.env.BABEL_ENV = 'development';
      const { code } = babel.transformSync(input, options);
      expect(code).toMatchSnapshot();
    });

    test('in production', () => {
      process.env.BABEL_ENV = 'production';
      const { code } = babel.transformSync(input, options);
      expect(code).toMatchSnapshot();
    });

    test('in test', () => {
      process.env.BABEL_ENV = 'test';
      const { code } = babel.transformSync(input, options);
      expect(code).toMatchSnapshot();
    });
  });

  describe('static type checker', () => {
    test(`can't enable flow and typescript both`, () => {
      expect(() => {
        babel.transformSync('const a = "a"', {
          babelrc: false,
          presets: [[preset, { flow: true, typescript: true }]],
        });
      }).toThrow();
    });

    test('should throw error if write flow or ts code without enabling one of them', () => {
      const flowInput = `
        // @flow
        function square(n: number): number {
          return n * n;
        }
      `;
      const tsInput = `
        function identity<T>(arg: T): T {
          return arg;
        }
      `;
      const options = {
        babelrc: false,
        presets: [[preset]],
      };
      expect(() => {
        babel.transformSync(flowInput, options);
      }).toThrow();
      expect(() => {
        babel.transformSync(tsInput, options);
      }).toThrow();
    });

    test('transform flow syntax correctly', () => {
      const input = `
        // @flow
        function square(n: number): number {
          return n * n;
        }
      `;
      const options = {
        babelrc: false,
        presets: [[preset, { flow: true }]],
        filename: '/index.js',
      };
      const { code } = babel.transformSync(input, options);
      expect(code).toMatchSnapshot();
    });

    test('transform typescript syntax correctly', () => {
      const input = `
        function identity<T>(arg: T): T {
          return arg;
        }
      `;
      const options = {
        babelrc: false,
        presets: [[preset, { typescript: true }]],
        filename: '/index.ts',
      };
      const { code } = babel.transformSync(input, options);
      expect(code).toMatchSnapshot();
    });
  });

  describe('proposals', () => {
    test('should throw error when disable proposals', () => {
      const input = `
        class Bork {
          static a = 'foo';
        }
      `;
      const options = {
        babelrc: false,
        presets: [[preset, { proposals: false }]],
      };
      expect(() => {
        babel.transformSync(input, options);
      }).toThrow();
    });

    test('minimal proposals', () => {
      const input = `
        @decorator
        class Class { static prop = 'prop'; }
      `;
      const options = {
        babelrc: false,
        presets: [[preset, { proposals: 'minimal' }]],
        filename: '/index.js',
      };
      const { code } = babel.transformSync(input, options);
      expect(code).toMatchSnapshot();
    });

    test('all proposals', () => {
      const input = `
        async function asyncFunction() { await awaitFunciton(); }

        @decorator
        class Class { static prop = 'prop'; }

        const doExpression = do { 'value'; };

        const nullishCoalescing = object.foo ?? 'bar';

        boundObject::functionBind

        function* functionSent() { console.log(function.sent); }

        logicalAssignment ||= otherVariable;

        const numericSeparator = 1_000_000_000_000;

        const optionalChaining = a?.b?.c?.d;

        partialApplication(?, param);

        const pipelineResult = "value" |> processFunction

        class PrivateMethodClass { #privateProp = 'value'; }

        const throwExpression = throw new Error("message")

        export exportDefaultFrom from 'module-name';

        export * as exportNamespaceFrom from 'module-name';
      `;
      const options = {
        babelrc: false,
        presets: [[preset, { proposals: 'all' }]],
        filename: '/index.js',
      };
      const { code } = babel.transformSync(input, options);
      expect(code).toMatchSnapshot();
    });
  });

  describe('polyfills', () => {
    test('should inject default polyfills and user polyfills in entry file', () => {
      const options = {
        babelrc: false,
        presets: [[preset, { entry: '/entry.js', polyfills: ['module-name'] }]],
        filename: '/entry.js',
      };
      const { code } = babel.transformSync('', options);
      expect(code).toMatchSnapshot();
    });

    test('should not inject default polyfills when disable shim', () => {
      const options = {
        babelrc: false,
        presets: [[preset, { entry: '/entry.js', shim: false }]],
        filename: '/entry.js',
      };
      const { code } = babel.transformSync('', options);
      expect(code).not.toMatch('import');
      expect(code).not.toMatch('require');
    });
  });
});
