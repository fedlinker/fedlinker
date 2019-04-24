const path = require('path');
const { getFileBasenamesInDir } = require('../utils');
const subCmds = getFileBasenamesInDir(path.join(__dirname, 'web_cmds'));

exports.command = `web <${subCmds.join('|')}> [options]`;
exports.describe = 'React web application related';

exports.builder = yargs => {
  return yargs.commandDir('web_cmds').demandCommand();
};
