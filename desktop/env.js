'use strict';

/**
 * External Dependencies
 */
const path = require( 'path' );
const app = require( 'electron' ).app;
const fs = require( 'fs' );

/**
 * Internal dependencies
 */
const config = require( './lib/config' );
const Settings = require( './lib/settings' );

/**
 * Module variables
 */

// Paths
const serverPath = path.resolve( path.join( __dirname, '..', 'calypso', 'server' ) );
const sharedPath = path.resolve( path.join( __dirname, '..', 'calypso', 'shared' ) );
const desktopPath = path.resolve( path.join( __dirname ) );

process.env.CALYPSO_ENV = config.calypso_config;

// If debug is enabled then setup the debug target
if ( Settings.isDebug() ) {
	process.env.DEBUG_COLORS = config.debug.colors;
	process.env.DEBUG = config.debug.namespace;

	if ( config.debug.log_file ) {
		const logFile = path.join( app.getPath( 'userData' ), config.debug.log_file );

		if ( config.debug.clear_log && fs.existsSync( logFile ) ) {
			fs.unlinkSync( logFile );
		}

		process.env.DEBUG_FD = fs.openSync( logFile, 'a' );
	}
}

/**
 * These setup things for Calypso. We have to do them inside the app as we can't set any env variables in the packaged release
 * This has to come after the DEBUG_* variables
 */
const debug = require( 'debug' )( 'desktop:boot' );
const added = require( 'module' ).globalPaths.push( serverPath );
const shared = require( 'module' ).globalPaths.push( sharedPath );
const desktop = require( 'module' ).globalPaths.push( desktopPath );

debug( '========================================================================================================' );
debug( config.name + ' v' + config.version );
debug( 'Server: ' + config.server_url + ':' + config.server_port );
debug( 'Server path: ' + require( 'module' ).globalPaths[added - 1] );
debug( 'Shared path: ' + require( 'module' ).globalPaths[shared - 1] );
debug( 'Desktop path: ' + require( 'module' ).globalPaths[desktop - 1] );
debug( 'Settings:', Settings._getAll() );

if ( Settings.getSetting( 'proxy-type' ) === '' ) {
	debug( 'Proxy: none' );
	app.commandLine.appendSwitch( 'no-proxy-server' );
} else if ( Settings.getSetting( 'proxy-type' ) === 'custom' ) {
	debug( 'Proxy: ' + Settings.getSetting( 'proxy-url' ) + ':' + Settings.getSetting( 'proxy-port' ) );
	app.commandLine.appendSwitch( 'proxy-server', Settings.getSetting( 'proxy-url' ) + ':' + Settings.getSetting( 'proxy-port' ) );

	if ( Settings.getSetting( 'proxy-pac' ) !== '' ) {
		debug( 'Proxy PAC: ' + Settings.getSetting( 'proxy-pac' ) );

		// todo: this doesnt seem to work yet
		app.commandLine.appendSwitch( 'proxy-pac-url', Settings.getSetting( 'proxy-pac' ) );
	}
}

debug( '========================================================================================================' );

// Define a global 'desktop' variable that can be used in browser windows to access config and settings
global.desktop = {
	config: config,
	settings: Settings
};
