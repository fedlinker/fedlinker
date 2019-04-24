const minimalProposals = ['class-properties', 'decorators'];

// https://babeljs.io/docs/en/plugins#experimental
const allProposals = [
  'class-properties',
  'decorators',
  'do-expressions',
  'export-default-from',
  'export-namespace-from',
  'function-bind',
  'function-sent',
  'logical-assignment-operators',
  'nullish-coalescing-operator',
  'numeric-separator',
  'optional-chaining',
  'partial-application',
  'pipeline-operator',
  'private-methods',
  'throw-expressions',
];

const hasProposal = (proposals, proposal) => {
  if (proposals.includes(proposal)) return true;
  if (proposals.includes(`@babel/plugin-proposal-${proposal}`)) return true;
  return false;
};

module.exports = (api, options = {}) => {
  const env = api.env();
  const isProd = env === 'production';
  const isDev = env === 'development';
  const isTest = env === 'test';

  const {
    // Enable Flow syntax.
    flow = false,
    // Enable TypeScript syntax.
    typescript = false,

    // ES experimental syntax:
    // - 'minimal': only enable class-properties and decorators syntax.
    // - 'all': enable all experimental syntax.
    // - ['proposal-name']: user specified experimental syntax array.
    proposals = 'minimal',

    // Followings are babel-plugin-entry options.
    // https://github.com/fedlinker/fedlinker/blob/master/packages/babel-plugin-entry/README.md
    entry = undefined,
    polyfills = [],
  } = options;

  // Can't enable flow and typescript both.
  if (flow && typescript) {
    throw new Error(
      `[babel-preset-fedlinker]: can't enable flow and typescript both`
    );
  }

  const presets = [];
  const plugins = [];
  const overrides = [];

  // Env.
  presets.push([
    require('@babel/preset-env'),
    isTest
      ? {
          targets: { node: 'current' },
          ...options['@babel/preset-env'],
        }
      : {
          // Assume module resolving handled by a builder (like Webpack) by default.
          modules: false,
          // Allow import @babel/polyfill
          useBuiltIns: 'entry',
          corejs: 3,
          shippedProposals: proposals === 'all',
          ...options['@babel/preset-env'],
        },
  ]);

  // Inject polyfills to entry files.
  if (entry && polyfills && polyfills.length) {
    plugins.push([require('babel-plugin-entry'), { entry, polyfills }]);
  }

  // Hoist React elements to the highest possible scope in production env.
  if (isProd) {
    plugins.push([
      require('@babel/plugin-transform-react-constant-elements'),
      { ...options['@babel/plugin-transform-react-constant-elements'] },
    ]);
  }

  // React
  presets.push([
    require('@babel/preset-react'),
    {
      // Don't add polyfills.
      useBuiltIns: true,
      development: isDev || isTest,
      ...options['@babel/preset-react'],
    },
  ]);

  // Experimental.
  let resolvedProposals = proposals;
  if (proposals === 'minimal') resolvedProposals = minimalProposals;
  else if (proposals === 'all') resolvedProposals = allProposals;
  else if (!Array.isArray(proposals)) resolvedProposals = [];

  if (hasProposal(resolvedProposals, 'do-expressions')) {
    plugins.push(require('@babel/plugin-proposal-do-expressions'));
  }
  if (hasProposal(resolvedProposals, 'export-default-from')) {
    plugins.push(require('@babel/plugin-proposal-export-default-from'));
  }
  if (hasProposal(resolvedProposals, 'export-namespace-from')) {
    plugins.push(require('@babel/plugin-proposal-export-namespace-from'));
  }
  if (hasProposal(resolvedProposals, 'function-bind')) {
    plugins.push(require('@babel/plugin-proposal-function-bind'));
  }
  if (hasProposal(resolvedProposals, 'function-sent')) {
    plugins.push(require('@babel/plugin-proposal-function-sent'));
  }
  if (hasProposal(resolvedProposals, 'logical-assignment-operators')) {
    plugins.push(
      require('@babel/plugin-proposal-logical-assignment-operators')
    );
  }
  if (hasProposal(resolvedProposals, 'nullish-coalescing-operator')) {
    plugins.push(require('@babel/plugin-proposal-nullish-coalescing-operator'));
  }
  if (hasProposal(resolvedProposals, 'numeric-separator')) {
    plugins.push(require('@babel/plugin-proposal-numeric-separator'));
  }
  if (hasProposal(resolvedProposals, 'optional-chaining')) {
    plugins.push([
      require('@babel/plugin-proposal-optional-chaining'),
      { ...options['@babel/plugin-proposal-optional-chaining'] },
    ]);
  }
  if (hasProposal(resolvedProposals, 'partial-application')) {
    plugins.push(require('@babel/plugin-proposal-partial-application'));
  }
  if (hasProposal(resolvedProposals, 'pipeline-operator')) {
    plugins.push([
      require('@babel/plugin-proposal-pipeline-operator'),
      {
        proposal: 'minimal',
        ...options['@babel/plugin-proposal-pipeline-operator'],
      },
    ]);
  }
  if (hasProposal(resolvedProposals, 'throw-expressions')) {
    plugins.push(require('@babel/plugin-proposal-throw-expressions'));
  }
  if (hasProposal(resolvedProposals, 'private-methods')) {
    plugins.push([
      require('@babel/plugin-proposal-private-methods'),
      { loose: true, ...options['@babel/plugin-proposal-private-methods'] },
    ]);
  }
  if (hasProposal(resolvedProposals, 'decorators')) {
    plugins.push([
      require('@babel/plugin-proposal-decorators'),
      { legacy: true, ...options['@babel/plugin-proposal-class-properties'] },
    ]);
  }
  if (hasProposal(resolvedProposals, 'class-properties')) {
    plugins.push([
      require('@babel/plugin-proposal-class-properties'),
      { loose: true, ...options['@babel/plugin-proposal-class-properties'] },
    ]);
  }

  // Dynamic import.
  plugins.push([require('@babel/plugin-syntax-dynamic-import')]);

  // Runtime.
  plugins.push([
    require('@babel/plugin-transform-runtime'),
    {
      corejs: 3,
      useESModules: !isTest,
      ...options['@babel/plugin-transform-runtime'],
    },
  ]);
  if (!isTest) {
    plugins.push([
      require('@babel/plugin-transform-regenerator'),
      { async: false, ...options['@babel/plugin-transform-regenerator'] },
    ]);
  }

  // Remove propTypes in production.
  if (isProd) {
    plugins.push([
      require('babel-plugin-transform-react-remove-prop-types'),
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
        [require('@babel/preset-flow'), { ...options['@babel/preset-flow'] }],
      ],
    });
  }
  if (typescript) {
    overrides.push({
      include: /\.tsx?$/,
      presets: [
        [
          require('@babel/preset-typescript'),
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
          require('@babel/plugin-proposal-decorators'),
          {
            ...options['@babel/plugin-proposal-class-properties'],
            legacy: true,
          },
        ],
        [
          require('@babel/plugin-proposal-class-properties'),
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
