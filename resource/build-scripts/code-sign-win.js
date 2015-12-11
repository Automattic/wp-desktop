'use strict';

/**
 * External Dependencies
 */
var path = require( 'path' );
var fs = require( 'fs' );
var cp = require( 'child_process' );

/**
 * Internal dependencies
 */
var win32package = require( '../build-config/win32-package.json' );
var config = require( '../lib/config' );

/**
 * Module variables
 */
var topDir = path.dirname( path.dirname( __dirname ) );
var setupFile = path.join( topDir, 'release/' + config.name + '-' + config.version + '-Setup.exe' );
var spcFile = path.join( __dirname, '..', 'secrets', '/automattic-code.spc' );
var pvkFile = path.join( __dirname, '..', 'secrets', '/automattic-code.pvk' );

console.log( 'Signing installer...' );

// confirm files exist
if ( ! fs.existsSync( setupFile ) ) {
	console.log( 'File not found: ' + setupFile );
	console.log( 'Setup.exe file does not exist. Did you run `make package-win32` first?' );
	process.exit();
}

// confirm files exist
if ( ! fs.existsSync( spcFile ) || ! fs.existsSync( pvkFile ) ) {
	console.log( 'Certificate file not found: ' + spcFile + ' or ' + pvkFile );
	console.log( 'You need to see install valid code signing certificates.' );
	process.exit();
}

// confirm signcode exe
cp.exec( 'which signcode', function( error ) {
	var cmd = 'signcode -a sha1 -t http://timestamp.digicert.com/ -spc ' + spcFile + ' -v ' + pvkFile + " -n '" + win32package.description + "' " + setupFile;

	if ( error ) {
		console.log( '`signcode` command not found. Install Mono tool using `brew install mono`' )
		process.exit();
	}

	// sign it
	cp.execSync( cmd, { stdio: 'inherit' } );
} );
