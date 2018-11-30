#!/usr/bin/env node

var fs = require('fs');
var util = require('util');
var crypto = require('crypto');

const exists = util.promisify( fs.exists );
const readFile = util.promisify( fs.readFile );
const copyFile = util.promisify( fs.copyFile );
const { precommitFile, baseFile } = require('./constants');

( async () => {

  console.log( 'attempting to install nomaster precommit hook' );

  const precommitFileExists = await exists( precommitFile );
  
  if ( !precommitFileExists ) {
    await copyFile( baseFile, precommitFile );
    console.log( 'nomaster precommit hook installed' );
  } else {

    const precommitFileContents = await readFile( precommitFile );
    const baseFileContents = await readFile( baseFile );

    const precommitFileContentsHash = crypto.createHash('sha256').update( precommitFileContents.toString() );
    const baseFileContentsHash = crypto.createHash('sha256').update( baseFileContents.toString() );
    
    if( precommitFileContentsHash.digest('hex') == baseFileContentsHash.digest('hex') ) {
      console.log( 'precommit is already installed' );
      process.exit( 0 );
    } else {
      console.log( 'another precommit is installed, please remove this package or that precommit' );
      process.exit( 1 );
    }
  }

} )();