const testModule = require('./');
const packageJson = require('../package.json');
const fs = require('fs');
const path = require('path');
const util = require('util');
const readFile = util.promisify( fs.readFile );

describe( 'check help output', () => {

  const helpOutput = testModule();

  it( 'should contain valid package name and version', async () => {
    const packageName = `${ packageJson.name } v${ packageJson.version }`;
    expect( helpOutput ).toEqual( expect.stringContaining( packageName ) );
  });

  it( 'should contain author', async() => {
    const authorName = `${ packageJson.author }`;
    expect( helpOutput ).toEqual( expect.stringContaining( authorName ) );
  });
  
  it( 'should contain all the options', async() => {
    expect( helpOutput ).toEqual( expect.stringMatching( /\t--help\s+\w+/gmi      ) );
    expect( helpOutput ).toEqual( expect.stringMatching( /\t--install\s+\w+/gmi   ) );
    expect( helpOutput ).toEqual( expect.stringMatching( /\t--uninstall\s+\w+/gmi ) );
    expect( helpOutput ).toEqual( expect.stringMatching( /\t--directory\s+\w+/gmi ) );
    expect( helpOutput ).toEqual( expect.stringMatching( /\t--status\s+\w+/gmi    ) );
    expect( helpOutput ).toEqual( expect.stringMatching( /\t--verbose\s+\w+/gmi   ) );
  });

  it( 'should contain copyright', async() => {
    expect( helpOutput ).toEqual( expect.stringMatching( /copyright\s+©\s+\d{4}/gmi ));
  });

  it( 'should have matching license', async() => {
    const license = ( await readFile( path.join( '.', 'LICENSE' ) ) ).toString();
    expect( license    .toUpperCase() ).toEqual( expect.stringContaining( 'MIT LICENSE' ) );
    expect( helpOutput .toUpperCase() ).toEqual( expect.stringContaining( 'MIT LICENSE' ) );
  });

});
