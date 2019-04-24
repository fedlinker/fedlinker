const babel = require('@babel/core');
const preset = require('../index');

describe('babel-preset-fedlinker', () => {
  describe('basic', () => {
    const basicInput = `
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

    const basicOptions = {
      babelrc: false,
      presets: [[preset]],
      filename: '/entry.jsx',
    };

    test('should transform correctly in development env', () => {
      process.env.BABEL_ENV = 'development';
      const { code } = babel.transformSync(basicInput, basicOptions);
      expect(code).toMatchSnapshot();
    });

    test('should transform correctly in production env', () => {
      process.env.BABEL_ENV = 'production';
      const { code } = babel.transformSync(basicInput, basicOptions);
      expect(code).toMatchSnapshot();
    });

    test('should transform correctly in test env', () => {
      process.env.BABEL_ENV = 'test';
      const { code } = babel.transformSync(basicInput, basicOptions);
      expect(code).toMatchSnapshot();
    });
  });

  // describe('polyfills', () => {
  //   test('default polyfills', () => {
  //     process.env.BABEL_ENV = 'development';

  //     const options = {
  //       babelrc: false,
  //       presets: [[require('../index'), { entry: '/entry.js' }]],
  //       filename: '/entry.js',
  //     };

  //     const { code } = babel.transformSync(`const a = ''`, options);
  //     expect(code).toMatch('@babel/runtime-corejs3/core-js-stable/map.js');
  //     expect(code).toMatch('@babel/runtime-corejs3/core-js-stable/set.js');
  //     expect(code).toMatch(require.resolve('raf'));
  //   });

  //   test('with fetch polyfills', () => {
  //     process.env.BABEL_ENV = 'production';

  //     const options = {
  //       babelrc: false,
  //       presets: [[require('../index'), { entry: '/entry.js', fetchPolyfill: true }]],
  //       filename: '/entry.js',
  //     };

  //     const { code } = babel.transformSync(`const a = ''`, options);
  //     expect(code).toMatch('@babel/runtime-corejs3/core-js-stable/map.js');
  //     expect(code).toMatch('@babel/runtime-corejs3/core-js-stable/set.js');
  //     expect(code).toMatch(require.resolve('whatwg-fetch'));
  //     expect(code).toMatch(require.resolve('abortcontroller-polyfill'));
  //   });

  //   test('no default polyfills', () => {
  //     process.env.BABEL_ENV = 'production';
  //     const options = {
  //       babelrc: false,
  //       presets: [[require('../index'), { entry: '/entry.js', injectPolyfills: false }]],
  //       filename: '/entry.js',
  //     };

  //     const { code } = babel.transformSync(`const a = ''`, options);
  //     expect(code).not.toMatch('@babel/runtime-corejs3/core-js-stable/map.js');
  //     expect(code).not.toMatch('@babel/runtime-corejs3/core-js-stable/set.js');
  //     expect(code).not.toMatch(require.resolve('whatwg-fetch'));
  //     expect(code).not.toMatch(require.resolve('abortcontroller-polyfill'));
  //   });

  //   test('with user polyfills', () => {
  //     process.env.BABEL_ENV = 'development';

  //     const options = {
  //       babelrc: false,
  //       presets: [[require('../index'), { entry: '/entry.js', polyfills: ['module-name'] }]],
  //       filename: '/entry.js',
  //     };

  //     const { code } = babel.transformSync(`const a = ''`, options);
  //     expect(code).toMatch('@babel/runtime-corejs3/core-js-stable/map.js');
  //     expect(code).toMatch('@babel/runtime-corejs3/core-js-stable/set.js');
  //     expect(code).toMatch(require.resolve('raf'));
  //     expect(code).toMatch('module-name');
  //   });

  //   test('noly user polyfills', () => {
  //     process.env.BABEL_ENV = 'development';

  //     const options = {
  //       babelrc: false,
  //       presets: [
  //         [
  //           require('../index'),
  //           { entry: '/entry.js', injectPolyfills: false, polyfills: ['module-name'] },
  //         ],
  //       ],
  //       filename: '/entry.js',
  //     };

  //     const { code } = babel.transformSync(`const a = ''`, options);
  //     expect(code).not.toMatch('@babel/runtime-corejs3/core-js-stable/map.js');
  //     expect(code).not.toMatch('@babel/runtime-corejs3/core-js-stable/set.js');
  //     expect(code).not.toMatch(require.resolve('raf'));
  //     expect(code).toMatch('module-name');
  //   });
  // });

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
      process.env.BABEL_ENV = 'development';
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

    test('transform flow code correctly', () => {
      process.env.BABEL_ENV = 'development';
      const input = `
        // @flow
        function square(n: number): number {
          return n * n;
        }
      `;
      const options = {
        babelrc: false,
        presets: [[preset, { flow: true }]],
        filename: '/entry.js',
      };
      const { code } = babel.transformSync(input, options);
      expect(code).not.toMatch('square(n: number): number');
    });

    test('transform typescript code correctly', () => {
      process.env.BABEL_ENV = 'development';
      const input = `
        function identity<T>(arg: T): T {
          return arg;
        }
      `;
      const options = {
        babelrc: false,
        presets: [[preset, { typescript: true }]],
        filename: '/entry.ts',
      };
      const { code } = babel.transformSync(input, options);
      expect(code).not.toMatch('identity<T>(arg: T): T');
    });
  });

  describe('proposals', () => {
    test('should throw error when close proposals', () => {
      process.env.BABEL_ENV = 'development';
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

    test('all proposals', () => {
      process.env.BABEL_ENV = 'development';
      const input = `
        // do-expressions
        let a = do {
          if(x > 10) {
            'big';
          } else {
            'small';
          }
        };

        // nullish-coalescing-operator
        var foo = object.foo ?? "default";

        // function-bind
        obj::func

        // function-sent
        function* generator() {
          console.log("Sent", function.sent);
          console.log("Yield", yield);
        }

        // logical-assignment-operators
        a ||= b;

        // numeric-separator
        let budget = 1_000_000_000_000;

        // optional-chaining
        const baz = obj?.foo?.bar?.baz;

        // partial-application
        f(?, x);

        // pipeline-operator
        let result = "hello"
          |> doubleSay
          |> capitalize
          |> exclaim;

        // private-methods
        class Counter extends HTMLElement {
          #xValue = 0;
          get #x() { return this.#xValue; }
          set #x(value) {
            this.#xValue = value;
          }
          #clicked() {
            this.#x++;
          }
        }

        // throw-expressions
        filename = throw new TypeError("Argument required")

        // export-default-from
        export v from 'mod';

        // export-namespace-from
        export * as ns from 'mod';
      `;
      const options = {
        babelrc: false,
        presets: [[preset, { proposals: 'all' }]],
      };
      const { code } = babel.transformSync(input, options);
      expect(code).toMatchSnapshot();
    });
  });
});
