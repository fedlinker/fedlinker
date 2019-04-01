# `babel-preset-fedlinker`

Babel preset for [Fedlinker](https://fedlinker.com/).

## Install

```shell
npm install -D babel-preset-fedlinker
# or
yarn add -D babel-preset-fedlinker
```

## Usage

In your babel configuration file (i.e. `.babelrc.js`):

```js
module.exports = {
  presets: [
    [
      'babel-preset-fedlinker',
      {
        flow: false,
        typescript: false,
        proposals: 'minimal',
        injectPolyfills: true,
        fetchPolyfill: false,

        // Flowing options are babel-plugin-entry's options.
        // https://github.com/fedlinker/fedlinker/packages/babel-plugin-entry/README.md
        entry: './src/index.js',
        entries: ['./src/home/index.js', '/absolute/path/entry.js'],
        polyfills: ['module-name', './relative-path', '/absolute-path'],
        context: '/project-root/',
      },
    ],
  ],
};
```

## Options

- **`flow`**: Support Flow syntax, defualt `false`.
- **`typescript`**: Support TypeScript syntax, default `false`.
- **`proposals`**: Whitch proposals should be used.
  - `"minimal"`: Only use [class-properties](https://babeljs.io/docs/en/babel-plugin-proposal-class-properties) and [decorators](https://babeljs.io/docs/en/babel-plugin-proposal-decorators) plugins.
  - `"all"`: Use [all proposal plugins](https://babeljs.io/docs/en/plugins#experimental).
  - `Array(proposal-name)`: Can be an array contains [propposal names](https://babeljs.io/docs/en/plugins#experimental), i.e `['export-default-from', 'export-namespace-from']`.
- **`injectPolyfills`**: Auto inject [polyfills](https://reactjs.org/docs/javascript-environment-requirements.html). If you want auto inject polyfills, you muse specify `entry` or `entries` options.

The flowing options are [babel-plugin-entry](https://github.com/fedlinker/fedlinker/packages/babel-plugin-entry/README.md)'s options：

- **`entry`**: Single entry filename. Can be a relative or absolue path.
- **`entries`**: Multiple entry filenames. Cans use with `entry` option.
- **`polyfills`**: Polyfills array. Item in `polyfills` can be a(n) module name, relative path or absolute path.
- **`context`**: Same as Webpack `context`, default is `process.cwd()`. All relative path in babel-plugin-entry options will be concated with `context`. When you changed Webpack context, you should change this option with same value.

## License

MIT.
