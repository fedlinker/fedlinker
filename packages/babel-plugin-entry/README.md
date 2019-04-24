# babel-plugin-entry

Babel plugin for injecting polyfills into entry file(s).

## Install

```shell
npm install -D babel-plugin-entry
# or
yarn add -D babel-plugin-entry
```

## Usage

In your babel configuration file (i.e. `.babelrc.js`):

```js
const path = require('path');
module.exports = {
  plugins: [
    [
      'babel-plugin-entry',
      {
        // Entry file(s).
        entry: path.join(process.cwd(), 'src/index.js'),
        // Injected polyfills.
        polyfills: ['module-name', '/absolute-path'],
      },
    ],
  ],
};
```

## Options

- **`entry`**: Entry file(s). **Required**. Must be an absolute path or an array contains absolute path.
- **`polyfills`**: Injected polyfills. They can be module names and absolute paths.

## Licenses

[MIT License](https://github.com/fedlinker/fedlinker/blob/master/MIT-LICENSE) and [Anti 996 License](https://github.com/fedlinker/fedlinker/blob/master/Anti-996-LICENSE).
