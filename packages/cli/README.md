# Fedlinker

See [Fedlinker website](https://fedlinker.com/).

## CLI

- `fedlinker init`
- `fedlinker dev`
- `fedlinker build`
- `fedlinker analyze`
- `fedlinker test`

## Config

### Common config

```ts
interface CommonConfig {
  target: 'web' | 'lib' | 'doc';
  flow: boolean;
  typescript: boolean;
  proposals: 'minimal' | 'all' | false | Proposal[];
}

// https://babeljs.io/docs/en/plugins#experimental
type Proposal =
  | 'class-properties'
  | 'decorators'
  | 'do-expressions'
  | 'export-default-from'
  | 'export-namespace-from'
  | 'function-bind'
  | 'function-sent'
  | 'logical-assignment-operators'
  | 'nullish-coalescing-operator'
  | 'numeric-separator'
  | 'optional-chaining'
  | 'partial-application'
  | 'pipeline-operator'
  | 'private-methods'
  | 'throw-expressions';
```

## Licenses

[MIT License](https://github.com/fedlinker/fedlinker/blob/master/MIT-LICENSE) and [Anti 996 License](https://github.com/fedlinker/fedlinker/blob/master/Anti-996-LICENSE).
