const docs = require('../manual');
const fsExtra = require('fs-extra');
const path = require('path');

const manDirectory = path.join( process.cwd(), 'man' );
fsExtra.ensureDirSync( manDirectory );
fsExtra.writeFileSync( path.join( manDirectory, 'main.1' ), docs() );
