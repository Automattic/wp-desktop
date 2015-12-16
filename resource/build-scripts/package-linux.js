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

var cmd = [
	'fpm',
	'--version '  + config.version,
	'--license "GPLv2"',
	'--name wordpress.com',
	'-s tar',
	'-t deb',
	'--prefix /usr/local',
	'--force', // forces overwrite of existing package
	'--package ./release/wordpress-com-' + config.version + '.deb',
	'./release/WordPress.com-linux-x64.' + config.version + '.tar.gz'
];

cp.execSync( cmd.join(' '), function( error ) {
	if (error) {
		console.log('Error building package: ' + error);
	}
	else {
		console.log('Package built');
	}

});

