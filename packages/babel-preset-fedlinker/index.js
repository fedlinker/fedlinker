module.exports = (api, options = {}) => {
  const env = api.env();
  const isProd = env === 'production';
  const isDev = env === 'development';
  const isTest = env === 'test';

  const {
    flow = false,
    typescript = false,
    // 'minimal' | 'all' | string[]
    proposals = 'minimal',
  } = options;

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
          // Use corejs polyfills on demand.
          useBuiltIns: 'usage',
          corejs: 3,
          shippedProposals: proposals === 'all',
          ...options['@babel/preset-env'],
        },
  ]);

  // Inject polyfills to entry files.
  plugins.push([
    require('babel-plugin-entry'),
    {
      ...options,
      polyfills: getPolyfills(options),
    },
  ]);

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
  let resolvedProposals;
  if (proposals === 'minimal') resolvedProposals = getMinimalProposals();
  else if (proposals === 'all') resolvedProposals = getAllProposals();
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
    plugins.push(require('@babel/plugin-proposal-logical-assignment-operators'));
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
      { loose: true, ...options['@babel/plugin-proposal-optional-chaining'] },
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
      { decoratorsBeforeExport: true, ...options['@babel/plugin-proposal-class-properties'] },
    ]);
  }
  if (hasProposal(resolvedProposals, 'class-properties')) {
    plugins.push([
      require('@babel/plugin-proposal-class-properties'),
      { loose: true, ...options['@babel/plugin-proposal-class-properties'] },
    ]);
  }

  // Runtime.
  plugins.push([
    require('@babel/plugin-transform-runtime'),
    {
      corejs: 3,
      helpers: true,
      regenerator: true,
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

  // Overrides.
  if (flow) {
    overrides.push({
      exclude: /\.tsx?$/,
      presets: [[require('@babel/preset-flow'), { ...options['@babel/preset-flow'] }]],
    });
  }
  if (typescript) {
    overrides.push({
      include: /\.tsx?$/,
      presets: [
        [
          require('@babel/preset-typescript'),
          { isTSX: true, allExtensions: true, ...options['@babel/preset-typescript'] },
        ],
      ],
      // Support TypeScript experimental decorators syntax.
      plugins: [
        [
          require('@babel/plugin-proposal-decorators'),
          { ...options['@babel/plugin-proposal-class-properties'], legacy: true },
        ],
        [
          require('@babel/plugin-proposal-class-properties'),
          { ...options['@babel/plugin-proposal-class-properties'], loose: true },
        ],
      ],
    });
  }

  return { presets, plugins, overrides };
};

function getAllProposals() {
  return [
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
}

function getMinimalProposals() {
  return ['class-properties', 'decorators'];
}

function hasProposal(proposals, proposal) {
  if (proposals.includes(proposal)) return true;
  if (proposals.includes(`@babel/plugin-proposal-${proposal}`)) return true;
  return false;
}

function getPolyfills(options) {
  const { injectPolyfills = true, fetchPolyfill = false, polyfills: userPolyfills = [] } = options;

  // Collection polyfills
  let polyfills = [];

  if (injectPolyfills) {
    // https://reactjs.org/docs/javascript-environment-requirements.html
    polyfills = [
      '@babel/runtime-corejs3/core-js-stable/map.js',
      '@babel/runtime-corejs3/core-js-stable/set.js',
      require.resolve('raf'),
    ];

    if (fetchPolyfill) {
      polyfills.push(require.resolve('whatwg-fetch'));
      polyfills.push(require.resolve('abortcontroller-polyfill'));
    }
  }

  if (Array.isArray(userPolyfills)) {
    polyfills = polyfills.concat(userPolyfills);
  }

  return polyfills;
}
