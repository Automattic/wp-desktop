'use strict';

/**
 * Internal dependencies
 */
var cp = require('child_process');

/**
 * Module variables
 */
console.log('Building Flatpak package...');

var onErrorBail = function( error ) {
	if (error) {
		console.log("Error: " + error);
		process.exit(1);
	}
};

var cmd = [
	'electron-installer-flatpak' +
	' --src release/WordPress.com-linux-x64' +
	' --dest release/flatpak/' +
	' --arch x86_64' +
	' --bin WordPress.com' +
	' --icon release/WordPress.com-linux-x64/WordPress.png'
];

cp.execSync( cmd.join(' '), onErrorBail );
