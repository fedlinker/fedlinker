# babel-plugin-entry

Babel plugin for injecting polyfills into entry file(s).

## Install

```shell
npm install -D babel-plugin-entry
# or
yarn add -D babel-plugin-entry
```

## Usage

In your babel configuration file (i.e. `babel.config.js`):

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

- **`entry`**: Entry file(s). Must be an absolute path with file extension or an array contains absolute paths with file extensions.
- **`polyfills`**: Injected polyfills. They can be module names and absolute paths.

## License

[Anti 996 License (反 996 许可证)](./LICENSE).
