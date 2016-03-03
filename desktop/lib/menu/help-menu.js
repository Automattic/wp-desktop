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
const i18n = require( 'lib/i18n' );

let menuItems = [];

if ( platform.isWindows() || platform.isLinux() ) {
	menuItems.push( {
		label: i18n.translate( 'About WordPress.com' ),
		click: function() {
			WindowManager.openAbout();
		}
	} );

	menuItems.push( { type: 'separator' } );
}

module.exports = function( mainWindow ) {
	return menuItems.concat( [
		{
			label: i18n.translate( 'How can we help?' ),
			click: function() {
				mainWindow.show();
				ipc.showHelp( mainWindow );
			}
		},
		{
			label: i18n.translate( 'Forums', { context: 'Link to Support Forums' } ),
			click: function() {
				shell.openExternal( 'https://forums.wordpress.com/' );
			}
		},
		{
			label: i18n.translate( 'Privacy Policy' ),
			click: function() {
				shell.openExternal( 'https://automattic.com/privacy/' );
			}
		},
	] );
}
