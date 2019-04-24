# Design

## Packages

- **fedlinker**: scripts include `dev`, `build`, `test` and `analyze` commands.
- **fedlinker-init**: CLI for creating a new project. Only one command `fedlinker-init`.
- **babel-preset-fedlinker**: Babel preset for Fedlinker.
- **fedlinker-create-webpack-config**: create Webpack config for Fedlinker.
- **fedlinker-markdown-loader**: markdown loader supports runtime examples.

## Package `fedlinker`

Use `fedlinker` command will auto process `fedlinker.config.js` file as config file, it can be changed by providing a CLI option `--config other.config.js` or `-c other.config.js`.

### Commands

- `fedlinker dev [options]`
- `fedlinker build [options]`
- `fedlinker test [options]`
- `fedlinker analyze [options]`

### Configs

```js
// fedlinker.config.js
const path = require('path');

const configs = {
  // Project type. It can be "web", "lib" or "doc". Default: "web".
  // - "web": single page application, also support multi pages.
  // - "lib": develop React components library.
  // - "doc": write with markdown, produce static website files,
  //          support `.mdx` and runtime examples in `.md`.
  type: 'web',

  // Whether enable flow syntax. Default: false.
  flow: false,

  // Whether enable typescript syntax. Default: false.
  typescript: false,

  // ES experimental syntax:
  // - "minimal" (Default): only enable "class-properties" and "decorators"
  //   syntax.
  // - "all": enable all experimental syntax.
  // - Array: user specified experimental syntax array. Include:
  //   - "class-properties"
  //   - "decorators"
  //   - "do-expressions"
  //   - "export-default-from"
  //   - "export-namespace-from"
  //   - "function-bind"
  //   - "function-sent"
  //   - "logical-assignment-operators"
  //   - "nullish-coalescing-operator"
  //   - "numeric-separator"
  //   - "optional-chaining"
  //   - "partial-application"
  //   - "pipeline-operator"
  //   - "private-methods"
  //   - "throw-expressions"
  // Reference: https://babeljs.io/docs/en/plugins#experimental
  proposals: 'minimal',

  // Source code directory. Absolute path or relatibve path (relative as
  // `process.cwd()`). Default: "src".
  src: 'src',

  // Bundle files output directory. Absolute path or relatibve path (relative as
  // `process.cwd()`). Default: "dist".
  dist: 'dist',

  // Static files. Absolute path or relatibve path (relative as `process.cwd()`).
  // Default: "statics". Files under this directory will be copied into `dist`
  // directory.
  statics: 'statics',

  // Same as Webpack `entry` option. Default: 'src'
  entry: 'src',

  // Same as Webpack `output.publicPath` option. Default: '/'. In development
  // env, it will always be '/'.
  publicPath: '/',

  // Custom Babel config.
  babel: fedlinkerBabelConfig => {
    // Do something.
    return fedlinkerBabelConfig;
  },

  // Custom Webpack config.
  webpack: fedlinkerWebpackConfig => {
    // Do something.
    return fedlinkerWebpackConfig;
  },
};
```

### Options

Most options are same as [configs](#configs).

```shell
Options:
  --config, -c
  --type
  --flow
  --typescript
  --proposals
  --src
  --dist
  --statics
  --entry
  --public-path
```

## Package `fedlinker-init`

In fedlinker-init package, only one command without options:

- `fedlinker-init`

After running this command, it will show prompts for interacting with users.
