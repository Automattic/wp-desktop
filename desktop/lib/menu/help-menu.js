'use strict';

/**
 * External dependencies
 */
const shell = require( 'electron' ).shell;
const ipc = require( 'lib/calypso-commands' );
const url = require( 'url' );

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
				// on login page - user logged out
				let parsedURL = url.parse( mainWindow.webContents.getURL() );
				if ( parsedURL.pathname === '/login' ) {
					shell.openExternal( 'https://en.support.wordpress.com/' );
				} else {
					mainWindow.show();
					ipc.showHelp( mainWindow );
				}
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
