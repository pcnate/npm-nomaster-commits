#!/usr/bin/env node

const lib = require('./src');
const args = require('minimist')( process.argv.slice( 2 ) );


/**
 * get the status of the app and current working directory
 * 
 * @param {boolean} verbose extra verbose logging
 * @param {string} directory directory to act upon
 */
async function status( verbose, directory ) {
  const { action, exitCode } = await lib.status( verbose, directory );
  if( action === 'exit' ) process.exit( exitCode );
}

/**
 * install the pre-commit hook
 * 
 * @param {boolean} verbose extra verbose logging
 * @param {string} directory directory to act upon
 */
async function install( verbose, directory ) {
  const { action, exitCode } = await lib.install( verbose, directory );
  if( action === 'exit' ) process.exit( exitCode );
}


/**
 * uninstall the pre-commit hook
 * 
 * @param {boolean} verbose extra verbose logging
 * @param {string} directory directory to act upon
 */
async function uninstall( verbose, directory ) {
  const { action, exitCode } = await lib.uninstall( verbose, directory );
  if( action === 'exit' ) process.exit( exitCode );
}


/**
 * gets the help documentation
 * 
 * @returns {string}
 */
async function help() {
  return require('./manual')();
}


/**
 * 
 */
if ( require.main === module ) {
  ( async() => {

    let verbose = !!args['verbose'] || false;
    let directory = !!args['directory'] ? args['directory'] : process.cwd();
  
    if( !!args['help'] || ( !args['install'] && !args['uninstall'] && !args['status']) ) {
      console.log( await help() );
    } else

    if( !!args['status'] ) {
      await status( verbose, directory );
    } else
  
    if( !!args['install'] ) {
      await install( verbose, directory );
    } else
  
    if( !!args['uninstall'] ) {
      await uninstall( verbose, directory );
    }
    
  })();
} else {
  module.exports = {
    install,
    uninstall,
    help,
  }
}