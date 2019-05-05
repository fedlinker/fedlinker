const path = require('path');
const OriginalJoi = require('@hapi/joi');
const titleCase = require('title-case');
const proposals = require('./proposals');

const Joi = OriginalJoi.extend(joi => ({
  base: joi.string(),
  name: 'string',
  language: {
    absolutePath: 'Shoule be an absolute path',
    basename:
      'A properly formatted basename should have a leading slash, ' +
      'but no trailing slash',
  },
  rules: [
    {
      name: 'absolutePath',
      validate(params, value, state, options) {
        if (!path.isAbsolute(value)) {
          return this.createError(
            'string.absolutePath',
            { v: value },
            state,
            options
          );
        }
        return value;
      },
    },
    {
      name: 'basename',
      validate(params, value, state, options) {
        if (
          value[0] !== '/' ||
          (value.length > 1 && value[value.length - 1] === '/')
        ) {
          return this.createError(
            'string.basename',
            { v: value },
            state,
            options
          );
        }
        return value;
      },
    },
  ],
}));

const schema = Joi.object().keys({
  // Project target (type):
  // - 'web': React web application, support single page and multi pages.
  // - 'lib': React components library.
  // - 'doc': Write with markdown, generate static website files. Support online
  //          React examples.
  target: Joi.string()
    .valid(['web', 'lib', 'doc'])
    .default('web'),

  // Whether support Flow syntax. Can't be enabled when `typescript` is enabled.
  flow: Joi.boolean().default(false),

  // Whether support TypeScript syntax. Can't be enabled when `flow` is enabled.
  typescript: Joi.when('flow', {
    is: true,
    then: Joi.boolean().valid([false]),
    otherwise: Joi.boolean(),
  }).default(false),

  // Which ECMAScript experimental syntax should be supported.
  // - 'minimal', true: only support 'class-properties' and 'decorators' syntax.
  // - 'all': support all experimental syntax.
  // - false: disable experimental syntax.
  // - Array: custom experimental syntax names. i.e. ['do-expressions'].
  // Ref: https://babeljs.io/docs/en/plugins#experimental
  proposals: Joi.alternatives()
    .try(
      Joi.string().valid('minimal', 'all'),
      Joi.boolean(),
      Joi.array()
        .unique()
        .items(Joi.string().valid(proposals))
    )
    .default('minimal'),

  // Whether support styles. It controls `css`, `less`, `sass`, `stylus` and
  // `postcss` configs. It can be an object as style-loader options.
  style: Joi.alternatives()
    .try(Joi.boolean(), Joi.object())
    .default(true),

  // Whether support CSS. It can be an object as css-loader options.
  css: Joi.alternatives().try(Joi.boolean(), Joi.object()),

  // Whether support Less. It can be an object as less-loader and Less processor
  // options.
  less: Joi.alternatives().try(Joi.boolean(), Joi.object()),

  // Whether support Sass. It can be an object as sass-loader and Sass processor
  // options.
  sass: Joi.alternatives().try(Joi.boolean(), Joi.object()),

  // Whether support Stylus. It can be an object as stylus-loader and Stylus
  // processor options.
  stylus: Joi.alternatives().try(Joi.boolean(), Joi.object()),

  // Whether support Postcss. It can be an object as postcss-loader and Postcss
  // processor options.
  postcss: Joi.alternatives().try(Joi.boolean(), Joi.object()),

  // Whether support Markdown. It can be an object as fedlinker-markdown-loader
  // options.
  markdown: Joi.alternatives()
    .try(Joi.boolean(), Joi.object())
    .default(true),

  // Whether support MDX. It can be an object as @mdx-js/loader options.
  mdx: Joi.alternatives()
    .try(Joi.boolean(), Joi.object())
    .default(true),

  // Whether support images, include `.png`, `.jpg`, `.gif`, `.jpeg` and `.bmp`.
  // It can be an object as url-loader (only used by images) options.
  image: Joi.alternatives()
    .try(Joi.boolean(), Joi.object())
    .default(true),

  // Whether support loading other files except for the above and HTML templates.
  // It can be an object as file-loader options.
  rest: Joi.alternatives()
    .try(Joi.boolean(), Joi.object())
    .default(true),

  // Whether use thread-loader for improvement. It can be an object as
  // thread-loader options.
  thread: Joi.alternatives()
    .try(Joi.boolean(), Joi.object())
    .default(require('os').cpus().length > 1),

  // Root directory. Webpack context. Must be an absolute path.
  root: Joi.string()
    .trim()
    .absolutePath()
    .default(process.cwd()),

  // Source code directory. Default is "src" directory under `root`. It can be
  // an absolute path, a relative path (relative to `root`) or an empty string.
  // When it's an empty string, it will be resolved to `root` value.
  src: Joi.string()
    .trim()
    .allow('')
    .default('src'),

  // Output directory. Default is "dist" directory under `root`. It can be an
  // absolute path, a relative path (relative to `root`), but can't be an empty
  // string. When it's value equals to `root`, it will be set to
  // `path.join(root, 'dist')`.
  dist: Joi.string()
    .trim()
    .default('dist'),

  // Static directories. Default is "statics" directory under `root`. It shoule
  // be an absolute path or a relative path (relative to `root`) or an array
  // contains paths. Files in `statics` will be copied into `dist` directory.
  // If any path in `statics` is `root` value, it will be set to
  // `path.join(root, 'statics')`.
  statics: Joi.alternatives()
    .try(
      Joi.string().trim(),
      Joi.array()
        .unique()
        .items(Joi.string().trim())
    )
    .default('statics'),

  // react-router basename. Should have a leading slash, but no trailing slash.
  basename: Joi.string()
    .trim()
    .basename(),

  // Webpack `output.publicPath` option in production env.
  public: Joi.string()
    .trim()
    .allow('')
    .default('/'),

  // Whether auto inject default polyfills in entry files. Those polyfills are:
  // - Dynamic import.
  //   'core-js/features/array/iterator',
  //   'core-js/features/promise',
  //   'core-js/features/promise/finally',
  // - React.
  //   'core-js/features/object/assign',
  //   'core-js/features/array/from',
  //   'core-js/features/symbol',
  //   'core-js/features/set',
  //   'core-js/features/map',
  //   'raf/polyfill',
  // - `window.fetch()`.
  //   'whatwg-fetch',
  //   'abortcontroller-polyfill/dist/polyfill-patch-fetch',
  shim: Joi.boolean().default(true),

  // User custom polyfills. They will be merged with defualt polyfills, and then
  // injected into entry files. Recommend this way to add polyfills.
  polyfills: Joi.array()
    .unique()
    .items(Joi.string())
    .default([]),

  // Multiple pages application. All rest props in page object will be passed in
  // HtmlWebpackPlugin.
  pages: Joi.alternatives().try(
    Joi.array()
      .items([
        Joi.string().trim(),
        Joi.object({
          name: Joi.string()
            .trim()
            .required(),
          entry: Joi.string().trim(),
          title: Joi.string()
            .trim()
            .allow(''),
          filename: Joi.string().trim(),
          template: Joi.string().trim(),
          chunks: Joi.array()
            .unique()
            .items(Joi.string().trim()),
        }).unknown(),
      ])
      .unique((a, b) => {
        let na, nb;
        if (typeof a === 'string') na = a;
        if (typeof b === 'string') nb = b;
        if (typeof a === 'object') na = a.name;
        if (typeof b === 'object') nb = b.name;
        return na === nb;
      })
      .min(1),
    Joi.object()
      .pattern(
        /[a-z0-9_-]/,
        Joi.object()
          .keys({
            entry: Joi.string().trim(),
            title: Joi.string()
              .trim()
              .allow(''),
            filename: Joi.string().trim(),
            template: Joi.string().trim(),
            chunks: Joi.array()
              .unique()
              .items(Joi.string().trim()),
          })
          .unknown()
      )
      .min(1)
  ),

  // Whether enable Subsource Integrity in production env. It can be an object
  // as webpack-subresource-integrity options.
  sri: Joi.alternatives()
    .try(Joi.boolean(), Joi.object())
    .default(true),

  // Whether enable Content Security Policies in production env. It can be an
  // object as csp-html-webpack-plugin options.
  csp: Joi.alternatives()
    .try(Joi.boolean(), Joi.object())
    .default(true),

  // Whether enable Progressive Web Application in production env. It can be an
  // object as workbox-webpack-plugin options.
  pwa: Joi.alternatives()
    .try(Joi.boolean(), Joi.object())
    .default(true),

  // Whether enable Resource Hints.
  hints: Joi.boolean().default(true),

  // Host in development env.
  host: Joi.string()
    .hostname()
    .default('0.0.0.0'),

  // Port in development env.
  port: Joi.number().port(),

  // Whether enable HMR in development env.
  hmr: Joi.boolean().default(true),

  // Open page in development env.
  open: Joi.alternatives()
    .try(Joi.boolean(), Joi.string().trim())
    .default(true),

  // Proxy in development env.
  proxy: Joi.object(),

  // Https in development env.
  https: Joi.alternatives()
    .try(Joi.boolean(), Joi.object())
    .default(false),

  // Locales.
  locales: Joi.object(),

  // Theme.
  theme: Joi.object(),

  // Gzip.
  gzip: Joi.alternatives()
    .try(Joi.boolean(), Joi.object())
    .default(true),
});

