const path = require('path');
const { getFileBasenamesInDir } = require('../utils');
const subCmds = getFileBasenamesInDir(path.join(__dirname, 'lib_cmds'));

exports.command = `lib <${subCmds.join('|')}> [options]`;
exports.describe = 'React components library related';

exports.builder = yargs => {
  return yargs.commandDir('lib_cmds').demandCommand();
};
