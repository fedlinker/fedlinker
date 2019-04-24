const validate = require('../../config/validate');

describe('CLI', () => {
  describe('config/validate.js', () => {
    test('validate schema', () => {
      expect(() => {
        validate({
          flow: false,
          typescript: true,
          proposals: ['class-properties', 'decorators'],
          polyfills: ['polyfill'],
          src: './src',
          dest: './dist',
          statics: './statics',
          entry: './src',
          publicPath: '/',
        });
      }).not.toThrow();
    });

    test(`can't enable Flow and TypeScript both`, () => {
      expect(() => {
        validate({
          flow: true,
          typescript: true,
        });
      }).toThrow();
    });
  });
});
