const path = require('path');
const validateAndNormalizeConfig = require('../../libs/validateAndNormalizeConfig');
const cwd = process.cwd();

describe('fedlinker-utils', () => {
  describe('libs/validateAndNormalizeConfig.js', () => {
    test('shoule return defaults when no configuration is provided', () => {
      expect(validateAndNormalizeConfig()).toMatchObject({
        target: 'web',

        flow: false,
        typescript: false,
        proposals: 'minimal',

        root: cwd,
        src: path.join(cwd, 'src'),
        dist: path.join(cwd, 'dist'),
        assets: '__assets__/',
        statics: [path.join(cwd, 'statics')],

        productionPublicPath: '/',
        productionSourceMap: false,

        style: true,
        postcss: true,
        css: true,
        less: true,
        sass: true,
        stylus: true,

        markdown: true,
        mdx: true,
        image: true,
        other: true,
        thread: require('os').cpus().length > 1,

        shim: true,
        polyfills: [],

        pages: [
          {
            name: 'main',
            entry: path.join(cwd, 'src'),
            title: 'Home',
            filename: 'index.html',
            template: undefined,
            chunks: ['runtime~main', 'vendors~main', 'main'],
          },
        ],
      });
    });

    test('should return custom config correctly', () => {
      const root = path.join(cwd, 'root');

      expect(
        validateAndNormalizeConfig({
          target: 'lib',

          flow: true,
          proposals: ['do-expressions'],

          root: root,
          dist: 'dest',
          assets: '\\assets',
          statics: ['public', 'static'],
          productionPublicPath: '/assets/',
          productionSourceMap: true,

          shim: false,
          polyfills: ['module-name', './relative-path', '/absolute-path'],
        })
      ).toMatchObject({
        target: 'lib',

        flow: true,
        typescript: false,
        proposals: ['do-expressions'],

        root: root,
        src: path.join(root, 'src'),
        dist: path.join(root, 'dest'),
        assets: 'assets/',
        statics: [path.join(root, 'public'), path.join(root, 'static')],
        productionPublicPath: '/assets/',
        productionSourceMap: true,

        shim: false,
        polyfills: [
          'module-name',
          path.join(root, './relative-path'),
          '/absolute-path',
        ],

        pages: [
          {
            name: 'main',
            entry: path.join(root, 'src'),
            title: 'Home',
            filename: 'index.html',
            template: undefined,
            chunks: ['runtime~main', 'vendors~main', 'main'],
          },
        ],
      });
    });

    test("can't enable `flow` and `typescript` both", () => {
      expect(() => {
        validateAndNormalizeConfig({ flow: true, typescript: true });
      }).toThrow();
    });

    test('could set pages to an array', () => {
      expect(
        validateAndNormalizeConfig({
          pages: [
            'index',
            {
              name: 'about',
              entry: './src/about',
              title: 'About',
              filename: 'about.html',
              template: 'template.html',
              other: 'other',
            },
          ],
        })
      ).toMatchObject({
        pages: [
          {
            name: 'index',
            entry: path.join(cwd, 'src/index'),
            title: 'Index',
            filename: 'index.html',
            template: undefined,
            chunks: ['runtime~index', 'vendors~index', 'index'],
          },
          {
            name: 'about',
            entry: path.join(cwd, 'src/about'),
            title: 'About',
            filename: 'about.html',
            template: path.join(cwd, 'template.html'),
            chunks: ['runtime~about', 'vendors~about', 'about'],
            other: 'other',
          },
        ],
      });
    });

    test('could set pages to an object', () => {
      expect(
        validateAndNormalizeConfig({
          pages: {
            index: {},
            about: {
              entry: './src/about',
              title: 'About',
              filename: 'about.html',
              template: 'template.html',
              other: 'other',
            },
          },
        })
      ).toMatchObject({
        pages: [
          {
            name: 'index',
            entry: path.join(cwd, 'src/index'),
            title: 'Index',
            filename: 'index.html',
            template: undefined,
            chunks: ['runtime~index', 'vendors~index', 'index'],
          },
          {
            name: 'about',
            entry: path.join(cwd, 'src/about'),
            title: 'About',
            filename: 'about.html',
            template: path.join(cwd, 'template.html'),
            chunks: ['runtime~about', 'vendors~about', 'about'],
            other: 'other',
          },
        ],
      });
    });

    test('should disable all styles when disable `style`', () => {
      expect(validateAndNormalizeConfig({ style: false })).toMatchObject({
        style: false,
        postcss: false,
        css: false,
        less: false,
        sass: false,
        stylus: false,
      });
    });

    test('should enable styles separately when disable `style`', () => {
      expect(
        validateAndNormalizeConfig({
          style: false,
          postcss: true,
          css: true,
          less: true,
          sass: true,
          stylus: true,
        })
      ).toMatchObject({
        style: false,
        postcss: true,
        css: true,
        less: true,
        sass: true,
        stylus: true,
      });
    });

    test('styles can be objects', () => {
      expect(
        validateAndNormalizeConfig({
          style: {},
          postcss: {},
          css: {},
          less: {},
          sass: true,
          stylus: true,
        })
      ).toMatchObject({
        style: {},
        postcss: {},
        css: {},
        less: {},
        sass: true,
        stylus: true,
      });
    });

    test('`babel` and `webpack` can be objects', () => {
      expect(() => {
        validateAndNormalizeConfig({
          babel: {},
          webpack: {},
        });
      }).not.toThrow();
    });

    test('`babel` and `webpack` can be functions', () => {
      expect(() => {
        validateAndNormalizeConfig({
          babel: () => {},
          webpack: () => {},
        });
      }).not.toThrow();
    });
  });
});
