#!/usr/bin/env node

var fs = require('fs');
var util = require('util');
var crypto = require('crypto');

const exists = util.promisify( fs.exists );
const readFile = util.promisify( fs.readFile );
const unlink = util.promisify( fs.unlink );
const { precommitFile, baseFile } = require('./constants');

( async () => {

  console.log( 'attempting to uninstall nomaster precommit hook' );

  const precommitFileExists = await exists( precommitFile );
  
  if ( !precommitFileExists ) {
    console.log( 'precommit hook not installed' );
    process.exit( 0 );
  } else {

    const precommitFileContents = await readFile( precommitFile );
    const baseFileContents = await readFile( baseFile );

    const precommitFileContentsHash = crypto.createHash('sha256').update( precommitFileContents.toString() );
    const baseFileContentsHash = crypto.createHash('sha256').update( baseFileContents.toString() );
    
    if( precommitFileContentsHash.digest('hex') == baseFileContentsHash.digest('hex') ) {
      await unlink( precommitFile );
      console.log( 'nomaster precommit hook removed' );
      process.exit( 0 );
    } else {
      console.log( 'another precommit is installed, not removing it' );
      process.exit( 0 );
    }
  }

} )();