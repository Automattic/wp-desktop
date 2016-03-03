'use strict';

/**
 * External Dependencies
 */
const electron = require( 'electron' );
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const url = require( 'url' );
const debug = require( 'debug' )( 'desktop:runapp' );

/**
 * Internal dependencies
 */
const Config = require( 'lib/config' );
const server = require( './server' );
const Settings = require( 'lib/settings' );
const settingConstants = require( 'lib/settings/constants' );
const cookieAuth = require( 'lib/cookie-auth' );
const appInstance = require( 'lib/app-instance' );
const platform = require( 'lib/platform' );
const System = require( 'lib/system' );
const i18n = require( 'lib/i18n' );

/**
 * Module variables
 */
var mainWindow = null;

function showAppWindow() {
	let appUrl = Config.server_url + ':' + Config.server_port;
	let lastLocation = Settings.getSetting( settingConstants.LAST_LOCATION );
	if ( lastLocation && isValidLastLocation( lastLocation ) ) {
		appUrl += lastLocation;
	}

	debug( 'Initialize i18n' );
	i18n.init( app.getLocale() );

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

	mainWindow.on( 'close', function() {
		let currentURL = mainWindow.webContents.getURL();
		let parsedURL = url.parse( currentURL );
		if ( isValidLastLocation( parsedURL.pathname ) ) {
			Settings.saveSetting( settingConstants.LAST_LOCATION, parsedURL.pathname );
		}
	} );

	mainWindow.on( 'closed', function() {
		debug( 'Window closed' );
		mainWindow = null;
	} );

	platform.setMainWindow( mainWindow );

	return mainWindow;
}

function startApp( started_cb ) {
	debug( 'App is ready, starting server' );

	server.start( app, function() {
		started_cb( showAppWindow() );
	} );
}

function isValidLastLocation( loc ) {
	const invalids = [
		'/desktop/',     // Page shown when no Electron
		'/start'         // Don't attempt to resume the signup flow
	];

	for ( let s of invalids ) {
		if ( loc.startsWith( s ) ) {
			return false;
		}
	}

	return true;
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
