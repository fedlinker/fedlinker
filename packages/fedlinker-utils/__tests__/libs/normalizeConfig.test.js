const normalizeConfig = require('../../libs/normalizeConfig');
const path = require('path');
const cwd = process.cwd();

describe('fedlinker-utils', () => {
  describe('libs/normalizeConfig.js', () => {
    test('should return defualts correctly', () => {
      expect(normalizeConfig()).toEqual({
        type: 'web',
        flow: false,
        typescript: false,
        proposals: 'minimal',
        src: path.resolve(cwd, './src'),
        dist: path.resolve(cwd, './dist'),
        statics: path.resolve(cwd, './statics'),
        productionPublicPath: '/',
        injectDefaultPolyfills: true,
        polyfills: [],
        pages: [
          {
            name: 'main',
            entry: path.resolve(cwd, './src'),
            filename: 'index.html',
            template: undefined,
            title: 'Home',
          },
        ],
        babel: undefined,
        webapck: undefined,
        __normalized: true,
      });
    });
  });
});
