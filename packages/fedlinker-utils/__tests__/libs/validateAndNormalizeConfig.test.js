const path = require('path');
const cwd = process.cwd();
const validateAndNormalizeConfig = require('../../libs/validateAndNormalizeConfig');

describe('fedlinker-utils', () => {
  describe('libs/validateAndNormalizeConfig.js', () => {
    test('shoule return defaults when no configuration provided', () => {
      expect(validateAndNormalizeConfig()).toMatchObject({
        target: 'web',
        flow: false,
        typescript: false,
        proposals: 'minimal',
        style: true,
        css: true,
        less: true,
        sass: true,
        stylus: true,
        postcss: true,
        markdown: true,
        mdx: true,
        image: true,
        rest: true,
        thread: require('os').cpus().length > 1,
        root: cwd,
        src: path.join(cwd, 'src'),
        dist: path.join(cwd, 'dist'),
        statics: [path.join(cwd, 'statics')],
        public: '/',
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
        sri: true,
        csp: true,
        pwa: true,
        hints: true,
        host: '0.0.0.0',
        hmr: true,
        open: 'index.html',
        https: false,
        gzip: true,
      });
    });

    test('should return custom config correctly', () => {
      expect(
        validateAndNormalizeConfig({
          target: 'lib',
          flow: true,
          proposals: ['do-expressions'],
          css: false,
          stylus: false,
          mdx: false,
          rest: false,
          thread: true,
          dist: 'dest',
          statics: ['public', 'static'],
          basename: '/basename',
          public: '/assets/',
          shim: false,
          polyfills: ['module-name', './relative-path', '/absolute-path'],
          sri: {},
          port: 8080,
        })
      ).toMatchObject({
        target: 'lib',
        flow: true,
        typescript: false,
        proposals: ['do-expressions'],
        style: true,
        css: false,
        less: true,
        sass: true,
        stylus: false,
        postcss: true,
        markdown: true,
        mdx: false,
        image: true,
        rest: false,
        thread: true,
        root: cwd,
        src: path.join(cwd, 'src'),
        dist: path.join(cwd, 'dest'),
        statics: [path.join(cwd, 'public'), path.join(cwd, 'static')],
        basename: '/basename',
        public: '/assets/',
        shim: false,
        polyfills: [
          'module-name',
          path.join(cwd, './relative-path'),
          '/absolute-path',
        ],
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
        sri: {},
        csp: true,
        pwa: true,
        hints: true,
        host: '0.0.0.0',
        port: 8080,
        hmr: true,
        open: 'index.html',
        https: false,
        gzip: true,
      });
    });

    test("can't enable `flow` and `typescript` both", () => {
      expect(() => {
        validateAndNormalizeConfig({ flow: true, typescript: true });
      }).toThrow();
    });

    test('set pages to array', () => {
      expect(
        validateAndNormalizeConfig({
          pages: [
            'index',
            {
              name: 'about',
              entry: './src/about',
              title: 'About',
              filename: 'about.html',
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
            template: undefined,
            chunks: ['runtime~about', 'vendors~about', 'about'],
            other: 'other',
          },
        ],
      });
    });

    test('set pages to object', () => {
      expect(
        validateAndNormalizeConfig({
          pages: {
            index: {},
            about: {
              entry: './src/about',
              title: 'About',
              filename: 'about.html',
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
            template: undefined,
            chunks: ['runtime~about', 'vendors~about', 'about'],
            other: 'other',
          },
        ],
      });
    });

    test('shoule disable all styles when `style` is disabled', () => {
      expect(
        validateAndNormalizeConfig({
          style: false,
          css: true,
        })
      ).toMatchObject({
        style: false,
        css: true,
        less: false,
        sass: false,
        stylus: false,
        postcss: false,
      });
    });
  });
});
