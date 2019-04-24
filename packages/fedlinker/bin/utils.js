const path = require('path');
const fs = require('fs');

const EXT = '.js';

exports.getFileBasenamesInDir = dir => {
  if (!path.isAbsolute(dir) || !fs.statSync(dir).isDirectory()) {
    throw new Error('Should input an absolute directory path');
  }

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .map(file => {
      if (file.isFile() && path.extname(file.name) === EXT) {
        return path.basename(file.name, EXT);
      } else {
        return false;
      }
    })
    .filter(Boolean);
};
