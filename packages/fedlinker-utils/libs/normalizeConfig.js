const path = require('path');
const titleCase = require('title-case');
const cwd = process.cwd();
const validateConfig = require('./validateConfig');

const normalizeDir = (dirName, config, defaultValue) => {
  if (dirName in config) {
    if (path.isAbsolute(config[dirName])) {
      return config[dirName];
    } else {
      return path.join(cwd, config[dirName]);
    }
  } else {
    return path.join(cwd, defaultValue);
  }
};

module.exports = (config = {}, shouldValidate = true) => {
  if (config.__normalized) return config;
  if (shouldValidate) validateConfig(config);

  let src = normalizeDir('src', config, './src');
  let dist = normalizeDir('dist', config, './dist');
  let statics = normalizeDir('statics', config, './statics');

  // `src` can be cwd, but `dist` and `statics` can't.
  if (dist === cwd) {
    dist = path.join(cwd, './dist');
  }
  if (statics === cwd) {
    statics = path.join(cwd, './statics');
  }

  const result = {
    type: 'type' in config ? config.type : 'web',
    flow: 'flow' in config ? config.flow : false,
    typescript: 'typescript' in config ? config.typescript : false,
    proposals: 'proposals' in config ? config.proposals : 'minimal',
    src,
    dist,
    statics,
    productionPublicPath:
      'productionPublicPath' in config ? config.productionPublicPath : '/',
    injectDefaultPolyfills:
      'injectDefaultPolyfills' in config ? config.injectDefaultPolyfills : true,
    polyfills: 'polyfills' in config ? config.polyfills : [],
    pages: [],
    babel: 'babel' in config ? config.babel : undefined,
    webpack: 'webpack' in config ? config.webpack : undefined,
    // Identifier for avoiding duplicated normalization
    __normalized: true,
  };

  if ('pages' in config) {
    if (Array.isArray(config.pages)) {
      const pages = [...new Set(config.pages)];
      for (let name of pages) {
        result.pages.push({
          name,
          entry: path.join(src, name),
          filename: `${name}.html`,
          template: undefined,
          title: titleCase(name),
        });
      }
    }

    if (typeof config.pages === 'object') {
      for (let name in config.pages) {
        const value = config.pages[name];
        let entry, filename, template, title;

        if (typeof value === 'string') {
          entry = value;
        } else if (typeof value === 'object') {
          entry = value.entry;
          filename = value.filename;
          template = value.template;
          title = value.title;
        }

        if (entry == null) entry = path.join(src, name);
        if (!path.isAbsolute(entry)) entry = path.join(cwd, entry);
        if (!filename) filename = `${name}.html`;
        if (!template && !path.isAbsolute(template)) {
          template = path.join(cwd, template);
        }
        if (title == null) title = titleCase(name);

        result.pages.push({ name, entry, filename, template, title });
      }
    }
  } else {
    result.pages = [
      {
        name: 'main',
        entry: src,
        filename: 'index.html',
        template: undefined,
        title: 'Home',
      },
    ];
  }

  return result;
};