const NORMALIZED = Symbol('normalized');

module.exports = (config = {}) => {
  // If config is normalized, just return directly.
  if (config && config[NORMALIZED]) return config;

  const { error, value: result } = Joi.validate(config, schema);
  if (error) throw error;

  // Normalize styles.
  const styleEnabled = !!result.style;
  if (!('css' in result)) result.css = styleEnabled;
  if (!('less' in result)) result.less = styleEnabled;
  if (!('sass' in result)) result.sass = styleEnabled;
  if (!('stylus' in result)) result.stylus = styleEnabled;
  if (!('postcss' in result)) result.postcss = styleEnabled;

  // Normalize paths.
  const root = result.root;
  if (!path.isAbsolute(result.src)) result.src = path.join(root, result.src);
  if (!path.isAbsolute(result.dist)) result.dist = path.join(root, result.dist);
  // `dist` path can't be `root`'s value.
  if (result.dist === root) result.dist = path.join(root, 'dist');
  if (!Array.isArray(result.statics)) result.statics = [result.statics];

  result.statics = result.statics.map(staticPath => {
    const ret = path.isAbsolute(staticPath)
      ? staticPath
      : path.join(root, staticPath);
    // Static path can't be `root` value.
    return ret === root ? path.join(root, 'statics') : ret;
  });
  result.statics = [...new Set(result.statics)];

  result.polyfills = result.polyfills.map(polyfillPath => {
    return polyfillPath[0] === '.'
      ? path.join(root, polyfillPath)
      : polyfillPath;
  });
  result.polyfills = [...new Set(result.polyfills)];

  // Normalize pages.
  if ('pages' in result) {
    if (typeof result.pages === 'object' && !Array.isArray(result.pages)) {
      const pages = [];
      for (let name in result.pages) {
        pages.push({
          name,
          ...result.pages[name],
        });
      }
      result.pages = pages;
    }

    result.pages = result.pages.map(page => {
      if (typeof page === 'string') page = { name: page };
      let { name, entry, title, filename, template, chunks, ...rest } = page;

      if (entry === undefined) {
        entry = path.join(result.src, name);
      } else if (!path.isAbsolute(entry)) {
        entry = path.join(root, entry);
      }

      if (title === undefined) title = titleCase(name);
      if (filename === undefined) filename = `${name}.html`;

      if (typeof template === 'string' && !path.isAbsolute(template)) {
        template = path.join(root, template);
      }
      if (chunks === undefined) {
        chunks = [`runtime~${name}`, `vendors~${name}`, name];
      }

      return { name, entry, title, filename, template, chunks, ...rest };
    });
  } else {
    result.pages = [
      {
        name: 'main',
        entry: result.src,
        title: 'Home',
        filename: 'index.html',
        template: undefined,
        chunks: ['runtime~main', 'vendors~main', 'main'],
      },
    ];
  }

  // If `open` is true, use first page filename.
  if (result.open === true) {
    result.open = result.pages[0].filename;
  }

  result[NORMALIZED] = true;
  return result;
};
