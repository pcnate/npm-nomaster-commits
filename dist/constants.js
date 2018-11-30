const path = require('path');
const fs = require('fs');

// const folder = path.dirname( moduel.parent.filename );
function findParentPkgDesc(directory) {
  if (!directory) {
    directory = path.dirname(module.parent.filename);
  }
  var file = path.resolve(directory, 'package.json');
  if (fs.existsSync(file) && fs.statSync(file).isFile()) {
    return path.dirname( file );
  }
  var parent = path.resolve(directory, '..');
  if (parent === directory) {
    return null;
  }
  return findParentPkgDesc(parent);
}

const precommitFile = path.join( findParentPkgDesc( path.dirname( process.cwd() ) ), ".git/hooks/pre-commit" );
const baseFile = path.join( findParentPkgDesc( process.cwd() ), "dist/pre-commit.sh" );

console.log({ precommitFile });
console.log({ baseFile });

module.exports = {
  precommitFile,
  baseFile,
}