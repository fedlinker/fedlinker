module.exports = {
  config: {
    desc: 'Fedlinker config file path',
    string: true,
    global: true,
    group: 'Global options:',
  },
  flow: {
    desc: 'Enable Flow syntax',
    boolean: true,
    global: true,
    group: 'Global options:',
  },
  typescript: {
    desc: 'Enable TypeScript syntax',
    boolean: true,
    global: true,
    group: 'Global options:',
  },
  proposals: {
    desc: 'ECMAScript experimental syntax',
    global: true,
    group: 'Global options:',
    default: 'minimal',
    choices: ['minimal', 'all', 'none'],
  },
};
