'use strict';
/**
 * External Dependencies
 */
var exec = require( 'child_process' ).execSync;
var path = require( 'path' );
var spellchecker = require( '../lib/spellchecker' )

function cleanBuild( appPath, buildOpts ) {
	var icon, tar;

	console.log( 'Cleaning the Linux build' );

	icon = 'cp ./resource/app-icon/icon_128x128@2x.png ' + appPath + '/WordPress.png';
	tar = 'tar -zcf ' + appPath + '.' + buildOpts.appVersion + '.tar.gz -C ' + buildOpts.out + ' ' + path.basename( appPath );

	exec( icon );
	exec( icon.replace( /ia32/g, 'x64' ) );
	exec( tar );
	exec( tar.replace( /ia32/g, 'x64' ) );
}

module.exports = {
	cleaner: cleanBuild,
	beforeBuild: spellchecker.bind( null, 'http://automattic.github.io/wordpress-desktop/deps/spellchecker-linux64-v1.0.2-electron-v0.35.4.zip' )
}
