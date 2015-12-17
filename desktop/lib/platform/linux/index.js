'use strict';

/**
 * External Dependencies
 */
const electron = require( 'electron' );
const app = electron.app;
const Menu = electron.Menu;
const debug = require( 'debug' )( 'platform:mac' );

/**
 * Internal dependencies
 */
const appQuit = require( 'lib/app-quit' );
const menuSetter = require( 'lib/menu-setter' );

function LinuxPlatform( mainWindow ) {
	this.window = mainWindow;

	app.on( 'activate', function() {
		debug( 'Window activated' );

		mainWindow.show();
		mainWindow.focus();
	} );

	app.on( 'window-all-closed', function() {
		debug( 'All windows closed, shutting down' );
		app.quit();
	} );

	mainWindow.on( 'close', function( ev ) {
		app.quit();
	} );
}

LinuxPlatform.prototype.restore = function() {
	if ( this.window.isMinimized() ) {
		this.window.restore();
	}

	this.window.show();
}


module.exports = LinuxPlatform;
