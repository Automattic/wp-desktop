'use strict';

/**
 * External Dependencies
 */
const electron = require( 'electron' );
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const debug = require( 'debug' )( 'desktop:runapp' );

/**
 * Internal dependencies
 */
const Config = require( 'lib/config' );
const server = require( './server' );
const Settings = require( 'lib/settings' );
const cookieAuth = require( 'lib/cookie-auth' );
const appInstance = require( 'lib/app-instance' );
const platform = require( 'lib/platform' );

/**
 * Module variables
 */
var mainWindow = null;

function runApp() {
	const appUrl = Config.server_url + ':' + Config.server_port;

	debug( 'Starting app on ' + appUrl );

	mainWindow = new BrowserWindow( Settings.getSettingGroup( Config.mainWindow, 'window', [ 'x', 'y', 'width', 'height' ] ) );

	cookieAuth( mainWindow, function() {
		mainWindow.webContents.send( 'cookie-auth-complete' );
	} );

	mainWindow.webContents.on( 'did-finish-load', function() {
		mainWindow.webContents.send( 'app-config', Config, Settings.isDebug() );
	} );

	mainWindow.loadURL( appUrl );
	//mainWindow.openDevTools();

	mainWindow.on( 'closed', function() {
		debug( 'Window closed' );
		mainWindow = null;
	} );

	platform.setMainWindow( mainWindow );

	return mainWindow;
}

module.exports = function( started_cb ) {
	if ( appInstance.isSingleInstance() ) {
		// Start the app window
		app.on( 'ready', function() {
			server.start( app, function() {
				started_cb( runApp() );
			} );
		} );
	}
};
