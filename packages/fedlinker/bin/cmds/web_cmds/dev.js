const chalk = require('chalk');

exports.command = 'dev [options]';
exports.describe = 'Develop React web application';

exports.handler = argv => {
  console.log(chalk.green('Work in progress...'));
};
