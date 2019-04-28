const minimalProposals = ['class-properties', 'decorators'];
// https://babeljs.io/docs/en/plugins#experimental
const allProposals = require('fedlinker-utils').proposals;

const defaultPolyfills = [
  // Dynamic import.
  'core-js/features/array/iterator',
  'core-js/features/promise',
  'core-js/features/promise/finally',
  // React.
  'core-js/features/object/assign',
  'core-js/features/array/from',
  'core-js/features/symbol',
  'core-js/features/set',
  'core-js/features/map',
  'raf/polyfill',
  // `window.fetch()`.
  'whatwg-fetch',
  'abortcontroller-polyfill/dist/polyfill-patch-fetch',
];

const hasProposal = (proposals, proposal) => {
  if (proposals.includes(proposal)) return true;
  if (proposals.includes(`@babel/plugin-proposal-${proposal}`)) return true;
};

module.exports = (api, options = {}) => {
  const env = api.env();
  const isProd = env === 'production';
  const isDev = env === 'development';
  const isTest = env === 'test';

  let {
    // Whether support Flow syntax.
    flow = false,

    // Whether support TypeScript syntax.
    typescript = false,

    // ES experimental syntax:
    // - "minimal": only enable "class-properties" and "decorators" syntax.
    // - "all": enable all experimental syntax that Babel supports.
    // - Array: user specified experimental syntax array. They can be:
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
    //   Ref: https://babeljs.io/docs/en/plugins#experimental
    proposals = 'minimal',

    // Inject default polyfills for supporting dynamic import, React and fetch
    // method in lower version browers.
    injectDefaultPolyfills = true,

    // Follings are babel-plugin-entry options.
    // Ref: https://github.com/fedlinker/fedlinker/blob/master/packages/babel-plugin-entry/README.md#options
    entry,
    polyfills = [],
  } = options;

  // Can't enable flow and typescript both.
  if (flow && typescript) {
    throw new Error(`Can't enable flow and typescript both`);
  }

  // Resolve proposals.
  if (proposals === 'minimal') proposals = minimalProposals;
  else if (proposals === 'all') proposals = allProposals;
  else if (!Array.isArray(proposals)) proposals = [];

  // Combine user polyfills and default polyfills
  if (!Array.isArray(polyfills)) polyfills = [polyfills];
  polyfills = []
    .concat(injectDefaultPolyfills ? defaultPolyfills : [])
    .concat(polyfills);

  const presets = [];
  const plugins = [];
  const overrides = [];

  // Env preset.
  presets.push([
    require.resolve('@babel/preset-env'),
    isTest
      ? {
          // In test env, target to current node. Transform module to commonjs.
          targets: { node: 'current' },
          ...options['@babel/preset-env'],
        }
      : {
          // Assume module resolving handled by a builder (like Webpack).
          modules: false,
          // Use polyfills on demand.
          useBuiltIns: 'usage',
          // Use corejs version 3 as built-in polyfills.
          corejs: 3,
          // Don't polyfill those, should be handled by providing global polyfills.
          exclude: [
            'es.array.iterator',
            'es.promise',
            'es.promise.finally',
            'es.object.assign',
            'es.array.from',
            'es.symbol',
            'es.set',
            'es.map',
          ],
          shippedProposals: proposals === 'all',
          ...options['@babel/preset-env'],
        },
  ]);

  // Hoist React elements to the highest possible scope in production env.
  if (isProd) {
    plugins.push([
      require.resolve('@babel/plugin-transform-react-constant-elements'),
      { ...options['@babel/plugin-transform-react-constant-elements'] },
    ]);
  }

  // React preset.
  presets.push([
    require.resolve('@babel/preset-react'),
    {
      // Don't add polyfills, env preset will handle this.
      useBuiltIns: true,
      development: isDev || isTest,
      ...options['@babel/preset-react'],
    },
  ]);

  // Inject polyfills in entry file(s).
  if (entry && polyfills.length) {
    plugins.push([
      require('babel-plugin-entry'),
      {
        entry,
        polyfills,
      },
    ]);
  }

  // Experimental syntax.
  if (hasProposal(proposals, 'decorators')) {
    plugins.push([
      require.resolve('@babel/plugin-proposal-decorators'),
      { legacy: true, ...options['@babel/plugin-proposal-decorators'] },
    ]);
  }
  if (hasProposal(proposals, 'class-properties')) {
    plugins.push([
      require.resolve('@babel/plugin-proposal-class-properties'),
      { loose: true, ...options['@babel/plugin-proposal-class-properties'] },
    ]);
  }
  if (hasProposal(proposals, 'do-expressions')) {
    plugins.push(require.resolve('@babel/plugin-proposal-do-expressions'));
  }
  if (hasProposal(proposals, 'export-default-from')) {
    plugins.push(require.resolve('@babel/plugin-proposal-export-default-from'));
  }
  if (hasProposal(proposals, 'export-namespace-from')) {
    plugins.push(
      require.resolve('@babel/plugin-proposal-export-namespace-from')
    );
  }
  if (hasProposal(proposals, 'function-bind')) {
    plugins.push(require.resolve('@babel/plugin-proposal-function-bind'));
  }
  if (hasProposal(proposals, 'function-sent')) {
    plugins.push(require.resolve('@babel/plugin-proposal-function-sent'));
  }
  if (hasProposal(proposals, 'logical-assignment-operators')) {
    plugins.push(
      require.resolve('@babel/plugin-proposal-logical-assignment-operators')
    );
  }
  if (hasProposal(proposals, 'nullish-coalescing-operator')) {
    plugins.push(
      require.resolve('@babel/plugin-proposal-nullish-coalescing-operator')
    );
  }
  if (hasProposal(proposals, 'numeric-separator')) {
    plugins.push(require.resolve('@babel/plugin-proposal-numeric-separator'));
  }
  if (hasProposal(proposals, 'optional-chaining')) {
    plugins.push([
      require.resolve('@babel/plugin-proposal-optional-chaining'),
      { ...options['@babel/plugin-proposal-optional-chaining'] },
    ]);
  }
  if (hasProposal(proposals, 'partial-application')) {
    plugins.push(require.resolve('@babel/plugin-proposal-partial-application'));
  }
  if (hasProposal(proposals, 'pipeline-operator')) {
    plugins.push([
      require.resolve('@babel/plugin-proposal-pipeline-operator'),
      {
        proposal: 'minimal',
        ...options['@babel/plugin-proposal-pipeline-operator'],
      },
    ]);
  }
  if (hasProposal(proposals, 'throw-expressions')) {
    plugins.push(require.resolve('@babel/plugin-proposal-throw-expressions'));
  }
  if (hasProposal(proposals, 'private-methods')) {
    plugins.push([
      require.resolve('@babel/plugin-proposal-private-methods'),
      { loose: true, ...options['@babel/plugin-proposal-private-methods'] },
    ]);
  }

  // Dynamic import.
  plugins.push([require.resolve('@babel/plugin-syntax-dynamic-import')]);
  if (isTest) {
    plugins.push([require.resolve('babel-plugin-dynamic-import-node')]);
  }

  // Runtime.
  plugins.push([
    require.resolve('@babel/plugin-transform-runtime'),
    {
      corejs: 3,
      useESModules: !isTest,
      ...options['@babel/plugin-transform-runtime'],
    },
  ]);

  // Remove propTypes in production.
  if (isProd) {
    plugins.push([
      require.resolve('babel-plugin-transform-react-remove-prop-types'),
      {
        mode: 'remove',
        removeImport: true,
        ...options['babel-plugin-transform-react-remove-prop-types'],
      },
    ]);
  }

  // Overrides for enabling Flow or TypeScript syntax.
  if (flow) {
    overrides.push({
      exclude: /\.tsx?$/,
      presets: [
        [
          require.resolve('@babel/preset-flow'),
          { ...options['@babel/preset-flow'] },
        ],
      ],
    });
  }
  if (typescript) {
    overrides.push({
      include: /\.tsx?$/,
      presets: [
        [
          require.resolve('@babel/preset-typescript'),
          {
            isTSX: true,
            allExtensions: true,
            ...options['@babel/preset-typescript'],
          },
        ],
      ],
      // Support TypeScript experimental decorators syntax.
      plugins: [
        [
          require.resolve('@babel/plugin-proposal-decorators'),
          {
            ...options['@babel/plugin-proposal-decorators'],
            legacy: true,
          },
        ],
        [
          require.resolve('@babel/plugin-proposal-class-properties'),
          {
            ...options['@babel/plugin-proposal-class-properties'],
            loose: true,
          },
        ],
      ],
    });
  }

  return { presets, plugins, overrides };
};
