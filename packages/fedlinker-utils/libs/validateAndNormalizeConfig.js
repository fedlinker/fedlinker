const path = require('path');
const titleCase = require('title-case');
const Joi = require('./joi');
const proposals = require('./proposals');

const schema = Joi.object().keys({
  target: Joi.string()
    .valid(['web', 'lib', 'doc'])
    .default('web'),

  flow: Joi.boolean().default(false),
  typescript: Joi.when('flow', {
    is: true,
    then: Joi.boolean().valid([false]),
    otherwise: Joi.boolean(),
  }).default(false),
  proposals: Joi.alternatives()
    .try(
      Joi.string().valid('minimal', 'all'),
      Joi.boolean(),
      Joi.array()
        .unique()
        .items(Joi.string().valid(proposals))
    )
    .default('minimal'),

  style: Joi.alternatives(Joi.boolean(), Joi.object()).default(true),
  postcss: Joi.alternatives(Joi.boolean(), Joi.object()),
  css: Joi.alternatives(Joi.boolean(), Joi.object()),
  less: Joi.alternatives(Joi.boolean(), Joi.object()),
  sass: Joi.alternatives(Joi.boolean(), Joi.object()),
  stylus: Joi.alternatives(Joi.boolean(), Joi.object()),

  markdown: Joi.alternatives(Joi.boolean(), Joi.object()).default(true),
  mdx: Joi.alternatives(Joi.boolean(), Joi.object()).default(true),
  image: Joi.alternatives(Joi.boolean(), Joi.object()).default(true),
  other: Joi.alternatives(Joi.boolean(), Joi.object()).default(true),
  thread: Joi.boolean().default(require('os').cpus().length > 1),

  root: Joi.string()
    .trim()
    .absolutePath()
    .default(process.cwd()),
  src: Joi.string()
    .trim()
    .allow('')
    .default('src'),
  dist: Joi.string()
    .trim()
    .default('dist'),
  assets: Joi.string()
    .trim()
    .default('__assets__/'),
  statics: Joi.alternatives()
    .try(
      Joi.string().trim(),
      Joi.array()
        .unique()
        .items(Joi.string().trim())
    )
    .default('statics'),

  productionPublicPath: Joi.string()
    .trim()
    .allow('')
    .default('/'),
  productionSourceMap: Joi.boolean().default(false),

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
            .items(Joi.string().trim())
            .unique(),
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
        Joi.string(),
        Joi.object()
          .keys({
            entry: Joi.string().trim(),
            title: Joi.string()
              .trim()
              .allow(''),
            filename: Joi.string().trim(),
            template: Joi.string().trim(),
            chunks: Joi.array()
              .items(Joi.string().trim())
              .unique(),
          })
          .unknown()
      )
      .min(1)
  ),

  shim: Joi.boolean().default(true),
  polyfills: Joi.array()
    .unique()
    .items(Joi.string())
    .default([]),

  babel: Joi.alternatives().try(Joi.object(), Joi.func()),
  webpack: Joi.alternatives().try(Joi.object(), Joi.func()),
});

const NORMALIZED = Symbol('normalized');

module.exports = (config = {}) => {
  if (config && config[NORMALIZED]) return config;

  const { error, value: result } = Joi.validate(config, schema);
  if (error) throw error;

  // Normalize paths.

  const root = result.root;

  if (!path.isAbsolute(result.src)) result.src = path.join(root, result.src);
  if (!path.isAbsolute(result.dist)) result.dist = path.join(root, result.dist);
  if (result.dist === root) result.dist = path.join(root, 'dist');

  result.assets = result.assets.replace(/\\\\?/, '/');
  if (result.assets[0] === '/') result.assets = result.assets.slice(1);
  if (result.assets.length && result.assets[result.assets.length - 1] !== '/') {
    result.assets = result.assets + '/';
  }

  if (!Array.isArray(result.statics)) result.statics = [result.statics];
  result.statics = result.statics.map(staticPath => {
    const ret = path.isAbsolute(staticPath)
      ? staticPath
      : path.join(root, staticPath);
    return ret === root ? path.join(root, 'statics') : ret;
  });
  result.statics = [...new Set(result.statics)];

  result.polyfills = result.polyfills.map(polyfillPath => {
    return polyfillPath[0] === '.'
      ? path.join(root, polyfillPath)
      : polyfillPath;
  });
  result.polyfills = [...new Set(result.polyfills)];

  // Normalize styles.

  const styleEnabled = !!result.style;

  if (!('postcss' in result)) result.postcss = styleEnabled;
  if (!('css' in result)) result.css = styleEnabled;
  if (!('less' in result)) result.less = styleEnabled;
  if (!('sass' in result)) result.sass = styleEnabled;
  if (!('stylus' in result)) result.stylus = styleEnabled;

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

  result[NORMALIZED] = true;
  return result;
};
