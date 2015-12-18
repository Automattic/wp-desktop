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
const System = require( 'lib/system' );
const storeKit = require( 'lib/store-kit' );

/**
 * Module variables
 */
var mainWindow = null;

function showAppWindow() {
	const appUrl = Config.server_url + ':' + Config.server_port;

	debug( 'Loading app (' + appUrl + ') in mainWindow' );

	mainWindow = new BrowserWindow( Settings.getSettingGroup( Config.mainWindow, 'window', [ 'x', 'y', 'width', 'height' ] ) );

	cookieAuth( mainWindow, function() {
		mainWindow.webContents.send( 'cookie-auth-complete' );
	} );

	mainWindow.webContents.on( 'did-finish-load', function() {
		mainWindow.webContents.send( 'app-config', Config, Settings.isDebug(), System.getDetails() );
	} );

	mainWindow.loadURL( appUrl );
	//mainWindow.openDevTools();

	mainWindow.on( 'closed', function() {
		debug( 'Window closed' );
		mainWindow = null;
		server.kill();
	} );

	platform.setMainWindow( mainWindow );

	storeKit.requestProducts();

	return mainWindow;
}

function startApp( started_cb ) {
	debug( 'App is ready, starting server' );

	server.start( app, function() {
		started_cb( showAppWindow() );
	} );
}

module.exports = function( started_cb ) {
	debug( 'Checking for other instances' );

	if ( appInstance.isSingleInstance() ) {
		const boot = function() {
			startApp( started_cb );
		};

		debug( 'No other instances, waiting for app ready' );

		// Start the app window
		if ( app.isReady() ) {
			boot();
		} else {
			app.on( 'ready', boot );
		}
	}
};
