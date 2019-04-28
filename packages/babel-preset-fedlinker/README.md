# babel-preset-fedlinker

Babel preset for [Fedlinker](https://fedlinker.com/).

## Install

```shell
npm install -D babel-preset-fedlinker
# or
yarn add -D babel-preset-fedlinker
```

## Usage

In your babel configuration file (i.e. `babel.config.js`):

```js
const path = require('path');
module.exports = {
  presets: [
    [
      'babel-preset-fedlinker',
      {
        flow: false,
        typescript: false,
        proposals: 'minimal',
        injectDefaultPolyfills: true,
        entry: path.join(process.cwd(), 'src/index.js'),
        polyfills: ['module-name', '/absolute-path'],
      },
    ],
  ],
};
```

## Options

All options are optional.

- **`flow`**: Support Flow syntax. Defualt `false`.
- **`typescript`**: Support TypeScript syntax. Default `false`.
- **`proposals`**: Whitch proposals should be used. Default `"minimal"`
  - `"minimal"`: Only use [class-properties](https://babeljs.io/docs/en/babel-plugin-proposal-class-properties) and [decorators](https://babeljs.io/docs/en/babel-plugin-proposal-decorators) plugins.
  - `"all"`: Use [all proposal plugins](https://babeljs.io/docs/en/plugins#experimental).
  - `Array`: Can be an array contains [propposal names](https://babeljs.io/docs/en/plugins#experimental), i.e `['export-default-from', 'export-namespace-from']`.
- **`injectDefaultPolyfills`**: Auto inject default polyfills for supporting dynamic importing, React and `window.fetch()` method in lower version browers. Default `true`.

The following options are [babel-plugin-entry options](https://github.com/fedlinker/fedlinker/blob/master/packages/babel-plugin-entry/README.md#options):

- **`entry`**: Entry file(s). Must be an absolute path with file extension or an array contains absolute paths with file extensions.
- **`polyfills`**: Injected user custom polyfills. They can be module names and absolute paths.

Can't enable `flow` and `typescript` both.

## License

[Anti 996 License (反 996 许可证)](./LICENSE).
