const validateConfig = require('../../libs/validateConfig');

describe('fedlinker-utils', () => {
  describe('libs/validateConfig.js', () => {
    test('could input an empty object', () => {
      expect(() => {
        validateConfig({});
      }).not.toThrow();
    });

    test('validate full config object', () => {
      expect(() => {
        validateConfig({
          type: 'web',
          flow: false,
          typescript: false,
          proposals: 'minimal',
          src: './src',
          dist: './dist',
          statics: './statics',
          productionPublicPath: '/',
          injectDefaultPolyfills: false,
          polyfills: ['module-name'],
          pages: ['home', 'about'],
          babel: () => {},
          webpack: () => {},
        });
      }).not.toThrow();
    });

    test(`can't enable flow and typescript both`, () => {
      expect(() => {
        validateConfig({
          flow: true,
          typescript: true,
        });
      }).toThrow();
    });
  });
});
