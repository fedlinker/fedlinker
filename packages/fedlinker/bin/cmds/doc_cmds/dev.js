const dev = require('../../../lib/dev');

exports.command = 'dev [options]';
exports.describe = 'Develop document';

exports.handler = argv => {
  dev({ ...argv, type: 'doc' });
};
