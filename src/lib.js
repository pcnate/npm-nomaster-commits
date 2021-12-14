#!/usr/bin/env node

const path   = require('path');
const fs     = require('fs');
const os     = require('os');
const util   = require('util');
const crypto = require('crypto');
const envCi  = require('env-ci');
const color  = require('cli-color');

const fs2 = {
  exists:    util.promisify( fs.exists   ),
  readFile:  util.promisify( fs.readFile ),
  copyFile:  util.promisify( fs.copyFile ),
  chmodFile: util.promisify( fs.chmod    ),
  unlink:    util.promisify( fs.unlink   ),
}
const CONTINUE_ON_CONFLICTING_COMMIT_HOOK_DELAY = 5;
const enableOnCiEnvs = false;


/**
 * attempt to get the root node directory
 * 
 * @param {string} directory sub directory
 * @returns {string}
 */
module.exports.findParentPkgDesc = ( directory ) => {
  if( !directory ) directory = path.dirname( module.parent.filename );
  var file = path.resolve( directory, '.git' );
  if( fs.existsSync( file ) && fs.statSync( file ).isDirectory() ) return path.dirname( file );
  var parent = path.resolve( directory, '..' );
  if( parent === directory ) return null;
  return this.findParentPkgDesc( parent );
}


/**
 * get the location of the parent repository to install the git hook into
 * 
 * @returns {string}
 */
module.exports.precommitFile = ( directory ) => {
  let dir = this.findParentPkgDesc( directory || process.cwd() );
  return path.join( dir, ".git", "hooks", "pre-commit" );
}


/**
 * get the location of the pre-commit hook distributable
 * 
 * @returns {string}
 */
module.exports.baseFile = () => {
  return path.join( path.dirname( __dirname ), "dist", "pre-commit.sh" );
}


/**
 * hash file contents for comparison
 * 
 * @param {string} contents contents of file that should be hashed for comparison
 */
module.exports.hashFile = async ( contents = '' ) => new Promise( async resolve => {
  resolve( crypto.createHash('sha256').update( contents ).digest('hex') );
});


/**
 * compare the contents of two files for changes
 * 
 * converts to string and removes comment lines before comparison
 * 
 * @param {string} contents1 first file
 * @param {string} contents2 second file
 * @returns {promise}
 */
