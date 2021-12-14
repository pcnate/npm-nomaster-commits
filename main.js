#!/usr/bin/env node

const lib = require('./src');
const args = require('minimist')( process.argv.slice( 2 ) );
const isInstalledGlobally = require('is-installed-globally');


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
async function install( verbose, directory, auto ) {
  if( isInstalledGlobally && auto ) process.exit(0);
  const { action, exitCode } = await lib.install( verbose, directory );
  if( action === 'exit' ) process.exit( exitCode );
}


/**
 * uninstall the pre-commit hook
 * 
 * @param {boolean} verbose extra verbose logging
 * @param {string} directory directory to act upon
 */
async function uninstall( verbose, directory, auto ) {
  if( isInstalledGlobally && auto ) process.exit(0);
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

    const verbose = !!args['verbose'] || false;
    const directory = !!args['directory'] ? args['directory'] : process.cwd();
    const auto = !!args['auto'] || false;
  
    if( !!args['help'] || ( !args['install'] && !args['uninstall'] && !args['status']) ) {
      console.log( await help() );
    } else

    if( !!args['status'] ) {
      await status( verbose, directory );
    } else
  
    if( !!args['install'] ) {
      await install( verbose, directory, auto );
    } else
  
    if( !!args['uninstall'] ) {
      await uninstall( verbose, directory, auto );
    }
    
  })();
} else {
  module.exports = {
    install,
    uninstall,
    help,
  }
}