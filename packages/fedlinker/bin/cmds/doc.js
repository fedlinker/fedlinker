const path = require('path');
const { getFileBasenamesInDir } = require('../utils');
const subCmds = getFileBasenamesInDir(path.join(__dirname, 'doc_cmds'));

exports.command = `doc <${subCmds.join('|')}> [options]`;
exports.describe = 'Document related';

exports.builder = yargs => {
  return yargs.commandDir('doc_cmds').demandCommand();
};