module.exports.compareFileContents = async ( contents1, contents2 ) => new Promise( async resolve => {
  contents1 = contents1.toString().replace( /\#.*?\r(\n){0,1}/gmi, '' );
  contents2 = contents2.toString().replace( /\#.*?\r(\n){0,1}/gmi, '' );
  resolve( await this.hashFile( contents1 ) === await this.hashFile( contents2 ) );
});


/**
 * copy a file with verbose logging option
 * 
 * @param {boolean} verbose extra verbose logging
 * @param {string} source path to the source file
 * @param {string} target path to the target file
 * @returns {promise}
 */
module.exports.copyFile = async ( verbose = false, source, target ) => new Promise( async resolve => {
  if ( verbose ) console.log( `cp ${ source } ${ target }` );
  await fs2.copyFile( source, target ).catch( error => {
    console.error( color.red('error copying file'), error );
    resolve( false );
  });
  resolve( true );
});


/**
 * change the permissions to allow pre-commit hook to be executable
 * 
 * @param {boolean} verbose extra verbose logging
 * @param {string} target path to the target file
 * @returns {promise}
 */
module.exports.makeExecutable = async ( verbose = false, target ) => new Promise( async resolve => {
  if ( verbose ) console.log( `chmod ${ target } 0755` );
  await fs2.chmodFile( target, '0755' ).catch( error => {
    console.error( color.red('error chmodding file'), error );
    resolve( false );
    return;
  });
  resolve( true );
});


/**
 * check the status of a directory
 * 
 * @param {boolean} verbose extra verbose logging
 * @param {string} directory path of target git repository
 * @returns {promise}
 */
module.exports.status = ( verbose = false, directory ) => new Promise( async resolve => {
  console.log( color.blue( 'attempting to check for nomaster pre-commit hook' ) );

  const precommitFile   = this.precommitFile( directory );
  const baseFile        = this.baseFile();
  const targetGitFolder = path.join( directory, '.git' );

  console.log( 'pre-commit hook source:', baseFile      );
  console.log( 'pre-commit hook path:  ', precommitFile );

  // check for base file
  if( !await fs2.exists( baseFile ) ) {
    console.log( color.red( 'pre-commit hook distributable not found' ) );
    resolve({ action: 'exit', exitCode: 1 });
    return;
  }
  
  // check if folder is a git repository
  if( !await fs2.exists( targetGitFolder ) && !fs.statSync( targetGitFolder ).isDirectory() ) {
    console.log( color.red( `'${ directory }' is not a valid git repository` ) );    
    resolve({ action: 'exit', exitCode: 1 });
    return;
  }
  
  // check for existing pre-commit hook
  if( !await fs2.exists( precommitFile ) ) {
    console.log( color.red( `no pre-commit hook is installed in this git repository` ) );    
    resolve({ action: 'exit', exitCode: 0 });
    return;
  }

  const precommitFileContents = ( await fs2.readFile( precommitFile ) ).toString();
  const baseFileContents      = ( await fs2.readFile( baseFile      ) ).toString();
  if ( await this.compareFileContents( precommitFileContents, baseFileContents ) ) {
    console.log( 'file contents match?' )
  }

  console.log( 'precommitFileContents: ', precommitFileContents );
  console.log( 'baseFileContents     : ', baseFileContents      );

  // print out the findings
  resolve({ action: 'exit', exitCode: 0 });
});


/**
 * install the precommit hook
 * 
 * @param {boolean} verbose extra verbose logging
 * @param {string} directory path of target git repository
 * @returns {promise}
 */
module.exports.install = ( verbose = false, directory ) => new Promise( async resolve => {
  console.log( color.blue( 'attempting to install nomaster pre-commit hook' ) );
  console.log( 'pre-commit hook source:', this.baseFile() );
  console.log( 'pre-commit hook path:  ', this.precommitFile( directory ) );
  
  const precommitFile = this.precommitFile( directory );
  const baseFile = this.baseFile();

  const { isCi } = envCi();

  if( isCi && !enableOnCiEnvs ) {
    console.warn( color.red( 'This run was triggered in a known CI environment' ), color.yellow( 'not installing pre-commit hook' ) );
    resolve({ action: 'exit', exitCode: 0 });
    return;
  }

  // check for base file
  if( !await fs2.exists( baseFile ) ) {
    console.log( color.red( 'pre-commit hook distributable not found' ) );
    resolve({ action: 'exit', exitCode: 1 });
    return;
  }

  // check if the pre-commit hook is not installed
  if( !await fs2.exists( precommitFile ) ) {
    
    // copy our file to the git hooks folder
    if( !await this.copyFile( verbose, baseFile, precommitFile ) ) {
      resolve({ action: 'exit', exitCode: 1 });
      return;
    }
    
    // verify it was copied and set it to executable
    if( await fs2.exists( precommitFile ) ) {
      if( !await this.makeExecutable( verbose, precommitFile ) ) {
        resolve({ action: 'exit', exitCode: 1 });
        return;        
      }
    } else {
      console.error( color.red(`Error: The pre-commit hook was not found at '${ precommitFile }'. The reason should be listed above`) );
      resolve({ action: 'exit', exitCode: 1 });
      return;
    }
    
    // success
    console.log('nomaster pre-commit hook', color.yellow( 'installed' ) );
    resolve({ action: 'exit', exitCode: 0 });
    return;
  }

  // verify if the existing pre-commit hook is different
  const precommitFileContents = ( await fs2.readFile( precommitFile ) ).toString();
  const baseFileContents      = ( await fs2.readFile( baseFile      ) ).toString();
  if( await this.compareFileContents( precommitFileContents, baseFileContents ) ) {
    
    // copy our file to the git hooks folder
    if( !await this.copyFile( verbose, baseFile, precommitFile ) ) {
      resolve({ action: 'exit', exitCode: 1 });
      return;
    }

    // verify it was copied and set it to executable
    if( await fs2.exists( precommitFile ) ) {
      if( !await this.makeExecutable( verbose, precommitFile ) ) {
        resolve({ action: 'exit', exitCode: 1 });
        return;        
      }
    } else {
      console.error( color.red(`Error: The pre-commit hook was not found at '${ precommitFile }'. The reason should be listed above`) );
      resolve({ action: 'exit', exitCode: 1 });
      return;
    }

    // success
    console.log('nomaster pre-commit hook', color.yellow( 'updated' ) );
    resolve({ action: 'exit', exitCode: 0 });
    return;
  }
  
  console.warn('another pre-commit is installed, please remove this package or that pre-commit');

  let i = CONTINUE_ON_CONFLICTING_COMMIT_HOOK_DELAY;
  process.stdout.write(`continuing in ${ i } seconds\r`);
  let _timer1 = setInterval( () => process.stdout.write(`continuing in ${ i } seconds\r`), 100 );
  let _timer2 = setInterval( () => i--, 1000 );
  setTimeout( () => {
    process.stdout.write( os.EOL );
    clearInterval( _timer1 );
    clearInterval( _timer2 );
    resolve({ action: 'exit', exitCode: 0 });
  }, ( CONTINUE_ON_CONFLICTING_COMMIT_HOOK_DELAY * 1000 ) + 200 );

});


/**
 * uninstall the procommit hook if it is our unmodified version
 * 
 * @param {boolean} verbose extra verbose logging
 * @param {string} directory path of target git repository
 * @returns {promise}
 */
module.exports.uninstall = ( verbose = false, directory ) => new Promise( async resolve => {
  console.log( color.blue( 'attempting to uninstall nomaster pre-commit hook' ) );
  console.log( 'pre-commit hook source:', this.baseFile() );
  console.log( 'pre-commit hook path:  ', this.precommitFile( directory ) );

  const precommitFile = this.precommitFile( directory );
  const baseFile = this.baseFile();

  // check for base file
  if( !await fs2.exists( baseFile ) ) {
    console.log( color.red( 'pre-commit hook distributable not found' ) );
    resolve({ action: 'exit', exitCode: 1 });
    return;
  }

  // check if the pre-commit hook is not installed
  if( !await fs2.exists( precommitFile ) ) {
    console.log( color.yellow( 'pre-commit hook not installed' ) );
    resolve({ action: 'exit', exitCode: 0 });
    return;
  }

  // check if the existing pre-commit hook is ours
  const precommitFileContents = ( await fs2.readFile( precommitFile ) ).toString();
  const baseFileContents      = ( await fs2.readFile( baseFile      ) ).toString();
  if( !await this.compareFileContents( precommitFileContents, baseFileContents ) ) {
    console.log( 'another pre-commit is installed, not removing it' );
    resolve({ action: 'exit', exitCode: 1 });
    return;
  }

  // remove the pre-commit hook
  await fs2.unlink( precommitFile ).catch( error => {
    console.error( color.red( 'Error removing file' ), error );
  });
  console.log( 'nomaster pre-commit hook', color.yellow( 'removed' ) );
  resolve({ action: 'exit', exitCode: 0 });
});
