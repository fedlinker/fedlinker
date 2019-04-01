# `babel-plugin-entry`

Babel plugin for injecting polyfills in entry files

## Install

```shell
npm install -D babel-plugin-entry
# or
yarn add -D babel-plugin-entry
```

## Usage

In your babel configuration file (i.e. `.babelrc`):

```json
{
  "plugins": [
    [
      "babel-plugin-entry",
      {
        "entry": "./src/index.js",
        "entries": ["./src/home/index.js", "/absolute/path/entry.js"],
        "polyfills": ["module-name", "./relative-path", "/absolute-path"],
        "context": "/project-root/"
      }
    ]
  ]
}
```

## Options

All relative paths above will be resolved by `path.resolve()` with `context` base path.

- **`entry`**: Single entry filename. Can be a relative or absolue path.
- **`entries`**: Multiple entry filenames. Cans use with `entry` option.
- **`polyfills`**: Polyfills array. Item in `polyfills` can be a(n) module name, relative path or absolute path.
- **`context`**: Same as Webpack `context`, default is `process.cwd()`. All relative path in babel-plugin-entry options will be concated with `context`. When you changed Webpack context, you should change this option with same value.

## License

MIT.
