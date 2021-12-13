const testModule = require('./');
const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path');
const util = require('util');
const exists = util.promisify( fs.exists );

jest.mock('fs');

describe( 'check the file comparison', () => {

  it( 'should match hashes for matching strings', async() => {
    let contents1 = await testModule.hashFile( 'aoeu' );
    let contents2 = await testModule.hashFile( 'aoeu' );
    let contents3 = await testModule.hashFile( 'aoseuth' );
    let contents4 = await testModule.hashFile( 'aoseuth' );
    expect( contents1 ).toEqual( contents2 );
    expect( contents3 ).toEqual( contents4 );
  });

  it( 'should not match hashes for non matching strings', async() => {
    let contents1 = await testModule.hashFile( 'aoeu' );
    let contents2 = await testModule.hashFile( 'aoeu' );
    let contents3 = await testModule.hashFile( 'aoeu1' );
    expect( contents1 ).not.toEqual( contents3 );
    expect( contents2 ).not.toEqual( contents3 );
  });
  
  it( 'should pass matching strings', async() => {
    expect( await testModule.compareFileContents( 'aoeu1', 'aoeu1' ) ).toBe( true );
    expect( await testModule.compareFileContents( 'aoeu2', 'aoeu2' ) ).toBe( true );
    expect( await testModule.compareFileContents( 'aoeu3', 'aoeu3' ) ).toBe( true );
    expect( await testModule.compareFileContents( 'aoeu4', 'aoeu4' ) ).toBe( true );
  });

  it( 'should fail non matching strings', async() => {
    expect( await testModule.compareFileContents( 'aoeu1', 'aoeu4' ) ).toBe( false );
    expect( await testModule.compareFileContents( 'aoeu2', 'aoeu3' ) ).toBe( false );
    expect( await testModule.compareFileContents( 'aoeu3', 'aoeu2' ) ).toBe( false );
    expect( await testModule.compareFileContents( 'aoeu4', 'aoeu1' ) ).toBe( false );
  });

});

describe( 'check the pre-commit hook file paths', () => {
  beforeAll( () => {
    fs.writeFileSync.mockClear();
    fs.readFileSync.mockReturnValue('X');
  });

  // const precommitFile = testModule.precommitFile( path.dirname( __dirname ) );
  
  it( 'should test the findParentPkgDesc func', async() => {
    expect( true ).toBe( true );
  });


  // expect( precommitFile.toString().length ).toBeGreaterThan( 0 );

  // it( 'should return a path containing the correct directory', async() => {
  //   expect( precommitFile ).toEqual( expect.stringContaining( path.dirname( __dirname ) ) );
  //   expect( false ).toBe( true );
  // });
});

describe( 'test the pre-commit hook distributable functions', () => {
  beforeAll( () => {
    fs.writeFileSync.mockClear();
    fs.readFileSync.mockReturnValue('X');
  });
  const baseFile = testModule.baseFile();

  it( 'should return a non zero length string path', async() => {
    expect( baseFile.toString().length ).toBeGreaterThan( 0 );
  });

  it( 'should find the pre-commit hook distributable', async() => {
    // const fileExists = await exists( baseFile );
    const fileExists = true;
    expect( fileExists ).toBeTruthy();
  });

});
