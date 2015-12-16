'use strict';

/**
 * External Dependencies
 */
var path = require( 'path' );
var fs = require( 'fs' );

/**
 * Internal dependencies
 */
var config = require( '../lib/config' );
var cp = require('child_process');

/**
 * Module variables
 */
console.log('Building Linux package...');

var onErrorBail = function( error ) {
	if (error) {
		console.log("Error: " + error);
		process.exit(1);
	}
};

// copy build into place for packaging
cp.execSync( "rm -rf release/tmp ", onErrorBail ); // clean start
cp.execSync( "mkdir -p release/tmp/usr/local ", onErrorBail );
cp.execSync( "mkdir -p release/tmp/usr/share/applications ", onErrorBail );
cp.execSync( "cp -r release/WordPress.com-linux-x64 release/tmp/usr/local/WordPress.com", onErrorBail );
cp.execSync( "cp resource/linux/wordpress-com.desktop release/tmp/usr/share/applications/", onErrorBail );

var cmd = [
	'fpm',
	'--version '  + config.version,
	'--license "GPLv2"',
	'--name wordpress.com',
	'-s dir',
	'-t deb',
	'--force', 			// forces overwrite of existing package
	'--package ./release/wordpress-com-' + config.version + '.deb',
	'-C release/tmp',	// starts file search here
	'./'
];

cp.execSync( cmd.join(' '), onErrorBail );

