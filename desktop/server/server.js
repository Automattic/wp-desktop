'use strict';

/**
 * External Dependencies
 */
const portscanner = require( 'portscanner' );
const debug = require( 'debug' )( 'desktop:server' );
const path = require( 'path' );
const fork = require( 'child_process' ).fork;

/**
 * Internal dependencies
 */
const Config = require( '../config' );

/**
 * Module variables
 */
const BOOT_TIMEOUT = 10000;
let didBoot = false;
let calypso = null;

function showFailure( app ) {
	const dialog = require( 'dialog' );

	dialog.showMessageBox( {
		type: 'warning',
		title: 'WordPress',
		message: 'Failed to start the app',
		detail: 'Sorry but we failed to start the app. Are you running another copy of it?',
		buttons: [ 'Quit' ]
	}, function() {
		app.quit();
	} );
}

function startServer( app, startedCallback ) {
	let appFile = path.resolve( process.cwd(), 'calypso', 'build', 'bundle-desktop.js' ),
		env = Object.create( process.env );

	env.PORT = Config.server_port;
	env.NODE_PATH = 'server:client:.'; // Necessary for commonjs require paths
	env.CALYPSO_IS_FORK = 1;

	debug( 'Loading server from file: ' + appFile );

	calypso = fork( appFile, [], {
		silent: true, // For access to std(out|err)
		cwd: path.resolve( process.cwd(), 'calypso' ), // Force working directory to calypso root
		env: env
	} );

	// If Calypso fails to start for some reason, show an error.
	setTimeout( function() {
		if ( didBoot ) {
			return;
		}

		debug( 'Did not get boot signal from Calypso; exiting.' );
		showFailure( app );
		killServer();
	}, BOOT_TIMEOUT );

	calypso.on( 'message', function( message ) {
		// We need to wait until the server has booted.
		// Wait until we get the signal.
		if ( message.boot && message.boot === 'ready' ) {
			debug( 'Yay! Server booted!' );
			didBoot = true;
			startedCallback();
		}
	} );

	// Debug
	calypso.stdout.on( 'data', function( data ) {
		debug( 'app.stout: ' + data );
	} );

	calypso.stderr.on( 'data', function( data ) {
		debug( 'app.stderr: ' + data );
	} );

	calypso.on( 'close', function( code, signal ) {
		debug( 'app.close with code: ' + ( code ? code : 0 ) + ' (' + signal + ')' );
	} );

	calypso.on( 'exit', function( code, signal ) {
		debug( 'app.exit with code: ' + ( code ? code : 0 ) + ' (' + signal + ')' );
	} );
}

function killServer() {
	if ( calypso ) {
		debug( 'Killing server' );
		calypso.kill();
		calypso = null;
		didBoot = false;
	}
}

module.exports = {
	start: function( app, startedCallback ) {
		debug( 'Checking server port: ' + Config.server_port + ' on host ' + Config.server_host );

		portscanner.checkPortStatus( Config.server_port, Config.server_host, function( error, status ) {
			if ( error || status === 'open' ) {
				debug( 'Port check failed - ' + status, error );
				showFailure( app );
				return;
			}

			startServer( app, startedCallback );
		} );
	},
	kill: killServer
};
