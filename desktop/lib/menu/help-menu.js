'use strict';

/**
 * External dependencies
 */
const shell = require( 'electron' ).shell;
const ipc = require( 'lib/calypso-commands' );

/**
 * Internal dependencies
 */
const platform = require( 'lib/platform' );
const WindowManager = require( 'lib/window-manager' );

let menuItems = [];

if ( platform.isWindows() || platform.isLinux() ) {
	menuItems.push( {
		label: 'About WordPress.com',
		click: function() {
			WindowManager.openAbout();
		}
	} );

	menuItems.push( { type: 'separator' } );
}

module.exports = function( mainWindow ) {
	return menuItems.concat( [
		{
			label: 'How can we help?',
			click: function() {
				mainWindow.show();
				ipc.showHelp( mainWindow );
			}
		},
		{
			label: 'Support docs',
			click: function() {
				shell.openExternal( 'https://support.wordpress.com' );
			}
		},
		{
			label: 'Forums',
			click: function() {
				shell.openExternal( 'https://forums.wordpress.com/' );
			}
		},
		{
			label: 'Privacy Policy',
			click: function() {
				shell.openExternal( 'https://automattic.com/privacy/' );
			}
		},
	] );
}
