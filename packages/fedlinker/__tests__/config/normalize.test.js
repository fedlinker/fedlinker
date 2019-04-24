const normalize = require('../../config/normalize');
const path = require('path');
const cwd = process.cwd();

describe('CLI', () => {
  describe('config/normalize.js', () => {
    test('defaults', () => {
      expect(normalize()).toEqual({
        flow: false,
        typescript: false,
        proposals: 'minimal',
        polyfills: [],
        src: path.resolve(cwd, './src'),
        dest: path.resolve(cwd, './dist'),
        statics: path.resolve(cwd, './statics'),
        entry: path.resolve(cwd, './src'),
        publicPath: '/',
        __normalized: true,
      });
    });
  });
});
