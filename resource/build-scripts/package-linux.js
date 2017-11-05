'use strict';

/**
 * External Dependencies
 */
const path = require( 'path' );
const fs = require( 'fs' );

/**
 * Internal dependencies
 */
const config = require( '../lib/config' );
const cp = require('child_process');

/**
 * Module variables
 */
console.log('Building Linux package...');

const onErrorBail = function( error ) {
	if (error) {
		console.log("Error: " + error);
		process.exit(1);
	}
};

// copy build into place for packaging
cp.execSync( "rm -rf release/tmp", onErrorBail ); // clean start
cp.execSync( "mkdir -p release/tmp/usr/share/applications", onErrorBail );
cp.execSync( "mkdir -p release/tmp/usr/share/pixmaps", onErrorBail );
cp.execSync( "cp -r release/WordPress.com-linux-x64 release/tmp/usr/share/wpcom", onErrorBail );
cp.execSync( "mv release/tmp/usr/share/wpcom/WordPress.com release/tmp/usr/share/wpcom/wpcom", onErrorBail );	// rename binary to wpcom
cp.execSync( "cp resource/linux/wpcom.desktop release/tmp/usr/share/applications/", onErrorBail );
cp.execSync( "cp resource/app-icon/icon_256x256.png release/tmp/usr/share/pixmaps/wpcom.png", onErrorBail );

const cmd = [
	'fpm',
	'--version '  + config.version,
	'--license "GPLv2"',
	'--name "wordpress.com"',
	'--description "WordPress.com Desktop client"',
	'--vendor "Automattic, Inc."',
	'--maintainer "WordPress.com Support <support@wordpress.com>"',
	'--url "https://desktop.wordpress.com/"',
	'-s dir',
	'-t deb',
	'--force', 			// forces overwrite of existing package
	'--package ./release/wordpress-com-' + config.version + '.deb',
	'-C release/tmp',	// starts file search here
	'./'
];

cp.execSync( cmd.join(' '), onErrorBail );

